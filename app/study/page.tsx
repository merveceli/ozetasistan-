"use client";

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Brain, ArrowLeft, Check, X, Info, Sparkles, Loader2, Trophy, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Flashcard {
    documentId: string;
    documentTitle: string;
    cardIndex: number;
    front: string;
    back: string;
}

export default function StudyPage() {
    const router = useRouter();
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showBack, setShowBack] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [stats, setStats] = useState({ correct: 0, total: 0 });

    useEffect(() => {
        fetchDueCards();
    }, []);

    const fetchDueCards = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/study/due');
            const data = await res.json();
            if (data.flashcards) {
                setCards(data.flashcards);
                setStats({ correct: 0, total: data.flashcards.length });
            }
        } catch (error) {
            toast.error("Tekrarlar yüklenemedi.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswer = async (performance: 'easy' | 'good' | 'hard' | 'again') => {
        const currentCard = cards[currentIndex];
        
        try {
            await fetch('/api/study/flashcards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentId: currentCard.documentId,
                    cardIndex: currentCard.cardIndex,
                    performance
                })
            });

            if (performance !== 'again') {
                setStats(s => ({ ...s, correct: s.correct + 1 }));
            }

            if (currentIndex < cards.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setShowBack(false);
            } else {
                setCompleted(true);
            }
        } catch (error) {
            toast.error("İlerleme kaydedilemedi.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="font-bold text-muted-foreground">Zeka Kartları Hazırlanıyor...</p>
                </div>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="flex h-screen flex-col bg-background">
                <Header />
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <Trophy className="w-12 h-12 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black mb-2">Tebrikler!</h1>
                            <p className="text-muted-foreground">Bugünkü tüm tekrarlarını tamamladın. Hafızan artık daha güçlü!</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-secondary/30 p-4 rounded-3xl border border-border">
                                <p className="text-2xl font-black text-primary">{stats.total}</p>
                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Kart İncelendi</p>
                            </div>
                            <div className="bg-secondary/30 p-4 rounded-3xl border border-border">
                                <p className="text-2xl font-black text-emerald-500">%{Math.round((stats.correct / stats.total) * 100) || 100}</p>
                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Başarı Oranı</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => router.push('/')}
                            className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Ana Sayfaya Dön
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="flex h-screen flex-col bg-background">
                <Header />
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto opacity-50">
                            <Sparkles className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Harikasın!</h2>
                            <p className="text-muted-foreground">Şu an için tekrar etmen gereken bir kart bulunmuyor.</p>
                        </div>
                        <button onClick={() => router.push('/')} className="px-8 py-3 bg-secondary rounded-xl font-bold hover:bg-secondary/80 transition-all">Geri Dön</button>
                    </div>
                </div>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="flex h-screen flex-col bg-background overflow-hidden">
            <Header />
            <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 flex flex-col pt-10 md:pt-20">
                {/* Progress Group */}
                <div className="mb-12 flex items-center justify-between">
                    <button onClick={() => router.back()} className="p-3 hover:bg-secondary rounded-2xl transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">GÜNLÜK HEDEF</span>
                        <div className="flex gap-1">
                            {cards.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={cn(
                                        "w-2 h-1 rounded-full transition-all duration-500",
                                        i < currentIndex ? "bg-primary" : i === currentIndex ? "bg-primary/40 w-4" : "bg-secondary"
                                    )} 
                                />
                            ))}
                        </div>
                    </div>
                    <div className="w-10" />
                </div>

                {/* Card Container */}
                <div className="flex-1 flex flex-col items-center justify-center relative perspective-1000">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex + (showBack ? '-back' : '-front')}
                            initial={{ rotateY: showBack ? -90 : 90, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            exit={{ rotateY: showBack ? 90 : -90, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className={cn(
                                "w-full max-w-2xl aspect-[4/3] md:aspect-[16/9] rounded-[3rem] p-8 md:p-12 border-2 shadow-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all relative overflow-hidden",
                                showBack 
                                    ? "bg-card border-primary/20" 
                                    : "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30"
                            )}
                            onClick={() => !showBack && setShowBack(true)}
                        >
                            {!showBack && (
                                <div className="absolute top-8 left-8 flex items-center gap-2 opacity-50">
                                    <Brain className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{currentCard.documentTitle}</span>
                                </div>
                            )}

                            <h2 className={cn(
                                "font-bold text-xl md:text-3xl leading-tight select-none",
                                showBack ? "text-foreground" : "text-primary-foreground/90"
                            )}>
                                {showBack ? currentCard.back : currentCard.front}
                            </h2>

                            {!showBack && (
                                <p className="absolute bottom-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] animate-pulse">
                                    Cevabı görmek için tıkla
                                </p>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <div className={cn(
                        "mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl transition-all duration-500 transform",
                        showBack ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
                    )}>
                        <button 
                            onClick={() => handleAnswer('again')}
                            className="group flex flex-col items-center gap-2 p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-3xl transition-all"
                        >
                            <X className="w-5 h-5 text-red-500" />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Yeniden</span>
                        </button>
                        <button 
                            onClick={() => handleAnswer('hard')}
                            className="group flex flex-col items-center gap-2 p-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-3xl transition-all"
                        >
                            <RotateCcw className="w-5 h-5 text-orange-500" />
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Zor</span>
                        </button>
                        <button 
                            onClick={() => handleAnswer('good')}
                            className="group flex flex-col items-center gap-2 p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-3xl transition-all"
                        >
                            <Check className="w-5 h-5 text-blue-500" />
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">İyi</span>
                        </button>
                        <button 
                            onClick={() => handleAnswer('easy')}
                            className="group flex flex-col items-center gap-2 p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-3xl transition-all"
                        >
                            <Sparkles className="w-5 h-5 text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Kolay</span>
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                        <Info className="w-3 h-3" />
                        Aralıklı tekrar algoritması (SM-2) bir sonraki çalışma zamanını senin için belirler.
                    </p>
                </div>
            </div>
            
            <style jsx>{`
                .perspective-1000 { perspective: 1000px; }
            `}</style>
        </div>
    );
}
