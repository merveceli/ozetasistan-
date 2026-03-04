import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const DAILY_AD_LIMIT = 3;

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Giriş yapmanız gerekmektedir.' }, { status: 401 });
        }

        // Bugünkü tarih (UTC gün başı)
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

        // Bugün kaç reklam izlendiğini say — ad_rewards tablosundan
        const { count: todayCount, error: countError } = await supabase
            .from('ad_rewards')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', `${todayStr}T00:00:00.000Z`)
            .lt('created_at', `${todayStr}T23:59:59.999Z`);

        if (countError) {
            console.error('Count error:', countError);
            // Eğer tablo yoksa feature_usage_logs'dan kontrol et
            const { count: fallbackCount } = await supabase
                .from('feature_usage_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('feature_name', 'ad_reward')
                .gte('created_at', `${todayStr}T00:00:00.000Z`)
                .lt('created_at', `${todayStr}T23:59:59.999Z`);

            if ((fallbackCount ?? 0) >= DAILY_AD_LIMIT) {
                return NextResponse.json({
                    error: `Bugünlük ${DAILY_AD_LIMIT} reklam hakkınızı kullandınız. Yarın tekrar deneyin.`,
                    remaining: 0,
                }, { status: 429 });
            }
        } else {
            if ((todayCount ?? 0) >= DAILY_AD_LIMIT) {
                return NextResponse.json({
                    error: `Bugünlük ${DAILY_AD_LIMIT} reklam hakkınızı kullandınız. Yarın tekrar deneyin.`,
                    remaining: 0,
                }, { status: 429 });
            }
        }

        // Güvenli RPC ile tam olarak +1 kredi ekle (atomik)
        const { data: newCredits, error: rpcError } = await supabase.rpc(
            'increment_user_credits',
            { p_user_id: user.id, p_amount: 1 }
        );

        if (rpcError) {
            console.error('RPC error:', rpcError);
            // Fallback: direkt güncelle
            const { data: profile } = await supabase
                .from('profiles')
                .select('user_credits')
                .eq('id', user.id)
                .single();

            const currentCredits = profile?.user_credits ?? 0;
            await supabase
                .from('profiles')
                .update({ user_credits: currentCredits + 1 })
                .eq('id', user.id);
        }

        // Log kaydı — ad_rewards tablosu (yoksa feature_usage_logs)
        const { error: insertError } = await supabase
            .from('ad_rewards')
            .insert({ user_id: user.id, credits_earned: 1 });

        if (insertError) {
            // Fallback to feature_usage_logs
            await supabase.from('feature_usage_logs').insert({
                user_id: user.id,
                feature_name: 'ad_reward',
                credits_used: -1,
            });
        }

        const remaining = DAILY_AD_LIMIT - ((todayCount ?? 0) + 1);

        return NextResponse.json({
            success: true,
            message: 'Analiz kredisi kazanıldı!',
            newCredits: newCredits ?? 1,
            remaining: Math.max(0, remaining),
        });

    } catch (error: any) {
        console.error('Watch ad error:', error);
        return NextResponse.json({
            error: 'Sunucu hatası oluştu.'
        }, { status: 500 });
    }
}
