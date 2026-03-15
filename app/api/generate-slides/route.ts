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

        const prompt = `Akademik ANALIZ_PAKETI'ne dayalı 7 slaytlık hızlı Türkçe sunum hazırla. Sadece bu bilgileri kullan.
JSON Yapısı:
{
  "slides": [
    {
      "slide_number": number,
      "title": "Kısa Başlık (max 50 kr)",
      "content": ["Madde 1 (max 70 kr)", "Madde 2", "Madde 3"],
      "speaker_notes": "1 kısa cümle",
      "visual_suggestion": "Kısa öneri",
      "layout_type": "title|content|steps|quiz|terms",
      "image_prompt": "English short prompt"
    }
  ]
}
Not: layout_type 'terms' ise content dizisi "Terim: Açıklama" formatında olmalı.
ANALIZ_PAKETI: ${analysisPackage.substring(0, 4000)}
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
