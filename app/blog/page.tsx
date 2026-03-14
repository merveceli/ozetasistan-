import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Clock, ArrowRight, Tag } from 'lucide-react';
import { BlogCTAButton } from '@/components/BlogCTAButton';

export const metadata: Metadata = {
    title: 'Blog — Akademik Çalışma ve AI İpuçları',
    description:
        'Akademik başarı için yapay zeka kullanımı, PDF analizi, flashcard teknikleri, zihin haritaları ve verimli çalışma yöntemleri hakkında kapsamlı rehberler.',
    keywords: [
        'akademik çalışma teknikleri', 'PDF özetleme yöntemleri', 'yapay zeka ile öğrenme',
        'flashcard nasıl yapılır', 'zihin haritası nedir', 'tez okuma teknikleri',
        'verimli ders çalışma', 'makale analizi', 'Gemini AI eğitim',
    ],
    openGraph: {
        title: 'Özet Asistanı Blog — Akademik AI ve Verimli Çalışma',
        description:
            'Yapay zekayla akademik verimliliğinizi artırın. PDF analizi, flashcard ve sunum üretimi hakkında uzman rehberleri.',
    },
    alternates: {
        canonical: 'https://ozetasistani.com/blog',
    },
};

const blogPosts = [
    {
        slug: 'kurucunun-hikayesi',
        title: 'Neden Özet Asistanı\'nı Kurdum? Öğrencilikten Girişimciliğe',
        excerpt: 'Yüzlerce sayfalık öğrenci dertlerinden doğan bir yapay zeka girişimi. İstanbul Üniversitesi bilgisayar programcılığı öğrencisi Merve Çelik\'in ağzından uygulamanın hikayesi.',
        category: 'Duyuru',
        readTime: '5 dk',
        date: '2025-03-14',
        tags: ['merve çelik', 'girişimcilik', 'hikaye'],
        icon: '💌',
    },
    {
        slug: 'yapay-zeka-ile-literatur-taramasi',
        title: 'Yapay Zeka ile Literatür Taraması Nasıl Yapılır? Akademik Rehber',
        excerpt: 'Akademik literatür taramasını haftalar yerine saatler içinde tamamlayın. AI araçları ile akademik kaynak bulma ve sentezleme teknikleri.',
        category: 'Araştırma',
        readTime: '10 dk',
        date: '2025-03-14',
        tags: ['literatür taraması', 'araştırma', 'yapay zeka'],
        icon: '📚',
    },
    {
        slug: 'pomodoro-teknigi-ile-ders-calisma',
        title: 'Pomodoro Tekniği: Tükenmişlik Yaşamadan Odaklanın',
        excerpt: 'Saatlerce masada oturmanıza rağmen verim alamıyor musunuz? Pomodoro Tekniği ve odak radyosu kullanarak ders çalışma veriminizi artırın.',
        category: 'Üretkenlik',
        readTime: '6 dk',
        date: '2025-03-14',
        tags: ['pomodoro', 'üretkenlik', 'ders çalışma'],
        icon: '⏱️',
    },
    {
        slug: 'ingilizce-akademik-metin-cevirisi',
        title: 'Akademik İngilizce Metinleri Çevirmeden Anlama Rehberi',
        excerpt: 'Google Translate kullanmayı bırakın. İngilizce orijinal makaleleri doğrudan kavrayarak okuma hızı kazanmanın yolları.',
        category: 'Dil Gelişimi',
        readTime: '9 dk',
        date: '2025-03-14',
        tags: ['ingilizce makale', 'çeviri', 'akademik okuma'],
        icon: '🌐',
    },
    {
        slug: 'sinav-kaygisi-nasil-yenilir',
        title: 'Sınav Kaygısı ve Stresi Nasıl Yenilir? Başa Çıkma Taktikleri',
        excerpt: 'Sınav gecesi uykusuzluğa ve unutkanlığa son! Sınav stresini azaltıp performansınızı yükseltecek bilimsel stratejiler.',
        category: 'Psikoloji',
        readTime: '7 dk',
        date: '2025-03-14',
        tags: ['sınav stresi', 'kaygı', 'öğrenci psikolojisi'],
        icon: '🧘',
    },
    {
        slug: 'akademik-makale-nasil-ozetlenir',
        title: 'Akademik Makale Nasıl Özetlenir? Yapay Zeka ile Hızlı Analiz Rehberi',
        excerpt:
            'Yüzlerce sayfalık akademik makaleleri saniyeler içinde özet almak artık mümkün. Gemini AI destekli Özet Asistanı ile akademik analiz sürecinizi nasıl hızlandırabileceğinizi adım adım öğrenin.',
        category: 'Rehber',
        readTime: '8 dk',
        date: '2025-03-01',
        tags: ['PDF analizi', 'akademik makale', 'yapay zeka'],
        icon: '📄',
    },
    {
        slug: 'yapay-zeka-ile-pdf-analizi',
        title: 'Yapay Zeka ile PDF Analizi: 2025\'te Bilgi Çıkarmanın En Akıllı Yolu',
        excerpt:
            'PDF belgelerinden anlamlı bilgi çıkarmak için yapay zeka nasıl kullanılır? Özet Asistanı\'nın Gemini 2.5 Flash altyapısıyla PDF analizi yaparken dikkat etmeniz gerekenler.',
        category: 'Teknoloji',
        readTime: '10 dk',
        date: '2025-03-05',
        tags: ['PDF', 'Gemini AI', 'makine öğrenmesi'],
        icon: '🤖',
    },
    {
        slug: 'flashcard-ile-hizli-ogrenme',
        title: 'Flashcard ile Hızlı Öğrenme: Spaced Repetition Yöntemi Nedir?',
        excerpt:
            'Hafızanın nasıl çalıştığını anlayan Spaced Repetition (aralıklı tekrar) yöntemi ile akademik başarınızı katlayın. Özet Asistanı\'nın otomatik flashcard özelliğini nasıl kullanırsınız?',
        category: 'Öğrenme Teknikleri',
        readTime: '7 dk',
        date: '2025-03-07',
        tags: ['flashcard', 'öğrenme teknikleri', 'hafıza'],
        icon: '🧠',
    },
    {
        slug: 'zihin-haritasi-nedir',
        title: 'Zihin Haritası Nedir? Akademik Çalışmada Nasıl Kullanılır?',
        excerpt:
            'Zihin haritaları konular arasındaki bağlantıları görselleştirerek öğrenmeyi kolaylaştırır. Akademik makalelerinizden otomatik zihin haritası üretmenin faydaları ve nasıl yapılacağı.',
        category: 'Öğrenme Teknikleri',
        readTime: '6 dk',
        date: '2025-03-09',
        tags: ['zihin haritası', 'görsel öğrenme', 'not alma'],
        icon: '🗺️',
    },
    {
        slug: 'tez-okuma-teknikleri',
        title: 'Tez Okuma Teknikleri: 500 Sayfalık Tezi 1 Günde Nasıl Anlarsınız?',
        excerpt:
            'Akademik tezleri verimli okumak için kanıtlanmış stratejiler: SQ3R yöntemi, seçici okuma ve yapay zeka destekli tez analizi ile nasıl zaman kazanırsınız?',
        category: 'Akademik Başarı',
        readTime: '9 dk',
        date: '2025-03-11',
        tags: ['tez okuma', 'akademik çalışma', 'üretkenlik'],
        icon: '🎓',
    },
];

