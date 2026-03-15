import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        console.log('📤 Upload request received');

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string || 'pdf';

        console.log('📄 File info:', { name: file?.name, size: file?.size, type });

        if (!file) {
            console.log('❌ No file uploaded');
            return NextResponse.json({ error: 'Dosya yüklenmedi.' }, { status: 400 });
        }

        // 10MB limit
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'Dosya boyutu çok büyük (Maksimum 10MB).' }, { status: 400 });
        }

        // 🛡️ SECURITY CHECK: Sıkı Dosya Tipi ve MIME Doğrulaması (TÜBİTAK Seviyesi)
        const allowedMimeTypes = [
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['pdf', 'txt', 'doc', 'docx'];

        // Sadece URL değilse (fiziksel dosya ise) doğrula
        if (type !== 'url') {
            if (!allowedMimeTypes.includes(file.type)) {
                console.warn(`🚨 Güvenlik Uyarısı: Geçersiz MIME tipi algılandı (${file.type}). Dosya: ${file.name}`);
                return NextResponse.json({ error: 'Güvenlik ihlali: Sadece PDF, Word veya TXT formatındaki belgelere izin verilmektedir. Zararlı yazılım koruması aktif.' }, { status: 415 });
            }

            if (!fileExt || !allowedExtensions.includes(fileExt)) {
                console.warn(`🚨 Güvenlik Uyarısı: Geçersiz dosya uzantısı algılandı (.${fileExt}). Dosya: ${file.name}`);
                return NextResponse.json({ error: 'Güvenlik ihlali: Kabul edilmeyen dosya formatı tespit edildi.' }, { status: 415 });
            }
        }

        console.log('🔐 Creating Supabase client...');
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Dosya yüklemek için oturum açmanız gerekmektedir.' }, { status: 401 });
        }

        const userId = user.id;
        console.log('✅ Authenticated user found:', userId);

        console.log('✅ Using user ID:', userId);

        // fileExt zaten güvenlik bloğunda tanımlandı (yeniden atama yapılmıyor)
        // Sanitize filename to avoid issues
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storageFileName = `${userId}/${Date.now()}-${sanitizedFileName}`;

        console.log('📁 Uploading to storage:', storageFileName);

        // Upload to Supabase Storage
        const { data: storageData, error: storageError } = await supabase.storage
            .from('documents')
            .upload(storageFileName, file, {
                upsert: true
            });

        if (storageError) {
            console.error('❌ Storage error:', storageError);
            return NextResponse.json({
                error: `Depolama hatası: ${storageError.message}. Lütfen Supabase Storage'da 'documents' bucket'ının olduğundan ve RLS politikalarının ayarlandığından emin olun.`
            }, { status: 500 });
        }

        console.log('✅ File uploaded to storage:', storageData);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(storageFileName);

        console.log('🔗 Public URL:', publicUrl);

        // Create DB record
        console.log('💾 Creating database record...');
        const { data: dbData, error: dbError } = await supabase
            .from('documents')
            .insert({
                user_id: userId,
                title: file.name,
                file_url: publicUrl,
                file_path: storageFileName,
                file_type: type,
                analysis_status: 'pending',
            })
            .select()
            .single();

        if (dbError) {
            console.error('❌ Database error:', dbError);
            // If DB insert fails, consider deleting the file from storage to keep consistent state
            // await supabase.storage.from('documents').remove([storageFileName]);
            return NextResponse.json({
                error: `Veritabanı hatası: ${dbError.message}. Lütfen 'documents' tablosunun RLS politikalarını kontrol edin.`
            }, { status: 500 });
        }

        console.log('✅ Database record created:', dbData);
        console.log('🎉 Upload successful!');

        return NextResponse.json({ success: true, document: dbData });
    } catch (error: any) {
        console.error('💥 Upload error:', error);
        return NextResponse.json({
            error: 'Sunucu hatası oluştu.',
            details: error?.message || 'Unknown error'
        }, { status: 500 });
    }
}
