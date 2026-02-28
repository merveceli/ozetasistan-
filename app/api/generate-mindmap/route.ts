import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const { analysisPackage } = await request.json();

        if (!analysisPackage) {
            return NextResponse.json({ error: 'ANALIZ_PAKETI içeriği gereklidir' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const prompt = `Aşağıda bir akademik makaleye ait ANALIZ_PAKETI bulunmaktadır.

SADECE bu analiz paketindeki bilgileri kullan.
PDF dosyasını tekrar analiz etmeye çalışma.
Yeni bilgi ekleme.
Varsayım yapma.

Çıktıyı tamamen Türkçe ver.

Bu analiz paketine dayanarak bir zihin haritası yapısı üret.

Zihin haritasının merkezinde çalışmanın genel konusu yer alsın.

Ana dallar şu başlıklara tam olarak karşılık gelsin:
- Amaç ve Problem
- Yöntem
- Veri / Deney ortamı
- Bulgular
- Katkı
- Sınırlılıklar

ANALIZ_PAKETI:
${analysisPackage}

Return ONLY valid JSON (no markdown, no code blocks):
{
  "mind_map": {
    "name": "Merkez Konu (Çalışmanın Genel Başlığı)",
    "children": [
      {
        "name": "Amaç ve Problem",
        "children": [
          { "name": "Alt madde 1" },
          { "name": "Alt madde 2" }
        ]
      },
      {
        "name": "Yöntem",
        "children": [
          { "name": "Alt madde 1" }
        ]
      },
      {
        "name": "Veri / Deney ortamı",
        "children": [
          { "name": "Alt madde 1" }
        ]
      },
      {
        "name": "Bulgular",
        "children": [
          { "name": "Alt madde 1" }
        ]
      },
      {
        "name": "Katkı",
        "children": [
          { "name": "Alt madde 1" }
        ]
      },
      {
        "name": "Sınırlılıklar",
        "children": [
          { "name": "Alt madde 1" }
        ]
      }
    ]
  }
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
        console.error('Mind map generation error:', error);
        return NextResponse.json({
            error: 'Zihin haritası oluşturulamadı',
            details: error.message
        }, { status: 500 });
    }
}
