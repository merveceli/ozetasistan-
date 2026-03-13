import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, Zap, Shield, Brain } from 'lucide-react';
import { ArticleStructuredData } from '@/components/StructuredData';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ozetasistani.com';

export const metadata: Metadata = {
    title: 'Yapay Zeka ile PDF Analizi: 2025\'te Bilgi Çıkarmanın En Akıllı Yolu',
    description:
        'PDF belgelerinden anlamlı bilgi çıkarmak için yapay zeka nasıl kullanılır? Özet Asistanı\'nın Gemini 2.5 Flash altyapısıyla PDF analizi yaparken dikkat etmeniz gerekenler.',
    keywords: [
        'yapay zeka PDF analizi', 'Gemini AI PDF', 'PDF bilgi çıkarma',
        'AI belge analizi 2025', 'otomatik PDF özetleme', 'makine öğrenmesi doküman',
    ],
    openGraph: {
        title: 'Yapay Zeka ile PDF Analizi — 2025 Rehberi',
        description: 'Gemini AI ile PDF belgelerini saniyeler içinde analiz edin. 2025\'in en akıllı yöntemi.',
        url: `${SITE_URL}/blog/yapay-zeka-ile-pdf-analizi`,
    },
    alternates: {
        canonical: `${SITE_URL}/blog/yapay-zeka-ile-pdf-analizi`,
    },
};

