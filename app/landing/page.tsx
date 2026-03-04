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
    Star
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
                    <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-white/60 hover:text-white transition-colors">Özellikler</button>
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
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold tracking-widest uppercase text-primary-foreground/80">Yeni Nesil Akademik Yapay Zeka</span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl font-[1000] tracking-tight mb-8 max-w-5xl leading-[0.9]">
                        Akademik <span className="bg-clip-text text-transparent bg-gradient-to-b from-primary via-purple-400 to-blue-500 underline decoration-primary/30 decoration-8 underline-offset-8 text-glow">Derinliği</span> Yeniden Keşfedin
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/60 max-w-2xl mb-12 leading-relaxed">
                        Binlerce sayfa makaleyi saniyeler içinde analiz edin, zihin haritaları oluşturun ve sunumlar hazırlayın. Akademik başarınızın akıllı ortağı.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex gap-5 mb-20">
                        <Link href="/auth/signup" className="group relative px-8 py-4 bg-primary text-white rounded-2xl font-black text-lg transition-all shadow-2xl shadow-primary/40 flex items-center justify-center overflow-hidden">
                            <span className="relative z-10 flex items-center">
                                Şimdi Dene
                                <MoveRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
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

            {/* Bento Grid Features */}
            <section id="features" className="py-24 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-none">Limitleri <span className="text-primary italic">Zorlayan</span> Özellikler.</h2>
                            <p className="text-white/50 text-lg">Yapay zeka teknolojisinin en ileri noktasını akademik ihtiyaçlarınızla birleştirdik.</p>
                        </div>
                        <button className="flex items-center space-x-2 text-primary font-black uppercase text-sm tracking-widest hover:translate-x-2 transition-transform">
                            <span>Tümünü Keşfet</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6 h-auto md:h-[600px]">
                        {/* Main Feature */}
                        <div className="md:col-span-3 md:row-span-2 group relative bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-[2.5rem] border border-white/10 p-10 overflow-hidden hover:border-primary/50 transition-all duration-500 flex flex-col justify-end">
                            <div className="absolute top-10 right-10 flex gap-2">
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20"><Brain className="w-6 h-6 text-white" /></div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black mb-4">Gemini 2.5 Flash Gücü</h3>
                                <p className="text-white/60 text-lg max-w-md">En karmaşık makaleleri saniyeler içinde analiz eden, çok dilli ve yüksek kapasiteli yapay zeka deneyimi.</p>
                            </div>
                            <div className="absolute top-0 -right-20 w-80 h-80 bg-primary/30 blur-[100px] rounded-full group-hover:bg-primary/50 transition-all duration-500" />
                        </div>

                        <div className="md:col-span-3 grid grid-cols-2 gap-6">
                            <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 hover:bg-white/10 transition-all group">
                                <Presentation className="w-10 h-10 text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
                                <h4 className="text-xl font-bold mb-2">Otomatik Sunum</h4>
                                <p className="text-white/40 text-sm">Analizlerinizden profesyonel slaytlar üretin.</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 hover:bg-white/10 transition-all group">
                                <Network className="w-10 h-10 text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
                                <h4 className="text-xl font-bold mb-2">Çapraz Okuma</h4>
                                <p className="text-white/40 text-sm">Birden fazla kaynağı birbiriyle sentezleyin.</p>
                            </div>
                        </div>

                        <div className="md:col-span-1 bg-gradient-to-t from-orange-500/20 to-transparent rounded-[2.5rem] border border-white/10 p-8 flex flex-col items-center justify-center text-center group">
                            <Mic className="w-10 h-10 text-orange-400 mb-4 group-hover:animate-pulse" />
                            <h4 className="text-lg font-bold">Sesli Not</h4>
                        </div>
                        <div className="md:col-span-2 bg-gradient-to-t from-emerald-500/10 to-transparent rounded-[2.5rem] border border-white/10 p-8 flex items-center space-x-6 group">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-3xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <Video className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold">Ders Analizi</h4>
                                <p className="text-white/40 text-sm">Video ve ses kayıtlarını ders notuna dönüştürün.</p>
                            </div>
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



            {/* Footer */}
            <footer className="py-20 border-t border-white/5 bg-black/40 backdrop-blur-3xl">
                <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-2">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><BookOpen className="w-5 h-5 text-white" /></div>
                            <span className="text-xl font-black tracking-tight underline decoration-primary decoration-4">Özet Asistanı</span>
                        </div>
                        <p className="max-w-xs text-white/40 text-sm mb-8 leading-relaxed">Akademik araştırma süreçlerini otomatize eden, öğrenci ve akademisyenlere özel akıllı asistan.</p>
                        <div className="flex gap-4">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors" />)}
                        </div>
                    </div>
                    <div>
                        <h5 className="font-black mb-6 uppercase tracking-widest text-[10px] text-white/60">Ürün</h5>
                        <ul className="space-y-4 text-sm font-medium text-white/40">
                            <li><button className="hover:text-primary transition-colors">Özellikler</button></li>
                            <li><button className="hover:text-primary transition-colors">API</button></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-black mb-6 uppercase tracking-widest text-[10px] text-white/60">Kurumsal</h5>
                        <ul className="space-y-4 text-sm font-medium text-white/40">
                            <li><button className="hover:text-primary transition-colors">Hakkımızda</button></li>
                            <li><button className="hover:text-primary transition-colors">Sözleşmeler</button></li>
                            <li><button className="hover:text-primary transition-colors">Destek</button></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 md:px-12 mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-white/20 font-bold">© 2026 ÖZET ASISTANI. TÜM HAKLARI SAKLIDIR.</p>
                </div>
            </footer>

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
        </div>
    );
}
