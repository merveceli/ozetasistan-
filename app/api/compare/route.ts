import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const { documentIds } = await request.json();

        if (!documentIds || !Array.isArray(documentIds) || documentIds.length < 2) {
            return NextResponse.json({ error: 'En az iki doküman seçmelisiniz.' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
        }

        // Fetch all documents
        const { data: documents, error: dbError } = await supabase
            .from('documents')
            .select('*')
            .in('id', documentIds)
            .eq('user_id', user.id);

        if (dbError || !documents || documents.length !== documentIds.length) {
            return NextResponse.json({ error: 'Bazı dokümanlar bulunamadı.' }, { status: 404 });
        }

        // Prepare parts for Gemini
        const parts: any[] = [];

        for (const doc of documents) {
            const { data: fileData } = await supabase.storage
                .from('documents')
                .download(doc.file_path);

            if (fileData) {
                if (doc.file_type === 'pdf') {
                    const arrayBuffer = await fileData.arrayBuffer();
                    parts.push({
                        inlineData: {
                            mimeType: 'application/pdf',
                            data: Buffer.from(arrayBuffer).toString('base64')
                        }
                    });
                } else {
                    const text = await fileData.text();
                    parts.push({ text: `Doküman: ${doc.title}\nİçerik: ${text.slice(0, 20000)}` });
                }
            }
        }

        // Add prompt
        parts.push({
            text: `Aşağıdaki ${documents.length} dokümanı çapraz okuma yöntemiyle analiz et. 
        
        Gereksinimler:
        1. Ortak temaları ve kavramları belirle.
        2. Karşıt görüşleri veya çelişkileri vurgula.
        3. "Tez-Antitez-Sentez" yapısı oluştur.
        4. Metodoloji, Temel Bulgular ve Sonuç başlıklarını içeren bir karşılaştırma tablosu hazırla.

        Çıktıyı tamamen Türkçe ver. İngilizce tek bir kelime bile kullanma.
        
        Sadece geçerli JSON döndür (kod bloğu veya markdown olmasın):
        {
          "common_themes": ["Tema 1", "Tema 2"],
          "synthesis": "Sentez paragrafı (Türkçe)...",
          "conflicts": ["Çelişki 1", "Zıtlık 2"],
          "comparison_table": {
            "columns": ["Doküman", "Metodoloji", "Temel Bulgular", "Sonuç"],
            "rows": [
              ["Doküman Başlığı 1", "Yöntem...", "Bulgu...", "Sonuç..."],
              ["Doküman Başlığı 2", "Yöntem...", "Bulgu...", "Sonuç..."]
            ]
          }
        }` });

        const result = await model.generateContent(parts);
        const response = await result.response;
        const textResponse = response.text();

        // Clean JSON response
        let cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonStart = cleanJson.indexOf('{');
        const jsonEnd = cleanJson.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1) {
            cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1);
        }

        const analysisData = JSON.parse(cleanJson);

        return NextResponse.json(analysisData);

    } catch (error: any) {
        console.error('Comparison error:', error);
        return NextResponse.json({
            error: 'Karşılaştırma sırasında bir hata oluştu.',
            details: error.message
        }, { status: 500 });
    }
}
