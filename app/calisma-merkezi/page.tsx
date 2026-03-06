"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    RotateCcw,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Trophy,
    Target,
    Bell,
    Clock,
    Flame,
    Calendar,
    X,
    Plus,
    BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashCard {
    id: number;
    front: string;
    back: string;
    nextReview: Date;
    interval: number; // gün
    repetitions: number;
    ease: number; // SM-2 kolaylık faktörü
}

// SM-2 Spaced Repetition algoritması
function sm2(card: FlashCard, quality: 0 | 1 | 2): FlashCard {
    // quality: 0=bilmiyorum, 1=zor, 2=biliyorum
    let { interval, repetitions, ease } = card;

    if (quality >= 1) {
        if (repetitions === 0) interval = 1;
        else if (repetitions === 1) interval = 6;
        else interval = Math.round(interval * ease);
        repetitions++;
    } else {
        repetitions = 0;
        interval = 1;
    }

    ease = Math.max(1.3, ease + 0.1 - (2 - quality) * (0.08 + (2 - quality) * 0.02));

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return { ...card, interval, repetitions, ease, nextReview };
}

function formatNextReview(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / 86400000);
    if (days <= 0) return 'Bugün tekrar et!';
    if (days === 1) return 'Yarın';
    return `${days} gün sonra`;
}

function getDueCards(cards: FlashCard[]): FlashCard[] {
    const now = new Date();
    return cards.filter(c => c.nextReview <= now);
}