export default function YapayZekaIlePdfAnalizi() {
    return (
        <>
            <ArticleStructuredData
                title="Yapay Zeka ile PDF Analizi: 2025'te Bilgi Çıkarmanın En Akıllı Yolu"
                description="PDF belgelerinden anlamlı bilgi çıkarmak için yapay zeka nasıl kullanılır? Gemini AI PDF analiz rehberi."
                url={`${SITE_URL}/blog/yapay-zeka-ile-pdf-analizi`}
                datePublished="2025-03-05"
                dateModified="2025-03-13"
            />
            <main className="max-w-3xl mx-auto px-6 py-12">
                <nav aria-label="Sayfa yolu" className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link href="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
                    <span>/</span>
                    <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                    <span>/</span>
                    <span className="text-foreground">Yapay Zeka ile PDF Analizi</span>
                </nav>

                <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-purple-500/20 text-purple-300 border-purple-500/30">Teknoloji</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="w-3.5 h-3.5" /> 10 dk okuma</span>
                    <span className="text-sm text-muted-foreground">5 Mart 2025</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                    Yapay Zeka ile PDF Analizi: 2025&apos;te Bilgi Çıkarmanın En Akıllı Yolu
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed mb-10 border-l-4 border-purple-500 pl-4">
                    Dünya genelinde her gün milyarlarca PDF belgesi oluşturuluyor. Bu devasa bilgi yığınından
                    anlamlı içgörüler çıkarmak için yapay zeka artık olmazsa olmaz bir araç haline geldi.
                </p>

                <article className="prose prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">PDF Analizi Neden Bu Kadar Önemli?</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Akademik camiada önemli bir sorun var: Türkiye&apos;de her yıl yüz binlerce tez yazılıyor,
                            binlerce akademik dergide milyonlarca makale yayımlanıyor. Bu bilgi denizinde doğru
                            kaynağa ulaşmak ve onu etkin biçimde kullanmak giderek zorlaşıyor.
                        </p>
                        <p className="text-foreground/80 leading-relaxed mt-4">
                            PDF formatı, akademik dünyada standart haline gelmiş olsa da geleneksel okuma yöntemleriyle
                            işlenmesi son derece zaman alıcıdır. İşte bu noktada <strong>büyük dil modelleri (LLM)</strong>
                            devreye girerek PDF&apos;leri saniyeler içinde analiz edebilmektedir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Gemini 2.5 Flash: PDF Analizinde Devrim</h2>
                        <p className="text-foreground/80 leading-relaxed mb-6">
                            Özet Asistanı&apos;nın kullandığı Gemini 2.5 Flash modeli, PDF analizi konusunda birkaç
                            kritik avantaj sağlar:
                        </p>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                {
                                    icon: <Zap className="w-6 h-6 text-yellow-400" />,
                                    title: '1 Milyon Token Kapasitesi',
                                    desc: 'Yaklaşık 2000 sayfalık bir belgeyi tek seferde analiz edebilir. Kısım kısım işlemeye gerek yoktur.',
                                },
                                {
                                    icon: <Brain className="w-6 h-6 text-purple-400" />,
                                    title: 'Çok Dilli Anlayış',
                                    desc: 'Türkçe, İngilizce, Almanca ve 50+ dilde yazılmış PDF\'leri aynı doğrulukla analiz eder.',
                                },
                                {
                                    icon: <Shield className="w-6 h-6 text-emerald-400" />,
                                    title: 'Hallüsinasyon Koruması',
                                    desc: 'Belge dışından bilgi eklenmez; yalnızca PDF\'te bulunan içerik kullanılır.',
                                },
                            ].map((item) => (
                                <div key={item.title} className="flex gap-4 p-5 bg-card border border-border/50 rounded-2xl">
                                    <div className="flex-shrink-0 w-12 h-12 bg-secondary/50 rounded-xl flex items-center justify-center">
                                        {item.icon}
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
                        <h2 className="text-2xl font-bold mb-4">PDF Analizi ile Neler Yapabilirsiniz?</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            Özet Asistanı&apos;nda bir PDF&apos;i yükledikten sonra şunları yapabilirsiniz:
                        </p>
                        <ul className="space-y-3 text-foreground/80">
                            <li className="flex gap-3 items-start"><span className="text-primary font-bold mt-0.5">→</span><span><strong>Detaylı Özet:</strong> Makalenin tamamını okumadan ana argümanları ve bulguları öğrenin.</span></li>
                            <li className="flex gap-3 items-start"><span className="text-primary font-bold mt-0.5">→</span><span><strong>Otomatik Flashcard:</strong> Makaledeki anahtar kavramlar ve tanımlardan soru-cevap kartları üretin.</span></li>
                            <li className="flex gap-3 items-start"><span className="text-primary font-bold mt-0.5">→</span><span><strong>Zihin Haritası:</strong> Belgedeki konular arasındaki ilişkileri görsel haritaya dönüştürün.</span></li>
                            <li className="flex gap-3 items-start"><span className="text-primary font-bold mt-0.5">→</span><span><strong>Sunum Taslağı:</strong> PDF içeriğini profesyonel slayt yapısına otomatik çevirin.</span></li>
                            <li className="flex gap-3 items-start"><span className="text-primary font-bold mt-0.5">→</span><span><strong>Kaynak Doğrulama:</strong> Belgede yapılan iddiaların güvenilirliğini analiz edin.</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Hangi PDF Türleri En İyi Analiz Edilir?</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { type: 'Metin tabanlı PDF', score: '★★★★★', note: 'Mükemmel sonuç' },
                                { type: 'Taranmış PDF (OCR)', score: '★★★★☆', note: 'İyi sonuç' },
                                { type: 'Teknik/İstatistiksel makaleler', score: '★★★★★', note: 'Mükemmel sonuç' },
                                { type: 'Görsel ağırlıklı PDF', score: '★★★☆☆', note: 'Orta sonuç' },
                                { type: 'Türkçe akademik tezler', score: '★★★★★', note: 'Mükemmel sonuç' },
                                { type: 'İngilizce makaleler', score: '★★★★★', note: 'Mükemmel sonuç' },
                            ].map((item) => (
                                <div key={item.type} className="p-4 bg-card border border-border/50 rounded-xl flex justify-between items-center">
                                    <span className="text-sm font-medium">{item.type}</span>
                                    <div className="text-right">
                                        <div className="text-yellow-400 text-xs">{item.score}</div>
                                        <div className="text-xs text-muted-foreground">{item.note}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2025&apos;te PDF Analizinde Öne Geçin</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Akademik ve profesyonel dünyada hız ve doğruluk giderek daha fazla önem kazanıyor.
                            Yapay zeka destekli PDF analiz araçları artık bir rekabet avantajı değil, temel bir
                            iş akışı aracı. Özet Asistanı, bu dönüşümü Türkçe dil desteği ve akademik odağıyla
                            yönetmenize yardımcı oluyor.
                        </p>
                    </section>
                </article>

                <div className="mt-12 p-8 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-3xl text-center">
                    <h2 className="text-2xl font-bold mb-2">PDF&apos;ini Şimdi Analiz Et</h2>
                    <p className="text-muted-foreground mb-6">Ücretsiz başla, sonuçlarına şaşır.</p>
                    <Link
                        href="/auth/signup"
                        id="blog-article-cta-pdf"
                        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all"
                    >
                        Ücretsiz Dene <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <nav className="mt-10 flex justify-between items-center border-t border-border/50 pt-8">
                    <Link href="/blog/akademik-makale-nasil-ozetlenir" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Önceki Makale
                    </Link>
                    <Link href="/blog/flashcard-ile-hizli-ogrenme" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Sonraki Makale <ArrowRight className="w-4 h-4" />
                    </Link>
                </nav>
            </main>
        </>
    );
}
