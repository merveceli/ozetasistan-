import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const DAILY_AD_LIMIT = 3;

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ remaining: 0 }, { status: 401 });
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        // ad_rewards tablosunu dene
        const { count: todayCount, error: countError } = await supabase
            .from('ad_rewards')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', `${todayStr}T00:00:00.000Z`)
            .lt('created_at', `${todayStr}T23:59:59.999Z`);

        if (countError) {
            // Fallback: feature_usage_logs
            const { count: fallbackCount } = await supabase
                .from('feature_usage_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('feature_name', 'ad_reward')
                .gte('created_at', `${todayStr}T00:00:00.000Z`)
                .lt('created_at', `${todayStr}T23:59:59.999Z`);

            return NextResponse.json({
                remaining: Math.max(0, DAILY_AD_LIMIT - (fallbackCount ?? 0)),
                used: fallbackCount ?? 0,
                limit: DAILY_AD_LIMIT,
            });
        }

        return NextResponse.json({
            remaining: Math.max(0, DAILY_AD_LIMIT - (todayCount ?? 0)),
            used: todayCount ?? 0,
            limit: DAILY_AD_LIMIT,
        });
    } catch (error) {
        console.error('Remaining ads error:', error);
        return NextResponse.json({ remaining: DAILY_AD_LIMIT });
    }
}
