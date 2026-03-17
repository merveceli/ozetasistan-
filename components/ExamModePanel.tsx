"use client";

import { useState } from 'react';
import { X, GraduationCap, Loader2, CheckCircle2, XCircle, Trophy, BookOpen, Clock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ExamType = 'yks' | 'kpss' | 'ales' | 'tus';
type ExamTab = 'generate' | 'past';

interface Question {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
    source_note?: string;
}

interface ExamModePanelProps {
    summary: string;
    keyPoints: string[];
    onClose: () => void;
}

const EXAM_OPTIONS: { id: ExamType; label: string; emoji: string; color: string }[] = [
    { id: 'yks', label: 'YKS', emoji: '📐', color: 'bg-blue-500' },
    { id: 'kpss', label: 'KPSS', emoji: '🏛️', color: 'bg-emerald-500' },
    { id: 'ales', label: 'ALES', emoji: '🎓', color: 'bg-purple-500' },
    { id: 'tus', label: 'TUS', emoji: '🩺', color: 'bg-red-500' },
];

function QuizCard({
    q,
    index,
    onAnswer,
    selected,
}: {
    q: Question;
    index: number;
    onAnswer: (qi: number, optionIdx: number) => void;
    selected: number | null;
}) {
    const isAnswered = selected !== null;
    const isCorrect = selected === q.answer;

    return (
        <div className={cn(
            "p-5 rounded-2xl border transition-all duration-300",
            isAnswered
                ? isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-red-500/10 border-red-500/30"
                : "bg-secondary/30 border-border"
        )}>
            <p className="text-sm font-semibold mb-4 leading-relaxed">
                <span className="text-primary font-black mr-2">{index + 1}.</span>
                {q.question}
            </p>

            <div className="space-y-2">
                {q.options.map((opt, optIdx) => {
                    let optClass = "w-full text-left text-xs px-4 py-2.5 rounded-xl border transition-all duration-200 font-medium hover:border-primary/40";
                    if (!isAnswered) {
                        optClass += " bg-background border-border hover:bg-secondary/50";
                    } else if (optIdx === q.answer) {
                        optClass += " bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400";
                    } else if (optIdx === selected) {
                        optClass += " bg-red-500/20 border-red-500/50 text-red-600 dark:text-red-400";
                    } else {
                        optClass += " bg-background border-border opacity-50";
                    }

                    return (
                        <button
                            key={optIdx}
                            className={optClass}
                            onClick={() => !isAnswered && onAnswer(index, optIdx)}
                            disabled={isAnswered}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>

            {isAnswered && (
                <div className={cn(
                    "mt-4 p-3 rounded-xl text-xs leading-relaxed flex gap-2",
                    isCorrect ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-red-500/10 text-red-700 dark:text-red-300"
                )}>
                    {isCorrect ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                    <div>
                        <p className="font-bold mb-0.5">{isCorrect ? 'Doğru!' : `Yanlış. Doğru cevap: ${q.options[q.answer]}`}</p>
                        <p className="opacity-90">{q.explanation}</p>
                        {q.source_note && <p className="mt-1 text-[10px] opacity-70 italic">{q.source_note}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

export function ExamModePanel({ summary, keyPoints, onClose }: ExamModePanelProps) {
    const [selectedExam, setSelectedExam] = useState<ExamType>('yks');
    const [activeTab, setActiveTab] = useState<ExamTab>('generate');
    const [isLoading, setIsLoading] = useState(false);
    const [questions, setQuestions] = useState<Question[] | null>(null);
    const [answers, setAnswers] = useState<Record<number, number>>({});

    const score = Object.values(answers).length > 0
        ? Object.entries(answers).filter(([qi, sel]) => questions?.[Number(qi)]?.answer === sel).length
        : null;

    const fetchQuestions = async (tab: ExamTab) => {
        setIsLoading(true);
        setQuestions(null);
        setAnswers({});
        toast.loading('Sorular hazırlanıyor...', { id: 'exam-gen' });
        try {
            const res = await fetch('/api/exam-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    summary,
                    keyPoints,
                    examType: selectedExam,
                    mode: tab,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Soru oluşturulamadı.');
            }
            const data = await res.json();
            setQuestions(data.questions || []);
            toast.success('Sorular hazır!', { id: 'exam-gen' });
        } catch (e: any) {
            toast.error(e.message, { id: 'exam-gen' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (tab: ExamTab) => {
        setActiveTab(tab);
        setQuestions(null);
        setAnswers({});
    };

    const handleAnswer = (qi: number, optionIdx: number) => {
        setAnswers(prev => ({ ...prev, [qi]: optionIdx }));
    };

    const answeredCount = Object.keys(answers).length;
    const totalCount = questions?.length ?? 0;
    const allAnswered = totalCount > 0 && answeredCount === totalCount;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-6 border-b border-border/50 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg">Sınav Modu</h3>
                                <p className="text-xs text-muted-foreground">YKS · KPSS · ALES · TUS formatında sorular</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Exam Type Selector */}
                    <div className="flex gap-2 mt-4">
                        {EXAM_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => { setSelectedExam(opt.id); setQuestions(null); setAnswers({}); }}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                                    selectedExam === opt.id
                                        ? `${opt.color} text-white border-transparent shadow-md`
                                        : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/30"
                                )}
                            >
                                <span>{opt.emoji}</span> {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border shrink-0">
                    <button
                        onClick={() => handleTabChange('generate')}
                        className={cn(
                            "flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                            activeTab === 'generate'
                                ? "border-b-2 border-amber-500 text-amber-500 bg-amber-500/5"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Sparkles className="w-4 h-4" /> AI Soru Üret
                    </button>
                    <button
                        onClick={() => handleTabChange('past')}
                        className={cn(
                            "flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                            activeTab === 'past'
                                ? "border-b-2 border-orange-500 text-orange-500 bg-orange-500/5"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Clock className="w-4 h-4" /> Çıkmış Soru Stili
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-hide">
                    {!questions && !isLoading && (
                        <div className="text-center py-10 sm:py-16 animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 rotate-3 hover:rotate-0 transition-transform duration-300 shadow-inner">
                                {activeTab === 'generate'
                                    ? <Sparkles className="w-12 h-12 text-amber-500" />
                                    : <BookOpen className="w-12 h-12 text-orange-500" />
                                }
                            </div>
                            <h4 className="font-black text-2xl sm:text-3xl mb-3 tracking-tight">
                                {activeTab === 'generate' ? 'AI Özgün Sorular' : 'Çıkmış Soru Stili'}
                            </h4>
                            <p className="text-muted-foreground text-sm sm:text-base mb-10 max-w-sm mx-auto leading-relaxed">
                                {activeTab === 'generate'
                                    ? <>Belgenizin içeriğinden <strong>{EXAM_OPTIONS.find(e => e.id === selectedExam)?.label}</strong> formatında 10 ÖSYM tarzı özgün soru üretilir.</>
                                    : <>Belge konusuna uygun, geçmiş yıl sınavlarında çıkmış sorulara benzer <strong>{EXAM_OPTIONS.find(e => e.id === selectedExam)?.label}</strong> tarzı 10 soru hazırlanır.</>
                                }
                            </p>
                            <button
                                onClick={() => fetchQuestions(activeTab)}
                                className={cn(
                                    "group relative inline-flex items-center gap-3 text-white px-10 py-4.5 rounded-2xl font-black transition-all shadow-2xl hover:scale-[1.03] active:scale-[0.98]",
                                    activeTab === 'generate'
                                        ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30"
                                        : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/30"
                                )}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {activeTab === 'generate' ? <Sparkles className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                    Sınavı Başlat
                                </span>
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-6 animate-in fade-in duration-500">
                            <div className="relative">
                                <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-amber-500/20 rounded-full animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-lg mb-1">Soru Kağıdı Hazırlanıyor</p>
                                <p className="text-sm text-muted-foreground animate-pulse">
                                    {activeTab === 'past' ? 'Sınav arşivleri taranıyor...' : 'AI soruları dökümandan türetiyor...'}
                                </p>
                            </div>
                        </div>
                    )}

                    {questions && questions.length > 0 && (
                        <div className="space-y-8 pb-10">
                            {/* Score Hero Section */}
                            {allAnswered && score !== null && (
                                <div className={cn(
                                    "p-8 rounded-[2.5rem] text-center border-2 animate-in fade-in zoom-in slide-in-from-top-8 duration-700 shadow-2xl relative overflow-hidden",
                                    score >= 8 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" :
                                    score >= 5 ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400" :
                                    "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                                )}>
                                    <div className="absolute top-0 left-0 w-full h-1 opacity-20 bg-gradient-to-r from-transparent via-current to-transparent" />
                                    
                                    <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-background/50 backdrop-blur-sm shadow-xl">
                                        <Trophy className={cn("w-10 h-10", score >= 7 ? "text-amber-500" : "text-muted-foreground")} />
                                    </div>
                                    
                                    <h5 className="font-black text-4xl mb-2">{score}/{totalCount}</h5>
                                    <p className="text-lg font-bold mb-6 italic opacity-90">
                                        {score === totalCount ? 'Kusursuz! Sen bir dahisin! 🏆' :
                                         score >= 8 ? 'Harika! Başarıya ramak kaldı. 🎉' : 
                                         score >= 5 ? 'İyi gidiyorsun! Biraz daha odaklanmalısın. 📈' : 
                                         'Görünüşe göre biraz daha tekrar gerekiyor. 💪'}
                                    </p>
                                    
                                    <div className="flex gap-3 justify-center">
                                        <button
                                            onClick={() => fetchQuestions(activeTab)}
                                            className="px-6 py-3 bg-foreground text-background rounded-xl font-black text-sm hover:scale-105 transition-all shadow-lg"
                                        >
                                            Yeniden Dene
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="px-6 py-3 bg-secondary text-foreground rounded-xl font-black text-sm hover:scale-105 transition-all"
                                        >
                                            Kapat
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!allAnswered && (
                                <div className="sticky top-0 z-20 -mx-4 sm:-mx-8 px-4 sm:px-8 py-3 bg-card/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-4">
                                        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-primary transition-all duration-500" 
                                                style={{ width: `${(answeredCount / totalCount) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                                            {answeredCount}/{totalCount} Tamamlandı
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-black px-2 py-1 rounded-md bg-secondary text-muted-foreground uppercase">
                                        {EXAM_OPTIONS.find(e => e.id === selectedExam)?.label}
                                    </span>
                                </div>
                            )}

                            <div className="space-y-6">
                                {questions.map((q, i) => (
                                    <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                        <QuizCard
                                            q={q}
                                            index={i}
                                            onAnswer={handleAnswer}
                                            selected={answers[i] ?? null}
                                        />
                                    </div>
                                ))}
                            </div>

                            {!allAnswered && (
                                <button
                                    onClick={() => fetchQuestions(activeTab)}
                                    className="w-full py-5 rounded-2xl border-2 border-dashed border-border/50 text-sm text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all font-black uppercase tracking-widest"
                                >
                                    Farklı Sorular Getir
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
