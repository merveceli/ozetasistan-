import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || user.app_metadata?.is_admin !== true) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const adminDb = createAdminClient();

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        // Stats via RPC (includes real trend calculations)
        const { data: stats, error: statsError } = await adminDb.rpc('get_admin_dashboard_stats', {
            days_range: days,
        });

        if (statsError) throw statsError;

        // Recent Users
        const { data: recentUsers, error: usersError } = await adminDb
            .from('profiles')
            .select('id, full_name, email, subscription_tier, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        if (usersError) throw usersError;

        // Recent Activity (last 10 feature usage logs with user info)
        const { data: recentActivity, error: activityError } = await adminDb
            .from('feature_usage_logs')
            .select(`
                id,
                feature_name,
                tokens_used,
                created_at,
                profiles:user_id ( full_name, email )
            `)
            .order('created_at', { ascending: false })
            .limit(10);

        if (activityError) {
            console.warn('Activity fetch warning:', activityError.message);
        }

        // Message Stats
        const { count: totalMessages } = await adminDb
            .from('contact_messages')
            .select('*', { count: 'exact', head: true });

        const { count: unreadMessages } = await adminDb
            .from('contact_messages')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);

        const baseStats = stats || {
            totalUsers: 0, activeSubscribers: 0, monthlyRevenue: 0, totalAnalyses: 0,
            trendUsers: 0, trendSubscribers: 0, trendRevenue: 0, trendAnalyses: 0,
        };

        return NextResponse.json({
            stats: {
                ...baseStats,
                totalMessages: totalMessages || 0,
                unreadMessages: unreadMessages || 0
            },
            recentUsers: recentUsers || [],
            recentActivity: recentActivity || [],
            environment: process.env.NODE_ENV,
        });

    } catch (error: any) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

