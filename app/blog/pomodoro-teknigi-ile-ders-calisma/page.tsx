import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, Timer, CheckCircle2, Zap, Brain, Mic } from 'lucide-react';
import { ArticleStructuredData } from '@/components/StructuredData';
import { BlogCTAButton } from '@/components/BlogCTAButton';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ozetasistani.com';

export const metadata: Metadata = {
    title: 'Pomodoro Tekniği ile Nasıl Ders Çalışılır? Tükenmişlik Yaşamadan Odaklanın',
    description:
        'Saatlerce masada oturmanıza rağmen verim alamıyor musunuz? Pomodoro Tekniği ve odak radyosu kullanarak ders çalışma veriminizi %200 artırın.',
    keywords: [
        'pomodoro tekniği', 'ders çalışma teknikleri', 'odaklanma',
        'zaman yönetimi', 'öğrenci verimliliği', 'sınav stresi', 'odak radyosu'
    ],
    openGraph: {
        title: 'Pomodoro Tekniği: Tükenmişlik Yaşamadan Çalışın',
        description: 'Pomodoro Tekniği ile dikkatinizi maksimum seviyede tutmanın bilimsel yolları.',
        url: `${SITE_URL}/blog/pomodoro-teknigi-ile-ders-calisma`,
    },
    alternates: {
        canonical: `${SITE_URL}/blog/pomodoro-teknigi-ile-ders-calisma`,
    },
};

export default function PomodoroTeknigi() {
    return (
        <>
            <ArticleStructuredData
                title="Pomodoro Tekniği ile Nasıl Ders Çalışılır? Tükenmişlik Yaşamadan Odaklanın"
                description="Saatlerce masada oturmanıza rağmen verim alamıyor musunuz? Pomodoro Tekniği ve odak radyosu kullanarak çalışma veriminizi artırın."
                url={`${SITE_URL}/blog/pomodoro-teknigi-ile-ders-calisma`}
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
                    <span className="text-foreground">Pomodoro Tekniği</span>
                </nav>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-pink-500/20 text-pink-300 border-pink-500/30">Üretkenlik</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="w-3.5 h-3.5" /> 6 dk okuma</span>
                    <span className="text-sm text-muted-foreground">14 Mart 2025</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                    Pomodoro Tekniği ile Nasıl Ders Çalışılır? Tükenmişlik Yaşamadan Odaklanın
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed mb-10 border-l-4 border-pink-500 pl-4">
                    Saatlerce masadan kalkmadan ders çalışmak sandığınızın aksine öğrenmeyi hızlandırmaz, sadece beyninizi tüketir. 
                    Bu yazıda, Francesco Cirillo'nun 1980'lerde yarattığı efsanevi Pomodoro tekniğinin modern ve teknolojik 
                    versiyonunu nasıl uygulayacağınızı öğreneceksiniz.
                </p>

                <article className="prose prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Timer className="w-6 h-6 text-pink-500" /> Pomodoro Nedir? Orijinal Kurallar
                        </h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            Pomodoro (İtalyancada domates), zamanı belirli periyotlara bölen ve kısa mola döngüleriyle çalışan bir 
                            zaman yönetimi metodudur. İnsan beyninin maksimum odaklanabilme süresinin 20-30 dakika aralığında olmasına 
                            dayanır.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                            <div className="bg-card p-5 rounded-2xl border border-border/50 text-center">
                                <h4 className="text-3xl font-black text-white mb-2">25 <span className="text-sm text-muted-foreground font-normal">Dakika</span></h4>
                                <p className="text-sm text-primary font-bold">Tam Odaklanmış Çalışma</p>
                            </div>
                            <div className="bg-card p-5 rounded-2xl border border-border/50 text-center">
                                <h4 className="text-3xl font-black text-white mb-2">5 <span className="text-sm text-muted-foreground font-normal">Dakika</span></h4>
                                <p className="text-sm text-pink-500 font-bold">Kısa Mola</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground italic text-center">
                            * 4 Pomodoro döngüsünden sonra (Toplam 2 saat) 15-30 dakikalık "Uzun Mola" verilir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Uygularken Yapılan En Büyük 3 Hata</h2>
                        <div className="space-y-4">
                            <div className="flex gap-3 items-start">
                                <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center font-bold text-xs shrink-0 mt-1">1</span>
                                <div>
                                    <h4 className="font-bold text-foreground">Molalarda Telefona Bakmak</h4>
                                    <p className="text-sm text-muted-foreground">5 dakikalık molada Instagram'a girmek beynin ödül sistemini (dopamin) yıpratır. Mola, odanın içinde yürümek veya su içmek içindir.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center font-bold text-xs shrink-0 mt-1">2</span>
                                <div>
                                    <h4 className="font-bold text-foreground">Yarıda Bölünmek</h4>
                                    <p className="text-sm text-muted-foreground">Bir Pomodoro yarım bırakılamaz. 25 dakika bitene kadar tuvalete gitmek bile yasaktır (acil durumlar hariç). Bu disiplin metodun temelidir.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center font-bold text-xs shrink-0 mt-1">3</span>
                                <div>
                                    <h4 className="font-bold text-foreground">Arka Plan Seslerini Yanlış Seçmek</h4>
                                    <p className="text-sm text-muted-foreground">Podcast veya sözlü müzik dinlemek Pomodoro'yu yok eder. Sözler beyinde "dil işleme" merkezini çalıştırdığı için derse olan odağınızı keser.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-card border border-border/50 p-6 rounded-3xl mt-8">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Mic className="w-6 h-6 text-emerald-500" /> Teknolojiyi Kullanın: Odak Radyosu
                        </h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Yukarıda bahsettiğimiz 3. kural çok önemlidir! Çalışırken beyni alfa dalgalarına sokan ve 
                            dış uyaranları izole eden "Lofi" veya "Binaural Beats (Çift Yollu Vuruşlar)" dinlemek odak 
                            süresini uzatır.
                        </p>
                        <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                            <li>🎯 <strong>Lofi Sesleri:</strong> Sürekli tekrar eden bas ve tizler kalp ritmini çalışmaya uyumlar.</li>
                            <li>🌧️ <strong>Doğa Sesleri:</strong> Yağmur veya kahve dükkanı sesleri yalıtım sağlayarak stresi azaltır.</li>
                        </ul>
                        <p className="mt-4 text-xs text-muted-foreground">
                            * Özet Asistanı'nın <strong>Odak Radyosu Modülü</strong>, sadece çalışmaya özel seçilmiş 7/24 kesintisiz 
                            odak kanalları sunar.
                        </p>
                    </section>

                </article>

                {/* CTA */}
                <div className="mt-12 p-8 bg-gradient-to-br from-pink-500/10 to-orange-500/10 border border-pink-500/20 rounded-3xl text-center">
                    <Zap className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Çalışma Merkeziniz Hazır</h2>
                    <p className="text-muted-foreground mb-6">Odak radyosu dinleyerek belgelerinizi özetleyin ve Pomodoro sayacınızı başlatın.</p>
                    <BlogCTAButton defaultText="Ücretsiz Kayıt Ol" className="bg-pink-500 hover:bg-pink-600 shadow-pink-500/20" />
                </div>

                {/* Navigation */}
                <nav className="mt-10 flex justify-between items-center border-t border-border/50 pt-8">
                    <Link href="/blog/yapay-zeka-ile-literatur-taramasi" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Önceki
                    </Link>
                    <Link href="/blog/ingilizce-akademik-metin-cevirisi" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Sonraki <ArrowRight className="w-4 h-4" />
                    </Link>
                </nav>
            </main>
        </>
    );
}
