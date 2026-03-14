import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Clock, Star, Heart, GraduationCap, Building2 } from 'lucide-react';
import { ArticleStructuredData } from '@/components/StructuredData';
import { BlogCTAButton } from '@/components/BlogCTAButton';
import Image from 'next/image';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ozetasistani.com';

export const metadata: Metadata = {
    title: 'Neden Özet Asistanı\'nı Kurdum? Kurucudan Mektup',
    description:
        'Yüzlerce sayfalık öğrenci dertlerinden doğan bir yapay zeka girişimi. İstanbul Üniversitesi bilgisayar programcılığı öğrencisi Merve Çelik\'in ağzından Özet Asistanı\'nın hikayesi.',
    keywords: [
        'özet asistanı kimin', 'merve çelik', 'yapay zeka girişimi',
        'öğrenci girişimci', 'startup hikayesi', 'kurucudan mektup'
    ],
    openGraph: {
        title: 'Özet Asistanı\'nın Kuruluş Hikayesi | Merve Çelik',
        description: 'Binlerce öğrencinin okuma yükünü hafifleten yapay zeka uygulamasının arkasındaki hikaye.',
        url: `${SITE_URL}/blog/kurucunun-hikayesi`,
    },
    alternates: {
        canonical: `${SITE_URL}/blog/kurucunun-hikayesi`,
    },
};

