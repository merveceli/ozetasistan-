import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { checkQuota, consumeAnalysisCredit, logFeatureUsage } from '@/lib/quota';
import { getSummaryLengthInstruction, getSummaryLanguageInstruction, UserSettings } from '@/lib/userSettings';

// Vercel Serverless ve Edge fonksiyonları için zaman aşımı (Timeout) süresini maksimuma çıkarır (Hobby: 60s, Pro: 300s)
export const maxDuration = 60;

export async function POST(request: Request) {
  let currentDocumentId: string | null = null;
  try {
    console.log('🔍 Analysis request start');
    const { documentId, level, settings, force } = await request.json() as { documentId: string, level: string, settings?: UserSettings, force?: boolean };
    currentDocumentId = documentId; // Assign documentId to currentDocumentId
    console.log('📄 Request data:', { documentId, level, settings, force });

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Analiz yapmak için oturum açmanız gerekmektedir.' }, { status: 401 });
    }

    console.log(`✅ User: ${user.id}`);

    // Check quota and tier
    const quotaCheck = await checkQuota(user.id, 'analyze');
    if (!quotaCheck.allowed) {
      return NextResponse.json({
        error: 'Kullanım kotası aşıldı',
        message: quotaCheck.reason,
        needsUpgrade: true
      }, { status: 403 });
    }

    // Fetch document
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (dbError || !document) {
      console.error('❌ Document not found:', dbError);
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    console.log('📄 Document:', document.name, document.file_type);

    // 🚀 CACHE KONTROLÜ: Eğer bu level daha önce analiz edilmişse, 
    // belgenin genel statusü ne olursa olsun (başka bir level processing olsa bile) doğrudan önbelleği dön!
    if (!force && document.metadata && document.metadata[level]) {
      console.log(`✅ Found cached analysis for level: ${level}. Skipping AI generation to save quota.`);
      return NextResponse.json(document.metadata[level]);
    }

    // 🚀 PROCESSING KONTROLÜ: Eğer şu an bu belge tamamen aynı level için işleniyorsa,
    // (yani kullanıcı art arda sayfayı yeniliyorsa) Gemini'a üst üste 3-4 aynı istek atmasını engelle!
    if (!force && document.analysis_status === 'processing') {
      return NextResponse.json({
        error: 'Şu anda sistem zaten bu veriyi analiz ediyor. Lütfen birkaç saniye bekleyin...',
      }, { status: 429 });
    }

    const supabaseAdmin = createAdminClient();

    // Update status to processing
    await supabaseAdmin
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

    // ─── User Settings Instructions ───────────────────────────────────────
    const lengthInstruction = settings?.summaryLength ? getSummaryLengthInstruction(settings.summaryLength) : '';
    const langInstruction = settings?.summaryLanguage ? getSummaryLanguageInstruction(settings.summaryLanguage) : 'Ciktinin tamami Turkce olmalidir. PDF Ingilizce bile olsa Turkce yaz.';

    // ─── Prompt Templates ────────────────────────────────────────────────
    let promptTemplate = '';

    if (level === 'metadata') {
      promptTemplate = `Yüklenmiş olan PDF dosyasını analiz et.
Sadece bu PDF dosyasının içeriğini kullan.
Dış bilgi kullanma.

Çıktının tamamı Türkçe olmak zorundadır.
Eğer PDF İngilizce bile olsa, çıktıyı mutlaka Türkçe üret.

Aşağıdaki bilgileri aynen çıkar:
1. Makalenin başlığı
2. Yazar isimleri
3. Yayın yılı (varsa)
4. Makalenin ilk paragrafının ilk iki cümlesi

Eğer bu bilgiler PDF'den okunamazsa, "error" alanına "PDF içeriği okunamıyor" yaz.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "title": "Makale başlığı",
  "authors": ["Yazar 1", "Yazar 2"],
  "year": "2024",
  "first_paragraph_intro": "İlk iki cümle...",
  "error": null
}`;

    } else if (level === 'deep_analysis') {
      promptTemplate = `Yüklenmiş olan akademik PDF dosyasını analiz et.

Sadece ve sadece bu PDF içeriğini kullan.
Dış bilgi kullanma ve tahmin yapma.
Çıktının tamamı Türkçe olmalıdır.

Aşağıdaki başlıklar için kısa maddeler oluştur. Her alan için 2-4 madde yeter.
Eğer bir başlık için PDF'de bilgi yoksa: "Bu bilgi makalede açıkça belirtilmemiştir." yaz.

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

Sadece bu PDF dosyasının içeriğini kullan. Dış bilgi kullanma, tahmin etme.
Çıktının tamamı Türkçe olmalıdır. PDF İngilizce bile olsa Türkçe yaz.

Bu PDF'e dayanarak TAM OLARAK 10 slayttan oluşan profesyonel bir akademik sunum hazırla.
Her slaytta 3-5 kısa madde olsun.

Slayt Akışı:
1. Başlık Slaytı (Tüm detaylar)
2. Giriş ve Problem Tanımı
3. Literatür Bağlamı
4. Metodoloji / Yöntem
5. Uygulama / Deney Tasarımı
6. Bulgular ve Veri Analizi
7. Tartışma ve Katkı
8. Sınırlılıklar ve Gelecek Çalışmalar
9. Anahtar Terimler Sözlüğü (Makaledeki 4-5 kritik terim)
10. Bilgi Testi (İçerikle ilgili 3 çoktan seçmeli soru)

Her slayt için aşağıdaki JSON yapısını kullan:
{
  "slides": [
    {
      "slide_number": 1,
      "title": "Slayt Başlığı",
      "content": ["Madde 1", "Madde 2"],
      "speaker_notes": "Sunumda söylenecek 2-3 cümlelik not.",
      "visual_suggestion": "İlgili görsel/diyagram tipi.",
      "layout_type": "title | content | comparison | steps | terms | quiz",
      "image_prompt": "English short visual prompt."
    }
  ]
}

Return ONLY valid JSON (no markdown, no code blocks):`;

    } else if (level === 'analysis_package') {
      promptTemplate = `Yüklenmiş olan akademik PDF dosyasını analiz et.

Sadece bu PDF içeriğini kullan. Dış bilgi kullanma.
Çıktıyı tamamen Türkçe ver.

Aşağıdaki yapıda kompakt bir Analiz Paketi üret. Her alan en fazla 2-3 madde içerecek.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "analysis_package": "ANALİZ_PAKETİ:\\n\\nBaşlık: ...\\nYazarlar: ...\\nYıl: ...\\n\\nAmaç ve Problem: ...\\nYöntem: ...\\nVeri: ...\\nBulgular: ...\\nKatkı: ...\\nSınırlılıklar: ..."
}`;

    } else if (level === 'student') {
      // ─── ÖĞRENCİ MODU: Kapsamlı ders notu formatı ───
      promptTemplate = `Sen çok deneyimli, sevecen ve konuyu gerçekten anlatan bir öğretmensin.
Verilen PDF belgesini, konuyu hiç bilmeyen bir lise veya üniversite öğrencisine sıfırdan anlat.

MUTLAK KURALLAR:
1. ${langInstruction}
2. Sadece geçerli JSON üret. Markdown KULLANMA, kod bloğu KULLANMA.
3. JSON içinde satırbaşları için sadece \\n kullan.
4. Özel karakterleri escape et.
5. UZUNLUK KURALI: ${lengthInstruction}

ÖZET YAPISI - summary alanı BU SIRAYA GÖRE yazılmalı:

GİRİŞ - konuya giriş, neden önemli, hayatta nerede karşılıyoruz? (en az 2 paragraf)
TEMEL KAVRAMLAR - PDF'deki temel tanımlar ve kavramlar sade dille (her birine örnek ver)
ANA KONULAR - PDF'deki TÜM ana başlık ve alt başlıklarını tek tek anlat, hiç atlama (en büyük bölüm)
UYGULAMA - bu konu gerçek hayatta nerede kullanılır, örnekler
ÖZET - akılda kalması gereken 3-5 kritik bilgi

Her bölüm iki \\n ile ayrılsın. En az 800 kelime olsun. Öğrenciye ders anlatan bir öğretmen gibi yaz.

Return ONLY valid JSON (no markdown wrapper, no code fences):
{
  "summary": "GİRİŞ:\\n[konuya giriş ve neden önemli - 2 paragraf]\\n\\nTEMEL KAVRAMLAR:\\n[temel tanımlar ve açıklamalar - her biri örnekli]\\n\\nANA KONULAR:\\n[PDF'deki her bölüm tek tek, kapsamlı anlatım]\\n\\nUYGULAMA:\\n[gerçek hayat örnekleri ve kullanım alanları]\\n\\nÖZET:\\n[akılda kalması gerekenler - 3-5 madde]",
  "key_points": [
    "1. kritik nokta - öğrenci için neden önemli olduğunu yaz",
    "2. kritik nokta",
    "3. kritik nokta",
    "4. kritik nokta",
    "5. kritik nokta",
    "6. kritik nokta",
    "7. kritik nokta"
  ],
  "glossary": {
    "Terim 1": "Öğrenci diline çevrilmiş açıklama ve günlük hayat örneği",
    "Terim 2": "Açıklama ve örnek",
    "Terim 3": "Açıklama ve örnek",
    "Terim 4": "Açıklama ve örnek",
    "Terim 5": "Açıklama ve örnek"
  },
  "critique": {
    "strengths": ["Belgenin öğrenci için anlaşılır yönü 1", "Güçlü yön 2", "Güçlü yön 3"],
    "weaknesses": ["Öğrenciyi zorlayabilecek nokta 1", "Eksik nokta 2"],
    "methodology": "Bu bilgi nasıl elde edilmiş? Araştırma mı, deney mi? Öğrenci için anlaşılır şekilde açıkla."
  },
  "level_specific_insight": "ÖĞRENCİ REHBERİ\\n\\nBu Konuyu Anlamak İçin Önce Şunları Bil:\\n- [ön bilgi 1]\\n- [ön bilgi 2]\\n\\nGünlük Hayatta Nerede Karşılaşırız:\\n- [somut örnek 1]\\n- [somut örnek 2]\\n\\nÖğrencilerin Sık Yaptığı Hatalar:\\n- [yanılgı 1 ve nasıl önlenir]\\n- [yanılgı 2 ve nasıl önlenir]\\n\\nSınavda Çıkabilecek Soru Tipleri:\\n- [soru tipi 1]\\n- [soru tipi 2]\\n- [soru tipi 3]\\n\\nKonuyu Pekiştirmek İçin İpuçları:\\n- [strateji 1]\\n- [strateji 2]",
  "mind_map": {
    "name": "Ana Konu",
    "children": [
      { "name": "Alt Başlık 1", "children": [{ "name": "Detay 1" }, { "name": "Detay 2" }] },
      { "name": "Alt Başlık 2", "children": [{ "name": "Detay 3" }, { "name": "Detay 4" }] },
      { "name": "Alt Başlık 3", "children": [{ "name": "Detay 5" }] }
    ]
  },
  "citation_metadata": {
    "title": "Belge Başlığı",
    "author": "Yazar(lar)",
    "year": "2024",
    "doi": "N/A",
    "publisher": "Yayıncı"
  },
  "study_module": {
    "flashcards": [
      { "front": "Konu 1 nedir?", "back": "Kısa net cevap ve günlük örnek" },
      { "front": "Konu 2 nedir?", "back": "Kısa net cevap ve günlük örnek" },
      { "front": "Konu 3 nedir?", "back": "Kısa net cevap ve günlük örnek" },
      { "front": "Konu 4 nedir?", "back": "Kısa net cevap ve günlük örnek" },
      { "front": "Konu 5 nedir?", "back": "Kısa net cevap ve günlük örnek" },
      { "front": "Konu 6 nedir?", "back": "Kısa net cevap ve günlük örnek" },
      { "front": "Konu 7 nedir?", "back": "Kısa net cevap ve günlük örnek" },
      { "front": "Konu 8 nedir?", "back": "Kısa net cevap ve günlük örnek" },
      { "front": "Konu 9 nedir?", "back": "Kısa net cevap ve günlük örnek" },
      { "front": "Konu 10 nedir?", "back": "Kısa net cevap ve günlük örnek" },
      { "front": "Konu 11 nedir?", "back": "Kısa net cevap ve günlük örnek" },
      { "front": "Konu 12 nedir?", "back": "Kısa net cevap ve günlük örnek" }
    ],
    "quiz": [
      { "question": "Bilgi sorusu 1?", "options": ["A seçeneği", "B seçeneği", "C seçeneği", "D seçeneği"], "answer": 0 },
      { "question": "Kavrama sorusu 2?", "options": ["A seçeneği", "B seçeneği", "C seçeneği", "D seçeneği"], "answer": 1 },
      { "question": "Uygulama sorusu 3?", "options": ["A seçeneği", "B seçeneği", "C seçeneği", "D seçeneği"], "answer": 2 },
      { "question": "Analiz sorusu 4?", "options": ["A seçeneği", "B seçeneği", "C seçeneği", "D seçeneği"], "answer": 0 },
      { "question": "Değerlendirme sorusu 5?", "options": ["A seçeneği", "B seçeneği", "C seçeneği", "D seçeneği"], "answer": 3 },
      { "question": "Sentez sorusu 6?", "options": ["A seçeneği", "B seçeneği", "C seçeneği", "D seçeneği"], "answer": 1 }
    ]
  }
}`;

    } else if (level === 'academic') {
      // ─── AKADEMİK MOD: PDF kalite değerlendirmesi ───
      promptTemplate = `Sen akademik bir danışman ve literatür uzmanısın. Verilen PDF belgesini hem içerik hem de akademik kalite açısından çok yönlü değerlendir.

MUTLAK KURALLAR:
1. ${langInstruction}
2. Sadece geçerli JSON üret. Markdown kullanma.
3. JSON içinde satırbaşları için sadece \\n kullan.
4. UZUNLUK KURALI: ${lengthInstruction}

AKADEMİK MOD - PDF KALİTE DEĞERLENDİRMESİ:
Bu mod belgeyi özetlemekle kalmaz; akademik kalitesini ve yeterlilğini değerlendirir.

Analiz et:
1. KAYNAK YETERLİLİĞİ - Yeterli referans var mı? Atıflar güncel mi? Kaynak çeşitliliği?
2. KAPSAM - Konu derinlemesine işlenmiş mi? Literatür boşluklar kapatılmış mı?
3. METODOLOJİK RIGOR - Yöntem uygun mu? Geçerlilik ve güvenilirlik sağlanmış mı?
4. TEORİK ÇERÇEVE - Hangi teoriye dayanıyor? Yeterli mi?
5. ÖZGÜNLÜK - Katkı orijinal mi? Alanda neyi öne sürüyor?

Özet: İçerik özeti → Akademik bağlam → Güçlü ve zayıf yönler → Genel değerlendirme (en az 4 paragraf)

Return ONLY valid JSON (no markdown, no code blocks):
{
  "summary": "içerik özeti paragraf\\n\\nakademik bağlam paragraf\\n\\ngüçlü ve zayıf yönler paragraf\\n\\ngenel değerlendirme paragraf",
  "key_points": [
    "Akademik bulgu 1", "Bulgu 2", "Bulgu 3", "Bulgu 4", "Bulgu 5", "Bulgu 6", "Bulgu 7"
  ],
  "glossary": {
    "Teknik Terim 1": "Akademik bağlamda tanımı ve literatürdeki kullanımı",
    "Teknik Terim 2": "Tanım ve kullanım",
    "Teknik Terim 3": "Tanım ve kullanım"
  },
  "critique": {
    "strengths": ["Akademik güçlü yön 1 - neden?", "Güçlü yön 2", "Güçlü yön 3"],
    "weaknesses": ["Akademik zayıf yön 1 - nasıl giderilebilir?", "Zayıf yön 2"],
    "methodology": "Kullanılan araştırma yöntemi, veri toplama ve analiz yaklaşımı, validite ve güvenilirlik değerlendirmesi."
  },
  "level_specific_insight": "AKADEMİK DEĞERLENDİRME RAPORU\\n\\nKaynak Yeterliliği:\\n[Bu belge yeterli kaynak sunuyor mu? Atıfların sayısı, güncelliği ve çeşitliliği? Eksik kaynaklar?]\\n\\nKapsam ve Derinlik:\\n[Konu yeterince ele alınmış mı? Hangi alt başlıklar eksik? Literatür boşlukları ne ölçüde kapatılıyor?]\\n\\nMetodoloji Değerlendirmesi:\\n[Araştırma deseni uygun mu? Örneklem yeterli mi? İstatistiksel analizler doğru mu?]\\n\\nTeorik Çerçeve:\\n[Hangi teorilere dayanıyor? Bu çerçeve yeterli mi? Alternatif teorik yaklaşımlar var mı?]\\n\\nGenel Akademik Değerlendirme:\\n[Bu belge literatüre ne kadar katkı sağlıyor? Hangi araştırmacı profile hitap ediyor?]",
  "mind_map": {
    "name": "Araştırma Konusu",
    "children": [
      { "name": "Araştırma Sorusu", "children": [{ "name": "Alt problem 1" }, { "name": "Alt problem 2" }] },
      { "name": "Metodoloji", "children": [{ "name": "Yöntem" }, { "name": "Veri" }] },
      { "name": "Bulgular", "children": [{ "name": "Ana bulgu" }, { "name": "Katkı" }] }
    ]
  },
  "citation_metadata": {
    "title": "Belge Başlığı",
    "author": "Yazar(lar)",
    "year": "2024",
    "doi": "N/A",
    "publisher": "Yayıncı"
  },
  "study_module": {
    "flashcards": [
      { "front": "Akademik kavram 1", "back": "Literatürdeki tanımı ve bu belgede nasıl kullanıldığı" },
      { "front": "Akademik kavram 2", "back": "Tanımı ve kullanımı" },
      { "front": "Akademik kavram 3", "back": "Tanımı ve kullanımı" },
      { "front": "Akademik kavram 4", "back": "Tanımı ve kullanımı" },
      { "front": "Akademik kavram 5", "back": "Tanımı ve kullanımı" },
      { "front": "Akademik kavram 6", "back": "Tanımı ve kullanımı" },
      { "front": "Akademik kavram 7", "back": "Tanımı ve kullanımı" },
      { "front": "Akademik kavram 8", "back": "Tanımı ve kullanımı" },
      { "front": "Akademik kavram 9", "back": "Tanımı ve kullanımı" },
      { "front": "Akademik kavram 10", "back": "Tanımı ve kullanımı" }
    ],
    "quiz": [
      { "question": "Akademik analitik soru 1?", "options": ["A", "B", "C", "D"], "answer": 0 },
      { "question": "Analitik soru 2?", "options": ["A", "B", "C", "D"], "answer": 1 },
      { "question": "Analitik soru 3?", "options": ["A", "B", "C", "D"], "answer": 2 },
      { "question": "Analitik soru 4?", "options": ["A", "B", "C", "D"], "answer": 3 },
      { "question": "Analitik soru 5?", "options": ["A", "B", "C", "D"], "answer": 0 }
    ]
  }
}`;

    } else if (level === 'professor') {
      // ─── PROFESÖR MODU: İleri düzey akademik analiz ───
      promptTemplate = `Sen alanında uzman, yılların deneyimine sahip bir profesörsün. Verilen PDF belgesini, meslektaşın olan başka bir profesöre sunar gibi ileri düzey akademik terminolojiyle analiz et.

MUTLAK KURALLAR:
1. ${langInstruction} Teknik terimler orijinal dilde parantez içinde gösterilebilir.
2. Sadece geçerli JSON üret. Markdown kullanma.
3. JSON içinde satırbaşları için sadece \\n kullan.
4. UZUNLUK KURALI: ${lengthInstruction}

PROFESÖR MODU - İLERİ DÜZEY ANALİZ:
- Epistemolojik çerçeve ve ontolojik varsayımları sorgula
- Metodolojik paradigma (pozitivizm, yorumsamacılık, eleştirel teori) belirle ve eleştir
- Atıf ağı potansiyeli ve h-endeks etkisini değerlendir
- Alandaki teorik çatışmalar bağlamında eseri konumlandır
- Karşıt argümanlar ve alternatif paradigmatik yaklaşımlar sun
- Araştırma boşlukları (research gap) ve gelecek araştırma ajandası çiz
- İstatistiksel güç analizi, effect size, replikasyon krizi bağlamında değerlendir

Özet: en az 5 teknik paragraf, akademik terminoloji ağırlıklı.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "summary": "Epistemolojik zemin paragraf\\n\\nMetodolojik paradigma paragraf\\n\\nTeorik konumlanma paragraf\\n\\nBulgular ve öncekilerle kıyaslama paragraf\\n\\nAlandaki yansımalar paragraf",
  "key_points": [
    "İleri düzey akademik iddia 1 - teorik çerçeve ile birlikte",
    "Kritik bulgu 2",
    "Metodolojik katkı 3",
    "Teorik çelişki 4",
    "Araştırma boşluğu 5",
    "Atıf potansiyeli 6",
    "Paradigmatik etkisi 7",
    "Gelecek araştırma yönü 8"
  ],
  "glossary": {
    "Teknik Terim 1 (EN)": "Tanımı, literatürdeki tartışma geçmişi ve bu eserle ilişkisi",
    "Teknik Terim 2 (EN)": "Tanımı ve ilişkisi",
    "Teknik Terim 3 (EN)": "Tanımı ve ilişkisi",
    "Teknik Terim 4 (EN)": "Tanımı ve ilişkisi"
  },
  "critique": {
    "strengths": ["Epistemolojik tutarlılık - neden?", "Metodolojik güç - hangi açıdan?", "Teorik özgünlük", "Atıf değeri"],
    "weaknesses": ["Metodolojik sınırlılık - hangi paradigmatik açıdan?", "İç geçerlilik sorunları", "Dış geçerlilik kısıtları", "Kavramsal belirsizlikler"],
    "methodology": "Araştırma paradigması (pozitivist/yorumsamacı/karma), örneklem teorisi (purposive/random), veri analiz yaklaşımı (tümevarım/tümdengelim), güvenilirlik ve geçerlilik stratejileri, olası önyargı kaynakları ve confounding değişkenler."
  },
  "level_specific_insight": "PROFESÖR MODU - İLERİ DÜZEY ANALİZ\\n\\nEpistemolojik Çerçeve:\\n[Eserin dayandığı bilgi teorisi? Ontolojik varsayımlar? Paradigma nerede konumlanıyor?]\\n\\nTeorik Çatışmalar ve Karşıt Görüşler:\\n[Bu eser hangi teorilere meydan okuyor? Hangi akademisyenler karşı argüman üretir? Literatür tartışması?]\\n\\nAtıf Ağı ve Alan Etkisi:\\n[Atıf potansiyeli? Hangi çalışmaları etkileyecek? h-endeksine katkısı? Hangi dergilerde yayımlanabilir?]\\n\\nMetodolojik Rigor Değerlendirmesi:\\n[Statistical power, effect size, p-value yorumlama, replikasyon krizi bağlamı, confounding faktörler]\\n\\nAraştırma Boşlukları (Research Gap):\\n[Hangi sorular açıkta kalıyor? Hangi metodoloji ile takip edilmeli? Interdisciplinary fırsatlar?]\\n\\nYayın Stratejisi:\\n[Hangi Q1/Q2 dergilere gönderilebilir? Hangi konferanslar uygun?]",
  "mind_map": {
    "name": "Araştırma Paradigması",
    "children": [
      { "name": "Epistemolojik Zemin", "children": [{ "name": "Ontolojik Varsayım" }, { "name": "Paradigma" }] },
      { "name": "Metodolojik Çerçeve", "children": [{ "name": "Araştırma Deseni" }, { "name": "Analiz Yaklaşımı" }] },
      { "name": "Teorik Katkı", "children": [{ "name": "Mevcut Teorilerle İlişki" }] },
      { "name": "Araştırma Boşlukları", "children": [{ "name": "Takip Araştırma Yönleri" }] }
    ]
  },
  "citation_metadata": {
    "title": "Belge Başlığı",
    "author": "Yazar(lar)",
    "year": "2024",
    "doi": "N/A",
    "publisher": "Yayıncı"
  },
  "study_module": {
    "flashcards": [
      { "front": "İleri düzey kavram 1", "back": "Literatürdeki kullanımı, tartışma tarihi ve bu eserdeki rolü" },
      { "front": "İleri düzey kavram 2", "back": "Kullanımı ve rolü" },
      { "front": "İleri düzey kavram 3", "back": "Kullanımı ve rolü" },
      { "front": "İleri düzey kavram 4", "back": "Kullanımı ve rolü" },
      { "front": "İleri düzey kavram 5", "back": "Kullanımı ve rolü" },
      { "front": "İleri düzey kavram 6", "back": "Kullanımı ve rolü" },
      { "front": "İleri düzey kavram 7", "back": "Kullanımı ve rolü" },
      { "front": "İleri düzey kavram 8", "back": "Kullanımı ve rolü" }
    ],
    "quiz": [
      { "question": "İleri düzey analitik soru 1 (sentez/değerlendirme)?", "options": ["A", "B", "C", "D"], "answer": 0 },
      { "question": "Analitik soru 2?", "options": ["A", "B", "C", "D"], "answer": 1 },
      { "question": "Analitik soru 3?", "options": ["A", "B", "C", "D"], "answer": 2 },
      { "question": "Analitik soru 4?", "options": ["A", "B", "C", "D"], "answer": 3 },
      { "question": "Analitik soru 5?", "options": ["A", "B", "C", "D"], "answer": 0 }
    ]
  }
}`;

    } else {
      // Fallback — beklenmedik level değerleri için student modunu kullan
      promptTemplate = `Verilen belgeyi Turkce olarak ozetle.
JSON formatinda don: { "summary": "ozet", "key_points": ["madde 1", "madde 2"], "glossary": {}, "critique": { "strengths": [], "weaknesses": [], "methodology": "" }, "level_specific_insight": "", "mind_map": { "name": "Konu", "children": [] }, "citation_metadata": { "title": "", "author": "", "year": "", "doi": "", "publisher": "" }, "study_module": { "flashcards": [], "quiz": [] } }`;
    }

    // ─── Gemini API Call ─────────────────────────────────────────────────
    let result;

    if (document.file_type === 'pdf') {
      try {
        console.log('📄 Processing PDF...');
        const arrayBuffer = await fileData.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        console.log('✅ PDF converted to base64');
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
        // Mark as failed
        await supabase
          .from('documents')
          .update({ analysis_status: 'failed' })
          .eq('id', documentId);
        return NextResponse.json({
          error: 'PDF isleme hatasi. Lutfen tekrar deneyin.',
          details: pdfError.message
        }, { status: 500 });
      }

    } else if (document.file_type === 'image') {
      try {
        console.log('🖼️ Processing Image (OCR/Handwriting)...');
        const arrayBuffer = await fileData.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        
        const ocrPrompt = `Gonderilen resmi/el yazisini cok dikkatli bir sekilde oku. 
        Eger bu bir el yazisi notuysa, her kelimeyi dogru cevirdiginden emin ol.
        Okudugun metni temel alarak su analizi yap:
        
        ${promptTemplate}`;

        result = await model.generateContent([
          {
            inlineData: {
              mimeType: 'image/jpeg', // Standard for images in Gemini
              data: base64
            }
          },
          { text: ocrPrompt }
        ]);
        console.log('✅ Gemini Image/OCR responded');
      } catch (imgError: any) {
        console.error('❌ Image processing error:', imgError);
        return NextResponse.json({ error: 'Resim/OCR işleme hatası.', details: imgError.message }, { status: 500 });
      }

    } else if (document.file_type === 'url') {
      console.log('🌐 Processing URL...');
      const urlText = (await fileData.text()).trim();
      console.log('Fetching URL:', urlText);
      try {
        // Gerçek tarayıcı gibi davran: bot korumasını atlatmak için User-Agent ekle
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 saniye timeout

        const urlResponse = await fetch(urlText, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
          }
        });
        clearTimeout(timeoutId);

        if (!urlResponse.ok) {
          throw new Error(`Web sayfası ${urlResponse.status} hatası döndürdü. Sayfa herkese açık olmayabilir.`);
        }

        const html = await urlResponse.text();

        // HTML'den temiz metin çıkar
        const bodyMatch = html.match(/<body[^>]*>([\w|\W]*)<\/body>/im);
        let contentText = bodyMatch ? bodyMatch[1] : html;
        // script, style, nav, header, footer gibi gereksiz elemanları temizle
        contentText = contentText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
        contentText = contentText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
        contentText = contentText.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ');
        contentText = contentText.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ');
        contentText = contentText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

        if (contentText.length < 100) {
          throw new Error('Web sayfasından yeterli içerik alınamadı. Sayfa JavaScript gerektiriyor veya erişime kapalı olabilir.');
        }

        console.log('✅ URL content extracted, length:', contentText.length);

        result = await model.generateContent(
          promptTemplate + '\n\nDocument content:\n' + contentText.slice(0, 50000)
        );
      } catch (error: any) {
        console.error('URL Fetch Error:', error);
        if (error.name === 'AbortError') {
          throw new Error('Web sayfası çok uzun süre yanıt vermedi (15 saniye). Farklı bir URL deneyin.');
        }
        throw new Error(error.message || 'URL içeriği okunamadı. URL\'nin herkese açık olduğundan emin olun.');
      }

    } else {
      console.log('📝 Processing text file...');
      const text = await fileData.text();
      result = await model.generateContent(
        promptTemplate + '\n\nDocument content:\n' + text.slice(0, 50000)
      );
    }

    // ─── Parse Response ───────────────────────────────────────────────────
    const response = await result.response;
    const textResponse = response.text();
    console.log('📝 Response length:', textResponse.length);

    let analysisData;
    try {
      let cleanJson = textResponse.trim();

      // Remove markdown code blocks if present
      cleanJson = cleanJson.replace(/```json\s*/gi, '').replace(/```\s*/g, '');

      // Find JSON boundaries
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
      console.error('Raw response (first 500):', textResponse.substring(0, 500));

      // Mark as failed using admin client
      await supabaseAdmin
        .from('documents')
        .update({ analysis_status: 'failed' })
        .eq('id', documentId);

      return NextResponse.json({
        error: 'Yapay zeka yanıtı işlenemedi. Lütfen tekrar deneyin.',
        details: parseError.message,
        aiResponse: textResponse.substring(0, 500) // Hatayı net görebilmemiz için ilk 500 karakter
      }, { status: 500 });
    }

    // ─── Save & Respond ───────────────────────────────────────────────────
    const existingMetadata = document.metadata || {};
    const updatedMetadata = {
      ...existingMetadata,
      [level]: analysisData
    };

    const { error: updateError } = await supabaseAdmin
      .from('documents')
      .update({
        analysis_status: 'completed',
        metadata: updatedMetadata
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('❌ Failed to save analysis metadata:', updateError);
    } else {
      console.log('✅ Metadata saved to Supabase');
    }

    if (user) {
      await consumeAnalysisCredit(user.id);
      await logFeatureUsage(user.id, level || 'summary', documentId);
    }

    console.log('✅ Analysis complete');

    const jsonResponse = NextResponse.json(analysisData);

    if (!user) {
      jsonResponse.cookies.set('trial_completed', 'true', {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: false,
      });
    }

    return jsonResponse;

  } catch (error: any) {
    console.error('❌ Fatal error:', error);
    console.error('Stack:', error.stack);

    try {
      if (currentDocumentId) {
        const supabase = await createClient();
        await supabase
          .from('documents')
          .update({ analysis_status: 'failed' })
          .eq('id', currentDocumentId);
      }
    } catch { /* ignore cleanup errors */ }

    return NextResponse.json({
      error: error.message || 'Bir sunucu hatası oluştu, işlem zaman aşımına uğramış olabilir.',
      details: error.toString()
    }, { status: 500 });
  }
}
