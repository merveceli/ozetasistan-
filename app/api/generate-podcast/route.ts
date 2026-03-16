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
- "SUNUCU": Meraklı, enerjik, konuya yeni başlayan bir öğrenci. Arada "Vay canına!", "Gerçekten mi?", "Hadi canım!", "Hımm, anlıyorum" gibi tepkiler verir. Çok samimi ve heyecanlıdır.
- "UZMAN": Bilgili ama ukala olmayan, konuyu örneklendirerek anlatan samimi bir profesör. Konuşurken "yani", "aslında", "şöyle düşün", "bak şimdi" gibi ifadeler kullanır.

ÖZEL TALİMATLAR:
1. İNSANSIZLAŞTIRMA: Konuşma metnine doğal duraklamalar ve dolgu kelimeleri ekle (eee, yani, hani, aslında, bak şimdi). 
2. DUYGUSAL TEPKİLER: Sunucu bazen Uzman'ın cümlesine bitirmeden heyecanla girmeli ("Kesinlikle!", "Aynen!").
3. TÜRKÇE DOĞALLIĞI: Kitap dili yerine konuşma dili ("yapıyor", "ediyor", "yapmışlar resmen") kullan.
4. ÖRNEKLENDİRME: Teknik kavramları günlük hayat benzetmeleriyle açıkla.
5. SÜRE VE KARAKTER LİMİTİ: (ÇOK ÖNEMLİ): API maliyetlerini düşürmek için diyalog ÇOK KISA VE ÖZ olmalıdır. Toplam metin 1500 karakteri (yaklaşık 1-1.5 dakika) KESİNLİKLE GEÇMEMELİDİR. Hızlıca konuya girip etkili bir şekilde sonlandırın.

BELGE BAŞLIĞI: ${title || 'Akademik Belge'}

ÖZET:
${summary.slice(0, 2000)}

ANA NOKTALAR:
${(keyPoints || []).slice(0, 6).map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

ÇIKTI FORMATI - Sadece geçerli JSON döndür:
{
  "podcast_title": "Dinamik ve Havalı Bir Başlık",
  "duration_estimate": "~1-1.5 dakika",
  "dialogue": [
    { "speaker": "SUNUCU", "text": "Selamlar! Bugün yine masamızda zihin açan bir konu var. Hocam, şu başlığa bir baksanıza, inanılmaz değil mi?" },
    { "speaker": "UZMAN", "text": "Merhabalar... Evet, yani aslında ilk bakışta karmaşık gibi duruyor ama özünde o kadar temel bir soruya cevap veriyor ki..." }
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
