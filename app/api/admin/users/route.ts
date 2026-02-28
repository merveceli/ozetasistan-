import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.app_metadata?.is_admin !== true) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const tier = searchParams.get('tier');

        let query = supabase
            .from('profiles')
            .select('id, full_name, email, subscription_tier, subscription_status, subscription_end_date, user_credits, created_at, is_admin', { count: 'exact' });

        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        if (tier && tier !== 'all') {
            query = query.eq('subscription_tier', tier);
        }

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data: users, count, error } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        return NextResponse.json({
            users,
            total: count,
            page,
            limit,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Kullanıcı Güncelle (Plan/Durum/Kredi)
export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user: adminUser } } = await supabase.auth.getUser();

        if (adminUser?.app_metadata?.is_admin !== true) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, updates, action } = body;

        let finalUpdates = { ...updates };

        // Kredi ekleme özel aksiyonu
        if (action === 'add_credits') {
            // Mevcut krediyi al
            const { data: profile } = await supabase
                .from('profiles')
                .select('user_credits')
                .eq('id', userId)
                .single();

            const currentCredits = profile?.user_credits ?? 0;
            const addAmount = updates.user_credits ?? 5;
            finalUpdates = { user_credits: currentCredits + addAmount };
        }

        // updated_at her zaman güncelle
        finalUpdates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('profiles')
            .update(finalUpdates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        // Admin audit log
        await supabase.from('admin_audit_logs').insert({
            admin_id: adminUser.id,
            action_type: action === 'add_credits' ? 'credit_grant' : 'user_update',
            target_user_id: userId,
            details: finalUpdates,
        });

        return NextResponse.json({ user: data });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
