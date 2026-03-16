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
                <div className="flex-1 overflow-y-auto p-6">
                    {!questions && !isLoading && (
                        <div className="text-center py-10">
                            <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                {activeTab === 'generate'
                                    ? <Sparkles className="w-10 h-10 text-amber-500" />
                                    : <BookOpen className="w-10 h-10 text-orange-500" />
                                }
                            </div>
                            <h4 className="font-bold text-xl mb-2">
                                {activeTab === 'generate' ? 'AI Soru Üretici' : 'Çıkmış Soru Stili'}
                            </h4>
                            <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">
                                {activeTab === 'generate'
                                    ? <>Belgenizin içeriğinden <strong>{EXAM_OPTIONS.find(e => e.id === selectedExam)?.label}</strong> formatında 10 ÖSYM tarzı özgün soru üretilir.</>
                                    : <>Belge konusuna uygun, geçmiş yıl sınavlarında çıkmış sorulara benzer <strong>{EXAM_OPTIONS.find(e => e.id === selectedExam)?.label}</strong> tarzı 10 soru hazırlanır.</>
                                }
                            </p>
                            <button
                                onClick={() => fetchQuestions(activeTab)}
                                className={cn(
                                    "inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-xl",
                                    activeTab === 'generate'
                                        ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                                        : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
                                )}
                            >
                                {activeTab === 'generate' ? <Sparkles className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                Soruları Üret
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                            <p className="text-sm text-muted-foreground animate-pulse">
                                {activeTab === 'past' ? 'Sınav arşivleri taranıyor...' : 'Sorular hazırlanıyor...'}
                            </p>
                        </div>
                    )}

                    {questions && questions.length > 0 && (
                        <div className="space-y-6">
                            {/* Score Bar */}
                            {allAnswered && score !== null && (
                                <div className={cn(
                                    "p-4 rounded-2xl text-center font-bold animate-in fade-in slide-in-from-top-4",
                                    score >= 7 ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                                    score >= 5 ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                                    "bg-red-500/20 text-red-600 dark:text-red-400"
                                )}>
                                    <Trophy className="w-6 h-6 inline mr-2" />
                                    {score}/{totalCount} doğru —{' '}
                                    {score >= 7 ? 'Harika! 🎉' : score >= 5 ? 'İyi! Biraz daha çalışabilirsin.' : 'Daha fazla çalışman gerekiyor.'}
                                </div>
                            )}

                            {!allAnswered && (
                                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                                    <span>Cevaplandı: <strong className="text-foreground">{answeredCount}/{totalCount}</strong></span>
                                    <span className="text-[10px]">{EXAM_OPTIONS.find(e => e.id === selectedExam)?.label} · {activeTab === 'past' ? 'Çıkmış Stili' : 'AI Üretim'}</span>
                                </div>
                            )}

                            {questions.map((q, i) => (
                                <QuizCard
                                    key={i}
                                    q={q}
                                    index={i}
                                    onAnswer={handleAnswer}
                                    selected={answers[i] ?? null}
                                />
                            ))}

                            <button
                                onClick={() => fetchQuestions(activeTab)}
                                className="w-full py-3 rounded-2xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors font-medium"
                            >
                                Yeni Sorular Üret
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
