import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        // Auth check
        const { data: { user } } = await supabase.auth.getUser();

        // Use authenticated user ID or dummy ID for local testing/demo
        const dummyUserId = '00000000-0000-0000-0000-000000000000';
        const userId = user?.id || dummyUserId;

        // Fetch documents
        let dbQuery = supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId);

        if (query) {
            dbQuery = dbQuery.ilike('title', `%${query}%`);
        }

        const { data: documents, error } = await dbQuery
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ documents });
    } catch (error) {
        console.error('Fetch documents error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
