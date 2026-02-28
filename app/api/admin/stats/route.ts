import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Security Check: Only Admin/SuperAdmin
        const isAdmin = user?.app_metadata?.is_admin === true;
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        // Fetch Stats from RPC
        const { data: stats, error: statsError } = await supabase.rpc('get_admin_dashboard_stats', {
            days_range: days
        });

        if (statsError) throw statsError;

        // Fetch Recent Users
        const { data: recentUsers, error: usersError } = await supabase
            .from('profiles')
            .select('id, full_name, email, subscription_tier, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        if (usersError) throw usersError;

        return NextResponse.json({
            stats,
            recentUsers,
            environment: process.env.NODE_ENV
        });

    } catch (error: any) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
