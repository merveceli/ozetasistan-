"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Sparkles,
    Brain,
    Presentation,
    Mic,
    Video,
    Network,
    CheckCircle2,
    ArrowRight,
    Zap,
    Users,
    Clock,
    Lock,
    Cpu,
    Target,
    Quote,
    Layers,
    MoveRight,
    Star,
    HelpCircle,
    ChevronDown,
    FileUp,
    SearchCode,
    Smartphone,
    Gavel,
    Stethoscope,
    GraduationCap,
    Briefcase
} from 'lucide-react';


import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface Package {
    id: string;
    display_name: string;
    description: string;
    price_monthly: number;
    features: string[];
    isPopular?: boolean;
}

export default function LandingPage() {
    const router = useRouter();
    const [packages, setPackages] = useState<Package[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [heroIndex, setHeroIndex] = useState(0);

    const heroMessages = [
        { headline: 'Türkçe içerikleri', emphasis: 'anında özetleyen', tail: 'yapay zeka asistanı' },
        { headline: 'Akademik makaleleri', emphasis: 'derinlemesine', tail: 'analiz edin' },
        { headline: 'PDF’lerinizi', emphasis: 'otomatik flashcard', tail: 've quiz’e dönüştürün' },
        { headline: 'Araştırmalarınızı', emphasis: 'süper hızlı', tail: 'sunuya çevirin' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroIndex(prev => (prev + 1) % heroMessages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        checkAuthAndRedirect();
        fetchPackages();
    }, []);

    const checkAuthAndRedirect = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) router.push('/');
    };

    const fetchPackages = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('subscription_packages')
                .select('*')
                .eq('is_active', true)
                .order('price_monthly', { ascending: true });

            if (!error && data) {
                const formattedPackages = data.map((pkg: any) => ({
                    ...pkg,
                    isPopular: pkg.id === 'student'
                }));
                setPackages(formattedPackages);
            }
        } catch (error) {
            console.error('Failed to fetch packages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants: any = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    return (
        <div className="min-h-screen bg-[#030014] text-white selection:bg-primary/30 selection:text-primary overflow-x-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-blue-500/10 blur-[100px] rounded-full" />
                <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-purple-500/10 blur-[100px] rounded-full" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] mix-blend-overlay opacity-20" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 inset-x-0 z-50 py-6 px-6 md:px-12 flex justify-between items-center transition-all duration-300 backdrop-blur-md border-b border-white/5 bg-[#030014]/50">
                <Link href="/" className="flex items-center space-x-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
                        Özet Asistanı
                    </span>
                </Link>
                <div className="hidden md:flex items-center space-x-8">
                    <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-white/60 hover:text-white transition-colors">Nasıl Çalışır?</button>
                    <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-white/60 hover:text-white transition-colors">Özellikler</button>
                    <button onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-white/60 hover:text-white transition-colors">SSS</button>
                    <div className="h-4 w-px bg-white/10" />
                    <Link href="/auth/login" className="text-sm font-semibold hover:text-primary transition-colors">Giriş Yap</Link>
                    <Link href="/auth/signup" className="px-6 py-2.5 rounded-full bg-white text-[#030014] text-sm font-bold hover:bg-white/90 transition-all active:scale-95 shadow-xl shadow-white/5">
                        Ücretsiz Başla
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 md:px-12 overflow-hidden">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full mb-8">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-xs font-bold tracking-widest uppercase text-white/70">Yeni Nesil Akademik Yapay Zeka</span>
                    </motion.div>

                    {/* Animated Hero Headline */}
                    <div className="text-5xl md:text-8xl font-[1000] tracking-tight mb-8 max-w-5xl leading-[1] min-h-[180px] md:min-h-[240px] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.h1
                                key={heroIndex}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -24 }}
                                transition={{ duration: 0.55, ease: 'easeInOut' }}
                                className="text-center"
                            >
                                {heroMessages[heroIndex].headline}{' '}
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-primary via-purple-400 to-blue-500">
                                    {heroMessages[heroIndex].emphasis}
                                </span>{' '}
                                {heroMessages[heroIndex].tail}
                            </motion.h1>
                        </AnimatePresence>
                    </div>

                    {/* Dot indicators */}
                    <div className="flex gap-2 mb-8">
                        {heroMessages.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setHeroIndex(i)}
                                className={`transition-all duration-300 rounded-full ${i === heroIndex
                                    ? 'w-6 h-2 bg-primary'
                                    : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                                    }`}
                            />
                        ))}
                    </div>

                    <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/60 max-w-2xl mb-12 leading-relaxed">
                        Binlerce sayfa makaleyi saniyeler içinde analiz edin, zihin haritaları oluşturun ve sunumlar hazırlayın. Akademik başarınızın akıllı ortağı.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-20">
                        <Link href="/auth/signup" className="group relative px-8 py-4 bg-primary text-white rounded-2xl font-black text-lg transition-all shadow-2xl shadow-primary/40 flex items-center justify-center overflow-hidden">
                            <span className="relative z-10 flex items-center">
                                Ücretsiz Başla
                                <MoveRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </Link>
                        <Link href="/auth/login" className="px-8 py-4 rounded-2xl font-bold text-lg text-white/70 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                            Giriş Yap
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>

                    {/* Dashboard Preview / Hero Visual */}
                    <motion.div
                        variants={itemVariants}
                        className="relative w-full max-w-5xl mx-auto"
                    >
                        {/* Background glow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent blur-3xl opacity-50 rounded-full" />

                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Student Card */}
                            <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:border-primary/40 transition-all duration-500">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10">
                                    {/* Student illustration placeholder - Avatar */}
                                    <div className="flex justify-center mb-6">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-primary flex items-center justify-center text-5xl shadow-2xl shadow-primary/30">
                                                👨‍🎓
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                                                <span className="text-lg">✨</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center mb-5">
                                        <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                                            📖 Öğrenci Modu
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Hızlı Öğrenim</h3>
                                        <p className="text-white/40 text-sm leading-relaxed">
                                            100 sayfalık tezi 5 dakikada öğren. Flashcard ve quiz ile sınava hazırlan.
                                        </p>
                                    </div>
                                    {/* Mini feature list */}
                                    <div className="space-y-2">
                                        {[
                                            { icon: '✅', text: 'Basit dil özet' },
                                            { icon: '🧠', text: 'Akıllı flashcard' },
                                            { icon: '🎯', text: 'Sınav sorusu' },
                                        ].map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-white/60">
                                                <span className="text-base">{f.icon}</span>
                                                <span>{f.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Academic Card */}
                            <div className="relative group rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:border-purple-500/40 transition-all duration-500">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative z-10">
                                    {/* Academic illustration */}
                                    <div className="flex justify-center mb-6">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-5xl shadow-2xl shadow-purple-500/30">
                                                👩‍🔬
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                                                <span className="text-lg">🔬</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center mb-5">
                                        <div className="inline-flex items-center gap-1.5 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                                            🎓 Akademik Mod
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Derin Araştırma</h3>
                                        <p className="text-white/40 text-sm leading-relaxed">
                                            Metodoloji, eleştiri, kaynak yönetimi. Profesyonel akademik analiz.
                                        </p>
                                    </div>
                                    {/* Mini feature list */}
                                    <div className="space-y-2">
                                        {[
                                            { icon: '🔬', text: 'Metodoloji analizi' },
                                            { icon: '📊', text: 'Bibüyografik özetler' },
                                            { icon: '📊', text: 'APA / MLA / IEEE' },
                                        ].map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-white/60">
                                                <span className="text-base">{f.icon}</span>
                                                <span>{f.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating stats */}
                        <div className="flex flex-wrap justify-center gap-4 mt-8">
                            {[
                                { emoji: '⚡', label: '~5 sn', desc: 'Analiz süresi' },
                                { emoji: '🌐', label: '50+ dil', desc: 'PDF desteği' },
                                { emoji: '📄', label: '100MB', desc: 'Dosya limiti' },
                                { emoji: '🔒', label: 'Güvenli', desc: 'Uçtan uca' },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 backdrop-blur-xl hover:bg-white/10 transition-all">
                                    <span className="text-2xl">{stat.emoji}</span>
                                    <div>
                                        <p className="text-sm font-black text-white">{stat.label}</p>
                                        <p className="text-[10px] text-white/40">{stat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Social Proof */}
                    <motion.div variants={itemVariants} className="mt-20 pt-10 border-t border-white/5 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                        <div><p className="text-3xl font-black text-white mb-1">10K+</p><p className="text-xs font-bold text-white/40 uppercase tracking-widest">Analiz</p></div>
                        <div><p className="text-3xl font-black text-white mb-1">500+</p><p className="text-xs font-bold text-white/40 uppercase tracking-widest">Üniversite</p></div>
                        <div><p className="text-3xl font-black text-white mb-1">%98</p><p className="text-xs font-bold text-white/40 uppercase tracking-widest">Doğruluk</p></div>
                        <div><p className="text-3xl font-black text-white mb-1">24/7</p><p className="text-xs font-bold text-white/40 uppercase tracking-widest">Destek</p></div>
                    </motion.div>
                </motion.div>
            </section>
            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 px-6 md:px-12 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black mb-6">Nasıl Çalışır?</h2>
                        <p className="text-white/50 text-xl max-w-2xl mx-auto">Akademik iş akışınızı 3 basit adımda geleceğe taşıyın.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-24" />

                        {[
                            {
                                step: "01",
                                title: "Dokümanı Yükle",
                                desc: "PDF, Word veya makale linkini sisteme yükleyin. Dosya boyutu veya sayfa sınırı dert değil.",
                                icon: <FileUp className="w-8 h-8" />,
                                color: "from-blue-500 to-cyan-400"
                            },
                            {
                                step: "02",
                                title: "Yapay Zeka Analizi",
                                desc: "Gemini 3 Flash altyapısı ile metni saniyeler içinde tarar, kavramsal haritaları ve önemli noktaları çıkarır.",
                                icon: <SearchCode className="w-8 h-8" />,
                                color: "from-primary to-purple-500"
                            },
                            {
                                step: "03",
                                title: "Bilgiye Dönüştür",
                                desc: "Özetleri oku, flashcardlar ile çalış veya tek tıkla profesyonel sunumun taslağını al.",
                                icon: <Presentation className="w-8 h-8" />,
                                color: "from-purple-500 to-pink-500"
                            }
                        ].map((item, i) => (
                            <div key={i} className="relative group">
                                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-8 shadow-2xl shadow-primary/20 group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                                <div className="absolute -top-4 -right-4 text-6xl font-black text-white/5 select-none">{item.step}</div>
                                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                <p className="text-white/50 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* Advanced Features Grid */}
            <section id="features" className="py-24 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Yapay Zekanın <span className="text-primary italic">Zirvesi</span>.</h2>
                            <p className="text-white/50 text-lg">En ileri akademik analiz araçları ve sunum özellikleri artık tüm paketlerimizde aktif. Kullanım kotanız dahilinde tüm özellikleri sınırsızca deneyimleyin.</p>
                        </div>
                        <button className="flex items-center space-x-2 text-primary font-black uppercase text-sm tracking-widest hover:translate-x-2 transition-transform">
                            <span>Tümünü Keşfet</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Feature */}
                        <div className="md:col-span-2 relative bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-[2rem] border border-white/10 p-10 overflow-hidden hover:border-primary/50 transition-all duration-500 flex flex-col justify-end min-h-[360px]">
                            <div className="absolute top-10 right-10 flex gap-2">
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20"><Brain className="w-6 h-6 text-white" /></div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black mb-4">Gemini 2.5 Flash Gücü</h3>
                                <p className="text-white/60 text-lg max-w-md">En karmaşık akademik makaleleri saniyeler içinde analiz eden, çok dilli ve yüksek kapasiteli yapay zeka deneyimi.</p>
                            </div>
                            <div className="absolute top-0 -right-20 w-80 h-80 bg-primary/30 blur-[100px] rounded-full group-hover:bg-primary/50 transition-all duration-500" />
                        </div>

                        {/* Feature 2 */}
                        <div className="md:col-span-1 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-10 hover:bg-white/10 transition-all flex flex-col justify-end min-h-[360px]">
                            <Presentation className="w-12 h-12 text-blue-400 mb-8" />
                            <h4 className="text-2xl font-bold mb-3">Otomatik Sunum</h4>
                            <p className="text-white/40">Analizlerinizden profesyonel, sektörel slaytlar üretin.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="md:col-span-1 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-10 hover:bg-white/10 transition-all flex flex-col justify-end min-h-[360px]">
                            <Network className="w-12 h-12 text-purple-400 mb-8" />
                            <h4 className="text-2xl font-bold mb-3">Çapraz Okuma</h4>
                            <p className="text-white/40">Birden fazla kaynağı sentezleyip gizli çelişkileri ve bağları bulun.</p>
                        </div>

                        {/* Feature 4 */}
                        <div className="md:col-span-2 relative bg-gradient-to-tl from-emerald-500/10 to-transparent rounded-[2rem] border border-white/10 p-10 hover:border-emerald-500/30 transition-all flex flex-col justify-end min-h-[360px] overflow-hidden">
                            <div className="absolute top-10 right-10">
                                <div className="w-12 h-12 bg-emerald-500/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-emerald-500/20"><Mic className="w-6 h-6 text-emerald-400" /></div>
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-3xl font-bold mb-4">Çalışma Merkezi & Radyo</h4>
                                <p className="text-white/60 text-lg max-w-lg">Spaced Repetition (Aralıklı Tekrar) ile flashcard ezberleyin, Pomodoro radyosu ile odaklanarak uzun makaleleri sesli dinleyin.</p>
                            </div>
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials/Quotes */}
            <section className="py-24 px-6 md:px-12 relative">
                <div className="max-w-4xl mx-auto text-center">
                    <Quote className="w-16 h-16 text-primary/20 mx-auto mb-8" />
                    <h2 className="text-3xl md:text-5xl font-black italic mb-8">"Akademik çalışma yöntemimizi tamamen değiştirdi. Artık makale okumak bir yük değil, keyif haline geldi."</h2>
                    <div className="flex items-center justify-center space-x-4">
                        <div className="w-12 h-12 bg-white/10 rounded-full" />
                        <div className="text-left">
                            <p className="font-bold">Dr. Ahmet Yılmaz</p>
                            <p className="text-white/40 text-sm">Akademisyen @ İTÜ</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Who Can Use This Section */}
            <section id="use-cases" className="py-24 px-6 md:px-12 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Kimler Kullanabilir?</h2>
                        <p className="text-white/50 text-xl max-w-2xl mx-auto">Sadece öğrenciler için değil, bilgiyle uğraşan her profesyonel için.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: "Avukatlar",
                                desc: "Yüzlerce sayfalık dava dosyalarını, emsal kararları ve hukuki metinleri saniyeler içinde analiz edin, çelişkileri yakalayın.",
                                icon: <Gavel className="w-6 h-6 text-amber-400" />,
                                border: "hover:border-amber-400/30"
                            },
                            {
                                title: "Sağlık Çalışanları",
                                desc: "Güncel tıp makalelerini, araştırma raporlarını ve karmaşık vaka analizlerini hızlıca sentezleyin.",
                                icon: <Stethoscope className="w-6 h-6 text-rose-400" />,
                                border: "hover:border-rose-400/30"
                            },
                            {
                                title: "Akademisyenler",
                                desc: "Literatür taraması yaparken yüzlerce kaynağı karşılaştırın, kaynakçalarınızı düzenleyin ve sentez raporları oluşturun.",
                                icon: <GraduationCap className="w-6 h-6 text-primary" />,
                                border: "hover:border-primary/30"
                            },
                            {
                                title: "Kurumsal Ekipler",
                                desc: "Pazar araştırma raporlarını, rakip analizlerini ve şirket içi dokümanları hızlıca stratejik bilgiye dönüştürün.",
                                icon: <Briefcase className="w-6 h-6 text-blue-400" />,
                                border: "hover:border-blue-400/30"
                            }
                        ].map((item, i) => (
                            <div key={i} className={`p-8 rounded-[2rem] bg-white/5 border border-white/10 transition-all ${item.border} group`}>
                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* FAQ Section */}
            <section id="faq" className="py-24 px-6 md:px-12 relative">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-16">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                            <HelpCircle className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black">Merak Edilenler</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "Neden Özet Asistanı? Diğer araçlardan farkı ne?",
                                a: "Biz sadece bir 'özetleme' aracı değiliz. Akademik metodolojiyi anlayan, Türkçe dil yapısına %100 hakim ve analiz sonrası size sunum, flashcard gibi somut çıktılar üreten tek entegre platformuz. ChatGPT gibi genel araçlar metni kısaltırken, biz metni 'öğrenilebilir' hale getiriyoruz."
                            },
                            {
                                q: "Türkiye'de başka yerli/Türkçe akademik asistan var mı?",
                                a: "Piyasada basit API entegrasyonları olsa da, bu kadar geniş akademik modül grubunu (Sentez Lab, Zihin Haritaları, Odak Radyosu) tek çatıda toplayan Türkiye'nin ilk ve en gelişmiş yerli akademik AI platformuyuz. Türk akademisyen ve öğrencilerin ihtiyaçlarına göre özel olarak yapılandırıldık."
                            },
                            {
                                q: "Dokümanlarım güvende mi?",
                                a: "Kesinlikle. Yüklediğiniz dosyalar uçtan uca şifrelenir ve sadece sizin erişiminize açıktır. Verileriniz asla model eğitimi için kullanılmaz ve istediğiniz an sistemden kalıcı olarak silebilirsiniz."
                            },
                            {
                                q: "Gemini 3 Flash teknolojisi ne sağlıyor?",
                                a: "Dünyanın en yeni ve en hızlı multimodel yapay zeka altyapısını kullanıyoruz. Bu sayede 1 milyon tokenlik (yaklaşık 2000 sayfa) bir veriyi bile saniyeler içinde analiz edip çelişkileri bulabiliyoruz. Hızımız global rakiplerimizin 5 katı."
                            },
                        ].map((item, i) => {
                            const [isOpen, setIsOpen] = useState(false);
                            return (
                                <div
                                    key={i}
                                    onClick={() => setIsOpen(!isOpen)}
                                    className={cn(
                                        "group bg-white/5 border border-white/10 rounded-[2rem] p-8 transition-all cursor-pointer text-left",
                                        isOpen ? "bg-white/10 ring-1 ring-primary/20" : "hover:bg-white/10"
                                    )}
                                >
                                    <div className="flex justify-between items-center gap-4">
                                        <h4 className="text-xl font-bold">{item.q}</h4>
                                        <ChevronDown className={cn(
                                            "w-5 h-5 text-white/40 transition-all shrink-0",
                                            isOpen ? "rotate-180 text-primary" : "group-hover:text-primary"
                                        )} />
                                    </div>
                                    <div className={cn(
                                        "overflow-hidden transition-all duration-500 ease-in-out",
                                        isOpen ? "max-h-80 mt-6" : "max-h-0"
                                    )}>
                                        <p className="text-white/60 leading-relaxed pt-6 border-t border-white/10">
                                            {item.a}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </section>

            {/* Footer */}
            <footer className="pt-24 pb-10 border-t border-white/5 bg-[#030014] relative z-20">

                <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-5 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg"><BookOpen className="w-6 h-6 text-white" /></div>
                            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Özet Asistanı</span>
                        </div>
                        <p className="max-w-xs text-white/50 text-sm mb-8 leading-relaxed">Akademik araştırma süreçlerini otomatize eden, öğrenci ve akademisyenlere özel akıllı üretkenlik yapay zekası.</p>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-4 md:col-start-3">
                        <h5 className="font-black mb-6 uppercase tracking-widest text-[10px] text-white/40">Uygulama Özellikleri</h5>
                        <div className="grid grid-cols-2 gap-4">
                            <ul className="space-y-4 text-sm font-medium text-white/60 relative">
                                <li className="flex items-center gap-2 hover:text-white transition-colors cursor-default"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Öğrenci Modu</li>
                                <li className="flex items-center gap-2 hover:text-white transition-colors cursor-default"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Akademik Mod</li>
                                <li className="flex items-center gap-2 hover:text-white transition-colors cursor-default"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Profesör Modu</li>
                                <li className="flex items-center gap-2 hover:text-white transition-colors cursor-default"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Çalışma Merkezi</li>
                            </ul>
                            <ul className="space-y-4 text-sm font-medium text-white/60 relative">
                                <li className="flex items-center gap-2 hover:text-white transition-colors cursor-default"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Odak Radyosu</li>
                                <li className="flex items-center gap-2 hover:text-white transition-colors cursor-default"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Sentez Lab</li>
                                <li className="flex items-center gap-2 hover:text-white transition-colors cursor-default"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Zihin Haritaları</li>
                                <li className="flex items-center gap-2 hover:text-white transition-colors cursor-default"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Otomatik Sunum</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <h5 className="font-black mb-6 uppercase tracking-widest text-[10px] text-emerald-400">Geliştirici</h5>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group cursor-pointer shadow-lg">
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                                    <Cpu className="w-5 h-5 text-emerald-400 group-hover:animate-pulse" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-white truncate">Geliştirici Ekip</p>
                                    <p className="text-[9px] text-emerald-400/80 uppercase tracking-widest">Özet Asistanı</p>
                                </div>
                            </div>
                            <p className="text-xs text-white/40 leading-relaxed">
                                Bu proje, yapay zekanın akademik öğrenimi nasıl dönüştüreceğine dair tutkulu bir vizyonun eseridir.
                            </p>
                            <Link href="https://github.com/yunusemrekahraman" target="_blank" className="mt-4 inline-flex items-center text-[11px] font-bold text-emerald-400 hover:text-emerald-300">
                                İletişimde Kalın <ArrowRight className="w-3 h-3 ml-1" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 md:px-12 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-xs text-white/30 font-bold tracking-widest uppercase flex-1">© 2026 ÖZET ASİSTANI. TÜM HAKLARI SAKLIDIR.</p>

                    <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/30">
                        <Link href="/hakkimizda" className="hover:text-primary transition-colors">Hakkımızda</Link>
                        <Link href="/gizlilik-politikasi" className="hover:text-primary transition-colors">Gizlilik Politikası</Link>
                        <Link href="/iletisim" className="hover:text-primary transition-colors">İletişim</Link>
                    </div>

                    <div className="flex space-x-6 text-white/30">
                        <Link href="#" className="hover:text-white transition-colors"><Network className="w-4 h-4" /></Link>
                        <Link href="#" className="hover:text-white transition-colors"><Users className="w-4 h-4" /></Link>
                    </div>
                </div>
            </footer >

            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
                
                :global(body) {
                    font-family: 'Space Grotesk', sans-serif;
                }

                .bg-grid {
                    background-size: 40px 40px;
                    background-image: 
                        linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
                }
            `}</style>
        </div >
    );
}
