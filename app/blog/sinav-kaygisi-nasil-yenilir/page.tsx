import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, HeartPulse, Brain, Coffee, Activity } from 'lucide-react';
import { ArticleStructuredData } from '@/components/StructuredData';
import { BlogCTAButton } from '@/components/BlogCTAButton';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ozetasistani.com';

export const metadata: Metadata = {
    title: 'Sınav Kaygısı ve Stresi Nasıl Yenilir? Bilimsel Başa Çıkma Taktikleri',
    description:
        'Sınav gecelerinde uykusuzluğa, ellerde titremeye ve unutkanlığa son! Sınav stresini azaltıp performansınızı yükseltecek psikolojik ve bilişsel stratejiler.',
    keywords: [
        'sınav kaygısı', 'sınav stresi', 'öğrenci psikolojisi',
        'odaklanma sorunu', 'stres yönetimi', 'sınav taktikleri'
    ],
    openGraph: {
        title: 'Sınav Kaygısıyla Başa Çıkma Yöntemleri',
        description: 'Vize ve Final dönemlerinde kortizol seviyenizi kontrol altında tutmanın bilimsel yolları.',
        url: `${SITE_URL}/blog/sinav-kaygisi-nasil-yenilir`,
    },
    alternates: {
        canonical: `${SITE_URL}/blog/sinav-kaygisi-nasil-yenilir`,
    },
};

export default function SinavKaygisi() {
    return (
        <>
            <ArticleStructuredData
                title="Sınav Kaygısı ve Stresi Nasıl Yenilir? Bilimsel Başa Çıkma Taktikleri"
                description="Sınav gecesi uykusuzluğa ve unutkanlığa son! Sınav stresini azaltıp performansınızı yükseltecek bilimsel stratejiler."
                url={`${SITE_URL}/blog/sinav-kaygisi-nasil-yenilir`}
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
                    <span className="text-foreground">Sınav Kaygısı</span>
                </nav>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-red-500/20 text-red-300 border-red-500/30">Psikoloji</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="w-3.5 h-3.5" /> 7 dk okuma</span>
                    <span className="text-sm text-muted-foreground">14 Mart 2025</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                    Sınav Kaygısı ve Stresi Nasıl Yenilir? Bilimsel Başa Çıkma Taktikleri
                </h1>

                <p className="text-lg text-muted-foreground leading-relaxed mb-10 border-l-4 border-red-500 pl-4">
                    Sayfalarca okuyorsunuz, ezberliyorsunuz ama sınav kağıdını önünüze aldığınız an her şey uçup gidiyor, 
                    öyle değil mi? Kalp atışınızın hızlanması ve unutkanlık aslında zihninizin size oynadığı biyolojik 
                    bir oyundur.
                </p>

                <article className="prose prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Brain className="w-6 h-6 text-red-500" /> Biyolojiyi Anlamak: Amigdala Kaçırması
                        </h2>
                        <p className="text-foreground/80 leading-relaxed">
                            Kaygı hissettiğinizde, beyindeki korku merkezi olan <em>Amigdala</em> devreye girer ve mantıksal 
                            düşünceyi sağlayan <em>Prefrontal Kortex'in</em> fişini tabiri caizse çeker. Vücuttaki kortizol (stres hormonu) 
                            seviyesi tavan yapınca öğrendiklerinizi "hatırlayamaz" hale gelirsiniz. Hedefimiz bu kortizolu düşürmek!
                        </p>
                    </section>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
                        <div className="bg-card border border-border/50 p-6 rounded-2xl">
                            <HeartPulse className="w-8 h-8 text-rose-500 mb-4" />
                            <h3 className="font-bold text-lg mb-2">4-7-8 Nefes Tekniği</h3>
                            <p className="text-sm text-muted-foreground">
                                Kalp ritmini hızla yavaşlatıp parasempatik sinir sistemini aktif eder. 4 saniye burnundan nefes al, 
                                7 saniye nefesini tut, 8 saniyede ağzından yavaşça ver. Bunu sınav başlamadan 3 kez tekrarla.
                            </p>
                        </div>
                        <div className="bg-card border border-border/50 p-6 rounded-2xl">
                            <Coffee className="w-8 h-8 text-orange-500 mb-4" />
                            <h3 className="font-bold text-lg mb-2">Kafeini Sınırla</h3>
                            <p className="text-sm text-muted-foreground">
                                Sınav gecesi ve sabahı içilen aşırı enerji içeceği ve kahve, anksiyeteyi tavan yatırır. Uyarıcı
                                maddeler kalbinizi hızlandırır ve beyninize sahte "tehlike" alarmı gönderir.
                            </p>
                        </div>
                    </div>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Özgüven Zırhı: Flashcardlar ve Pratik</h2>
                        <p className="text-foreground/80 leading-relaxed mb-4">
                            Stresin %80'i "Yeterince hakim miyim?" korkusundan kaynaklanır. Sınava saatler kala uzun PDF'ler okumak,
                            beyinde "Daha bilmediğim ne çok şey var" illüzyonu yaratır. 
                        </p>
                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-sm leading-relaxed mb-4">
                            <strong>Bilimsel Yaklaşım (Aktif Geri Çağırma):</strong> Son saatlerde sadece bilginizi kendinize soru 
                            sorarak test etmelisiniz. Bir metni tekrar okumak (Pasif Tekrar) size güven vermez. Flashcardlar 
                            (Kelime/Kavram Kartları) kullanarak beyninize bilginin "orada olduğu" ispatlanmalıdır.
                        </div>
                        <p className="text-foreground/80 leading-relaxed">
                            Özet Asistanı'nın <strong>Akıllı Flashcard Generatörü</strong> modülü tam olarak bu anlar için 
                            tasarlanmıştır. Ders notunuzu yüklediğinizde, en sık çıkma potansiyeli olan kavramları sizin için önü 
                            soru, arkası cevap şekline getirir.
                        </p>
                    </section>

                    <section className="mt-8 border-t border-border/50 pt-8">
                        <h2 className="text-2xl font-bold mb-4">Son Taktik: Kötü Senaryoyu Kabullenmek</h2>
                        <p className="text-foreground/80 leading-relaxed">
                            "Bu sınavdan kalırsam hayatım biter" inancı bilişsel bir çarpıtmadır. Sınavdan düşük alma senaryosunun,
                            sadece o dersin bütünlemesine veya tekrarına sebep olacağını, hayatın normal akışında minik bir engel
                            olduğunu kabullenmek (Worst-Case Scenario Acceptance) omuzlarınızdaki büyük yükü alacaktır.
                        </p>
                    </section>

                </article>

                {/* CTA */}
                <div className="mt-12 p-8 bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 rounded-3xl text-center">
                    <Activity className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Stres Yapma, Otomatize Et</h2>
                    <p className="text-muted-foreground mb-6">Sınav notlarını kendi başına özetlemekle vakit kaybetme, bırak asistan yapsın.</p>
                    <BlogCTAButton defaultText="Asistanı Dene" className="bg-red-500 hover:bg-red-600 shadow-red-500/20" />
                </div>

                {/* Navigation */}
                <nav className="mt-10 flex justify-between items-center border-t border-border/50 pt-8">
                    <Link href="/blog/ingilizce-akademik-metin-cevirisi" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Önceki
                    </Link>
                    <Link href="/blog" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Blog Ana Sayfa <ArrowRight className="w-4 h-4" />
                    </Link>
                </nav>
            </main>
        </>
    );
}
