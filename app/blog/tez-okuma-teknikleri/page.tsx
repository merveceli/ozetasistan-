import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, GraduationCap } from 'lucide-react';
import { ArticleStructuredData } from '@/components/StructuredData';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ozetasistani.com';

export const metadata: Metadata = {
    title: 'Tez Okuma Teknikleri: 500 Sayfalık Tezi 1 Günde Nasıl Anlarsınız?',
    description:
        'Akademik tezleri verimli okumak için kanıtlanmış stratejiler: SQ3R yöntemi, seçici okuma ve yapay zeka destekli tez analizi ile nasıl zaman kazanırsınız?',
    keywords: [
        'tez okuma teknikleri', 'akademik tez analizi', 'SQ3R yöntemi',
        'seçici okuma', 'tez nasıl okunur', 'doktora tezi anlama',
        'yüksek lisans tezi özet', 'tez özetleme yapay zeka',
    ],
    openGraph: {
        title: 'Tez Okuma Teknikleri — 500 Sayfayı 1 Günde Anlayın',
        description: 'SQ3R ve yapay zeka ile tez okuma stratejileri. Akademik verimliliğinizi artırın.',
        url: `${SITE_URL}/blog/tez-okuma-teknikleri`,
    },
    alternates: {
        canonical: `${SITE_URL}/blog/tez-okuma-teknikleri`,
    },
};

