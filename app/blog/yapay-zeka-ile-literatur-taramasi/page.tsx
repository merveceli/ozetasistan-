import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, CheckCircle2, BookOpen, Search, Library, FileText } from 'lucide-react';
import { ArticleStructuredData } from '@/components/StructuredData';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ozetasistani.com';

export const metadata: Metadata = {
    title: 'Yapay Zeka ile Literatür Taraması Nasıl Yapılır? Kapsamlı Rehber',
    description:
        'Akademik literatür taramasını haftalar yerine saatler içinde tamamlayın. Yapay zeka araçları kullanarak kaynak bulma, analiz etme ve sentezleme teknikleri.',
    keywords: [
        'literatür taraması', 'yapay zeka literatür taraması', 'akademik araştırma',
        'kaynak analizi', 'makale sentezleme', 'tez yazımı', 'AI araştırma asistanı'
    ],
    openGraph: {
        title: 'Yapay Zeka ile Literatür Taraması Rehberi',
        description: 'Akademik araştırmalarınızı hızlandıracak yapay zeka destekli literatür taraması teknikleri.',
        url: `${SITE_URL}/blog/yapay-zeka-ile-literatur-taramasi`,
    },
    alternates: {
        canonical: `${SITE_URL}/blog/yapay-zeka-ile-literatur-taramasi`,
    },
};

