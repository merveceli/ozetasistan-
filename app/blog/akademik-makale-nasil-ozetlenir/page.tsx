import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, CheckCircle2, BookOpen } from 'lucide-react';
import { ArticleStructuredData } from '@/components/StructuredData';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ozetasistani.com';

export const metadata: Metadata = {
    title: 'Akademik Makale Nasıl Özetlenir? Yapay Zeka ile Hızlı Analiz Rehberi',
    description:
        'Yüzlerce sayfalık akademik makaleleri saniyeler içinde özet almak artık mümkün. Gemini AI destekli Özet Asistanı ile akademik analiz sürecinizi nasıl hızlandırabileceğinizi adım adım öğrenin.',
    keywords: [
        'akademik makale özetleme', 'PDF özetleme', 'yapay zeka makale analizi',
        'Gemini AI akademik', 'hızlı makale okuma', 'akademik verimlilik',
        'özet asistanı', 'AI ile makale özetleme 2025',
    ],
    openGraph: {
        title: 'Akademik Makale Nasıl Özetlenir? Yapay Zeka Rehberi',
        description: 'Gemini AI ile akademik makaleleri saniyeler içinde analiz edin. Adım adım rehber.',
        url: `${SITE_URL}/blog/akademik-makale-nasil-ozetlenir`,
    },
    alternates: {
        canonical: `${SITE_URL}/blog/akademik-makale-nasil-ozetlenir`,
    },
};