export default function TezOkumaTeknikler() {
    return (
        <>
            <ArticleStructuredData
                title="Tez Okuma Teknikleri: 500 Sayfalık Tezi 1 Günde Nasıl Anlarsınız?"
                description="SQ3R ve yapay zeka ile tez okuma stratejileri. Akademik verimliliğinizi artırın."
                url={`${SITE_URL}/blog/tez-okuma-teknikleri`}
                datePublished="2025-03-11"
                dateModified="2025-03-13"
            />
            <main className="max-w-3xl mx-auto px-6 py-12">
                <nav aria-label="Sayfa yolu" className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link href="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
                    <span>/</span>
                    <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                    <span>/</span>
                    <span className="text-foreground">Tez Okuma Teknikleri</span>
                </nav>

                <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/30">
                        Akademik Başarı
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" /> 9 dk okuma
                    </span>
                    <span className="text-sm text-muted-foreground">11 Mart 2025</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                    Tez Okuma Teknikleri: 500 Sayfalık Tezi 1 Günde Nasıl Anlarsınız?
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed mb-10 border-l-4 border-amber-500 pl-4">
                    Akademisyenler ve öğrenciler için yüzlerce sayfalık tezleri sindirmek büyük bir zorluktur.
                    Doğru tekniklerle bu süreyi dramatik biçimde kısaltmak mümkündür.
                </p>

                <article className="prose prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Neden Tez Okumak Bu Kadar Zor?</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Ortalama bir yüksek lisans tezi 80-150 sayfa arasında değişirken, doktora tezleri
                            300-600 sayfaya ulaşabilmektedir. Akademik dil karmaşıklığı, yoğun terminoloji ve
                            bölümler arası bağlantıları takip etmek, sıradan bir okuma hızıyla her tezin
                            anlaşılmasını saatler gerektirmektedir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">SQ3R Yöntemi: Kanıtlanmış Tez Okuma Stratejisi</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            SQ3R, Francis Robinson tarafından 1940&apos;larda geliştirilmiş ve günümüzde hâlâ en
                            etkin akademik okuma stratejilerinden biri olarak kabul görmektedir:
                        </p>
                        <div className="space-y-3">
                            {[
                                { letter: 'S', word: 'Survey (Tarama)', desc: 'Tezin tüm bölümlerini, başlıklarını, özet ve sonuç kısımlarını önce hızlıca gözden geçirin. Bu size tezin haritasını verir.' },
                                { letter: 'Q', word: 'Question (Soru Sor)', desc: 'Her bölüm başlığını soruya dönüştürün. "Bu bölümde ne bulacağım?" sorusu dikkatinizi odaklar.' },
                                { letter: 'R', word: 'Read (Oku)', desc: 'Sorularınıza cevap arar gibi okuyun. Her bölümü amaçlı ve aktif bir şekilde işleyin.' },
                                { letter: 'R', word: 'Recite (Tekrar Et)', desc: 'Her bölümü okuduktan sonra kitabı kapatıp ne öğrendiğinizi kendi kelimelerinizle ifade edin.' },
                                { letter: 'R', word: 'Review (Gözden Geçir)', desc: 'Tüm tezi bitirdikten sonra notlarınızı ve ana noktaları gözden geçirerek pekiştirin.' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-5 bg-card border border-border/50 rounded-2xl">
                                    <div className="w-10 h-10 flex-shrink-0 bg-amber-500/20 text-amber-400 font-black text-xl rounded-xl flex items-center justify-center">
                                        {item.letter}
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-0.5">{item.word}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Seçici Okuma: Her Bölümü Okumak Zorunda Değilsiniz</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            Tezlerin tüm bölümleri eşit öneme sahip değildir. Amacınıza göre odaklanmanız gereken
                            bölümler değişir:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { goal: 'Araştırma konusunu anlamak', focus: 'Giriş + Sonuç', priority: 'Yüksek' },
                                { goal: 'Metodoloji incelemek', focus: 'Yöntem bölümü', priority: 'Kritik' },
                                { goal: 'Bulguları görmek', focus: 'Bulgular + Tartışma', priority: 'Yüksek' },
                                { goal: 'Kaynak aramak', focus: 'Kaynakça', priority: 'Orta' },
                            ].map((item) => (
                                <div key={item.goal} className="p-4 bg-card border border-border/50 rounded-xl">
                                    <p className="font-semibold text-sm mb-1">{item.goal}</p>
                                    <p className="text-primary text-sm font-bold">{item.focus}</p>
                                    <span className="text-xs text-muted-foreground">Öncelik: {item.priority}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Yapay Zeka Destekli Tez Analizi ile Saatler Kazanın</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Tüm bu teknikleri uygulamak zamanınızı önemli ölçüde kısaltır. Ancak Özet Asistanı
                            ile bir tezi analiz ettirdiğinizde bu süreç dakikalara iner. Sistem otomatik olarak:
                        </p>
                        <ul className="mt-4 space-y-2 text-foreground/80">
                            <li className="flex gap-3"><span className="text-primary">→</span> Araştırma sorusunu ve hipotezi çıkarır</li>
                            <li className="flex gap-3"><span className="text-primary">→</span> Metodoloji bölümünü özetler</li>
                            <li className="flex gap-3"><span className="text-primary">→</span> Ana bulguları maddeler halinde listeler</li>
                            <li className="flex gap-3"><span className="text-primary">→</span> Sınırlılıkları ve gelecek araştırma önerilerini belirler</li>
                            <li className="flex gap-3"><span className="text-primary">→</span> Anahtar kavramlardan flashcard ve zihin haritası üretir</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Sonuç: Akıllı Okuma, Verimli Araştırma</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Tez okuma artık saatler sürmek zorunda değil. SQ3R gibi kanıtlanmış teknikleri
                            yapay zeka destekli araçlarla birleştirdiğinizde, 500 sayfalık bir tezi gerçekten
                            1-2 saat içinde özümseyebilirsiniz. Özet Asistanı bu dönüşümü mümkün kılan Türkçe
                            dünyasının ilk ve tek entegre akademik AI platformudur.
                        </p>
                    </section>
                </article>

                <div className="mt-12 p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-3xl text-center">
                    <GraduationCap className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Tezini Hemen Analiz Et</h2>
                    <p className="text-muted-foreground mb-6">500 sayfalık tezi dakikalar içinde özetle.</p>
                    <Link
                        href="/auth/signup"
                        id="blog-article-cta-tez"
                        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all"
                    >
                        Ücretsiz Başla <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <nav className="mt-10 flex justify-between items-center border-t border-border/50 pt-8">
                    <Link href="/blog/zihin-haritasi-nedir" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Önceki Makale
                    </Link>
                    <Link href="/blog" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Tüm Makaleler <ArrowRight className="w-4 h-4" />
                    </Link>
                </nav>
            </main>
        </>
    );
}
