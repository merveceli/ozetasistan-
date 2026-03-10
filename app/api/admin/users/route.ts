import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        // Auth kontrolü — normal client
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Admin kontrolü: app_metadata VEYA profiles.is_admin
        const adminDb = createAdminClient();
        const isAppAdmin = user.app_metadata?.is_admin === true;
        let isProfileAdmin = false;
        if (!isAppAdmin) {
            const { data: profile } = await adminDb.from('profiles').select('is_admin').eq('id', user.id).single();
            isProfileAdmin = profile?.is_admin === true;
        }

        if (!isAppAdmin && !isProfileAdmin) {
            return NextResponse.json({ error: 'Forbidden: Admin required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const tier = searchParams.get('tier');
        const provider = searchParams.get('provider');

        let query = adminDb
            .from('profiles')
            .select('*', { count: 'exact' });

        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        if (tier && tier !== 'all') {
            query = query.eq('subscription_tier', tier);
        }

        if (provider && provider !== 'all') {
            query = query.eq('provider', provider);
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data: users, count, error } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            console.error('Admin users query error:', error);
            throw error;
        }

        return NextResponse.json({
            users: users || [],
            total: count || 0,
            page,
            limit,
        });

    } catch (error: any) {
        console.error('Admin users GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Kullanıcı Güncelle (Plan/Durum/Kredi)
export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user: adminUser } } = await supabase.auth.getUser();

        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const adminDb = createAdminClient();
        const isAppAdmin = adminUser.app_metadata?.is_admin === true;
        if (!isAppAdmin) {
            const { data: profile } = await adminDb.from('profiles').select('is_admin').eq('id', adminUser.id).single();
            if (profile?.is_admin !== true) {
                return NextResponse.json({ error: 'Forbidden: Admin required' }, { status: 403 });
            }
        }
        const body = await request.json();
        const { userId, updates, action } = body;

        let finalUpdates = { ...updates };

        // Kredi ekleme özel aksiyonu
        if (action === 'add_credits') {
            const { data: profile } = await adminDb
                .from('profiles')
                .select('user_credits')
                .eq('id', userId)
                .single();

            const currentCredits = profile?.user_credits ?? 0;
            const addAmount = updates.user_credits ?? 5;
            finalUpdates = { user_credits: currentCredits + addAmount };
        }

        finalUpdates.updated_at = new Date().toISOString();

        const { data, error } = await adminDb
            .from('profiles')
            .update(finalUpdates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        // Admin audit log (non-fatal if table/schema issue)
        try {
            await adminDb.from('admin_audit_logs').insert({
                admin_id: adminUser.id,
                action_type: action === 'add_credits' ? 'credit_grant' : 'user_update',
                target_user_id: userId,
                details: finalUpdates,
            });
        } catch (auditErr) {
            console.warn('Audit log insert failed (non-fatal):', auditErr);
        }

        return NextResponse.json({ user: data });

    } catch (error: any) {
        console.error('Admin users PATCH error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