export default function AkademikMakaleNasilOzetlenir() {
    return (
        <>
            <ArticleStructuredData
                title="Akademik Makale Nasıl Özetlenir? Yapay Zeka ile Hızlı Analiz Rehberi"
                description="Yüzlerce sayfalık akademik makaleleri saniyeler içinde özet almak artık mümkün. Gemini AI destekli rehber."
                url={`${SITE_URL}/blog/akademik-makale-nasil-ozetlenir`}
                datePublished="2025-03-01"
                dateModified="2025-03-13"
            />
            <main className="max-w-3xl mx-auto px-6 py-12">
                {/* Breadcrumb */}
                <nav aria-label="Sayfa yolu" className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link href="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
                    <span>/</span>
                    <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                    <span>/</span>
                    <span className="text-foreground">Akademik Makale Özetleme</span>
                </nav>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-blue-500/20 text-blue-300 border-blue-500/30">Rehber</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="w-3.5 h-3.5" /> 8 dk okuma</span>
                    <span className="text-sm text-muted-foreground">1 Mart 2025</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                    Akademik Makale Nasıl Özetlenir? Yapay Zeka ile Hızlı Analiz Rehberi
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed mb-10 border-l-4 border-primary pl-4">
                    Yüzlerce sayfalık akademik makaleleri tek tek okuyarak not almak artık geçmişte kaldı.
                    Yapay zeka destekli özet araçlarıyla akademik veriminizi %80&apos;e kadar artırabilirsiniz.
                </p>

                <article className="prose prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Neden Akademik Makale Özetlemek Bu Kadar Zor?</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Türkiye&apos;deki üniversite öğrencileri ortalama her dönem 15-20 akademik makale okumak
                            zorunda kalmaktadır. Bir akademik makalenin ortalama uzunluğu ise 25-40 sayfa arasında
                            değişmektedir. Bu rakamlar, bir öğrencinin yalnızca okuma için harcaması gereken sürenin
                            400-800 saate ulaşabileceğini göstermektedir. Dahası, yabancı dildeki makaleler bu zorluğu
                            katbekat artırmaktadır.
                        </p>
                        <p className="text-foreground/80 leading-relaxed mt-4">
                            İşin püf noktası, akademik bir makaleyi hiçbir şey kaçırmadan ama verimli biçimde
                            özetleyebilmek için doğru <strong>yapılandırılmış veri çıkarma</strong> tekniklerini
                            kullanmaktır. Yapay zeka, 2025 itibarıyla bu alanda devrim niteliğinde araçlar sunmaktadır.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Geleneksel Makale Özetleme Yöntemleri (ve Eksiklikleri)</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            Geleneksel yöntemler şu şekilde sıralanabilir:
                        </p>
                        <ul className="space-y-3">
                            {[
                                { method: 'Manuel Not Alma', con: 'Çok zaman alır, önemli detaylar gözden kaçabilir' },
                                { method: 'Kopyala-Yapıştır Özeti', con: 'Bağlam ve anlam kopmalarına yol açar' },
                                { method: 'Sadece Abstract Okuma', con: 'Metodoloji ve bulgular atlanır, yanıltıcı olabilir' },
                                { method: 'Belirli Bölümleri Seçme', con: 'Sistematik değil, önemli kısımlar atlanabilir' },
                            ].map((item) => (
                                <li key={item.method} className="flex gap-3 p-4 bg-card border border-border/50 rounded-xl">
                                    <span className="font-semibold text-foreground min-w-48">{item.method}:</span>
                                    <span className="text-muted-foreground text-sm">{item.con}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Yapay Zeka ile Akademik Makale Özetleme: Adım Adım</h2>
                        <p className="text-foreground/80 leading-relaxed mb-6">
                            Özet Asistanı&apos;nı kullanarak bir akademik makaleyi analiz etmek yalnızca üç adım gerektirir:
                        </p>
                        <div className="space-y-4">
                            {[
                                {
                                    step: '1',
                                    title: 'PDF\'i Sisteme Yükle',
                                    desc: 'Analiz etmek istediğiniz akademik makaleyi, tezi veya raporun PDF dosyasını Özet Asistanı\'nın yükleme alanına sürükleyip bırakın. 100 MB\'a kadar ve 1000+ sayfaya kadar desteklenmektedir.',
                                },
                                {
                                    step: '2',
                                    title: 'Yapay Zeka Analizi Başlatın',
                                    desc: 'Gemini 2.5 Flash altyapısı, yüklediğiniz belgeyi saniyeler içinde işleyerek: giriş, metodoloji, bulgular ve sonuç bölümlerini semantik olarak analiz eder ve ana argümanları çıkarır.',
                                },
                                {
                                    step: '3',
                                    title: 'Özetinizi Alın',
                                    desc: 'Türkçe ve anlaşılır bir dilde hazırlanan özet; ana bulgular, metodoloji özeti, sınırlılıklar ve sonraki araştırma önerileri şeklinde yapılandırılmış biçimde sunulur.',
                                },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4 p-6 bg-card border border-border/50 rounded-2xl">
                                    <div className="w-10 h-10 flex-shrink-0 bg-primary/20 text-primary font-black text-lg rounded-xl flex items-center justify-center">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-1">{item.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">İyi Bir Akademik Özet Neyi İçermeli?</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            Özet Asistanı&apos;nın ürettiği analizler, standart bir akademik özette bulunması gereken
                            tüm unsurları kapsar:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                'Araştırma sorusu ve hipotez',
                                'Kullanılan metodoloji',
                                'Ana bulgular ve istatistikler',
                                'Sınırlılıklar ve kısıtlamalar',
                                'Pratik uygulama alanları',
                                'Önerilen gelecek araştırmalar',
                                'Anahtar kavramlar ve terimler',
                                'Kaynak ve atıf bilgileri',
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                    <span className="text-sm text-foreground/80">{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Hangi Tür Makaleler Özetlenebilir?</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Özet Asistanı, aşağıdaki akademik belge türlerini desteklemektedir:
                        </p>
                        <ul className="mt-4 space-y-2 text-foreground/80">
                            <li className="flex gap-2"><span className="text-primary">→</span> Hakemli dergi makaleleri (IEEE, Springer, Elsevier vb.)</li>
                            <li className="flex gap-2"><span className="text-primary">→</span> Lisans, yüksek lisans ve doktora tezleri</li>
                            <li className="flex gap-2"><span className="text-primary">→</span> Konferans bildirileri (SSCI, SCI, AHCI)</li>
                            <li className="flex gap-2"><span className="text-primary">→</span> Araştırma raporları ve white paper&apos;ler</li>
                            <li className="flex gap-2"><span className="text-primary">→</span> Teknik belgeler ve kılavuzlar</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Sonuç: Akademik Verimliliğin Geleceği</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            2025 yılında akademik başarının anahtarı, daha çok değil <strong>daha akıllıca</strong> çalışmaktan
                            geçiyor. Yapay zeka destekli özet araçları artık bir lüks değil, rekabetçi bir akademik
                            ortamda zorunlu hale geldi. Özet Asistanı, bu ihtiyacı Türkçe dilinde karşılayan tek
                            entegre platform olarak öğrenci ve araştırmacıların yanındadır.
                        </p>
                    </section>
                </article>

                {/* CTA */}
                <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-3xl text-center">
                    <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Hemen Ücretsiz Dene</h2>
                    <p className="text-muted-foreground mb-6">İlk analizini ücretsiz yap. Kredi kartı gerekmez.</p>
                    <Link
                        href="/auth/signup"
                        id="blog-article-cta-ozetleme"
                        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all"
                    >
                        Ücretsiz Başla <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="mt-10 flex justify-between items-center border-t border-border/50 pt-8">
                    <Link href="/blog" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Tüm Makaleler
                    </Link>
                    <Link href="/blog/yapay-zeka-ile-pdf-analizi" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Sonraki Makale <ArrowRight className="w-4 h-4" />
                    </Link>
                </nav>
            </main>
        </>
    );
}
