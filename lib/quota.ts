import { createClient } from '@/lib/supabase/server';

export interface QuotaLimits {
    max_documents: number;
    max_analyses_per_month: number;
    max_presentations: number;
    max_storage_mb: number;
}

export interface UsageStats {
    documents_uploaded: number;
    analyses_completed: number;
    presentations_created: number;
    storage_used_mb: number;
}

export interface QuotaStatus {
    limits: QuotaLimits;
    usage: UsageStats;
    canUploadDocument: boolean;
    canAnalyze: boolean;
    canCreatePresentation: boolean;
    remainingDocuments: number;
    remainingAnalyses: number;
    remainingPresentations: number;
    userCredits: number;
}

/**
 * Get current month in format YYYY-MM
 */
function getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

/**
 * Check if user has quota for a specific action
 * For 'analyze': önce user_credits kontrol edilir, sonra aylık kota
 */
export async function checkQuota(
    userId: string,
    action: 'document' | 'analyze' | 'presentation'
): Promise<{ allowed: boolean; reason?: string; source?: 'credit' | 'quota' }> {
    const supabase = await createClient();
    const currentMonth = getCurrentMonth();

    try {
        // Kullanıcı profili ve paket bilgisi
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier, user_credits')
            .eq('id', userId)
            .single();

        if (!profile) {
            return { allowed: false, reason: 'Kullanıcı profili bulunamadı' };
        }

        // Analiz için: önce user_credits kontrol et
        if (action === 'analyze' && (profile.user_credits ?? 0) > 0) {
            return { allowed: true, source: 'credit' };
        }

        // Paket limitleri
        const { data: packageData } = await supabase
            .from('subscription_packages')
            .select('limits')
            .eq('id', profile.subscription_tier)
            .single();

        if (!packageData) {
            return { allowed: false, reason: 'Paket bilgisi bulunamadı' };
        }

        const limits: QuotaLimits = packageData.limits;

        // Mevcut kullanım
        const { data: usage } = await supabase
            .from('usage_tracking')
            .select('*')
            .eq('user_id', userId)
            .eq('month_year', currentMonth)
            .single();

        if (!usage) {
            await supabase
                .from('usage_tracking')
                .insert({ user_id: userId, month_year: currentMonth });
            return { allowed: true, source: 'quota' };
        }

        switch (action) {
            case 'document':
                if (limits.max_documents === -1) return { allowed: true, source: 'quota' };
                if (usage.documents_uploaded >= limits.max_documents) {
                    return {
                        allowed: false,
                        reason: `Döküman yükleme limitine ulaştınız (${limits.max_documents}/${limits.max_documents})`,
                    };
                }
                break;

            case 'analyze':
                if (limits.max_analyses_per_month === -1) return { allowed: true, source: 'quota' };
                if (usage.analyses_completed >= limits.max_analyses_per_month) {
                    return {
                        allowed: false,
                        reason: `Aylık analiz limitine ulaştınız (${limits.max_analyses_per_month}/${limits.max_analyses_per_month}). Reklam izleyerek kredi kazanabilirsiniz.`,
                    };
                }
                break;

            case 'presentation':
                if (limits.max_presentations === -1) return { allowed: true, source: 'quota' };
                if (usage.presentations_created >= limits.max_presentations) {
                    return {
                        allowed: false,
                        reason: `Sunum oluşturma limitine ulaştınız (${limits.max_presentations}/${limits.max_presentations})`,
                    };
                }
                break;
        }

        return { allowed: true, source: 'quota' };
    } catch (error) {
        console.error('Quota check error:', error);
        return { allowed: false, reason: 'Kota kontrolü sırasında hata oluştu' };
    }
}

/**
 * Analiz kredisini tüket:
 * - Önce user_credits varsa kullan
 * - Yoksa aylık kota sayacını artır
 * SADECE yeni 'Generate' işleminde çağrılır, arşiv görüntülemesinde DEĞİL
 */
export async function consumeAnalysisCredit(userId: string): Promise<{ source: 'credit' | 'quota' }> {
    const supabase = await createClient();

    // RPC ile atomik: önce user_credits dene
    const { data: result } = await supabase.rpc('consume_analysis_credit', {
        p_user_id: userId,
    });

    if (result?.source === 'credit') {
        return { source: 'credit' };
    }

    // Kota sayacını artır
    await incrementUsage(userId, 'analyze');
    return { source: 'quota' };
}

