import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { checkQuota, consumeAnalysisCredit, logFeatureUsage } from '@/lib/quota';

export async function POST(request: Request) {
    try {
        console.log('🔍 Analysis request start');
        const { documentId, level } = await request.json();
        console.log('📄 Request data:', { documentId, level });

        if (!documentId) {
            return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
        }

        // Validate level
        const validLevels = ['student', 'academic', 'professor', 'metadata', 'deep_analysis', 'presentation', 'analysis_package'];
        if (level && !validLevels.includes(level)) {
            // Default to 'student' if invalid, or just proceed? Let's generic processing handle it or error.
            // For now, let's keep it flexible or default to 'student' if missing.
        }

        const supabase = await createClient();

        // Auth check
        const { data: { user } } = await supabase.auth.getUser();
        console.log(user ? `✅ User: ${user.id}` : '⚠️ No user');

        // Check quota and tier for authenticated users
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_tier')
                .eq('id', user.id)
                .single();

            const userTier = profile?.subscription_tier || 'free';

            // Tier-based depth restriction
            const restrictedLevels = ['academic', 'professor', 'deep_analysis', 'analysis_package'];
            if (userTier === 'free' && restrictedLevels.includes(level)) {
                return NextResponse.json({
                    error: 'Bu analiz derinliği için üyeliğinizi yükseltmeniz gerekmektedir.',
                    needsUpgrade: true
                }, { status: 403 });
            }

            const quotaCheck = await checkQuota(user.id, 'analyze');
            if (!quotaCheck.allowed) {
                return NextResponse.json({
                    error: 'Kullanım kotası aşıldı',
                    message: quotaCheck.reason,
                    needsUpgrade: true
                }, { status: 403 });
            }
        } else {
            // Guest trial only allows basic academic level
            if (level && level !== 'student' && level !== 'metadata') {
                return NextResponse.json({
                    error: 'Misafir kullanıcılar sadece temel analiz yapabilir.',
                    needsUpgrade: true
                }, { status: 403 });
            }
        }

        // Fetch document
        let query = supabase.from('documents').select('*').eq('id', documentId);
        if (user) query = query.eq('user_id', user.id);

        const { data: document, error: dbError } = await query.single();

        if (dbError || !document) {
            console.error('❌ Document not found:', dbError);
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        console.log('📄 Document:', document.name, document.file_type);

        // Update status to processing
        await supabase
            .from('documents')
            .update({ analysis_status: 'processing' })
            .eq('id', documentId);

        // Download file
        const { data: fileData, error: storageError } = await supabase.storage
            .from('documents')
            .download(document.file_path);

        if (storageError || !fileData) {
            console.error('❌ Storage error:', storageError);
            return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
        }

        console.log('📦 File downloaded, size:', fileData.size);

        // Prepare prompt
        // Prepare prompt
        let promptTemplate = '';

        if (level === 'metadata') {
            promptTemplate = `Yüklenmiş olan PDF dosyasını analiz et.
Sadece bu PDF dosyasının içeriğini kullan.
Dış bilgi kullanma.

Çıktının tamamı Türkçe olmak zorundadır. İngilizce tek bir cümle bile üretme.
Eğer PDF İngilizce bile olsa, çıktıyı mutlaka Türkçe üret.

Aşağıdaki bilgileri aynen çıkar:

1. Makalenin başlığı
2. Yazar isimleri
3. Yayın yılı (varsa)
4. Makalenin ilk paragrafının ilk iki cümlesi

Eğer bu bilgiler PDF’ten okunamıyorsa,
açıkça şu ifadeyi yaz:

"PDF içeriği okunamıyor veya metin çıkarılamadı."

Return ONLY valid JSON (no markdown, no code blocks):
{
  "title": "Makale başlığı",
  "authors": ["Yazar 1", "Yazar 2"],
  "year": "2024",
  "first_paragraph_intro": "İlk iki cümle...",
  "error": "PDF içeriği okunamıyor... (eğer okunamazsa)"
}`;
        } else if (level === 'deep_analysis') {
            promptTemplate = `Yüklenmiş olan akademik PDF dosyasını analiz et.

Sadece ve sadece bu PDF içeriğini kullan.
Dış bilgi kullanma ve tahmin yapma.

Çıktının tamamı Türkçe olmak zorundadır. İngilizce tek bir cümle bile üretme.
Eğer PDF İngilizce bile olsa, çıktıyı mutlaka Türkçe üret.

Aşağıdaki başlıklara göre kısa maddeler halinde cevap ver:

- Amaç ve Problem
- Yöntem
- Veri / Deney ortamı
- Bulgular
- Katkı
- Sınırlılıklar

Eğer herhangi bir başlık için PDF’te açık bilgi yoksa, şu ifadeyi yaz: "Bu bilgi makalede açıkça belirtilmemiştir."

Return ONLY valid JSON (no markdown, no code blocks):
{
  "amac_ve_problem": ["Madde 1", "Madde 2"],
  "yontem": ["Madde 1", "Madde 2"],
  "veri_deney_ortami": ["Madde 1", "Madde 2"],
  "bulgular": ["Madde 1", "Madde 2"],
  "katki": ["Madde 1", "Madde 2"],
  "sinirliliklar": ["Madde 1", "Madde 2"]
}`;
        } else if (level === 'presentation') {
            promptTemplate = `Yüklenmiş olan akademik PDF dosyasını analiz et.

Sadece ve sadece bu PDF dosyasının içeriğini kullan.
Dış bilgi kullanma, tahmin etme, uydurma yapma.

Çıktının tamamı Türkçe olmak zorundadır. İngilizce tek bir cümle bile üretme.
Eğer PDF İngilizce bile olsa, çıktıyı mutlaka Türkçe üret.

Bu PDF’e dayanarak TAM OLARAK 8 slayttan oluşan akademik bir sunum hazırla.

Her slayt için şu formatı kullan:

Slayt X Başlık:
- Madde
- Madde
- Madde

Her slaytta 3 ile 5 arasında kısa ve net madde olsun.

Slayt yapısı aşağıdaki sırayla ilerlemelidir:

1. Çalışmanın başlığı ve genel amacı
2. Problem tanımı
3. Makalenin kendi içinden kısa literatür bağlamı
4. Kullanılan yöntem / yaklaşım
5. Deney ortamı veya veri seti
6. Bulgular / sonuçlar
7. Çalışmanın katkısı (yenilik / novelty)
8. Sınırlılıklar ve gelecek çalışmalar

Sadece PDF’te açıkça bulunan bilgileri kullan.

Eğer bir slayt için PDF’te yeterli bilgi yoksa,
şu ifadeyi yaz:

"Bu slayt için makalede yeterli bilgi bulunmamaktadır."

Return ONLY valid JSON (no markdown, no code blocks):
{
  "slides": [
    {
      "slide_number": 1,
      "title": "Çalışmanın Başlığı ve Amacı",
      "content": ["Madde 1", "Madde 2", "Madde 3"]
    },
    {
      "slide_number": 2,
      "title": "Problem Tanımı",
      "content": ["Madde 1", "Madde 2", "Madde 3"]
    },
    // ... total 8 slides
  ]
}`;
        } else if (level === 'analysis_package') {
            promptTemplate = `Yüklenmiş olan akademik PDF dosyasını analiz et.

Sadece ve sadece bu PDF içeriğini kullan.
Dış bilgi kullanma, tahmin etme, uydurma yapma.

Çıktıyı tamamen Türkçe ver.

Aşağıdaki yapıda, kısa ve kompakt bir "Analiz Paketi" üret. Bu paket daha sonra sunum ve zihin haritası oluşturmak için kullanılacaktır.

Formatı aynen koru:

ANALIZ_PAKETI:

Başlık:
Yazarlar:
Yıl:

Amaç ve Problem:
Yöntem:
Veri / Deney ortamı:
Bulgular:
Katkı:
Sınırlılıklar:

Her alan en fazla 2–3 kısa madde içersin.
Eğer bir alan PDF’te açıkça yoksa: "Makale içinde açıkça belirtilmemiştir." yaz.

Return ONLY valid JSON (no markdown, no code blocks) with a single key 'analysis_package' containing the full formatted text string:
{
  "analysis_package": "ANALIZ_PAKETI:\\n\\nBaşlık: ..."
}`;
        } else {
            promptTemplate = `Bu ${document.file_type === 'pdf' ? 'PDF' : 'text'} belgesini ${level} seviyesindeki bir okuyucu için analiz et.

Çıktının tamamı Türkçe olmak zorundadır. İngilizce tek bir cümle bile üretme.
Eğer PDF İngilizce bile olsa, çıktıyı mutlaka Türkçe üret.

${level === 'student' ? 'Şunları sağla: net bir özet, zor terimler sözlüğü, 5 anahtar cümle.' : ''}
${level === 'academic' ? 'Şunları sağla: literatürdeki konumu, metodoloji eleştirisi, sınırlılıklar.' : ''}
${level === 'professor' ? 'Şunları sağla: atıf potansiyeli, karşıt görüş karşılaştırması, araştırma boşlukları.' : ''}

Ayrıca, öğrenme amacıyla en az 10 adet flashcard (ön yüzünde terim/soru, arka yüzünde ayrıntılı açıklama/cevap) ve en az 5 adet çoktan seçmeli quiz sorusu (her biri 4 şıklı ve bir doğru cevaplı) oluştur.

Sadece geçerli JSON döndür (markdown yok, kod bloğu yok). Anahtarlar İngilizce kalsın, değerler Türkçe olsun:
{
  "summary": "Ana özet (Türkçe)...",
  "key_points": ["Madde 1", "Madde 2", "Madde 3"],
  "glossary": { "Terim1": "Tanım1", "Terim2": "Tanım2" },
  "critique": {
    "strengths": ["Güçlü Yön 1", "Güçlü Yön 2"],
    "weaknesses": ["Zayıf Yön 1", "Zayıf Yön 2"],
    "methodology": "Metodoloji analizi..."
  },
  "level_specific_insight": "Seviyeye özel içgörüler...",
  "mind_map": {
    "name": "Ana Konu",
    "children": [
      { "name": "Alt Başlık 1", "children": [{ "name": "Detay 1" }] }
    ]
  },
  "citation_metadata": {
    "title": "Belge Başlığı",
    "author": "Yazar(lar)",
    "year": "2024",
    "doi": "Yoksa N/A",
    "publisher": "Yayıncı"
  },
  "study_module": {
    "flashcards": [
      { "front": "1. Terim veya Soru", "back": "Burada açıklama veya cevap mutlaka olmalı" },
      { "front": "2. Terim veya Soru", "back": "Burada açıklama veya cevap mutlaka olmalı" }
      // En az 10 tane
    ],
    "quiz": [
      { 
        "question": "Soru 1?", 
        "options": ["Seçenek A", "Seçenek B", "Seçenek C", "Seçenek D"], 
        "answer": 0 
      }
      // En az 5 tane
    ]
  }
}`;
        }

        let result;

        if (document.file_type === 'pdf') {
            try {
                console.log('📄 Processing PDF...');

                // Convert to base64
                const arrayBuffer = await fileData.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');

                console.log('✅ PDF converted to base64');

                // Use Gemini model (imported from lib/gemini)
                // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

                console.log('🤖 Sending to Gemini...');

                result = await model.generateContent([
                    {
                        inlineData: {
                            mimeType: 'application/pdf',
                            data: base64
                        }
                    },
                    { text: promptTemplate }
                ]);

                console.log('✅ Gemini responded');

            } catch (pdfError: any) {
                console.error('❌ PDF processing error:', pdfError);
                console.error('Error details:', {
                    message: pdfError.message,
                    stack: pdfError.stack,
                    name: pdfError.name
                });
                return NextResponse.json({
                    error: 'PDF processing failed',
                    details: pdfError.message
                }, { status: 500 });
            }
        } else if (document.file_type === 'url') {
            console.log('🌐 Processing URL...');
            const urlText = (await fileData.text()).trim();
            console.log('Fetching URL:', urlText);
            try {
                const urlResponse = await fetch(urlText);
                const html = await urlResponse.text();
                // Basic HTML body extraction
                const bodyMatch = html.match(/<body[^>]*>([\w|\W]*)<\/body>/im);
                let contentText = bodyMatch ? bodyMatch[1] : html;
                contentText = contentText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
                contentText = contentText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
                contentText = contentText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

                result = await model.generateContent(
                    promptTemplate + '\n\nDocument content:\n' + contentText.slice(0, 50000)
                );
            } catch (error) {
                console.error('URL Fetch Error:', error);
                throw new Error('URL içeriği okunamadı.');
            }
        } else {
            // Text files
            console.log('📝 Processing text file...');
            const text = await fileData.text();

            result = await model.generateContent(
                promptTemplate + '\n\nDocument content:\n' + text.slice(0, 50000)
            );
        }

        // Parse response
        const response = await result.response;
        const textResponse = response.text();

        console.log('📝 Response length:', textResponse.length);

        let analysisData;
        try {
            // Clean response
            let cleanJson = textResponse.trim();

            // Remove markdown code blocks
            cleanJson = cleanJson.replace(/```json\s*/g, '').replace(/```\s*/g, '');

            // Remove any leading/trailing non-JSON characters
            const jsonStart = cleanJson.indexOf('{');
            const jsonEnd = cleanJson.lastIndexOf('}');

            if (jsonStart !== -1 && jsonEnd !== -1) {
                cleanJson = cleanJson.substring(jsonStart, jsonEnd + 1);
            }

            console.log('🔍 Parsing JSON...');
            analysisData = JSON.parse(cleanJson);
            console.log('✅ JSON parsed successfully');

        } catch (parseError: any) {
            console.error('❌ JSON parse error:', parseError);
            console.error('Raw response:', textResponse.substring(0, 500));
            return NextResponse.json({
                error: 'Failed to parse AI response',
                details: parseError.message,
                rawResponse: textResponse.substring(0, 200)
            }, { status: 500 });
        }

        // Update status
        await supabase
            .from('documents')
            .update({ analysis_status: 'completed' })
            .eq('id', documentId);

        // Analiz kredisini tüket (önce user_credits, sonra aylık kota)
        // Bu SADECE yeni Generate işleminde çağrılır
        if (user) {
            await consumeAnalysisCredit(user.id);
            // Feature usage log — admin istatistikleri için
            await logFeatureUsage(user.id, level || 'summary', documentId);
        }

        console.log('✅ Analysis complete');

        const jsonResponse = NextResponse.json(analysisData);

        // If this was a guest analysis, set the trial_completed cookie
        if (!user) {
            jsonResponse.cookies.set('trial_completed', 'true', {
                path: '/',
                maxAge: 60 * 60 * 24 * 365, // 1 year
                httpOnly: false, // Middleware needs to read it
            });
        }

        return jsonResponse;

    } catch (error: any) {
        console.error('❌ Fatal error:', error);
        console.error('Stack:', error.stack);

        // Update status to failed
        const supabase = await createClient();
        if (document) {
            await supabase
                .from('documents')
                .update({ analysis_status: 'failed' })
                .eq('id', document);
        }

        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.toString()
        }, { status: 500 });
    }
}
