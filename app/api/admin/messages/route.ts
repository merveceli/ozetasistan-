import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Admin check
        if (!user || user.app_metadata?.is_admin !== true) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const adminDb = createAdminClient();

        const { data: messages, error } = await adminDb
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ messages });
    } catch (error: any) {
        console.error('Admin Fetch Messages Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || user.app_metadata?.is_admin !== true) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id, is_read } = await request.json();
        const adminDb = createAdminClient();

        const { error } = await adminDb
            .from('contact_messages')
            .update({ is_read })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || user.app_metadata?.is_admin !== true) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        const adminDb = createAdminClient();

        const { error } = await adminDb
            .from('contact_messages')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
