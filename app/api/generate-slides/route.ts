import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkQuota, incrementUsage, logFeatureUsage } from '@/lib/quota';

// Sunum üretimi için zaman aşımını artır (Vercel Pro: 300s, Hobby: 60s)
export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        const { analysisPackage, documentId } = await request.json();

        if (!analysisPackage) {
            return NextResponse.json({ error: 'Analysis package content is required' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Bu işlem için oturum açmanız gerekmektedir.' }, { status: 401 });
        }

        const userId = user.id;

        // --- CACHE KONTROLÜ ---
        const supabaseAdmin = createAdminClient();
        let document = null;

        if (documentId) {
            const { data, error } = await supabaseAdmin
                .from('documents')
                .select('*')
                .eq('id', documentId)
                .single();

            if (error || !data) {
                return NextResponse.json({ error: 'Döküman bulunamadı.' }, { status: 404 });
            }

            // Sahiplik kontrolü: Kullanıcı sadece kendi dökümanına sunum üretebilir (Guest dahil)
            if (data.user_id !== userId) {
                return NextResponse.json({ error: 'Bu döküman üzerinde işlem yapma yetkiniz yok.' }, { status: 403 });
            }

            document = data;

            // Eğer daha önceden cache'lenmiş bir sunum varsa kotadan yemeden direkt dön
            if (document?.metadata?.presentation_slides) {
                console.log('✅ Found cached presentation slides. Skipping AI generation.');
                return NextResponse.json(document.metadata.presentation_slides);
            }
        }

        // --- KOTA KONTROLÜ ---
        if (user) {
            const quotaCheck = await checkQuota(user.id, 'presentation');
            if (!quotaCheck.allowed) {
                return NextResponse.json({
                    error: quotaCheck.reason || 'Sunum kotanız doldu.',
                    needsUpgrade: true
                }, { status: 403 });
            }
        }

        const prompt = `Akademik ANALİZ_PAKETİ'ne dayalı 7-10 slaytlık profesyonel bir Türkçe akademik sunum hazırla. Sadece sağlanan bilgileri kullan, dışarıdan bilgi ekleme.

Çıktı mutlaka geçerli bir JSON formatında olmalıdır.

JSON Yapısı:
{
  "slides": [
    {
      "slide_number": number,
      "title": "Slayt Başlığı (max 60 karakter)",
      "content": ["Madde 1 (max 90 karakter)", "Madde 2", "Madde 3", "Madde 4"],
      "speaker_notes": "Sunum yapan kişi için 1-2 cümlelik açıklama.",
      "visual_suggestion": "Slayt için görsel önerisi (örn: 'Akış şeması', 'Sonuç grafiği').",
      "layout_type": "title|content|steps|quiz|terms",
      "image_prompt": "English descriptive image generation prompt."
    }
  ]
}

Not: layout_type 'terms' ise content dizisi "Terim: Açıklama" formatında olmalı.

ANALİZ_PAKETİ:
${analysisPackage.substring(0, 5000)}

Return ONLY valid JSON:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean and parse
        let cleanJson = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const jsonStart = cleanJson.indexOf('{');
        const jsonEnd = cleanJson.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1);
        }

        const data = JSON.parse(cleanJson);

        // --- BAŞARILI ÜRETİM SONRASI KOTA DÜŞME VE CACHE'LEME ---
        if (user) {
            await incrementUsage(user.id, 'presentation');
            await logFeatureUsage(user.id, 'presentation', documentId);
        }

        if (document && documentId) {
            const existingMetadata = document.metadata || {};
            await supabaseAdmin
                .from('documents')
                .update({
                    metadata: {
                        ...existingMetadata,
                        presentation_slides: data
                    }
                })
                .eq('id', documentId);
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Slide generation error:', error);
        return NextResponse.json({
            error: 'Failed to generate slides',
            details: error.message
        }, { status: 500 });
    }
}
