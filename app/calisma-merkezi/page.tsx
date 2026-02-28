"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    RotateCcw,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Trophy,
    Target
} from 'lucide-react';

const CARDS = [
    { id: 1, front: 'Kuantum Süperpozisyonu nedir?', back: 'Bir parçacığın aynı anda birden fazla durumda bulunabilmesi fenomenidir. Gözlem yapılana kadar olasılık dalgaları halindedir.' },
    { id: 2, front: 'Heisenberg Belirsizlik İlkesi neyi ifade eder?', back: 'Bir parçacığın konumu ve momentumunun aynı anda kesin bir doğrulukla ölçülemeyeceğini belirtir.' },
    { id: 3, front: 'Entropi kavramının termodinamikteki yeri nedir?', back: 'Bir sistemdeki düzensizliğin veya rastgeleliğin ölçüsüdür. İzole sistemlerde entropi her zaman artma eğilimindedir.' },
];

export default function StudyCenter() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [stats, setStats] = useState({ known: 0, unknown: 0 });

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % CARDS.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + CARDS.length) % CARDS.length);
    };

    return (
        <div className="min-h-screen bg-[#030014] text-white p-8 flex flex-col items-center justify-center">
            {/* Header Stats */}
            <div className="mb-12 flex items-center gap-8 bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Biliyorum</p>
                        <p className="text-xl font-bold tabular-nums">{stats.known}</p>
                    </div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Çalışmalıyım</p>
                        <p className="text-xl font-bold tabular-nums">{stats.unknown}</p>
                    </div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">İlerleme</p>
                        <p className="text-xl font-bold tabular-nums">%{Math.round(((currentIndex + 1) / CARDS.length) * 100)}</p>
                    </div>
                </div>
            </div>

            {/* Flashcard Component */}
            <div className="relative w-full max-w-2xl perspective-1000">
                <motion.div
                    className="relative w-full h-[400px] cursor-pointer preserve-3d transition-all duration-700"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    {/* Front Side */}
                    <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-[3rem] shadow-2xl backdrop-blur-2xl">
                        <div className="absolute top-8 left-8 flex items-center gap-2 text-primary font-black uppercase tracking-tighter text-xs">
                            <Brain className="w-4 h-4" />
                            Soru {currentIndex + 1}
                        </div>
                        <h2 className="text-3xl font-black text-center leading-tight">
                            {CARDS[currentIndex].front}
                        </h2>
                        <p className="absolute bottom-8 text-white/20 text-xs font-bold uppercase tracking-widest">Çevirmek için tıkla</p>
                    </div>

                    {/* Back Side */}
                    <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-12 bg-primary text-white border border-primary/50 rounded-[3rem] shadow-2xl shadow-primary/20 rotate-y-180">
                        <div className="absolute top-8 left-8 flex items-center gap-2 text-white/80 font-black uppercase tracking-tighter text-xs">
                            <RotateCcw className="w-4 h-4" />
                            Cevap
                        </div>
                        <p className="text-2xl font-bold text-center leading-relaxed">
                            {CARDS[currentIndex].back}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="mt-12 flex items-center gap-6">
                <button
                    onClick={handlePrev}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex gap-4">
                    <button
                        onClick={() => { setStats(s => ({ ...s, unknown: s.unknown + 1 })); handleNext(); }}
                        className="px-8 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-2xl border border-red-500/20 font-black flex items-center gap-2 transition-all"
                    >
                        <XCircle className="w-5 h-5" />
                        Bilmiyorum
                    </button>
                    <button
                        onClick={() => { setStats(s => ({ ...s, known: s.known + 1 })); handleNext(); }}
                        className="px-8 py-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-2xl border border-emerald-500/20 font-black flex items-center gap-2 transition-all"
                    >
                        <CheckCircle className="w-5 h-5" />
                        Biliyorum
                    </button>
                </div>

                <button
                    onClick={handleNext}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            <style jsx global>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .perspective-none { perspective: none; }
            `}</style>
        </div>
    );
}
