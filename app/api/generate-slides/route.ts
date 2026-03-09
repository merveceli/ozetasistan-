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

        // Use authenticated user ID or dummy ID for local testing/demo
        const dummyUserId = '00000000-0000-0000-0000-000000000000';
        const userId = user?.id || dummyUserId;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // --- CACHE KONTROLÜ ---
        const supabaseAdmin = createAdminClient();
        let document = null;

        if (documentId) {
            const { data } = await supabaseAdmin
                .from('documents')
                .select('*')
                .eq('id', documentId)
                .single();

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

        const prompt = `Aşağıda bir akademik makaleye ait ANALIZ_PAKETI verilmektedir.

SADECE bu analiz paketindeki bilgileri kullan.
Orijinal makalenin akademik derinliğini koru ama sunum formatına uygun şekilde yapılandır.

Çıktıyı tamamen Türkçe ver.

Aşağıdaki yapıda TAM OLARAK 10 slayttan oluşan bir sunum hazırla:

Slayt Akışı:
1. Başlık Slaytı (Başlık, Kapsam)
2. Giriş ve Problem Tanımı
3. Literatür Özeti / Bağlam
4. Yöntem / Metodoloji (Akış şeması için uygun yapılandır)
5. Uygulama / Deney Tasarımı
6. Ana Bulgular (Veri odaklı)
7. Tartışma ve Katkı
8. Sınırlılıklar ve Gelecek Çalışmalar
9. Anahtar Terimler Sözlüğü (Makaledeki en kritik 5-6 terim)
10. Mini Bilgi Testi (Makale içeriğiyle ilgili 3 adet çoktan seçmeli soru)

Her slayt nesnesi şu alanları içermelidir:
- slide_number: number
- title: Slayt başlığı
- content: 3-5 adet kısa madde (array)
- speaker_notes: Sunum yapan kişinin bu slaytta söylemesi gereken 2-3 cümlelik açıklama.
- visual_suggestion: Bu slayt için bir görsel önerisi
- layout_type: 'title' | 'content' | 'comparison' | 'steps' | 'terms' | 'quiz'
- image_prompt: Bu slaytı temsil eden AI görseli üretmek için İngilizce bir prompt

ANALIZ_PAKETI:
${analysisPackage}

Return ONLY valid JSON (no markdown wrapper, no \`\`\`json blocks):
{
  "slides": [
    {
      "slide_number": 1,
      "title": "...",
      "content": ["...", "..."],
      "speaker_notes": "...",
      "visual_suggestion": "...",
      "layout_type": "...",
      "image_prompt": "..."
    },
    // ... total 10 slides
  ]
}`;

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
