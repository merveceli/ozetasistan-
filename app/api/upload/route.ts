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

        console.log('🔐 Creating Supabase client...');
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        const dummyUserId = '00000000-0000-0000-0000-000000000000';
        let userId = dummyUserId;

        if (user) {
            console.log('✅ Authenticated user found:', user.id);
            userId = user.id;

            // Tier-based file type restriction
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_tier')
                .eq('id', userId)
                .single();

            const userTier = profile?.subscription_tier || 'free';

            if (userTier === 'free' && (type === 'audio' || type === 'video')) {
                return NextResponse.json({
                    error: 'Bu dosya tipi için üyeliğinizi yükseltmeniz gerekmektedir.',
                    needsUpgrade: true
                }, { status: 403 });
            }
        } else {
            console.log('⚠️ No authenticated user, using dummy ID. Checking trial status.');

            // SECURITY CHECK: Check if the guest has already completed a trial
            const cookieHeader = request.headers.get('cookie') || '';
            const hasCompletedTrial = cookieHeader.includes('trial_completed=true');

            if (hasCompletedTrial) {
                return NextResponse.json({
                    error: 'Ücretsiz deneme hakkınızı doldurdunuz. Lütfen analiz yapmaya devam etmek için giriş yapın veya kayıt olun.',
                    needsUpgrade: true,
                    needsLogin: true
                }, { status: 403 });
            }

            // Misafirler sadece ses/video yükleyemez; PDF, URL ve metin serbesttir
            if (type === 'audio' || type === 'video') {
                return NextResponse.json({
                    error: 'Ses/video analizi için lütfen giriş yapın.',
                    needsUpgrade: true
                }, { status: 403 });
            }
        }

        console.log('✅ Using user ID:', userId);

        const fileExt = file.name.split('.').pop();
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