export default function KurucuHikayesi() {
    return (
        <>
            <ArticleStructuredData
                title="Neden Özet Asistanı'nı Kurdum? Kurucudan Mektup"
                description="Yüzlerce sayfalık PDF'lerle boğuşan bir öğrencinin, kendi gibi binlerce öğrenciye yardım etmek için kurduğu girişimin hikayesi."
                url={`${SITE_URL}/blog/kurucunun-hikayesi`}
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
                    <span className="text-foreground">Kurucunun Hikayesi</span>
                </nav>

                {/* Meta */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold px-3 py-1 rounded-full border bg-amber-500/20 text-amber-500 border-amber-500/30">Duyuru</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="w-3.5 h-3.5" /> 5 dk okuma</span>
                    <span className="text-sm text-muted-foreground">14 Mart 2025</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold mb-8 leading-tight">
                    Neden Özet Asistanı&apos;nı Kurdum? <br/>
                    <span className="text-muted-foreground text-2xl md:text-3xl font-normal mt-2 block">Öğrencilikten Girişimciliğe Bir Yapay Zeka Hikayesi</span>
                </h1>

                <div className="flex items-center gap-4 py-6 border-y border-border/50 mb-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center font-bold text-white text-xl">
                        MÇ
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-foreground">Merve Çelik</h3>
                        <p className="text-sm text-muted-foreground">Kurucu ve Yazılım Geliştirici, Özet Asistanı</p>
                    </div>
                </div>

                <article className="prose prose-invert max-w-none space-y-8 text-foreground/80 leading-relaxed text-lg">
                    <p>
                        Herkese merhaba, ben <strong>Merve Çelik</strong>. 
                    </p>
                    <p>
                        İstanbul Üniversitesi Bilgisayar Programcılığı son sınıf öğrencisiyim. Bu Haziran ayında mezun oluyorum, 20 yaşındayım ve yıllardır teknoloji dünyasının içinde kendi ayakları üzerinde durmaya çalışan, freelance yazılım projeleri geliştiren bir geliştiriciyim.
                    </p>
                    <p>
                        Eğer şu an bu satırları okuyorsanız, büyük ihtimalle siz de benim gibi vizeler, finaller, bitmek bilmeyen tez okumaları ve sonu gelmeyen PDF dosyalarının arasında boğulmamak için bir "can simidi" arıyorsunuz demektir. İşte <strong>Özet Asistanı</strong> tam olarak bu hisle, benim kendi dertlerimden doğdu.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground flex items-center gap-2">
                        <GraduationCap className="text-primary w-6 h-6" /> Problemin Kendisiyle Yüzleşmek
                    </h2>
                    <p>
                        Üniversite hayatının getirdiği o amansız okuma yükünü hepimiz biliyoruz. Vizelere sadece günler varken sisteme yüklenen haftalar öncesinin PDF notları, yabancı dilde anlaması saatler süren devasa akademik makaleler... Bilgisayar programcılığında bile sayfalarca dokümanı taramak, kodlardan çok daha fazla yoruyordu beni. 
                    </p>
                    <p>
                        Bir gece proje ödevimi yetiştirmeye çalışırken, ekranımda açık olan onlarca kaynak PDF'e bakıp kendi kendime şunu sordum: <em>"Neden bu işi benim yerime okuyup özetleyecek, saatlerim gideceğine dakikalarımı alacak bir asistanım yok?"</em> Piyasada bulunan yapay zeka araçları ya sürekli "Token sınırını aştınız" uyarısı veriyordu, ya Türkçe dilini çok kötü konuşup bağlamı bozuyordu, ya da sayfalarca PDF yüklememe izin vermiyordu.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground flex items-center gap-2">
                        <Building2 className="text-purple-500 w-6 h-6" /> Kodların Başına Geçiş
                    </h2>
                    <p>
                        Yazılım yeteneklerimi ilk defa sadece kendim veya freelance müşterilerim için değil, <strong>doküman okumaktan hayattan kopan binlerce öğrenci arkadaşım için</strong> kullanmaya karar verdim. Özet Asistanı işte o geceki uykusuzluğun, öfkenin ve teknolojik merakın eseridir.
                    </p>
                    <p>
                        En güçlü dil modelini (Gemini 2.5 Flash) sisteme entegre ettim. Çünkü bize kelime kelime çeviri yapan robotik bir araç değil, gerçekten konunun özünü anlayan, sınavda çıkacak kısımları tahmin eden ve en önemlisi <strong>bağlamı koparmayan</strong> bir akademik asistan lazımdı.
                    </p>

                    <div className="bg-card border border-border/50 p-8 rounded-3xl my-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] flex items-start justify-end p-6">
                            <Star className="w-8 h-8 text-primary/40" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-foreground">Özet Asistanı'nı Tasarlarken 3 Temel İlkem Oldu:</h3>
                        <ul className="space-y-4">
                            <li className="flex gap-4 items-start">
                                <span className="bg-primary/20 text-primary w-8 h-8 flex items-center justify-center rounded-full font-bold shrink-0 mt-0.5">1</span>
                                <div>
                                    <strong className="text-foreground block mb-1">Erişilebilir Olmalı</strong>
                                    <span className="text-sm">Öğrenci bütçesini zorlamayan, devasa kredi kartı blokajları istemeyen samimi bir platform.</span>
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <span className="bg-purple-500/20 text-purple-400 w-8 h-8 flex items-center justify-center rounded-full font-bold shrink-0 mt-0.5">2</span>
                                <div>
                                    <strong className="text-foreground block mb-1">Akademik Kaliteden Ödün Vermemeli</strong>
                                    <span className="text-sm">Uydurma (Halüsinasyon) yapmayan, tamamen kullanıcı PDF'ine sadık kalan bir motor.</span>
                                </div>
                            </li>
                            <li className="flex gap-4 items-start">
                                <span className="bg-emerald-500/20 text-emerald-400 w-8 h-8 flex items-center justify-center rounded-full font-bold shrink-0 mt-0.5">3</span>
                                <div>
                                    <strong className="text-foreground block mb-1">Zamanın Gerçek Sahibine İadesi</strong>
                                    <span className="text-sm">Hedef "yapay zekanın öğrenmesi" değil, sizin en kısa sürede "ana fikri" alıp sınava veya sosyal hayatınıza dönmeniz.</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground flex items-center gap-2">
                        <Heart className="text-pink-500 w-6 h-6" /> Geleceğe Yönelik Sözüm
                    </h2>
                    <p>
                        Haziran'da mezun olmadan önce en büyük hayalim, Özet Asistanı'nın Türkiye'deki on binlerce öğrencinin, akademisyenin ve araştırmacının "favoriler" sekmesine girmesi. Burası sadece bir yapay zeka uygulaması değil; burası genç bir öğrencinin, kendisi gibi yorulmuş diğer öğrencilerin yükünü hafifletme projesi.
                    </p>
                    <p>
                        Uygulamamızı kullanırken, arkasında sizin gibi finallerden korkan, tez yazımının zorluğunu bilen birinin olduğunu unutmayın. Herhangi bir öneriniz, "şunu da eklesen harika olur" dediğiniz bir özellik varsa bana her zaman iletişim sayfamızdan ulaşabilirsiniz. 
                    </p>
                    <p>
                        Çünkü bu asistanı sizin için, hepimiz için kodladım.
                    </p>
                    
                    <div className="mt-12 text-foreground/80 pb-4">
                        Sevgilerimle,<br/>
                        <span className="text-2xl font-bold text-foreground mt-2 block font-serif italic">Merve Çelik</span>
                    </div>
                </article>

                {/* Navigation */}
                <nav className="mt-10 flex justify-between items-center border-t border-border/50 pt-8">
                    <Link href="/blog" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Tüm Makaleler
                    </Link>
                    <Link href="/blog/yapay-zeka-ile-literatur-taramasi" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Sonraki Makale <ArrowRight className="w-4 h-4" />
                    </Link>
                </nav>
            </main>
        </>
    );
}
