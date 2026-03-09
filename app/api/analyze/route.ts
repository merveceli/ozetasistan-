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
      const restrictedLevels = ['academic', 'professor', 'deep_analysis'];
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
      // Guest trial only allows basic levels and analysis_package for slides
      if (level && level !== 'student' && level !== 'metadata' && level !== 'analysis_package') {
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

    // 🚀 CACHE KONTROLÜ: Eğer bu level daha önce analiz edilmişse, 
    // belgenin genel statusü ne olursa olsun (başka bir level processing olsa bile) doğrudan önbelleği dön!
    if (!force && document.metadata && document.metadata[level]) {
      console.log(`✅ Found cached analysis for level: ${level}. Skipping AI generation to save quota.`);
      return NextResponse.json(document.metadata[level]);
    }

    // 🚀 PROCESSING KONTROLÜ: Eğer şu an bu belge tamamen aynı level için işleniyorsa,
    // (yani kullanıcı art arda sayfayı yeniliyorsa) Gemini'a üst üste 3-4 aynı istek atmasını engelle!
    if (!force && document.analysis_status === `processing_${level}`) {
      return NextResponse.json({
        error: 'Şu anda sistem zaten bu veriyi analiz ediyor. Lütfen birkaç saniye bekleyin...',
      }, { status: 429 });
    }

    const supabaseAdmin = createAdminClient();

    // Update status to processing (kullanıcının hangi seviyeyi process ettiğini bilmek için)
    await supabaseAdmin
      .from('documents')
      .update({ analysis_status: `processing_${level}` })
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
      promptTemplate = `Yuklenmiş olan PDF dosyasini analiz et.
Sadece bu PDF dosyasinin icerigini kullan.
Dis bilgi kullanma.

Ciktinin tamami Turkce olmak zorundadir.
Eger PDF Ingilizce bile olsa, ciktiy mutlaka Turkce uret.

Asagidaki bilgileri aynen cikar:
1. Makalenin basligi
2. Yazar isimleri
3. Yayin yili (varsa)
4. Makalenin ilk paragrafinin ilk iki cumlesi

Eger bu bilgiler PDF den okunamazsa, "error" alanina "PDF icerigi okunamiyor" yaz.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "title": "Makale basligi",
  "authors": ["Yazar 1", "Yazar 2"],
  "year": "2024",
  "first_paragraph_intro": "Ilk iki cumle...",
  "error": null
}`;

    } else if (level === 'deep_analysis') {
      promptTemplate = `Yuklenmiş olan akademik PDF dosyasini analiz et.

Sadece ve sadece bu PDF icerigini kullan.
Dis bilgi kullanma ve tahmin yapma.
Ciktinin tamami Turkce olmalidir.

Asagidaki basliklar icin kisa maddeler olustur. Her alan icin 2-4 madde yeter.
Eger bir baslik icin PDF de bilgi yoksa: "Bu bilgi makalede acikca belirtilmemistir." yaz.

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
      promptTemplate = `Yuklenmiş olan akademik PDF dosyasini analiz et.

Sadece bu PDF dosyasinin icerigini kullan. Dis bilgi kullanma, tahmin etme.
Ciktinin tamami Turkce olmalidir. PDF Ingilizce bile olsa Turkce yaz.

Bu PDF e dayanarak TAM OLARAK 10 slayttan olusan profesyonel bir akademik sunum hazirla.
Her slaytta 3-5 kisa madde olsun.

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
      "image_prompt": "İngilizce görsel üretim promptu."
    }
  ]
}

Return ONLY valid JSON (no markdown, no code blocks):`;

    } else if (level === 'analysis_package') {
      promptTemplate = `Yuklenmiş olan akademik PDF dosyasini analiz et.

Sadece bu PDF icerigini kullan. Dis bilgi kullanma.
Ciktiyi tamamen Turkce ver.

Asagidaki yapida kompakt bir Analiz Paketi uret. Her alan en fazla 2-3 madde icerecek.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "analysis_package": "ANALIZ_PAKETI:\\n\\nBaslik: ...\\nYazarlar: ...\\nYil: ...\\n\\nAmac ve Problem: ...\\nYontem: ...\\nVeri: ...\\nBulgular: ...\\nKatki: ...\\nSinirliliklar: ..."
}`;

    } else if (level === 'student') {
      // ─── ÖĞRENCİ MODU: Kapsamlı ders notu formatı ───
      promptTemplate = `Sen cok deneyimli, sevecen ve konuyu gercekten anlatan bir ogretmensin.
