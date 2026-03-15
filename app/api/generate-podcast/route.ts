import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { model } from '@/lib/gemini';

export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Bu özellik için giriş yapmanız gerekmektedir.' }, { status: 401 });
        }

        const { summary, keyPoints, title } = await request.json();

        if (!summary) {
            return NextResponse.json({ error: 'Özet verisi eksik.' }, { status: 400 });
        }

        const podcastPrompt = `Sen bir Türk akademik podcast yapımcısısın. Aşağıdaki akademik özet ve ana noktalar için 2 kişilik bir podcast diyaloğu yaz.

KONUŞMACULAR:
- "SUNUCU": Konuya yeni başlayan meraklı bir öğrenci (S harfi ile başla)
- "UZMAN": Alanında uzman akademisyen (U harfi ile başla)

KURALLAR:
1. Tamamen Türkçe yaz.
2. Doğal, akıcı ve sohbet dili kullan (teknik ama anlaşılır)
3. Tam olarak 12-16 konuşma satırı olsun (ikisi de yaklaşık eşit konuşsun)
4. Her satır kısa ve net olsun (max 2 cümle)
5. Sunucu sorular sorar, Uzman açıklar
6. Sonunda Uzman dinleyicilere bir tavsiye verir
7. Konuya göre gerçekçi ve bilgilendirici İÇERİK üret (uydurma)

BELGE BAŞLIĞI: ${title || 'Akademik Belge'}

ÖZET:
${summary.slice(0, 2000)}

ANA NOKTALAR:
${(keyPoints || []).slice(0, 6).map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

ÇIKTI FORMATI - Sadece geçerli JSON döndür, başka hiçbir şey yazma:
{
  "podcast_title": "Kısa başlık (maks 8 kelime)",
  "duration_estimate": "~X dakika",
  "dialogue": [
    { "speaker": "SUNUCU", "text": "Konuşma metni..." },
    { "speaker": "UZMAN", "text": "Konuşma metni..." }
  ]
}`;

        const result = await model.generateContent(podcastPrompt);
        const response = await result.response;
        const rawText = response.text();

        let podcastData;
        try {
            let clean = rawText.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '');
            const start = clean.indexOf('{');
            const end = clean.lastIndexOf('}');
            if (start !== -1 && end !== -1) clean = clean.substring(start, end + 1);
            podcastData = JSON.parse(clean);
        } catch {
            return NextResponse.json({ error: 'Podcast scripti oluşturulamadı. Lütfen tekrar deneyin.' }, { status: 500 });
        }

        return NextResponse.json(podcastData);

    } catch (error: any) {
        console.error('Podcast API error:', error);
        return NextResponse.json({ error: error.message || 'Sunucu hatası.' }, { status: 500 });
    }
}
