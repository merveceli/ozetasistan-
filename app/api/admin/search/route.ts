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
        const query = searchParams.get('q') || '';

        if (query.length < 2) {
            return NextResponse.json({ results: [] });
        }

        // Search in Profiles, Documents
        const [usersSearch, docsSearch] = await Promise.all([
            supabase.from('profiles').select('id, full_name, email').or(`full_name.ilike.%${query}%,email.ilike.%${query}%`).limit(5),
            supabase.from('documents').select('id, title, user_id').ilike('title', `%${query}%`).limit(5)
        ]);

        const results = [
            ...(usersSearch.data?.map(u => ({ ...u, type: 'user' })) || []),
            ...(docsSearch.data?.map(d => ({ ...d, type: 'document' })) || [])
        ];

        return NextResponse.json({ results });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
