import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, Languages, Lightbulb, BookOpen } from 'lucide-react';
import { ArticleStructuredData } from '@/components/StructuredData';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ozetasistani.com';

export const metadata: Metadata = {
    title: 'Akademik İngilizce Metinleri Çevirmeden Anlama Rehberi',
    description:
        'Google Translate kullanmayı bırakın. İngilizce makaleleri orijinal dilinde anlayarak analiz etmenin ipuçları ve akademik okuma teknikleri.',
    keywords: [
        'ingilizce makale çeviri', 'akademik ingilizce okuma', 'makale çeviri',
        'yabancı dil makale', 'akademik okuma taktikleri', 'ingilizce tez okuma'
    ],
    openGraph: {
        title: 'İngilizce Makaleleri Çevirmeden Anlama Taktikleri',
        description: 'İngilizce seviyeniz yetersiz olsa bile akademik makaleleri hızlıca analiz etmenin yöntemleri.',
        url: `${SITE_URL}/blog/ingilizce-akademik-metin-cevirisi`,
    },
    alternates: {
        canonical: `${SITE_URL}/blog/ingilizce-akademik-metin-cevirisi`,
    },
};

export default function IngilizceMetinCevirisi() {
    return (
        <>
            <ArticleStructuredData
                title="Akademik İngilizce Metinleri Çevirmeden Anlama Rehberi"
                description="Google Translate kullanmayı bırakın. İngilizce makaleleri doğrudan kavrayarak okuma hızı kazanmanın yolları."
                url={`${SITE_URL}/blog/ingilizce-akademik-metin-cevirisi`}
                datePublished="2025-03-14"
                dateModified="2025-03-14"
            />
            <main className="max-w-3xl mx-auto px-6 py-12">
                {/* Breadcrumb */}
                <nav aria-label="Sayfa yolu" className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link href="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
                    <span>/</span>
                    <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                    <span>/</span>
                    <span className="text-foreground">Akademik İngilizce Okuma</span>
                </nav>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Dil Gelişimi</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="w-3.5 h-3.5" /> 9 dk okuma</span>
                    <span className="text-sm text-muted-foreground">14 Mart 2025</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                    Akademik İngilizce Metinleri Çevirmeden Anlama Rehberi
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed mb-10 border-l-4 border-emerald-500 pl-4">
                    Türkçe kaynaklar yetersiz kaldığı için hepimiz İngilizce makalelere mecbur kalıyoruz. 
                    Tüm metni kopyalayıp çeviri araçlarına yapıştırmak ise akademik terminolojiyi ("jargon") bozuyor. 
                    Peki bu sorunu nasıl çözeceğiz?
                </p>

                <article className="prose prose-invert max-w-none space-y-8">
                    
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Languages className="w-6 h-6 text-emerald-500" /> Kelime Kelime Çevirinin Zararları
                        </h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            Otomatik çeviri araçları, akademik metinlerde geçen bir deyimi veya teori adını doğrudan kelime 
                            olarak çevirdiği için okuduğunuzu anlama oranınız yarı yarıya düşebilir. 
                        </p>
                        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-sm mt-4">
                            <strong>Örnek:</strong> İngilizce psikoloji makalesinde geçen <em>"Cognitive Load Theory"</em> terimi,
                            bazen "Bilişsel Yük Teorisi" yerine "Kavramsal Ağırlık Kuramı" gibi yanlış bağlamlarda çevrilebilir ve asıl anlamı yitirilir.
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Taktik 1: Sadece Bağlaçları ve Fiilleri Çözün</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Akademik bir cümlenin kalbi <strong>bağlaçlar (although, implies, resulting in)</strong> ve <strong>fiillerdir (demonstrates, evaluates)</strong>.
                            Uzun ve komplike tamlamaları çevirmeye çalışıp beyninizi yormak yerine şunu yapın: cümlenin öznesi 
                            ne yapmış? Bunun sonucunda ne olmuş? Diğer sıfatları çöpe atarak hızlı okuyun.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Taktik 2: Paragraf Başı ve Sonu Kuralı</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Akademik İngilizce çok sistematik bir dildir. Her paragrafın ilk cümlesi <em>Topic Sentence</em> (Ana Fikir), 
                            son cümlesi ise <em>Concluding Sentence</em> (Sonuç / Geçiş) cümlesidir. Sadece bir paragrafın 
                            başına ve sonuna göz atarak ortadaki yoğun kanıt ve alıntı kısmını atlayabilirsiniz.
                        </p>
                    </section>

                    <section className="bg-card border border-border/50 p-6 rounded-3xl mt-8">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Lightbulb className="w-6 h-6 text-yellow-500" /> Sır: Yapay Zeka ile Native Dilinde Analiz
                        </h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            En iyi çözüm, İngilizce bir PDF makalesini asıl dilini bozmadan, ancak sadece ana argümanları ve 
                            sonuçları Türkçe raporlamak üzere tasarlanmış bir yapay zeka asistanı kullanmaktır.
                        </p>
                        <ol className="list-decimal pl-5 space-y-2 text-sm text-foreground/80">
                            <li>İngilizce PDF'i <strong>Özet Asistanı'na</strong> yükleyin.</li>
                            <li>"Dil Çevirisi" yapmak yerine, sistemden <em>"Bu makalenin ana bulgularını ve literatüre katkısını Türkçe maddeleştir"</em> komutuyla bir analiz isteyin.</li>
                            <li>Makalenin özüne Türkçe hakim olduğunuz için, orijinal İngilizce PDF'teki tabloları veya grafikleri okurken anlamanız anında hızlanacaktır.</li>
                        </ol>
                    </section>

                </article>

                {/* CTA */}
                <div className="mt-12 p-8 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl text-center">
                    <BookOpen className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Dil Engelini Aşın</h2>
                    <p className="text-muted-foreground mb-6">İngilizce belgelerinizi yükleyin, Türkçe detaylı özetlere ve flashcardlara anında ulaşın.</p>
                    <Link
                        href="/auth/signup"
                        className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-emerald-600 transition-all"
                    >
                        Denemeye Başla <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="mt-10 flex justify-between items-center border-t border-border/50 pt-8">
                    <Link href="/blog/pomodoro-teknigi-ile-ders-calisma" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Önceki
                    </Link>
                    <Link href="/blog/sinav-kaygisi-nasil-yenilir" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Sonraki <ArrowRight className="w-4 h-4" />
                    </Link>
                </nav>
            </main>
        </>
    );
}