const categoryColors: Record<string, string> = {
    'Rehber': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Teknoloji': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Öğrenme Teknikleri': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Akademik Başarı': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Araştırma': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'Üretkenlik': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'Dil Gelişimi': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'Psikoloji': 'bg-red-500/20 text-red-300 border-red-500/30',
    'Duyuru': 'bg-amber-500/20 text-amber-500 border-amber-500/30',
};

export default function BlogPage() {
    const featured = blogPosts[0];
    const rest = blogPosts.slice(1);

    return (
        <main className="min-h-screen">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background border-b border-border/40 py-16 px-6 md:px-12">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-16 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                        <BookOpen className="w-4 h-4" />
                        Akademik AI Blog
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
                        Verimli Çalışmanın{' '}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                            Akıllı Rehberi
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Yapay zeka, PDF analizi, flashcard ve akademik çalışma teknikleri hakkında
                        uzman rehberleri. Her hafta yeni içerik.
                    </p>
                </div>
            </section>

            {/* Featured Post */}
            <section className="py-12 px-6 md:px-12 max-w-6xl mx-auto">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
                    Öne Çıkan Makale
                </p>
                <Link
                    href={`/blog/${featured.slug}`}
                    className="group flex flex-col md:flex-row gap-8 p-8 bg-card border border-border/50 rounded-3xl hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-primary/5"
                    aria-label={`Makaleyi oku: ${featured.title}`}
                >
                    <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-5xl">
                        {featured.icon}
                    </div>
                    <div className="flex-1">
                        <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border mb-3 ${categoryColors[featured.category]}`}>
                            {featured.category}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                            {featured.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">{featured.excerpt}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {featured.readTime} okuma
                            </span>
                            <span>{new Date(featured.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            <span className="ml-auto flex items-center gap-1 text-primary font-semibold group-hover:gap-2 transition-all">
                                Oku <ArrowRight className="w-4 h-4" />
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Other Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                    {rest.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="group flex flex-col p-6 bg-card border border-border/50 rounded-2xl hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5"
                            aria-label={`Makaleyi oku: ${post.title}`}
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl flex items-center justify-center text-2xl">
                                    {post.icon}
                                </div>
                                <span className={`self-start text-xs font-bold px-2.5 py-1 rounded-full border ${categoryColors[post.category]}`}>
                                    {post.category}
                                </span>
                            </div>
                            <h2 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors leading-snug">
                                {post.title}
                            </h2>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                                {post.excerpt}
                            </p>
                            <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {post.readTime}
                                </span>
                                <span>{new Date(post.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</span>
                                <span className="ml-auto flex items-center gap-1 text-primary group-hover:gap-2 transition-all text-sm font-semibold">
                                    Oku <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border/50">
                                {post.tags.map((tag) => (
                                    <span key={tag} className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                                        <Tag className="w-2.5 h-2.5" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-16 text-center p-10 bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-3xl">
                    <h2 className="text-2xl font-bold mb-3">Hemen Ücretsiz Dene</h2>
                    <p className="text-muted-foreground mb-6">
                        PDF&apos;lerini yükle, saniyeler içinde özet, flashcard ve sunum al.
                    </p>
                    <BlogCTAButton 
                        defaultText="Ücretsiz Başla" 
                        className="shadow-xl shadow-primary/20" 
                    />
                </div>
            </section>
        </main>
    );
}
