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

        const podcastPrompt = `Sen bir Türk akademik podcast yapımcısısın. Aşağıdaki akademik özet ve ana noktalar için 2 kişilik bir podcast diyaloğu yaz. NotebookLM'in "Audio Overview" tarzında, çok samimi, sürükleyici ve öğretici olsun.

KONUŞMACULAR:
- "SUNUCU": Meraklı, enerjik, konuya yeni başlayan bir öğrenci. Arada "Vay canına!", "Gerçekten mi?", "Anlıyorum" gibi tepkiler verir.
- "UZMAN": Bilgili ama ukala olmayan, konuyu örneklendirerek anlatan samimi bir profesör.

KURALLAR:
1. Dil: Tamamen Türkçe, çok doğal sohbet dili. 
2. Akış: Konuşmacılar birbirini onaylamalı ("Kesinlikle", "Harika bir noktaya değindin", "Hımm, şöyle ki...").
3. Yapı: Tam olarak 15-20 konuşma satırı olsun. Statik bir soru-cevap değil, dinamik bir fikir alışverişi olsun.
4. İçerik: Belgedeki teknik bilgiyi hikayeleştirerek veya günlük hayat örneği vererek anlatın.
5. Bitiriş: Dinleyiciye ilham veren veya düşündüren bir kapanış cümlesi.

BELGE BAŞLIĞI: ${title || 'Akademik Belge'}

ÖZET:
${summary.slice(0, 2000)}

ANA NOKTALAR:
${(keyPoints || []).slice(0, 6).map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

ÇIKTI FORMATI - Sadece geçerli JSON döndür:
{
  "podcast_title": "Dinamik Başlık (örn: Geleceğin Şifrelerini Çözüyoruz)",
  "duration_estimate": "~3 dakika",
  "dialogue": [
    { "speaker": "SUNUCU", "text": "Selam millet! Bugün masamızda gerçekten heyecan verici bir çalışma var..." },
    { "speaker": "UZMAN", "text": "Merhabalar, evet gerçekten de bu çalışma akademik dünyada kartları yeniden dağıtacak gibi..." }
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
