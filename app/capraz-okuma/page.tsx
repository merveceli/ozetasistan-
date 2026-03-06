"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import {
    BookOpenCheck, Network, FileText, Upload, Sparkles, AlertTriangle,
    CheckCircle2, X, Loader2, GitCompare, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContradictionResult {
    type: 'contradiction' | 'agreement' | 'unique';
    text: string;
    docA?: string;
    docB?: string;
    detail: string;
}

export default function CrossReadingPage() {
    const [textA, setTextA] = useState('');
    const [textB, setTextB] = useState('');
    const [results, setResults] = useState<ContradictionResult[] | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    const handleAnalyze = async () => {
        if (!textA.trim() || !textB.trim()) return;
        setAnalyzing(true);
        setResults(null);

        try {
            const res = await fetch('/api/cross-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ textA, textB })
            });
            if (!res.ok) throw new Error('Yapay zeka analiz hatası.');

            const data = await res.json();
            setResults(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            alert('Analiz sırasında hata oluştu.');
        } finally {
            setAnalyzing(false);
        }
    };

    const contradictions = results?.filter(r => r.type === 'contradiction') ?? [];
    const agreements = results?.filter(r => r.type === 'agreement') ?? [];
    const uniques = results?.filter(r => r.type === 'unique') ?? [];

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            <Header />
            <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
                {/* Background */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />

                <div className="max-w-6xl mx-auto">
                    {/* Page Header */}
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <BookOpenCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold italic tracking-tight">Çapraz Okuma & Sentez</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                İki kaynak arasındaki çelişkileri otomatik tespit et
                            </p>
                        </div>
                        <div className="ml-auto px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Çelişki Dedektörü
                        </div>
                    </div>

                    {/* Input Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-6">
                        {/* Source A */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                                </div>
                                <span className="text-sm font-bold">Kaynak A</span>
                            </div>
                            <textarea
                                value={textA}
                                onChange={e => setTextA(e.target.value)}
                                placeholder="Birinci kaynaktan metni yapıştırın... Örn: 'Verimlilik oranı %10 artmıştır (2022)...'"
                                className="flex-1 min-h-[220px] w-full bg-card/50 border border-border rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                            />
                            <p className="text-[11px] text-muted-foreground">{textA.length} karakter</p>
                        </div>

                        {/* Source B */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <span className="text-sm font-bold">Kaynak B</span>
                            </div>
                            <textarea
                                value={textB}
                                onChange={e => setTextB(e.target.value)}
                                placeholder="İkinci kaynaktan metni yapıştırın... Örn: 'Verimlilik oranı %15 artış gösterdi (2023)...'"
                                className="flex-1 min-h-[220px] w-full bg-card/50 border border-border rounded-2xl p-4 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                            />
                            <p className="text-[11px] text-muted-foreground">{textB.length} karakter</p>
                        </div>
                    </div>

                    {/* Analyze Button */}
                    <div className="flex justify-center mb-8">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAnalyze}
                            disabled={analyzing || !textA.trim() || !textB.trim()}
                            className="flex items-center gap-3 px-8 py-3.5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {analyzing ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Analiz Ediliyor...</>
                            ) : (
                                <><GitCompare className="w-5 h-5" /> Çelişki Analizi Başlat</>
                            )}
                        </motion.button>
                    </div>

                    {/* Results */}
                    <AnimatePresence>
                        {results && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                {/* Summary bar */}
                                <div className="flex flex-wrap gap-4 p-5 bg-card/50 border border-border rounded-2xl">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                                        <span className="text-sm font-bold">{contradictions.length} Çelişki</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                                        <span className="text-sm font-bold">{agreements.length} Uyuşma</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                        <span className="text-sm font-bold">{uniques.length} Özgün Bilgi</span>
                                    </div>
                                    {contradictions.length > 0 && (
                                        <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <AlertTriangle className="w-4 h-4 text-red-400" />
                                            <span className="text-xs font-bold text-red-400">Dikkat: Çelişkiler var!</span>
                                        </div>
                                    )}
                                </div>

                                {/* Result items */}
                                {results.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        className={cn(
                                            "rounded-2xl border overflow-hidden transition-all",
                                            item.type === 'contradiction'
                                                ? "border-red-500/30 bg-red-500/5"
                                                : item.type === 'agreement'
                                                    ? "border-emerald-500/30 bg-emerald-500/5"
                                                    : "border-blue-500/30 bg-blue-500/5"
                                        )}
                                    >
                                        <button
                                            className="w-full p-4 flex items-start gap-3 text-left"
                                            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                                        >
                                            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                                                item.type === 'contradiction' ? 'bg-red-500/20' :
                                                    item.type === 'agreement' ? 'bg-emerald-500/20' : 'bg-blue-500/20'
                                            )}>
                                                {item.type === 'contradiction'
                                                    ? <AlertTriangle className="w-4 h-4 text-red-400" />
                                                    : item.type === 'agreement'
                                                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                        : <Sparkles className="w-4 h-4 text-blue-400" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className={cn("text-[9px] font-black uppercase tracking-widest",
                                                    item.type === 'contradiction' ? 'text-red-400' :
                                                        item.type === 'agreement' ? 'text-emerald-400' : 'text-blue-400'
                                                )}>
                                                    {item.type === 'contradiction' ? '🔴 ÇELİŞKİ' :
                                                        item.type === 'agreement' ? '✅ UYUŞMA' : '🔵 ÖZGÜN BİLGİ'}
                                                </span>
                                                <p className="text-sm font-bold mt-0.5">{item.text}</p>
                                                {item.docA && item.docB && (
                                                    <div className="flex gap-4 mt-2">
                                                        <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-lg">{item.docA}</span>
                                                        <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-lg">{item.docB}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {expandedIdx === idx ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                                        </button>

                                        <AnimatePresence>
                                            {expandedIdx === idx && (
                                                <motion.div
                                                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-4 pt-1 border-t border-white/5">
                                                        <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Empty state */}
                    {!results && !analyzing && (
                        <div className="col-span-2 p-12 bg-secondary/10 rounded-[40px] border border-dashed border-primary/20 text-center">
                            <GitCompare className="w-16 h-16 text-primary mx-auto mb-6 opacity-40" />
                            <h2 className="text-2xl font-bold mb-2">Çelişki Dedektörü Hazır</h2>
                            <p className="text-muted-foreground max-w-md mx-auto">İki kaynaktan metin yapıştırın, AI aralarındaki farklılıkları ve çelişkileri otomatik olarak tespit edecek. Çelişen bilgiler kırmızıyla vurgulanacak.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