Verilen PDF belgesini, konuyu hic bilmeyen bir lise veya universite ogrencisine sifirdan anlat.

MUTLAK KURALLAR:
1. ${langInstruction}
2. Sadece gecerli JSON uret. Markdown KULLANMA, kod blogu KULLANMA.
3. JSON icinde satirbaslari icin sadece \\n kullan.
4. Ozel karakterleri escape et.
5. UZUNLUK KURALI: ${lengthInstruction}

OZET YAPISI - summary alani BU SIRAYA GORE yazilmali:

GIRIS - konuya giris, neden onemli, hayatta nerede karsilasiyoruz? (en az 2 paragraf)
TEMEL KAVRAMLAR - PDF deki temel tanimlar ve kavramlar sade dille (her birine ornek ver)
ANA KONULAR - PDF deki TUM ana baslik ve alt basliklarini tek tek anlat, hic atlama (en buyuk bolum)
UYGULAMA - bu konu gercek hayatta nerede kullanilir, ornekler
OZET - akilda kalmasi gereken 3-5 kritik bilgi

Her bolum iki \\n ile ayrilsin. En az 800 kelime olsun. Ogrenciye ders anlatan bir ogretmen gibi yaz.

Return ONLY valid JSON (no markdown wrapper, no code fences):
{
  "summary": "GIRIS:\\n[konuya giris ve neden onemli - 2 paragraf]\\n\\nTEMEL KAVRAMLAR:\\n[temel tanimlar ve aciklamalar - her biri ornekli]\\n\\nANA KONULAR:\\n[PDF deki her bolum tek tek, kapsamli anlatim]\\n\\nUYGULAMA:\\n[gercek hayat ornekleri ve kullanim alanlari]\\n\\nOZET:\\n[akilda kalmasi gerekenler - 3-5 madde]",
  "key_points": [
    "1. kritik nokta - ogrenci icin neden onemli oldugunu yaz",
    "2. kritik nokta",
    "3. kritik nokta",
    "4. kritik nokta",
    "5. kritik nokta",
    "6. kritik nokta",
    "7. kritik nokta"
  ],
  "glossary": {
    "Terim 1": "Ogrenci diline cevirilmis aciklama ve gunluk hayat ornegi",
    "Terim 2": "Aciklama ve ornek",
    "Terim 3": "Aciklama ve ornek",
    "Terim 4": "Aciklama ve ornek",
    "Terim 5": "Aciklama ve ornek"
  },
  "critique": {
    "strengths": ["Belgenin ogrenci icin anlasilir yonu 1", "Guclu yon 2", "Guclu yon 3"],
    "weaknesses": ["Ogrenciyi zorlayabilecek nokta 1", "Eksik nokta 2"],
    "methodology": "Bu bilgi nasil elde edilmis? Arastirma mi, deney mi? Ogrenci icin anlasılir sekilde acikla."
  },
  "level_specific_insight": "OGRENCI REHBERI\\n\\nBu Konuyu Anlamak Icin Once Sunlari Bil:\\n- [on bilgi 1]\\n- [on bilgi 2]\\n\\nGunluk Hayatta Nerede Karsilasariz:\\n- [somut ornek 1]\\n- [somut ornek 2]\\n\\nOgrencilerin Sik Yaptigi Hatalar:\\n- [yanilgi 1 ve nasil onlenir]\\n- [yanilgi 2 ve nasil onlenir]\\n\\nSinavda Cikabilecek Soru Tipleri:\\n- [soru tipi 1]\\n- [soru tipi 2]\\n- [soru tipi 3]\\n\\nKonuyu Pekistirmek Icin Ipuclari:\\n- [strateji 1]\\n- [strateji 2]",
  "mind_map": {
    "name": "Ana Konu",
    "children": [
      { "name": "Alt Baslik 1", "children": [{ "name": "Detay 1" }, { "name": "Detay 2" }] },
      { "name": "Alt Baslik 2", "children": [{ "name": "Detay 3" }, { "name": "Detay 4" }] },
      { "name": "Alt Baslik 3", "children": [{ "name": "Detay 5" }] }
    ]
  },
  "citation_metadata": {
    "title": "Belge Basligi",
    "author": "Yazar(lar)",
    "year": "2024",
    "doi": "N/A",
    "publisher": "Yayinci"
  },
  "study_module": {
    "flashcards": [
      { "front": "Konu 1 nedir?", "back": "Kisa net cevap ve gunluk ornek" },
      { "front": "Konu 2 nedir?", "back": "Kisa net cevap ve gunluk ornek" },
      { "front": "Konu 3 nedir?", "back": "Kisa net cevap ve gunluk ornek" },
      { "front": "Konu 4 nedir?", "back": "Kisa net cevap ve gunluk ornek" },
      { "front": "Konu 5 nedir?", "back": "Kisa net cevap ve gunluk ornek" },
      { "front": "Konu 6 nedir?", "back": "Kisa net cevap ve gunluk ornek" },
      { "front": "Konu 7 nedir?", "back": "Kisa net cevap ve gunluk ornek" },
      { "front": "Konu 8 nedir?", "back": "Kisa net cevap ve gunluk ornek" },
      { "front": "Konu 9 nedir?", "back": "Kisa net cevap ve gunluk ornek" },
      { "front": "Konu 10 nedir?", "back": "Kisa net cevap ve gunluk ornek" },
      { "front": "Konu 11 nedir?", "back": "Kisa net cevap ve gunluk ornek" },
      { "front": "Konu 12 nedir?", "back": "Kisa net cevap ve gunluk ornek" }
    ],
    "quiz": [
      { "question": "Bilgi sorusu 1?", "options": ["A secenegi", "B secenegi", "C secenegi", "D secenegi"], "answer": 0 },
      { "question": "Kavrama sorusu 2?", "options": ["A secenegi", "B secenegi", "C secenegi", "D secenegi"], "answer": 1 },
      { "question": "Uygulama sorusu 3?", "options": ["A secenegi", "B secenegi", "C secenegi", "D secenegi"], "answer": 2 },
      { "question": "Analiz sorusu 4?", "options": ["A secenegi", "B secenegi", "C secenegi", "D secenegi"], "answer": 0 },
      { "question": "Degerlendirme sorusu 5?", "options": ["A secenegi", "B secenegi", "C secenegi", "D secenegi"], "answer": 3 },
      { "question": "Sentez sorusu 6?", "options": ["A secenegi", "B secenegi", "C secenegi", "D secenegi"], "answer": 1 }
    ]
  }
}`;

    } else if (level === 'academic') {
      // ─── AKADEMİK MOD: PDF kalite değerlendirmesi ───
      promptTemplate = `Sen akademik bir danisман ve literatur uzmanisın. Verilen PDF belgesini hem icerik hem de akademik kalite acisindan cok yonlu degerlendir.

