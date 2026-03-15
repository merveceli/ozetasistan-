import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: Request, context: any) {
    try {
        const { id } = context.params;
        const { searchParams } = new URL(request.url);
        const level = searchParams.get('level') || 'student';

        if (!id) {
            return NextResponse.json({ error: 'ID eksik.' }, { status: 400 });
        }

        const supabaseAdmin = createAdminClient();

        // RLS atlamak için Admin client kullanıyoruz çünkü belgeyi sadece id ile okumalıyız
        // ve eğer public ise göstermeliyiz.
        const { data: document, error } = await supabaseAdmin
            .from('documents')
            .select('title, metadata, created_at')
            .eq('id', id)
            .single();

        if (error || !document) {
            return NextResponse.json({ error: 'Belge bulunamadı.' }, { status: 404 });
        }

        const metadata = document.metadata as any;

        // Public mi kontrolü
        if (!metadata || !metadata.is_public) {
            return NextResponse.json({ error: 'Bu analiz gizlidir ve sahibinin paylaşım onayı yoktur.' }, { status: 403 });
        }

        // İstenen seviyedeki analiz verisi var mı bakıyoruz
        if (!metadata[level]) {
            return NextResponse.json({ error: 'Bu belge için henüz bu seviyede bir analiz oluşturulmamış.' }, { status: 404 });
        }

        // Veriyi dön
        return NextResponse.json(metadata[level]);

    } catch (error: any) {
        console.error('Shared GET Error:', error);
        return NextResponse.json({ error: 'Analiz verisi alınamadı.' }, { status: 500 });
    }
}