export default function LiteratürTaramasi() {
    return (
        <>
            <ArticleStructuredData
                title="Yapay Zeka ile Literatür Taraması Nasıl Yapılır? Kapsamlı Rehber"
                description="Akademik literatür taramasını haftalar yerine saatler içinde tamamlayın. Yapay zeka ile kaynak analizi ve sentezleme teknikleri."
                url={`${SITE_URL}/blog/yapay-zeka-ile-literatur-taramasi`}
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
                    <span className="text-foreground">Literatür Taraması</span>
                </nav>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-purple-500/20 text-purple-300 border-purple-500/30">Araştırma</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="w-3.5 h-3.5" /> 10 dk okuma</span>
                    <span className="text-sm text-muted-foreground">14 Mart 2025</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                    Yapay Zeka ile Literatür Taraması Nasıl Yapılır? Akademik Araştırma Rehberi
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed mb-10 border-l-4 border-primary pl-4">
                    Bir tezin veya makalenin en zorlu ve zaman alıcı aşamalarından biri literatür taramasıdır. 
                    Neyse ki yapay zeka araçları sayesinde aylarca süren bu süreci sistemli bir şekilde 
                    günlere, hatta saatlere indirmek artık mümkün.
                </p>

                <article className="prose prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Geleneksel vs. Yapay Zeka Destekli Tarama</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            Geleneksel literatür taraması; Google Scholar, PubMed veya Scopus gibi veritabanlarında saatlerce anahtar kelime aratmayı,
                            bulunan makalelerin abstract'larını (özetlerini) tek tek okumayı ve manuel olarak Excele kaydetmeyi gerektirir.
                        </p>
                        <div className="bg-card border border-border/50 rounded-2xl p-6 my-6">
                            <h3 className="font-bold text-lg mb-4 text-primary">Yapay Zekanın Getirdiği Yenilikler:</h3>
                            <ul className="space-y-3">
                                <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span className="text-foreground/80"><strong>Semantik Arama:</strong> Yalnızca anahtar kelime eşleşmesi değil, anlam odaklı makale bulma.</span></li>
                                <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span className="text-foreground/80"><strong>Sentezleme (Synthesis):</strong> Birden fazla makaleyi aynı anda birbirleriyle kıyaslayabilme.</span></li>
                                <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span className="text-foreground/80"><strong>Boşluk (Gap) Tespiti:</strong> Mevcut araştırmalardaki eksik yönleri saniyeler içinde analiz etme.</span></li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Adım Adım AI Destekli Literatür Taraması</h2>
                        
                        <div className="space-y-6">
                            <div className="bg-card p-6 rounded-2xl border border-border/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full flex items-start justify-end p-4">
                                    <Search className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">1. Araştırma Sorusunu (Query) Şekillendirme</h3>
                                <p className="text-foreground/80 leading-relaxed">
                                    Literatür taramasına başlarken doğrudan "Yapay Zeka ve Eğitim" gibi çok geniş kavramlar 
                                    aratmak yerine özel komutlar (promt) kullanın. Örneğin: <em>"2020-2025 yılları arasında 
                                    yükseköğretimde yapay zeka kullanımının öğrenci başarısına etkilerini inceleyen ampirik 
                                    araştırmaları bul ve özetle."</em>
                                </p>
                            </div>

                            <div className="bg-card p-6 rounded-2xl border border-border/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full flex items-start justify-end p-4">
                                    <Library className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">2. Haritalama ve Kümeler Oluşturma (Mapping)</h3>
                                <p className="text-foreground/80 leading-relaxed">
                                    Bulduğunuz ana makalelerin PDF&apos;lerini Özet Asistanı gibi araçlara yükleyerek 
                                    "Zihin Haritası" modülünü kullanın. Bu sayede yazarların birbirlerine nasıl atıf yaptığını, 
                                    hangi okulların/kavramların (örneğin; Davranışçı yaklaşım vs Yapılandırmacı yaklaşım) 
                                    birbiriyle tartıştığını görsel olarak görebilirsiniz.
                                </p>
                            </div>

                            <div className="bg-card p-6 rounded-2xl border border-border/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full flex items-start justify-end p-4">
                                    <FileText className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">3. Toplu Sentez Analizi (Synthesis)</h3>
                                <p className="text-foreground/80 leading-relaxed">
                                    En can alıcı nokta burasıdır. 5 farklı makaleyi sisteme yükleyip "Sentez Modunu" açın ve şu komutu verin: 
                                    <em>"Bu 5 makalenin metodolojilerindeki farklılıkları ve ulaştıkları zıt sonuçları karşılaştırmalı 
                                    bir tablo halinde yaz."</em>
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-8 border-t border-border/50 pt-8">
                        <h2 className="text-2xl font-bold mb-4">Dikkat Edilmesi Gereken Etik Kurallar</h2>
                        <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                            <li><strong>Halüsinasyon (Uydurma) Kontrolü:</strong> Yapay zeka %100 doğru çalışmaz. Referans gösterdiği sayfa numarasını veya tabloyu her zaman orijinal PDF&apos;den teyit edin.</li>
                            <li><strong>Alıntıları Doğrulama:</strong> Metni doğrudan AI&apos;dan kopyalamayın. Kendi akademik cümlenizi kurun ve referansları orijinal yazarlara verin.</li>
                            <li><strong>Özet Asistanı Avantajı:</strong> Standart ChatGPT yerine "Özet Asistanı" gibi kapalı kaynak PDF analistleri kullanmak uydurma riskini sıfıra indirir, çünkü araç sadece yüklediğiniz metinden cevap üretir.</li>
                        </ul>
                    </section>
                </article>

                {/* CTA */}
                <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-3xl text-center">
                    <Library className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Sentez Laboratuvarını Keşfedin</h2>
                    <p className="text-muted-foreground mb-6">Aynı anda birden fazla makaleyi yükleyin, AI sizin için kıyaslasın.</p>
                    <Link
                        href="/auth/signup"
                        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all"
                    >
                        Ücretsiz Dene <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="mt-10 flex justify-between items-center border-t border-border/50 pt-8">
                    <Link href="/blog" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Tüm Makaleler
                    </Link>
                    <Link href="/blog/pomodoro-teknigi-ile-ders-calisma" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Sonraki Makale <ArrowRight className="w-4 h-4" />
                    </Link>
                </nav>
            </main>
        </>
    );
}