/**
 * Kullanım sayacını artır
 */
export async function incrementUsage(
    userId: string,
    action: 'document' | 'analyze' | 'presentation',
    amount: number = 1
): Promise<void> {
    const supabase = await createClient();
    const currentMonth = getCurrentMonth();

    const fieldMap = {
        document: 'documents_uploaded',
        analyze: 'analyses_completed',
        presentation: 'presentations_created',
    };

    const field = fieldMap[action];

    try {
        const { data: usage } = await supabase
            .from('usage_tracking')
            .select('*')
            .eq('user_id', userId)
            .eq('month_year', currentMonth)
            .single();

        if (usage) {
            await supabase
                .from('usage_tracking')
                .update({
                    [field]: Math.max(0, (usage[field] || 0) + amount),
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId)
                .eq('month_year', currentMonth);
        } else {
            await supabase.from('usage_tracking').insert({
                user_id: userId,
                month_year: currentMonth,
                [field]: Math.max(0, amount),
            });
        }
    } catch (error) {
        console.error('Usage increment error:', error);
    }
}

/**
 * Feature kullanımını logla (admin istatistikleri için)
 * Her yeni Generate işleminde çağrılmalı
 */
export async function logFeatureUsage(
    userId: string,
    featureName: string,
    documentId?: string,
    tokensUsed?: number
): Promise<void> {
    const supabase = await createClient();

    try {
        await supabase.from('feature_usage_logs').insert({
            user_id: userId,
            feature_name: featureName,
            document_id: documentId || null,
            tokens_used: tokensUsed || 0,
        });
    } catch (error) {
        // Log hatası ana işlemi engellememelidir
        console.error('Feature log error:', error);
    }
}

/**
 * Kullanıcının tam kota durumunu döndür
 */
export async function getQuotaStatus(userId: string): Promise<QuotaStatus | null> {
    const supabase = await createClient();
    const currentMonth = getCurrentMonth();

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier, user_credits')
            .eq('id', userId)
            .single();

        if (!profile) return null;

        const { data: packageData } = await supabase
            .from('subscription_packages')
            .select('limits')
            .eq('id', profile.subscription_tier)
            .single();

        if (!packageData) return null;

        const limits: QuotaLimits = packageData.limits;

        const { data: usage } = await supabase
            .from('usage_tracking')
            .select('*')
            .eq('user_id', userId)
            .eq('month_year', currentMonth)
            .single();

        const currentUsage: UsageStats = usage || {
            documents_uploaded: 0,
            analyses_completed: 0,
            presentations_created: 0,
            storage_used_mb: 0,
        };

        const userCredits = profile.user_credits ?? 0;

        return {
            limits,
            usage: currentUsage,
            userCredits,
            canUploadDocument:
                limits.max_documents === -1 || currentUsage.documents_uploaded < limits.max_documents,
            // Analiz için: kredi varsa her zaman izin ver
            canAnalyze:
                userCredits > 0 ||
                limits.max_analyses_per_month === -1 ||
                currentUsage.analyses_completed < limits.max_analyses_per_month,
            canCreatePresentation:
                limits.max_presentations === -1 ||
                currentUsage.presentations_created < limits.max_presentations,
            remainingDocuments:
                limits.max_documents === -1
                    ? -1
                    : Math.max(0, limits.max_documents - currentUsage.documents_uploaded),
            remainingAnalyses:
                limits.max_analyses_per_month === -1
                    ? -1
                    : Math.max(0, limits.max_analyses_per_month - currentUsage.analyses_completed) + userCredits,
            remainingPresentations:
                limits.max_presentations === -1
                    ? -1
                    : Math.max(0, limits.max_presentations - currentUsage.presentations_created),
        };
    } catch (error) {
        console.error('Get quota status error:', error);
        return null;
    }
}

/**
 * Arşivden var olan analizi görüntüleme — KREDİ DÜŞMEZ
 * Sadece erişim kaydı tutar (opsiyonel)
 */
export async function logArchiveView(userId: string, documentId: string): Promise<void> {
    // Kredi düşmez, sadece isteğe bağlı view logu
    const supabase = await createClient();
    try {
        await supabase.from('feature_usage_logs').insert({
            user_id: userId,
            feature_name: 'archive_view', // Ayrı feature adı — istatistiklerde filtreland
            document_id: documentId,
            tokens_used: 0,
        });
    } catch (error) {
        console.error('Archive view log error:', error);
    }
}
