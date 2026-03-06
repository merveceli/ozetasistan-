import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';

export const maxDuration = 60;

export async function POST(request: Request) {
    try {
        const { textA, textB } = await request.json();

        if (!textA || !textB) {
            return NextResponse.json({ error: 'İki metin de gereklidir.' }, { status: 400 });
        }

        const prompt = `
Aşağıda verilen iki metni "Çapraz Okuma / Sentez" amacıyla analiz et. 
Lütfen bu metinler arasındaki belirgin çelişkileri (contradiction), uyuşmaları (agreement) ve her iki metnin bir diğerinde bulunmayan özgün noktalarını (unique) tespit et.

Format olarak SADECE aşağıdaki gibi bir JSON dizisi döndür. Hiçbir açıklama, \`\`\`json veya markdown ekleme, sadece JSON kullan.

[
  {
    "type": "contradiction" | "agreement" | "unique",
    "text": "Bulgunun kısa başlığı veya özeti",
    "docA": "Kaynak A'dan ilgili kısa alıntı veya özet",
    "docB": "Kaynak B'den ilgili kısa alıntı veya özet",
    "detail": "Bu bulgunun metodolojik veya bağlamsal detaylı açıklaması"
  }
]

Metin A:
"${textA}"

Metin B:
"${textB}"
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Gemini JSON'ını temizleyip parse et
        let jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBracket = jsonStr.indexOf('[');
        const lastBracket = jsonStr.lastIndexOf(']');

        if (firstBracket !== -1 && lastBracket !== -1) {
            jsonStr = jsonStr.substring(firstBracket, lastBracket + 1);
        }

        const analysisResults = JSON.parse(jsonStr);

        return NextResponse.json(analysisResults);
    } catch (error: any) {
        console.error('Cross-read error:', error);
        return NextResponse.json({
            error: 'Analiz sırasında bir hata oluştu.',
            details: error.message
        }, { status: 500 });
    }
}
