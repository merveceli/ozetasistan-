"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    AlertCircle,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Quote,
    Search,
    Loader2,
    BookOpen,
    Globe,
    GraduationCap,
    BarChart2,
    HelpCircle,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BannerAd } from '@/components/BannerAd';

interface ClaimResult {
    text: string;
    status: 'verified' | 'disputed' | 'unverifiable';
    trustScore: number;
    explanation: string;
    sources: { label: string; url: string; type: 'wiki' | 'academic' | 'news' }[];
}

// Simüle edilmiş fact-check sonuçları
const MOCK_CLAIMS: ClaimResult[] = [
    {
        text: 'Kuantum bilgisayarlar, klasik bilgisayarların çözemediği karmaşık problemleri saniyeler içinde çözme potansiyeline sahiptir.',
        status: 'verified',
        trustScore: 91,
        explanation: 'Bu ifade, kuantum üstünlüğü (quantum supremacy) kavramıyla örtüşmektedir. Google\'ın 2019 Nature makalesi bu iddiayı desteklemektedir.',
        sources: [
            { label: 'Wikipedia: Kuantum Hesaplama', url: 'https://tr.wikipedia.org/wiki/Kuantum_bilgisayar', type: 'wiki' },
            { label: 'Nature: Quantum Supremacy', url: 'https://www.nature.com/articles/s41586-019-1666-5', type: 'academic' },
        ],
    },
    {
        text: 'Shor algoritması, RSA şifreleme sistemini kırma kapasitesiyle bilinir.',
        status: 'verified',
        trustScore: 98,
        explanation: 'Shor\'un 1994\'te önerdiği bu algoritma, RSA\'nın dayandığı asal çarpanlara ayırma problemini polinom zamanda çözer. Geniş ölçekli kuantum bilgisayarlar henüz mevcut değildir.',
        sources: [
            { label: 'Wiki: Shor Algoritması', url: 'https://en.wikipedia.org/wiki/Shor%27s_algorithm', type: 'wiki' },
            { label: 'IEEE: Shor\'s Algorithm', url: 'https://ieeexplore.ieee.org/', type: 'academic' },
            { label: 'NIST: Post-Quantum Cryptography', url: 'https://csrc.nist.gov/projects/post-quantum-cryptography', type: 'academic' },
        ],
    },
    {
        text: '2030 yılına kadar ticari kuantum işlemcilerin yaygınlaşması beklenmektedir.',
        status: 'disputed',
        trustScore: 62,
        explanation: 'Bu bir tahmin ifadesidir. Bazı analistler 2030\'u hedef gösterirken, uzmanlar çoğunluğu 2035-2040 aralığını daha gerçekçi bulmaktadır. Farklı kaynaklar farklı öngörüler sunmaktadır.',
        sources: [
            { label: 'Gartner Hype Cycle 2023', url: 'https://www.gartner.com/en/technologies/quantum-computing', type: 'news' },
            { label: 'McKinsey Quantum Report', url: 'https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/quantum-technology', type: 'academic' },
        ],
    },
];

const STATUS_CONFIG = {
    verified: {
        label: 'Doğrulandı',
        icon: CheckCircle2,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        barColor: 'bg-emerald-400',
    },
    disputed: {
        label: 'Tartışmalı',
        icon: AlertCircle,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        barColor: 'bg-amber-400',
    },
    unverifiable: {
        label: 'Doğrulanamadı',
        icon: HelpCircle,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        barColor: 'bg-red-400',
    },
};

