import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.app_metadata?.is_admin !== true) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Son 7 günlük gerçek feature_usage_logs verisi
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const { data: usageLogs, error } = await supabase
            .from('feature_usage_logs')
            .select('created_at, feature_name')
            .gte('created_at', sevenDaysAgo)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Son 7 günün tarihlerini oluştur
        const days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
                date: date.toISOString().split('T')[0], // YYYY-MM-DD
                label: date.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' }),
            };
        });

        // Logları günlere göre grupla
        const chartData = days.map(({ date, label }) => {
            const dayLogs = (usageLogs || []).filter(log =>
                log.created_at.startsWith(date)
            );
            return {
                name: label,
                analiz: dayLogs.filter(l => l.feature_name !== 'ad_reward').length,
                aktif: dayLogs.length,
            };
        });

        // Tier dağılımı için gerçek veri
        const { data: tierData, error: tierError } = await supabase
            .from('profiles')
            .select('subscription_tier');

        if (tierError) throw tierError;

        const tierCounts = (tierData || []).reduce((acc: Record<string, number>, p) => {
            const tier = p.subscription_tier || 'free';
            acc[tier] = (acc[tier] || 0) + 1;
            return acc;
        }, {});

        const tierChartData = Object.entries(tierCounts).map(([name, value]) => ({
            name: name === 'free' ? 'Ücretsiz' : name === 'student' ? 'Öğrenci' : 'Akademik',
            value,
        }));

        // Popüler özellikler
        const featureCounts = (usageLogs || []).reduce((acc: Record<string, number>, log) => {
            if (log.feature_name === 'ad_reward') return acc;
            acc[log.feature_name] = (acc[log.feature_name] || 0) + 1;
            return acc;
        }, {});

        const totalFeatureUsage = Object.values(featureCounts).reduce((a, b) => a + b, 0) || 1;

        const featureStats = Object.entries(featureCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([name, count]) => ({
                label: formatFeatureName(name),
                count,
                percentage: Math.round((count / totalFeatureUsage) * 100),
            }));

        return NextResponse.json({ chartData, tierChartData, featureStats });

    } catch (error: any) {
        console.error('Charts stats error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function formatFeatureName(name: string): string {
    const map: Record<string, string> = {
        'summary': 'Özetleme',
        'mindmap': 'Zihin Haritası',
        'focus-radio': 'Focus Radio',
        'presentation': 'Sunum Oluşturma',
        'compare': 'Karşılaştırma',
        'synthesis': 'Sentez Lab',
        'source-check': 'Kaynak Doğrulama',
        'chat': 'AI Sohbet',
    };
    return map[name] || name;
}
