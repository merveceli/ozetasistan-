import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

// Arama aracı ile modeli yapılandır
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    // gemini-2.5-pro generally uses search better, or we can use flash
    tools: [
        {
            // @ts-ignore
            googleSearch: {}
        }
    ]
});

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Metin gerekli' }, { status: 400 });
        }

        const prompt = `
Aşağıdaki metindeki iddiaları analiz et ve doğruluklarını internetten araştırıp kontrol et.
Gerçek ve güncel verilere dayanarak, her bir ana iddia için bir doğruluk değerlendirmesi yap.

Yanıtını YALNIZCA aşağıdaki JSON formatında, geçerli bir JSON dizisi (array) olarak döndür. JSON dışında hiçbir açıklama veya markdown karakteri (örneğin \`\`\`json) ekleme.

Örnek dönüş formatı:
[
  {
    "text": "Analiz edilen iddia metni",
    "status": "verified", // Sadece "verified", "disputed" veya "unverifiable" olabilir. Doğruysa verified, tartışmalıysa disputed, kanıt yoksa unverifiable.
    "trustScore": 95, // 0 ile 100 arasında bir güven skoru
    "explanation": "Doğrulama açıklaması, neden bu skor verildi ve internette hangi bilgilere ulaşıldı.",
    "sources": [
      {
        "label": "Kaynak Adı (örn. Wikipedia, Nature, BBC vb.)",
        "url": "https://...",
        "type": "wiki" // "wiki", "academic", veya "news" olabilir
      }
    ]
  }
]

Doğrulanacak Metin:
"""
${text}
"""
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        // Temizleme: model bazen ```json ... ``` ile dönebilir
        let cleanJson = responseText.trim();
        if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.substring(7);
        }
        if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.substring(3);
        }
        if (cleanJson.endsWith('```')) {
            cleanJson = cleanJson.slice(0, -3);
        }
        cleanJson = cleanJson.trim();

        let parsedData;
        try {
            parsedData = JSON.parse(cleanJson);
        } catch (e) {
            console.error("JSON Parse Error:", e, "Raw Text:", cleanJson);
            throw new Error("Model geçersiz bir JSON döndürdü.");
        }

        return NextResponse.json({ results: parsedData });

    } catch (error: any) {
        console.error('Fact-check API Error:', error);
        return NextResponse.json({
            error: error.message || 'Analiz sırasında bir hata oluştu'
        }, { status: 500 });
    }
}
