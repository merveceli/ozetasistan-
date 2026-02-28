import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const { analysisPackage } = await request.json();

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

        const prompt = `Aşağıda bir akademik makaleye ait ANALIZ_PAKETI verilmektedir.

SADECE bu analiz paketindeki bilgileri kullan.
PDF dosyasını tekrar analiz etmeye çalışma.
Yeni bilgi ekleme.

Çıktıyı tamamen Türkçe ver.

Bu analiz paketine dayanarak TAM OLARAK 8 slayttan oluşan bir sunum hazırla.

Her slayt için şu formatı kullan:

Slayt X Başlık:
- Madde
- Madde
- Madde

Her slaytta 3 ile 5 arasında kısa ve net madde olsun.

Slayt sırası:

1. Çalışmanın başlığı ve genel amacı
2. Problem tanımı
3. Kısa literatür bağlamı
4. Kullanılan yöntem / yaklaşım
5. Veri seti veya deney ortamı
6. Bulgular
7. Çalışmanın katkısı
8. Sınırlılıklar ve gelecek çalışmalar

ANALIZ_PAKETI:
${analysisPackage}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "slides": [
    {
      "slide_number": 1,
      "title": "Çalışmanın Başlığı ve Amacı",
      "content": ["Madde 1", "Madde 2", "Madde 3"]
    },
     // ... total 8 slides
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
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Slide generation error:', error);
        return NextResponse.json({
            error: 'Failed to generate slides',
            details: error.message
        }, { status: 500 });
    }
}
