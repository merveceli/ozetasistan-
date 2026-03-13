import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, RefreshCw, BarChart2 } from 'lucide-react';
import { ArticleStructuredData } from '@/components/StructuredData';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ozetasistani.com';

export const metadata: Metadata = {
    title: 'Flashcard ile Hızlı Öğrenme: Spaced Repetition Yöntemi Nedir?',
    description:
        'Hafızanın nasıl çalıştığını anlayan Spaced Repetition (aralıklı tekrar) yöntemi ile akademik başarınızı katlayın. Özet Asistanı\'nın otomatik flashcard özelliğini nasıl kullanırsınız?',
    keywords: [
        'flashcard nedir', 'spaced repetition', 'aralıklı tekrar yöntemi',
        'ebbinghaus unutma eğrisi', 'hızlı öğrenme teknikleri', 'flashcard uygulaması Türkçe',
        'akademik hafıza teknikleri', 'anki alternatifi',
    ],
    openGraph: {
        title: 'Flashcard ile Hızlı Öğrenme: Spaced Repetition Rehberi',
        description: 'Spaced Repetition yöntemi ile öğrendiklerinizi kalıcı hale getirin. Otomatik flashcard üretimi.',
        url: `${SITE_URL}/blog/flashcard-ile-hizli-ogrenme`,
    },
    alternates: {
        canonical: `${SITE_URL}/blog/flashcard-ile-hizli-ogrenme`,
    },
};

