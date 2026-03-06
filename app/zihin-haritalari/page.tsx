"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Network,
    Maximize2,
    Download,
    Plus,
    Minus,
    Search,
    Share2,
    Brain,
    HelpCircle,
    BookOpen,
    Lightbulb,
    X,
    CheckCircle2,
    Sparkles
} from 'lucide-react';

interface NodeData {
    id: number;
    label: string;
    x: number;
    y: number;
    type: 'root' | 'branch' | 'leaf';
    color?: string;
}

interface NodePopupData {
    nodeId: number;
    label: string;
    trivia: string;
    question: string;
    answer: string;
    isLoading: boolean;
}

const INITIAL_NODES: NodeData[] = [
    { id: 1, label: 'Dijital Dönüşüm', x: 400, y: 300, type: 'root' },
    { id: 2, label: 'Yapay Zeka', x: 180, y: 130, type: 'branch', color: '#7C3AED' },
    { id: 3, label: 'Blockchain', x: 620, y: 130, type: 'branch', color: '#3B82F6' },
    { id: 4, label: 'IoT Sistemleri', x: 150, y: 470, type: 'branch', color: '#10B981' },
    { id: 5, label: 'Bulut Bilişim', x: 650, y: 470, type: 'branch', color: '#F59E0B' },
    { id: 6, label: 'Makine Öğrenmesi', x: 60, y: 270, type: 'leaf', color: '#7C3AED' },
    { id: 7, label: 'Büyük Veri', x: 740, y: 300, type: 'leaf', color: '#3B82F6' },
];

// Simüle edilmiş AI içerikleri
const AI_CONTENT: Record<string, { trivia: string; question: string; answer: string }> = {
    'Dijital Dönüşüm': {
        trivia: '💡 Biliyor muydunuz? Dijital dönüşüm sadece teknoloji değil; organizasyon kültürünü, süreçleri ve iş modellerini de kapsar. McKinsey araştırmalarına göre dönüşüm projelerinin %70\'i başarısızlıkla sonuçlanır.',
        question: '❓ Sınav Sorusu: Dijital dönüşümün başarısında en kritik faktör hangisidir?',
        answer: '✅ Cevap: Üst yönetim desteği ve organizasyonel kültür değişimi. Teknoloji tek başına yeterli değildir.',
    },
    'Yapay Zeka': {
        trivia: '💡 Biliyor muydunuz? "Yapay Zeka" terimi 1956\'da John McCarthy tarafından Dartmouth Konferansı\'nda ortaya atılmıştır. GPT-4 ise 1 trilyon parametreye sahip olduğu tahmin edilmektedir.',
        question: '❓ Sınav Sorusu: Dar YZ (Narrow AI) ile Genel YZ (General AI) arasındaki temel fark nedir?',
        answer: '✅ Cevap: Dar YZ tek bir görevde uzmanlaşırken, Genel YZ insan gibi çok amaçlı düşünebilir. Bugün tüm YZ sistemleri dar YZ kategorisindedir.',
    },
    'Blockchain': {
        trivia: '💡 Biliyor muydunuz? Bitcoin\'in ilk gerçek dünya işlemi 2010\'da 2 pizza için 10.000 BTC ödemesiydi. Bugün bu miktar milyarlarca dolara ulaşmıştır.',
        question: '❓ Sınav Sorusu: Blockchain\'in "değişmezlik" (immutability) özelliği nasıl sağlanır?',
        answer: '✅ Cevap: Her blok bir öncekinin kriptografik hash\'ini içerir. Bir bloku değiştirmek tüm sonraki blokları geçersiz kılar.',
    },
    'IoT Sistemleri': {
        trivia: '💡 Biliyor muydunuz? 2030\'a kadar 29 milyar bağlı IoT cihazı olması beklenmektedir. Bir akıllı fabrikada ortalama 10.000\'den fazla sensör bulunabilir.',
        question: '❓ Sınav Sorusu: IoT güvenliğinin en büyük zayıf noktası nedir?',
        answer: '✅ Cevap: Düşük donanımlı cihazların şifreleme kapasitesinin yetersiz olması ve güncelleme mekanizmalarının eksikliği.',
    },
    'Bulut Bilişim': {
        trivia: '💡 Biliyor muydunuz? AWS, 2006\'da Amazon\'un kendi altyapısını kiralamaya başlamasıyla doğdu. Bugün global bulut piyasası yıllık 500 milyar doları aşmaktadır.',
        question: '❓ Sınav Sorusu: IaaS, PaaS ve SaaS arasındaki farkı örneklerle açıklayın.',
        answer: '✅ Cevap: IaaS = AWS EC2 (sunucu kiralama), PaaS = Heroku (geliştirme platformu), SaaS = Google Docs (hazır yazılım).',
    },
    'Makine Öğrenmesi': {
        trivia: '💡 Biliyor muydunuz? AlphaGo, 2016\'da dünya Go şampiyonu Lee Sedol\'u 4-1 yendi. Go\'da mümkün hamle sayısı evrendeki atom sayısından fazladır.',
        question: '❓ Sınav Sorusu: Overfitting (aşırı öğrenme) sorunu nasıl tespit edilir ve önlenir?',
        answer: '✅ Cevap: Eğitim doğruluğu yüksek ama test doğruluğu düşükse overfitting vardır. Çözüm: regularizasyon, dropout, daha fazla veri.',
    },
    'Büyük Veri': {
        trivia: '💡 Biliyor muydunuz? Her gün 2.5 quintillion byte (2.5 × 10¹⁸) veri üretilmektedir. İnternetin ilk 5000 günü boyunca üretilen tüm verinin miktarı, bugün tek bir günde üretilmektedir.',
        question: '❓ Sınav Sorusu: Büyük Verinin "5V" özelliği nedir?',
        answer: '✅ Cevap: Volume (hacim), Velocity (hız), Variety (çeşitlilik), Veracity (doğruluk), Value (değer).',
    },
};

