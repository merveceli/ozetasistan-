import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const { documentId } = await request.json();

        if (!documentId) {
            return NextResponse.json({ error: 'Document ID gerekli' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Giriş yapmanız gerekiyor.' }, { status: 401 });
        }

        // Kullanıcının bu belgeye sahip olup olmadığını kontrol et
        const { data: document, error: fetchError } = await supabase
            .from('documents')
            .select('user_id, metadata, file_path')
            .eq('id', documentId)
            .single();

        if (fetchError || !document || document.user_id !== user.id) {
            return NextResponse.json({ error: 'Bu belge bulunamadı veya yetkiniz yok.' }, { status: 403 });
        }

        // metadata.is_public = true yap
        const updatedMetadata = {
            ...(document.metadata || {}),
            is_public: true
        };

        const supabaseAdmin = createAdminClient();
        const { error: updateError } = await supabaseAdmin
            .from('documents')
            .update({ metadata: updatedMetadata })
            .eq('id', documentId);

        if (updateError) {
            throw new Error(updateError.message);
        }

        // İsteğe bağlı: Storage dosyasını public yapmayabiliriz, çünkü metin paylaşıyoruz.
        // Ama metadata public oldu.

        return NextResponse.json({ 
            success: true, 
            shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/shared/${documentId}` 
        });

    } catch (error: any) {
        console.error('Share API Error:', error);
        return NextResponse.json({ error: 'Paylaşım linki oluşturulamadı.' }, { status: 500 });
    }
}