export default function StudyCenter() {
    const [cards, setCards] = useState<FlashCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mode, setMode] = useState<'overview' | 'study' | 'add'>('overview');
    const [studyQueue, setStudyQueue] = useState<FlashCard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionStats, setSessionStats] = useState({ known: 0, unknown: 0 });
    const [showNotif, setShowNotif] = useState(true);
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');
    const [showSessionComplete, setShowSessionComplete] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Initial load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('study_cards');
        if (saved) {
            try {
                const parsed = JSON.parse(saved).map((c: any) => ({
                    ...c,
                    nextReview: new Date(c.nextReview)
                }));
                setCards(parsed);
            } catch (e) {
                console.error('Failed to parse cards from storage', e);
            }
        }
        setIsLoading(false);
    }, []);

    // Save to LocalStorage whenever cards change
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('study_cards', JSON.stringify(cards));
        }
    }, [cards, isLoading]);

    const syncWithDocuments = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/documents');
            if (!res.ok) throw new Error('Dokümanlar alınamadı');
            const data = await res.json();

            const docs = data.documents || [];
            const newCards: FlashCard[] = [];
            let addedCount = 0;

            docs.forEach((doc: any) => {
                if (doc.metadata) {
                    // Check all levels for study module
                    ['student', 'academic', 'professor'].forEach(level => {
                        const levelData = doc.metadata[level];
                        if (levelData?.study_module?.flashcards) {
                            levelData.study_module.flashcards.forEach((fc: any) => {
                                // Prevent duplicates
                                const exists = cards.some(c => c.front.toLowerCase() === fc.front.toLowerCase());
                                if (!exists) {
                                    newCards.push({
                                        id: Date.now() + addedCount,
                                        front: fc.front,
                                        back: fc.back,
                                        nextReview: new Date(),
                                        interval: 1, repetitions: 0, ease: 2.5
                                    });
                                    addedCount++;
                                }
                            });
                        }
                    });
                }
            });

            if (newCards.length > 0) {
                setCards(prev => [...prev, ...newCards]);
                alert(`${newCards.length} yeni kart eklendi!`);
            } else {
                alert('Yeni döküman/kart bulunamadı.');
            }
        } catch (error) {
            console.error('Sync error:', error);
            alert('Senkronizasyon sırasında hata oluştu.');
        } finally {
            setIsSyncing(false);
        }
    };

    const dueCards = getDueCards(cards);
    const learnedCards = cards.filter(c => c.repetitions >= 2);
    const newCards = cards.filter(c => c.repetitions === 0);

    const startStudy = () => {
        const queue = [...dueCards];
        if (queue.length === 0) {
            alert('Bugün tekrar edilecek kart yok. Harika!');
            return;
        }
        setStudyQueue(queue);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionStats({ known: 0, unknown: 0 });
        setMode('study');
        setShowSessionComplete(false);
    };

    const handleRate = (quality: 0 | 1 | 2) => {
        const card = studyQueue[currentIndex];
        const updated = sm2(card, quality);

        setCards(prev => prev.map(c => c.id === card.id ? updated : c));
        setSessionStats(s => ({
            known: quality >= 1 ? s.known + 1 : s.known,
            unknown: quality === 0 ? s.unknown + 1 : s.unknown,
        }));

        const next = currentIndex + 1;
        if (next >= studyQueue.length) {
            setShowSessionComplete(true);
        } else {
            setCurrentIndex(next);
            setIsFlipped(false);
        }
    };

    const addCard = () => {
        if (!newFront.trim() || !newBack.trim()) return;
        const card: FlashCard = {
            id: Date.now(),
            front: newFront,
            back: newBack,
            nextReview: new Date(),
            interval: 1, repetitions: 0, ease: 2.5
        };
        setCards(prev => [...prev, card]);
        setNewFront('');
        setNewBack('');
        setMode('overview');
    };

    // Study Mode
    if (mode === 'study') {
        if (showSessionComplete) {
            return (
                <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center p-8">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-md bg-white/5 border border-white/10 rounded-[3rem] p-10 text-center backdrop-blur-2xl"
                    >
                        <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-6" />
                        <h2 className="text-3xl font-black mb-2">Oturum Tamamlandı!</h2>
                        <p className="text-white/50 mb-8">SM-2 algoritması bir sonraki tekrar tarihlerinizi güncelledi.</p>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                                <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                                <p className="text-2xl font-black">{sessionStats.known}</p>
                                <p className="text-xs text-white/40 uppercase tracking-widest">Biliyorum</p>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                                <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                                <p className="text-2xl font-black">{sessionStats.unknown}</p>
                                <p className="text-xs text-white/40 uppercase tracking-widest">Çalışmalıyım</p>
                            </div>
                        </div>
                        <p className="text-sm text-white/40 mb-6">
                            Bir sonraki tekrar tarihleri güncellendi.
                            Spaced Repetition ile öğrendiklerinizi uzun süre hafızanızda tutacaksınız!
                        </p>
                        <button
                            onClick={() => setMode('overview')}
                            className="w-full py-3 bg-primary rounded-2xl font-black text-lg hover:bg-primary/80 transition-colors"
                        >
                            Genel Bakışa Dön
                        </button>
                    </motion.div>
                </div>
            );
        }

        const card = studyQueue[currentIndex];
        const progress = Math.round(((currentIndex) / studyQueue.length) * 100);

        return (
            <div className="min-h-screen bg-[#030014] text-white p-8 flex flex-col items-center justify-center">
                {/* Progress */}
                <div className="w-full max-w-2xl mb-8 flex items-center gap-4">
                    <button onClick={() => setMode('overview')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <div className="flex justify-between text-xs text-white/30 mb-2 font-bold uppercase tracking-widest">
                            <span>{currentIndex + 1} / {studyQueue.length}</span>
                            <span>%{progress} tamamlandı</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-primary to-cyan-400"
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Flashcard */}
                <div className="relative w-full max-w-2xl" style={{ perspective: '1000px' }}>
                    <motion.div
                        className="relative w-full h-[380px] cursor-pointer"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: 'spring', stiffness: 300, damping: 30 }}
                        style={{ transformStyle: 'preserve-3d' }}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        {/* Front */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-[3rem] shadow-2xl backdrop-blur-2xl"
                            style={{ backfaceVisibility: 'hidden' }}>
                            <div className="absolute top-6 left-8 flex items-center gap-2 text-primary font-black uppercase tracking-tighter text-xs">
                                <Brain className="w-4 h-4" />
                                Soru {currentIndex + 1}
                            </div>
                            <div className="absolute top-6 right-8 text-[10px] text-white/20 font-bold">
                                Tekrar #{card.repetitions + 1}
                            </div>
                            <h2 className="text-2xl font-black text-center leading-tight">{card.front}</h2>
                            <p className="absolute bottom-6 text-white/20 text-xs font-bold uppercase tracking-widest">Cevap için tıkla</p>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-primary border border-primary/50 rounded-[3rem] shadow-2xl shadow-primary/20"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                            <div className="absolute top-6 left-8 flex items-center gap-2 text-white/60 font-black uppercase tracking-tighter text-xs">
                                <RotateCcw className="w-4 h-4" />
                                Cevap
                            </div>
                            <p className="text-xl font-bold text-center leading-relaxed">{card.back}</p>
                        </div>
                    </motion.div>
                </div>

                {/* Rating Buttons */}
                <AnimatePresence>
                    {isFlipped && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-8 flex items-center gap-4 flex-wrap justify-center"
                        >
                            <button
                                onClick={() => handleRate(0)}
                                className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-2xl border border-red-500/20 font-black flex items-center gap-2 transition-all"
                            >
                                <XCircle className="w-5 h-5" />
                                Bilmiyorum
                                <span className="text-[10px] opacity-60">(1 gün)</span>
                            </button>
                            <button
                                onClick={() => handleRate(1)}
                                className="px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-2xl border border-amber-500/20 font-black flex items-center gap-2 transition-all"
                            >
                                <Brain className="w-5 h-5" />
                                Zordu
                                <span className="text-[10px] opacity-60">({card.interval}g)</span>
                            </button>
                            <button
                                onClick={() => handleRate(2)}
                                className="px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-2xl border border-emerald-500/20 font-black flex items-center gap-2 transition-all"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Biliyorum
                                <span className="text-[10px] opacity-60">({Math.round(card.interval * card.ease)}g)</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Add Card Mode
    if (mode === 'add') {
        return (
            <div className="min-h-screen bg-[#030014] text-white p-8 flex flex-col items-center justify-center">
                <div className="w-full max-w-xl">
                    <div className="flex items-center gap-3 mb-8">
                        <button onClick={() => setMode('overview')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-black">Yeni Kart Ekle</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-2 block">Soru / Ön Yüz</label>
                            <textarea
                                value={newFront}
                                onChange={e => setNewFront(e.target.value)}
                                placeholder="Soruyu yazın..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm resize-none min-h-[120px] focus:outline-none focus:border-primary/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-white/40 mb-2 block">Cevap / Arka Yüz</label>
                            <textarea
                                value={newBack}
                                onChange={e => setNewBack(e.target.value)}
                                placeholder="Cevabı yazın..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm resize-none min-h-[120px] focus:outline-none focus:border-primary/50 transition-all"
                            />
                        </div>
                        <button
                            onClick={addCard}
                            disabled={!newFront.trim() || !newBack.trim()}
                            className="w-full py-3 bg-primary text-white rounded-2xl font-black hover:bg-primary/80 disabled:opacity-50 transition-all"
                        >
                            Kartı Kaydet
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Overview Mode
    return (
        <div className="min-h-screen bg-[#030014] text-white p-8">
            {/* Spaced Repetition Notification */}
            <AnimatePresence>
                {showNotif && dueCards.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="mb-6 flex items-start gap-4 p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl backdrop-blur-xl"
                    >
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                            <Bell className="w-5 h-5 text-amber-400 animate-pulse" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black text-amber-300">
                                🧠 Bugün tekrar etmek ister misin?
                            </p>
                            <p className="text-xs text-amber-300/60 mt-0.5">
                                Unutma eğrisi analizine göre <strong>{dueCards.length} kart</strong> bugün tekrar zamanı geldi.
                                Kısa bir seans uzun vadeli öğrenmeyi {dueCards.length * 3}x artırır!
                            </p>
                        </div>
                        <button onClick={() => setShowNotif(false)} className="p-1.5 hover:bg-white/10 rounded-xl transition-colors shrink-0">
                            <X className="w-4 h-4 text-white/40" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-500 rounded-2xl flex items-center justify-center">
                        <Brain className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black">Çalışma Merkezi</h1>
                        <p className="text-xs text-white/40 font-medium">Spaced Repetition (SM-2) ile akıllı tekrar</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={syncWithDocuments}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 rounded-xl font-bold text-sm transition-all"
                    >
                        <RotateCcw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                        PDF'lerden Çek
                    </button>
                    <button
                        onClick={() => setMode('add')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold text-sm transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Kart Ekle
                    </button>
                    <button
                        onClick={startStudy}
                        disabled={dueCards.length === 0}
                        className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/80 rounded-xl font-black text-sm disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                    >
                        <Flame className="w-4 h-4" />
                        Çalışmaya Başla ({dueCards.length})
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Toplam Kart', value: cards.length, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: 'Bugün Tekrar', value: dueCards.length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'Öğrenildi', value: learnedCards.length, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Yeni Kart', value: newCards.length, icon: Flame, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                            <stat.icon className={cn("w-5 h-5", stat.color)} />
                        </div>
                        <div>
                            <p className="text-2xl font-black tabular-nums">{stat.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Card List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {cards.map(card => {
                    const isDue = card.nextReview <= new Date();
                    return (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "p-5 bg-white/5 border rounded-2xl backdrop-blur-xl transition-all",
                                isDue ? "border-amber-500/30 shadow-sm shadow-amber-500/10" : "border-white/10"
                            )}
                        >
                            <div className="flex items-start justify-between gap-2 mb-3">
                                <div className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider",
                                    isDue ? "bg-amber-500/20 text-amber-400" :
                                        card.repetitions >= 2 ? "bg-emerald-500/20 text-emerald-400" :
                                            "bg-blue-500/20 text-blue-400"
                                )}>
                                    {isDue ? '🔔 Tekrar Zamanı' :
                                        card.repetitions >= 2 ? '✅ Öğrenildi' :
                                            '🆕 Yeni'}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-white/30">
                                    <Calendar className="w-3 h-3" />
                                    {formatNextReview(card.nextReview)}
                                </div>
                            </div>
                            <p className="text-sm font-bold leading-snug mb-2 line-clamp-2">{card.front}</p>
                            <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{card.back}</p>
                            <div className="mt-3 flex items-center gap-2 text-[10px] text-white/20">
                                <span>Tekrar #{card.repetitions}</span>
                                <span>•</span>
                                <span>Aralık: {card.interval}g</span>
                                <span>•</span>
                                <span>Kolaylık: {card.ease.toFixed(1)}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
