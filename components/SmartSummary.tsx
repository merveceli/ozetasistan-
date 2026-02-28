"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Quote,
    CheckCircle2,
    ExternalLink,
    AlertCircle,
    ShieldCheck,
    Search,
    BookOpen
} from 'lucide-react';

const SMART_CONTENT = [
    { text: "Kuantum bilgisayarlar, klasik bilgisayarların çözemediği karmaşık problemleri saniyeler içinde çözme potansiyeline sahiptir.", type: "citation", source: "Nature Physics, 2023", url: "#", confidence: 98 },
    { text: "Shor algoritması, RSA şifreleme sistemini kırma kapasitesiyle bilinir.", type: "verified", source: "IEEE Xplore", confidence: 100 },
    { text: "2030 yılına kadar ticari kuantum işlemcilerin yaygınlaşması beklenmektedir.", type: "prediction", source: "Gartner Research", confidence: 75 }
];

export default function SmartSummary() {
    const [activeTag, setActiveTag] = useState<number | null>(null);

    return (
        <div className="w-full max-w-4xl mx-auto p-8">
            <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                    <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">AI Verified Content</span>
                    </div>
                </div>

                <header className="mb-10">
                    <h2 className="text-3xl font-black mb-4 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-primary" />
                        Akıllı Analiz Raporu
                    </h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-primary to-blue-500 rounded-full" />
                </header>

                <div className="space-y-6 leading-relaxed text-lg text-white/80">
                    {/* Interactive Text Blocks */}
                    <p>
                        {SMART_CONTENT.map((block, idx) => (
                            <span key={idx} className="relative inline">
                                <motion.span
                                    onMouseEnter={() => setActiveTag(idx)}
                                    onMouseLeave={() => setActiveTag(null)}
                                    className={`
                                        cursor-help transition-all duration-300 rounded-md px-1
                                        ${activeTag === idx ? 'bg-primary/20 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]' : 'bg-transparent border-b border-primary/30'}
                                    `}
                                >
                                    {block.text}{" "}
                                </motion.span>

                                <AnimatePresence>
                                    {activeTag === idx && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: -5, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-full left-0 z-50 w-72 mb-4 p-5 bg-[#12121e] border border-white/20 rounded-2xl shadow-2xl backdrop-blur-2xl"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`p-2 rounded-lg ${block.type === 'verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'}`}>
                                                    {block.type === 'verified' ? <CheckCircle2 className="w-4 h-4" /> : <Quote className="w-4 h-4" />}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Güven Skoru</p>
                                                    <p className={`text-sm font-bold ${block.confidence > 90 ? 'text-emerald-400' : 'text-primary'}`}>%{block.confidence}</p>
                                                </div>
                                            </div>

                                            <p className="text-xs font-bold text-white/90 mb-2 leading-tight">Kaynak: {block.source}</p>
                                            <div className="h-px w-full bg-white/5 my-3" />

                                            <div className="flex items-center justify-between">
                                                <button className="flex items-center gap-1.5 text-[10px] font-black text-primary hover:text-white transition-colors uppercase tracking-widest">
                                                    Atıf Yap <ExternalLink className="w-3 h-3" />
                                                </button>
                                                <button className="flex items-center gap-1.5 text-[10px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest">
                                                    Orijinal Pasaj <Search className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {/* Pointer Arrow */}
                                            <div className="absolute top-full left-6 w-3 h-3 bg-[#12121e] border-r border-b border-white/20 rotate-45 -translate-y-1.5" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </span>
                        ))}
                    </p>
                </div>

                <footer className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Atıf Formatı</span>
                            <select className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer hover:text-primary transition-colors">
                                <option>APA 7th Edition</option>
                                <option>MLA 9th Edition</option>
                                <option>IEEE Standard</option>
                            </select>
                        </div>
                    </div>

                    <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest">
                        <Quote className="w-4 h-4 text-primary" />
                        Tüm Kaynakçayı Kopyala
                    </button>
                </footer>
            </div>
        </div>
    );
}
