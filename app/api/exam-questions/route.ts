import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { model } from '@/lib/gemini';

export const maxDuration = 60;

type ExamType = 'yks' | 'kpss' | 'ales' | 'tus';
type Mode = 'generate' | 'past';

const EXAM_LABELS: Record<ExamType, string> = {
    yks: 'YKS (AYT/TYT)',
    kpss: 'KPSS',
    ales: 'ALES',
    tus: 'TUS',
};

const EXAM_INSTRUCTIONS: Record<ExamType, string> = {
    yks: `YKS sınavı formatında sorular üret. AYT için konuya özgü, TYT için temel becerilerle ilgili sorular yaz. Sorular ÖSYM'nin paragraf bazlı, çıkarım gerektiren soru stilinde olsun. Dil açık ama dikkat dağıtıcı ("tuzak") çeldiriciler içersin.`,
    kpss: `KPSS sınavı formatında sorular üret. Genel Yetenek - Genel Kültür çerçevesinde, memur adaylarına yönelik sorular yaz. Sorular ÖSYM'nin mantık yürütme, anlama ve kavrama odaklı stilinde olsun.`,
    ales: `ALES sınavı formatında sorular üret. Sözel veya Sayısal bölüm mantığında, akademik kariyer odaklı anlama ve çıkarım soruları yaz. ÖSYM'nin analitik düşünceyi ölçen stilini kullan.`,
    tus: `TUS (Tıpta Uzmanlık Sınavı) formatında sorular üret. Klinik vaka bazlı veya temel tıp bilgisi soruları yaz. Her soru için kısa bir klinik senaryo ve beyin fırtınası gerektiren şıklar ekle.`,
};

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Bu özellik için giriş yapmanız gerekmektedir.' }, { status: 401 });
        }

        const { summary, keyPoints, examType, mode } = await request.json() as {
            summary: string;
            keyPoints: string[];
            examType: ExamType;
            mode: Mode;
        };

        if (!summary || !examType) {
            return NextResponse.json({ error: 'Eksik parametreler.' }, { status: 400 });
        }

        const examLabel = EXAM_LABELS[examType] || examType.toUpperCase();
        const examInstruction = EXAM_INSTRUCTIONS[examType] || '';

        let prompt: string;

        if (mode === 'past') {
            prompt = `Sen bir ${examLabel} sınav uzmanısın. Aşağıdaki belge konusuna uygun, GERÇEK SINAV TARZINDA geçmiş yıl sorusu stilinde 10 soru hazırla.

${examInstruction}

BELGE ÖZETİ:
${summary.slice(0, 2000)}

ANA NOKTALAR:
${(keyPoints || []).slice(0, 6).map((p, i) => `${i + 1}. ${p}`).join('\n')}

ÖZEL TALİMATLAR:
- Her soruya "📅 Bu tür sorular [yıl aralığı] yılları arasındaki ${examLabel} sınavlarında çıkmıştır." şeklinde bir kaynak notu ekle (gerçekçi ama uydurma değil, genel bir yıl aralığı ver)
- Sorular gerçek ÖSYM kalitesinde, çeldiricili ve düşündürücü olsun
- Geri bildirim/açıklama kısmında neden doğru cevabın doğru olduğunu kısaca açıkla

ÇIKTI FORMATI — Sadece geçerli JSON döndür:
{
  "questions": [
    {
      "question": "Soru metni...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "answer": 0,
      "explanation": "Doğru cevap A'dır çünkü...",
      "source_note": "📅 Bu tür sorular 2018-2023 yılları arasındaki ${examLabel} sınavlarında çıkmıştır."
    }
  ]
}`;
        } else {
            prompt = `Sen bir ${examLabel} sınav hazırlık uzmanısın. Aşağıdaki belge içeriğini kullanarak ÖSYM kalitesinde 10 özgün soru hazırla.

${examInstruction}

BELGE ÖZETİ:
${summary.slice(0, 2000)}

ANA NOKTALAR:
${(keyPoints || []).slice(0, 6).map((p, i) => `${i + 1}. ${p}`).join('\n')}

ÖZEL TALİMATLAR:
- Sorular tamamen bu belgenin içeriğine dayalı olsun
- Her soru 5 şıktan (A-E) oluşsun, yalnızca 1 doğru cevap olsun
- Çeldiriciler gerçekçi ve yanıltıcı olsun
- Geri bildirim/açıklama kısmında neden doğru cevap olduğunu açıkla

ÇIKTI FORMATI — Sadece geçerli JSON döndür:
{
  "questions": [
    {
      "question": "Soru metni...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
      "answer": 0,
      "explanation": "Doğru cevap A'dır çünkü..."
    }
  ]
}`;
        }

        const result = await model.generateContent(prompt);
        const rawText = (await result.response).text();

        let parsed;
        try {
            let clean = rawText.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '');
            const start = clean.indexOf('{');
            const end = clean.lastIndexOf('}');
            if (start !== -1 && end !== -1) clean = clean.substring(start, end + 1);
            parsed = JSON.parse(clean);
        } catch {
            return NextResponse.json({ error: 'Sorular oluşturulamadı. Lütfen tekrar deneyin.' }, { status: 500 });
        }

        return NextResponse.json(parsed);

    } catch (error: any) {
        console.error('Exam Questions API error:', error);
        return NextResponse.json({ error: error.message || 'Sunucu hatası.' }, { status: 500 });
    }
}
