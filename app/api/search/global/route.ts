import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [] });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Oturum açmanız gerekmektedir.' }, { status: 401 });
        }

        // Başlıkta veya metadata içindeki özetlerde ara
        const { data, error } = await supabase
            .from('documents')
            .select('id, title, file_type, created_at, metadata')
            .eq('user_id', user.id)
            .or(`title.ilike.%${query}%`) // Başlıkta ara
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Global search error:', error);
            throw error;
        }

        // Manuel filtreleme (Gemini'nin ürettiği özetler içinde arama)
        const refinedResults = data.filter(doc => {
            const inTitle = doc.title.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'));
            let inSummary = false;
            
            if (doc.metadata) {
                // Herhangi bir level altındaki summary alanında ara
                inSummary = Object.values(doc.metadata).some((val: any) => 
                    val?.summary?.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'))
                );
            }
            
            return inTitle || inSummary;
        });

        return NextResponse.json({ 
            results: refinedResults.map(r => ({
                id: r.id,
                title: r.title,
                file_type: r.file_type,
                created_at: r.created_at
            }))
        });

    } catch (error: any) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