export default function MindMapPage() {
    const [zoom, setZoom] = useState(1);
    const [activePopup, setActivePopup] = useState<NodePopupData | null>(null);
    const [shownAnswer, setShownAnswer] = useState(false);
    const [loadingNodeId, setLoadingNodeId] = useState<number | null>(null);

    const handleNodeClick = async (node: NodeData) => {
        if (loadingNodeId !== null) return;

        setLoadingNodeId(node.id);
        setShownAnswer(false);

        // Simüle edilmiş AI gecikme süresi
        await new Promise(r => setTimeout(r, 800));

        const content = AI_CONTENT[node.label] ?? {
            trivia: '💡 Bu kavram hakkında AI henüz bilgi hazırlamıyor. Kısa süre içinde güncellenecek!',
            question: '❓ Bu konuyla ilgili sınav sorusu hazırlanıyor...',
            answer: '✅ Cevap yakında eklenecek.',
        };

        setActivePopup({
            nodeId: node.id,
            label: node.label,
            ...content,
            isLoading: false,
        });
        setLoadingNodeId(null);
    };

    return (
        <div className="min-h-screen bg-[#030014] text-white p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            {/* Header / Toolbar */}
            <div className="relative z-10 flex justify-between items-center mb-6 backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-2xl flex-wrap gap-3">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center">
                        <Network className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight">Akademik Zihin Haritası</h1>
                        <p className="text-xs text-white/50 font-medium">Düğümlere tıklayarak AI bilgi notlarını ve sınav sorularını görün</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2 flex-wrap gap-2">
                    {/* Pomodoro hint badge */}
                    <div className="hidden md:flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">İnteraktif Düğümler</span>
                    </div>

                    <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Minus className="w-4 h-4" /></button>
                        <span className="px-4 flex items-center text-xs font-bold tabular-nums">%{Math.round(zoom * 100)}</span>
                        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"><Search className="w-5 h-5" /></button>
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"><Download className="w-5 h-5" /></button>
                    <button className="p-3 bg-primary hover:bg-primary/80 rounded-xl shadow-lg shadow-primary/20 transition-all"><Share2 className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="relative h-[calc(100vh-180px)] border border-white/10 bg-white/[0.02] rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                <motion.div
                    className="absolute inset-0"
                    animate={{ scale: zoom }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    style={{ transformOrigin: 'center center' }}
                >
                    {/* Connection Lines (SVG) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#7C3AED" />
                                <stop offset="100%" stopColor="#3B82F6" />
                            </linearGradient>
                        </defs>
                        {INITIAL_NODES.slice(1).map(node => (
                            <motion.line
                                key={`line-${node.id}`}
                                x1={400} y1={300}
                                x2={node.x} y2={node.y}
                                stroke={node.color ?? "url(#lineGrad)"}
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.35 }}
                                transition={{ duration: 1.5, delay: 0.3 }}
                            />
                        ))}
                    </svg>

                    {/* Nodes */}
                    {INITIAL_NODES.map(node => (
                        <motion.div
                            key={node.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', delay: node.id * 0.08 }}
                            className="absolute"
                            style={{
                                left: node.x,
                                top: node.y,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.08, y: -4 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => handleNodeClick(node)}
                                className={`
                                    group relative cursor-pointer rounded-2xl border backdrop-blur-xl transition-all duration-300 select-none
                                    ${node.type === 'root'
                                        ? 'bg-primary/20 border-primary shadow-2xl shadow-primary/30 min-w-[180px] p-5'
                                        : node.type === 'branch'
                                            ? 'bg-white/8 border-white/15 hover:border-white/30 min-w-[140px] p-4'
                                            : 'bg-white/5 border-white/10 hover:border-white/20 min-w-[120px] p-3'
                                    }
                                `}
                                style={node.color && node.type !== 'root' ? {
                                    borderColor: `${node.color}40`,
                                    boxShadow: `0 0 20px ${node.color}15`
                                } : {}}
                            >
                                {/* Loading spinner overlay */}
                                <AnimatePresence>
                                    {loadingNodeId === node.id && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center z-10"
                                        >
                                            <svg className="w-6 h-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Click hint */}
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                    <Brain className="w-3 h-3 text-white" />
                                </div>

                                <h3 className={`text-center font-bold leading-tight ${node.type === 'root' ? 'text-base' : 'text-sm'}`}>
                                    {node.label}
                                </h3>
                                {node.type === 'root' && (
                                    <div className="mt-2 h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-primary"
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 2 }}
                                        />
                                    </div>
                                )}
                                {node.type !== 'root' && (
                                    <p className="text-center text-[9px] text-white/30 mt-1 font-medium">
                                        Tıkla & öğren
                                    </p>
                                )}
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* AI Popup Panel */}
                <AnimatePresence>
                    {activePopup && (
                        <motion.div
                            initial={{ opacity: 0, x: 40, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 40, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="absolute top-4 right-4 w-[340px] max-h-[calc(100%-2rem)] overflow-y-auto bg-[#0a0a1a]/95 border border-white/15 rounded-3xl shadow-2xl backdrop-blur-2xl z-50 p-6 space-y-4"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                                        <Brain className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">AI Bilgi Notu</p>
                                        <p className="text-sm font-bold">{activePopup.label}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActivePopup(null)}
                                    className="p-1.5 hover:bg-white/10 rounded-xl transition-colors shrink-0"
                                >
                                    <X className="w-4 h-4 text-white/50" />
                                </button>
                            </div>

                            {/* Trivia */}
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb className="w-4 h-4 text-amber-400" />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Biliyor Muydunuz?</span>
                                </div>
                                <p className="text-xs text-white/80 leading-relaxed">{activePopup.trivia}</p>
                            </div>

                            {/* Question */}
                            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <HelpCircle className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">Potansiyel Sınav Sorusu</span>
                                </div>
                                <p className="text-xs text-white/80 leading-relaxed">{activePopup.question}</p>

                                {!shownAnswer ? (
                                    <button
                                        onClick={() => setShownAnswer(true)}
                                        className="mt-3 w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <BookOpen className="w-3.5 h-3.5" />
                                        Cevabı Göster
                                    </button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Cevap</span>
                                        </div>
                                        <p className="text-xs text-white/70 leading-relaxed">{activePopup.answer}</p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Status Bar */}
                <div className="absolute bottom-6 left-6 flex items-center space-x-3 bg-white/5 border border-white/10 backdrop-blur-xl p-3 rounded-2xl">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-white/60 tracking-wider">AI Analiz Aktif — Düğümlere tıkla</span>
                </div>
            </div>
        </div>
    );
}