MUTLAK KURALLAR:
1. ${langInstruction}
2. Sadece gecerli JSON uret. Markdown kullanma.
3. JSON icinde satirbaslari icin sadece \\n kullan.
4. UZUNLUK KURALI: ${lengthInstruction}

AKADEMIK MOD - PDF KALITE DEGERLENDIRMESI:
Bu mod belgeyi ozetlemekle kalmaz; akademik kalitesini ve yeterlilgini degerlendirir.

Analiz et:
1. KAYNAK YETERLILIGI - Yeterli referans var mi? Atiflar guncel mi? Kaynak cesitliligi?
2. KAPSAM - Konu derinlemesine islenmis mi? Literatur bosluklar kapatilmis mi?
3. METODOLOJİK RIGOR - Yontem uygun mu? Gecerlilik ve guvenilirlik saglanmis mi?
4. TEORİK CERCEVE - Hangi teoriye dayanıyor? Yeterli mi?
5. OZGUNLUK - Katki orijinal mi? Alanda neyi one suruyor?

Ozet: Icerik ozeti → Akademik baglam → Guclu ve zayif yonler → Genel degerlendirme (en az 4 paragraf)

Return ONLY valid JSON (no markdown, no code blocks):
{
  "summary": "icerik ozeti paragraf\\n\\nakademik baglam paragraf\\n\\nguclu ve zayif yonler paragraf\\n\\ngenel degerlendirme paragraf",
  "key_points": [
    "Akademik bulgu 1", "Bulgu 2", "Bulgu 3", "Bulgu 4", "Bulgu 5", "Bulgu 6", "Bulgu 7"
  ],
  "glossary": {
    "Teknik Terim 1": "Akademik baglamda tanimi ve literaturdeki kullanimi",
    "Teknik Terim 2": "Tanim ve kullanim",
    "Teknik Terim 3": "Tanim ve kullanim"
  },
  "critique": {
    "strengths": ["Akademik guclu yon 1 - neden?", "Guclu yon 2", "Guclu yon 3"],
    "weaknesses": ["Akademik zayif yon 1 - nasil giderilebilir?", "Zayif yon 2"],
    "methodology": "Kullanilan arastirma yontemi, veri toplama ve analiz yaklasimi, validite ve guvenilirlik degerlendirmesi."
  },
  "level_specific_insight": "AKADEMIK DEGERLENDIRME RAPORU\\n\\nKaynak Yeterliligi:\\n[Bu belge yeterli kaynak sunuyor mu? Atiflarin sayisi, guncelligi ve cesitliligi? Eksik kaynaklar?]\\n\\nKapsam ve Derinlik:\\n[Konu yeterince ele alinmis mi? Hangi alt basliklar eksik? Literatur bosluklari ne olcude kapatiliyor?]\\n\\nMetodoloji Degerlendirmesi:\\n[Arastirma deseni uygun mu? Orneklem yeterli mi? İstatistiksel analizler dogru mu?]\\n\\nTeorik Cerceve:\\n[Hangi teorilere dayaniyor? Bu cerceve yeterli mi? Alternatif teorik yaklasimlar var mi?]\\n\\nGenel Akademik Degerlendirme:\\n[Bu belge literatore ne kadar katki sagliyor? Hangi arastirmaci profile hitap ediyor?]",
  "mind_map": {
    "name": "Arastirma Konusu",
    "children": [
      { "name": "Arastirma Sorusu", "children": [{ "name": "Alt problem 1" }, { "name": "Alt problem 2" }] },
      { "name": "Metodoloji", "children": [{ "name": "Yontem" }, { "name": "Veri" }] },
      { "name": "Bulgular", "children": [{ "name": "Ana bulgu" }, { "name": "Katki" }] }
    ]
  },
  "citation_metadata": {
    "title": "Belge Basligi",
    "author": "Yazar(lar)",
    "year": "2024",
    "doi": "N/A",
    "publisher": "Yayinci"
  },
  "study_module": {
    "flashcards": [
      { "front": "Akademik kavram 1", "back": "Literaturdeki tanimi ve bu belgede nasil kullanildigi" },
      { "front": "Akademik kavram 2", "back": "Tanimi ve kullanimi" },
      { "front": "Akademik kavram 3", "back": "Tanimi ve kullanimi" },
      { "front": "Akademik kavram 4", "back": "Tanimi ve kullanimi" },
      { "front": "Akademik kavram 5", "back": "Tanimi ve kullanimi" },
      { "front": "Akademik kavram 6", "back": "Tanimi ve kullanimi" },
      { "front": "Akademik kavram 7", "back": "Tanimi ve kullanimi" },
      { "front": "Akademik kavram 8", "back": "Tanimi ve kullanimi" },
      { "front": "Akademik kavram 9", "back": "Tanimi ve kullanimi" },
      { "front": "Akademik kavram 10", "back": "Tanimi ve kullanimi" }
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
      promptTemplate = `Sen alaninда uzman, yillarin deneyimine sahip bir profesorsun. Verilen PDF belgesini, meslektasin olan baska bir profesore sunar gibi ileri duzey akademik terminolojiyle analiz et.

MUTLAK KURALLAR:
1. ${langInstruction} Teknik terimler orijinal dilde parantez icinde gosterilebilir.
2. Sadece gecerli JSON uret. Markdown kullanma.
3. JSON icinde satirbaslari icin sadece \\n kullan.
4. UZUNLUK KURALI: ${lengthInstruction}

PROFESOR MODU - İLERI DUZEY ANALIZ:
- Epistemolojik cerceve ve ontolojik varsayimlari sorgula
- Metodolojik paradigma (pozitivizm, yorumsamacilik, elestirel teori) belirle ve elestir
- Atif agi potansiyeli ve h-endeks etkisini degerlendir
- Alandaki teorik catismalar baglaminda eseri konumlandir
- Karsit argümanlar ve alternatif paradigmatik yaklasimlar sun
- Arastirma boslukları (research gap) ve gelecek arastirma ajandasi ciz
- İstatistiksel guc analizi, effect size, replikasyon krizi baglaminda degerlendir

Ozet: en az 5 teknik paragraf, akademik terminoloji agirlikli.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "summary": "Epistemolojik zemin paragraf\\n\\nMetodolojik paradigma paragraf\\n\\nTeorik konumlanma paragraf\\n\\nBulgular ve oncekilerle kiyaslama paragraf\\n\\nAlandaki yansimalar paragraf",
  "key_points": [
    "İleri duzey akademik iddia 1 - teorik cerceve ile birlikte",
    "Kritik bulgu 2",
    "Metodolojik katki 3",
    "Teorik celisiki 4",
    "Arastirma boslugu 5",
    "Atif potansiyeli 6",
    "Paradigmatik etkisi 7",
    "Gelecek arastirma yonu 8"
  ],
  "glossary": {
    "Teknik Terim 1 (EN)": "Tanimi, literaturdeki tartisma gecmisi ve bu eserle iliskisi",
    "Teknik Terim 2 (EN)": "Tanimi ve iliskisi",
    "Teknik Terim 3 (EN)": "Tanimi ve iliskisi",
    "Teknik Terim 4 (EN)": "Tanimi ve iliskisi"
  },
  "critique": {
    "strengths": ["Epistemolojik tutarlilik - neden?", "Metodolojik guc - hangi acidon?", "Teorik ozgunluk", "Atif degeri"],
    "weaknesses": ["Metodolojik sinirlilik - hangi paradigmatik acidon?", "İc gecerlilik sorunlari", "Dis gecerlilik kisitlari", "Kavramsal belirsizlikler"],
    "methodology": "Arastirma paradigmasi (pozitivist/yorumsamaci/karma), orneklem teorisi (purposive/random), veri analiz yaklasimi (tumevariм/tumdengelim), guvenilirlik ve gecerlilik stratejileri, olasi onyargi kaynaklari ve confounding degiskenler."
  },
  "level_specific_insight": "PROFESOR MODU - İLERİ DUZEY ANALIZ\\n\\nEpistemolojik Cerceve:\\n[Eserin dayandigı bilgi teorisi? Ontolojik varsayımlar? Paradigma nerede konumlaniyor?]\\n\\nTeorik Catismalar ve Karsit Gorusler:\\n[Bu eser hangi teorilere meydan okuyor? Hangi akademisyenler karsi arguman uretir? Literatur tartismasi?]\\n\\nAtif Agi ve Alan Etkisi:\\n[Atif potansiyeli? Hangi calismalari etkileyecek? h-endeksine katkisi? Hangi dergilerde yayimlanabilir?]\\n\\nMetodolojik Rigor Degerlendirmesi:\\n[Statistical power, effect size, p-value yorumlama, replikasyon krizi baglamı, confounding faktorler]\\n\\nArastirma Boslukları (Research Gap):\\n[Hangi sorular acikta kaliyor? Hangi metodoloji ile takip edilmeli? Interdisciplinary firsatlar?]\\n\\nYayin Stratejisi:\\n[Hangi Q1/Q2 dergilere gonderilebilir? Hangi konferanslar uygun?]",
  "mind_map": {
    "name": "Arastirma Paradigmasi",
    "children": [
      { "name": "Epistemolojik Zemin", "children": [{ "name": "Ontolojik varsayim" }, { "name": "Paradigma" }] },
      { "name": "Metodolojik Cerceve", "children": [{ "name": "Arastirma deseni" }, { "name": "Analiz yaklasimi" }] },
      { "name": "Teorik Katki", "children": [{ "name": "Mevcut teorilerle iliski" }] },
      { "name": "Arastirma Boslukları", "children": [{ "name": "Takip arastirma yonleri" }] }
    ]
  },
  "citation_metadata": {
    "title": "Belge Basligi",
    "author": "Yazar(lar)",
    "year": "2024",
    "doi": "N/A",
    "publisher": "Yayinci"
  },
  "study_module": {
    "flashcards": [
      { "front": "İleri duzey kavram 1", "back": "Literaturdeki kullanimi, tartisma tarihi ve bu eserdeki rolu" },
      { "front": "İleri duzey kavram 2", "back": "Kullanimi ve rolu" },
      { "front": "İleri duzey kavram 3", "back": "Kullanimi ve rolu" },
      { "front": "İleri duzey kavram 4", "back": "Kullanimi ve rolu" },
      { "front": "İleri duzey kavram 5", "back": "Kullanimi ve rolu" },
      { "front": "İleri duzey kavram 6", "back": "Kullanimi ve rolu" },
      { "front": "İleri duzey kavram 7", "back": "Kullanimi ve rolu" },
      { "front": "İleri duzey kavram 8", "back": "Kullanimi ve rolu" }
    ],
    "quiz": [
      { "question": "İleri duzey analitik soru 1 (sentez/degerlendirme)?", "options": ["A", "B", "C", "D"], "answer": 0 },
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
        error: 'Yapay zeka yaniti isle nemedi. Lutfen tekrar deneyin.',
        details: parseError.message
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