const SOURCE_ICONS = {
    wiki: { icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Vikipedi' },
    academic: { icon: GraduationCap, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Akademik' },
    news: { icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Haber/Rapor' },
};

function TrustGauge({ score }: { score: number }) {
    const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
    const angle = (score / 100) * 180 - 90; // -90 to +90 degrees

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-20 h-10 overflow-hidden">
                <svg viewBox="0 0 80 40" className="w-full h-full">
                    {/* Background arc */}
                    <path d="M 8 36 A 32 32 0 0 1 72 36" fill="none" stroke="currentColor" className="text-white/10" strokeWidth="8" strokeLinecap="round" />
                    {/* Score arc */}
                    <path
                        d="M 8 36 A 32 32 0 0 1 72 36"
                        fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${(score / 100) * 100.5} 100.5`}
                        style={{ transition: 'stroke-dasharray 1s ease' }}
                    />
                    {/* Needle */}
                    <line
                        x1="40" y1="36" x2="40" y2="10"
                        stroke="white" strokeWidth="2" strokeLinecap="round"
                        transform={`rotate(${angle}, 40, 36)`}
                        style={{ transition: 'transform 1s ease' }}
                    />
                    <circle cx="40" cy="36" r="3" fill="white" />
                </svg>
            </div>
            <p className="text-xl font-black tabular-nums -mt-1" style={{ color }}>
                {score}<span className="text-sm font-bold opacity-60">/100</span>
            </p>
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Güven Skoru</p>
        </div>
    );
}

export default function KaynakDogrulamaPage() {
    const [inputText, setInputText] = useState('');
    const [results, setResults] = useState<ClaimResult[] | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [activePopup, setActivePopup] = useState<number | null>(null);
    const [citationFormat, setCitationFormat] = useState<'APA' | 'MLA' | 'IEEE'>('APA');

    const handleAnalyze = async () => {
        if (!inputText.trim()) return;
        setAnalyzing(true);
        setResults(null);
        try {
            const res = await fetch('/api/fact-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: inputText })
            });
            const data = await res.json();
            if (data.results) {
                const safeResults = data.results.map((r: any) => ({
                    ...r,
                    sources: (r.sources || []).map((s: any) => ({
                        ...s,
                        type: ['wiki', 'academic', 'news'].includes(s.type) ? s.type : 'news'
                    }))
                }));
                setResults(safeResults);
            } else {
                alert(data.error || 'Bir analiz hatası oluştu, lütfen tekrar deneyin.');
            }
        } catch (err) {
            console.error("Fact check error:", err);
            alert('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
        } finally {
            setAnalyzing(false);
        }
    };

    const overallScore = results
        ? Math.round(results.reduce((acc, r) => acc + r.trustScore, 0) / results.length)
        : null;

    return (
        <div className="min-h-screen bg-[#030014] text-white p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Kaynak Doğrulama</h1>
                        <p className="text-sm text-white/50">Her iddiaya güven skoru + kaynak bağlantısı</p>
                    </div>
                    <div className="ml-auto hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">AI Verified</span>
                    </div>
                </div>

                {/* Banner Ad Area */}
                <div className="mb-6">
                    <BannerAd variant="adsense" />
                </div>

                {/* Input Area */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 mb-6 backdrop-blur-xl">
                    <label className="text-xs font-black uppercase tracking-widest text-white/30 block mb-3">
                        Doğrulanacak Metin
                    </label>
                    <textarea
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        placeholder="Doğrulamak istediğiniz metni buraya yapıştırın. AI her iddiayı ayrı ayrı analiz edecek ve güven skoru verecek..."
                        className="w-full bg-transparent text-white/80 placeholder:text-white/20 text-sm leading-relaxed resize-none min-h-[140px] focus:outline-none"
                    />
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                        <p className="text-[11px] text-white/20">{inputText.length} karakter</p>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAnalyze}
                            disabled={analyzing || !inputText.trim()}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {analyzing
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Analiz Ediliyor...</>
                                : <><Search className="w-4 h-4" /> Doğrula & Puanla</>
                            }
                        </motion.button>
                    </div>
                </div>

                {/* Results */}
                <AnimatePresence>
                    {results && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            {/* Overall Score */}
                            {overallScore !== null && (
                                <motion.div
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 flex flex-wrap items-center gap-8 backdrop-blur-xl"
                                >
                                    <TrustGauge score={overallScore} />
                                    <div className="flex-1 min-w-[200px]">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Genel Değerlendirme</p>
                                        <div className="flex flex-wrap gap-4">
                                            {[
                                                { label: 'Doğrulandı', count: results.filter(r => r.status === 'verified').length, color: 'text-emerald-400' },
                                                { label: 'Tartışmalı', count: results.filter(r => r.status === 'disputed').length, color: 'text-amber-400' },
                                                { label: 'Belirsiz', count: results.filter(r => r.status === 'unverifiable').length, color: 'text-red-400' },
                                            ].map(s => (
                                                <div key={s.label} className="text-center">
                                                    <p className={cn("text-2xl font-black tabular-nums", s.color)}>{s.count}</p>
                                                    <p className="text-[10px] text-white/30 font-bold">{s.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Atıf Formatı</p>
                                        <div className="flex gap-2">
                                            {(['APA', 'MLA', 'IEEE'] as const).map(fmt => (
                                                <button key={fmt} onClick={() => setCitationFormat(fmt)}
                                                    className={cn("px-3 py-1 rounded-lg text-xs font-bold transition-all",
                                                        citationFormat === fmt ? "bg-primary text-white" : "bg-white/5 text-white/40 hover:bg-white/10"
                                                    )}>{fmt}</button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Claim items */}
                            {results.map((claim, idx) => {
                                const cfg = STATUS_CONFIG[claim.status];
                                const StatusIcon = cfg.icon;
                                const isOpen = activePopup === idx;

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={cn("rounded-2xl border overflow-hidden backdrop-blur-xl", cfg.bg, cfg.border)}
                                    >
                                        <div
                                            className="flex items-start gap-4 p-5 cursor-pointer"
                                            onClick={() => setActivePopup(isOpen ? null : idx)}
                                        >
                                            {/* Status icon */}
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/5")}>
                                                <StatusIcon className={cn("w-5 h-5", cfg.color)} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className={cn("text-[9px] font-black uppercase tracking-widest", cfg.color)}>
                                                        {cfg.label}
                                                    </span>
                                                    {/* Mini trust bar */}
                                                    <div className="flex items-center gap-1.5 ml-1">
                                                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className={cn("h-full rounded-full", cfg.barColor)}
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${claim.trustScore}%` }}
                                                                transition={{ duration: 1, delay: idx * 0.1 }}
                                                            />
                                                        </div>
                                                        <span className={cn("text-[10px] font-black tabular-nums", cfg.color)}>
                                                            {claim.trustScore}/100
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-medium text-white/80 leading-relaxed line-clamp-2">
                                                    {claim.text}
                                                </p>

                                                {/* Source icons (always visible) */}
                                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                    {claim.sources.map((src, sIdx) => {
                                                        const srcCfg = SOURCE_ICONS[src.type];
                                                        const SrcIcon = srcCfg.icon;
                                                        return (
                                                            <a
                                                                key={sIdx}
                                                                href={src.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={e => e.stopPropagation()}
                                                                className={cn(
                                                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all hover:opacity-80",
                                                                    srcCfg.bg, srcCfg.color
                                                                )}
                                                                title={src.label}
                                                            >
                                                                <SrcIcon className="w-3 h-3" />
                                                                <span className="truncate max-w-[100px]">{src.label}</span>
                                                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Gauge mini */}
                                            <div className="shrink-0 hidden sm:flex flex-col items-center">
                                                <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center relative"
                                                    style={{ borderColor: claim.trustScore >= 80 ? '#10B981' : claim.trustScore >= 60 ? '#F59E0B' : '#EF4444' }}>
                                                    <span className="text-xs font-black tabular-nums">{claim.trustScore}</span>
                                                </div>
                                                <p className="text-[8px] text-white/20 mt-1 uppercase">Güven</p>
                                            </div>
                                        </div>

                                        {/* Expanded detail */}
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-5 pb-5 pt-2 border-t border-white/5 space-y-4">
                                                        <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
                                                            <Info className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
                                                            <p className="text-sm text-white/60 leading-relaxed">{claim.explanation}</p>
                                                        </div>

                                                        {/* Citation generator */}
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">
                                                                {citationFormat} Atıf Önerileri
                                                            </p>
                                                            {claim.sources.map((src, sIdx) => (
                                                                <div key={sIdx} className="flex items-center gap-2 p-3 bg-white/5 rounded-xl mb-2 group">
                                                                    <p className="text-xs text-white/40 flex-1 font-mono">
                                                                        {citationFormat === 'APA'
                                                                            ? `${src.label}. (2024). ${src.url}`
                                                                            : citationFormat === 'MLA'
                                                                                ? `"${src.label}." Web, 2024. ${src.url}`
                                                                                : `[${sIdx + 1}] ${src.label}, ${src.url}`
                                                                        }
                                                                    </p>
                                                                    <a href={src.url} target="_blank" rel="noopener noreferrer"
                                                                        className="shrink-0 p-1.5 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                                        <ExternalLink className="w-3.5 h-3.5 text-primary" />
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty state */}
                {!results && !analyzing && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-5">
                            <ShieldCheck className="w-10 h-10 text-emerald-400 opacity-50" />
                        </div>
                        <h2 className="text-xl font-black mb-2">Metin girin, analizi başlatın</h2>
                        <p className="text-white/30 text-sm max-w-sm mx-auto">
                            Her iddia için 0-100 arası güven skoru, kaynak türü ikonları
                            (Wikipedia, Akademik, Haber) ve atıf linkleri oluşturulacak.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