export default function FlashcardIleHizliOgrenme() {
    return (
        <>
            <ArticleStructuredData
                title="Flashcard ile Hızlı Öğrenme: Spaced Repetition Yöntemi Nedir?"
                description="Spaced Repetition yöntemi ile akademik başarınızı katlayın. Otomatik flashcard üretimi rehberi."
                url={`${SITE_URL}/blog/flashcard-ile-hizli-ogrenme`}
                datePublished="2025-03-07"
                dateModified="2025-03-13"
            />
            <main className="max-w-3xl mx-auto px-6 py-12">
                <nav aria-label="Sayfa yolu" className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link href="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
                    <span>/</span>
                    <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                    <span>/</span>
                    <span className="text-foreground">Flashcard ile Hızlı Öğrenme</span>
                </nav>

                <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Öğrenme Teknikleri</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="w-3.5 h-3.5" /> 7 dk okuma</span>
                    <span className="text-sm text-muted-foreground">7 Mart 2025</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                    Flashcard ile Hızlı Öğrenme: Spaced Repetition Yöntemi Nedir?
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed mb-10 border-l-4 border-emerald-500 pl-4">
                    1885 yılında Hermann Ebbinghaus&apos;un keşfettiği &quot;Unutma Eğrisi&quot; teorisi, bugün yapay zeka
                    ile birleşerek öğrenmeyi kökten dönüştürüyor. Flashcard&apos;lar bu devrimün merkezinde.
                </p>

                <article className="prose prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Unutma Eğrisi ve Öğrenmenin Biyolojisi</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Ebbinghaus&apos;un araştırmalarına göre, yeni öğrenilen bilginin <strong>%50&apos;si 1 saat</strong>,
                            <strong>%70&apos;i 24 saat</strong>, <strong>%90&apos;ı ise 1 hafta</strong> içinde unutulmaktadır.
                            Bu, tamamen normal bir beyin fonksiyonudur ve buna &quot;Ebbinghaus Unutma Eğrisi&quot; denmektedir.
                        </p>
                        <p className="text-foreground/80 leading-relaxed mt-4">
                            Peki çözüm nedir? Bilgiyle <strong>doğru zamanlarda</strong> tekrar karşılaşmak. İşte
                            burada Spaced Repetition (Aralıklı Tekrar) devreye giriyor.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Spaced Repetition (Aralıklı Tekrar) Nedir?</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            Spaced Repetition, bir bilgiyi tam unutmak üzereyken tekrar etmeyi hedefleyen
                            bir öğrenme stratejisidir. İlke basittir:
                        </p>
                        <div className="flex flex-col gap-3">
                            {[
                                { label: 'İlk öğrenme', interval: 'Hemen', color: 'bg-primary/20 border-primary/40' },
                                { label: '1. tekrar', interval: '1 gün sonra', color: 'bg-blue-500/20 border-blue-500/40' },
                                { label: '2. tekrar', interval: '3 gün sonra', color: 'bg-purple-500/20 border-purple-500/40' },
                                { label: '3. tekrar', interval: '1 hafta sonra', color: 'bg-emerald-500/20 border-emerald-500/40' },
                                { label: '4. tekrar', interval: '2 hafta sonra', color: 'bg-amber-500/20 border-amber-500/40' },
                                { label: '5. tekrar', interval: '1 ay sonra → Kalıcı Hafıza', color: 'bg-rose-500/20 border-rose-500/40' },
                            ].map((item, i) => (
                                <div key={i} className={`flex justify-between items-center px-4 py-3 border rounded-xl ${item.color}`}>
                                    <span className="font-semibold text-sm">{item.label}</span>
                                    <span className="text-sm text-muted-foreground">{item.interval}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Otomatik Flashcard ile Spaced Repetition: Özet Asistanı Nasıl Çalışır?</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            Geleneksel flashcard yönteminde en büyük zorluk, kartları elle hazırlamaktır. Bir
                            200 sayfalık tezden flashcard hazırlamak saatler alabilir. Özet Asistanı bu süreci
                            otomatikleştirir:
                        </p>
                        <div className="space-y-4">
                            {[
                                { step: '1', title: 'PDF\'i Yükle', desc: 'Akademik makalenin PDF\'ini sisteme yükleyin.' },
                                { step: '2', title: 'AI Analizi', desc: 'Gemini 2.5 Flash, anahtar kavramları, tanımları, formülleri ve önemli bilgileri çıkarır.' },
                                { step: '3', title: 'Otomatik Kart Üretimi', desc: 'Her kavram için soru-cevap formatında flashcard\'lar oluşturulur.' },
                                { step: '4', title: 'Çalışma Merkezi', desc: 'Özet Asistanı\'nın Çalışma Merkezi\'nde Spaced Repetition modunda kartları çalışın.' },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-4 p-5 bg-card border border-border/50 rounded-2xl">
                                    <div className="w-9 h-9 flex-shrink-0 bg-emerald-500/20 text-emerald-400 font-black rounded-lg flex items-center justify-center">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-0.5">{item.title}</h3>
                                        <p className="text-muted-foreground text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Flashcard Kullanmanın Kanıtlanmış Faydaları</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { icon: <RefreshCw className="w-5 h-5 text-primary" />, stat: '%80', label: 'Daha az tekrar', desc: 'Geleneksel yönteme kıyasla aynı hafıza kalıcılığı için' },
                                { icon: <BarChart2 className="w-5 h-5 text-emerald-400" />, stat: '4x', label: 'Daha hızlı öğrenme', desc: 'Pasif okumaya kıyasla aktif geri çağırma etkisi' },
                            ].map((item) => (
                                <div key={item.stat} className="p-5 bg-card border border-border/50 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">{item.icon}<span className="text-2xl font-black">{item.stat}</span></div>
                                    <p className="font-bold">{item.label}</p>
                                    <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Sonuç: Akıllı Tekrar, Kalıcı Hafıza</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Yapay zekanın akademik öğrenmeye en büyük katkılarından biri, kişiselleştirilmiş ve
                            otomatik flashcard üretimidir. Artık saatler harcayıp kart hazırlamak yerine, PDF&apos;inizi
                            yükleyip dakikalar içinde hazır bir Spaced Repetition programına başlayabilirsiniz.
                            Özet Asistanı&apos;nın Çalışma Merkezi tam da bu iş için tasarlandı.
                        </p>
                    </section>
                </article>

                <div className="mt-12 p-8 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-3xl text-center">
                    <h2 className="text-2xl font-bold mb-2">Çalışma Merkezini Hemen Dene</h2>
                    <p className="text-muted-foreground mb-6">Flashcard&apos;larını otomatik üret, Spaced Repetition ile çalış.</p>
                    <Link
                        href="/auth/signup"
                        id="blog-article-cta-flashcard"
                        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all"
                    >
                        Ücretsiz Başla <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <nav className="mt-10 flex justify-between items-center border-t border-border/50 pt-8">
                    <Link href="/blog/yapay-zeka-ile-pdf-analizi" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Önceki Makale
                    </Link>
                    <Link href="/blog/zihin-haritasi-nedir" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Sonraki Makale <ArrowRight className="w-4 h-4" />
                    </Link>
                </nav>
            </main>
        </>
    );
}
