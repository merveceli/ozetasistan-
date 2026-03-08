"use client";

import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Presentation,
    Maximize2,
    Info,
    Lightbulb,
    FileSpreadsheet,
    FileText,
    Image as ImageIcon,
    CheckCircle2,
    X,
    Layout,
    StickyNote
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Slide {
    slide_number: number;
    title: string;
    content: string[];
    speaker_notes: string;
    visual_suggestion: string;
    layout_type: string;
    image_prompt: string;
    image_url?: string;
}

interface PresentationViewProps {
    data: { slides: Slide[] };
    theme: string;
    onClose: () => void;
}

const THEMES: Record<string, any> = {
    classic: {
        bg: "bg-zinc-900",
        card: "bg-zinc-800/50 border-white/5",
        text: "text-zinc-100",
        accent: "bg-primary",
        title: "text-primary",
        gradient: "from-primary/20 via-transparent to-transparent"
    },
    academic: {
        bg: "bg-slate-950",
        card: "bg-slate-900 border-blue-500/20",
        text: "text-blue-50",
        accent: "bg-blue-600",
        title: "text-blue-400",
        gradient: "from-blue-600/20 via-transparent to-transparent"
    },
    modern: {
        bg: "bg-zinc-950",
        card: "bg-black/40 border-purple-500/20",
        text: "text-purple-50",
        accent: "bg-purple-600",
        title: "text-purple-400",
        gradient: "from-purple-600/20 via-transparent to-transparent"
    },
    professional: {
        bg: "bg-zinc-950",
        card: "bg-black/80 border-zinc-800",
        text: "text-zinc-100",
        accent: "bg-zinc-100",
        title: "text-white",
        gradient: "from-white/5 via-transparent to-transparent"
    }
};

export function PresentationView({ data, theme, onClose }: PresentationViewProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showNotes, setShowNotes] = useState(false);
    const [showVisuals, setShowVisuals] = useState(false);
    const t = THEMES[theme] || THEMES.classic;

    const slides = data.slides;
    const slide = slides[currentSlide];

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
    };

    const prevSlide = () => {
        if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
    };

    return (
        <div className={cn("fixed inset-0 z-[100] flex flex-col animate-in fade-in duration-300", t.bg)}>
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
                <div className="flex items-center space-x-4">
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-white/70" />
                    </button>
                    <div>
                        <h3 className="text-white font-bold leading-none">Sunum Modu</h3>
                        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">{theme} teması uygulanıyor</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowNotes(!showNotes)}
                        className={cn("p-3 rounded-xl transition-all flex items-center gap-2 text-xs font-bold", showNotes ? "bg-primary text-white" : "bg-white/5 text-white/60 hover:bg-white/10")}
                    >
                        <StickyNote className="w-4 h-4" />
                        Notlar
                    </button>
                    <button
                        onClick={() => setShowVisuals(!showVisuals)}
                        className={cn("p-3 rounded-xl transition-all flex items-center gap-2 text-xs font-bold", showVisuals ? "bg-primary text-white" : "bg-white/5 text-white/60 hover:bg-white/10")}
                    >
                        <Layout className="w-4 h-4" />
                        Görsel Planyacı
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <button
                        onClick={() => toast.info('PDF/PPTX dışa aktarma özelliği Pro sürümünde yakında aktif olacak!')}
                        className="bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                    >
                        <Download className="w-4 h-4" />
                        Dışa Aktar (.pptx)
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 overflow-hidden flex relative">
                {/* Left: Notes Sidebar */}
                <AnimatePresence>
                    {showNotes && (
                        <motion.div
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            className="w-72 border-r border-white/10 bg-black/40 backdrop-blur-xl p-6 overflow-y-auto"
                        >
                            <div className="flex items-center gap-2 text-primary mb-6">
                                <StickyNote className="w-4 h-4" />
                                <h4 className="text-xs font-black uppercase tracking-widest">Konuşmacı Notları</h4>
                            </div>
                            <p className="text-sm text-white/70 leading-relaxed italic">
                                "{slide.speaker_notes}"
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Center: Slide Rendering */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
                    {/* Background gradient from theme */}
                    <div className={cn("absolute inset-0 bg-gradient-to-b opacity-50", t.gradient)} />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ x: 40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -40, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className={cn(
                                "relative w-full max-w-5xl aspect-[16/9] rounded-[2.5rem] p-16 shadow-2xl border-4 flex flex-col overflow-hidden",
                                t.card, t.text
                            )}
                        >
                            {/* Slide Number Watermark */}
                            <span className="absolute top-8 right-16 text-9xl font-black opacity-5 select-none text-current">
                                {slide.slide_number}
                            </span>

                            {/* Accent line */}
                            <div className={cn("absolute top-0 left-0 w-full h-2", t.accent)} />

                            <div className="relative z-10 flex flex-col h-full">
                                <h2 className={cn("text-5xl font-black mb-12 tracking-tight", t.title)}>
                                    {slide.title}
                                </h2>

                                <div className="flex-1 flex gap-12">
                                    {slide.layout_type === 'quiz' ? (
                                        <div className="flex-1 grid grid-cols-1 gap-4">
                                            {slide.content.map((q, idx) => (
                                                <div key={idx} className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group/q">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                                                            {idx + 1}
                                                        </div>
                                                        <p className="text-xl font-medium">{q}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : slide.layout_type === 'terms' ? (
                                        <div className="flex-1 grid grid-cols-2 gap-6">
                                            {slide.content.map((term, idx) => {
                                                const [name, desc] = term.split(':');
                                                return (
                                                    <div key={idx} className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                                                        <h4 className={cn("text-xl font-black mb-2", t.title)}>{name}</h4>
                                                        <p className="text-sm opacity-60 leading-relaxed">{desc || 'Terim açıklaması makaleden analiz edildi.'}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex-1 space-y-6">
                                                <ul className="space-y-6">
                                                    {slide.content.map((point, idx) => (
                                                        <li key={idx} className="flex items-start text-2xl font-medium leading-normal animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                                            <CheckCircle2 className={cn("w-6 h-6 mr-4 mt-2 shrink-0 opacity-40", t.title)} />
                                                            {point}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Visual Mockup Area */}
                                            <div className="w-1/3 h-full rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center p-8 text-center relative group">
                                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <ImageIcon className="w-12 h-12 text-white/20 mb-4" />
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Görsel Alanı</p>
                                                <p className="text-[10px] text-white/20 mt-2 px-4 italic">"{slide.image_prompt}"</p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="mt-auto flex items-center justify-between pt-8 border-t border-white/5">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Özet Asistanı Pro</p>
                                    <div className="flex items-center gap-1.5">
                                        {data.slides.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={cn("h-1 rounded-full transition-all", idx === currentSlide ? "w-6 bg-primary" : "w-1.5 bg-white/10")}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Controls */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center space-x-6 z-20">
                        <button
                            onClick={prevSlide}
                            disabled={currentSlide === 0}
                            className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center disabled:opacity-20 transition-all text-white"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-8 py-3 rounded-2xl flex items-center space-x-4">
                            <span className="text-white font-black text-lg">{currentSlide + 1}</span>
                            <span className="text-white/20 text-xs">/</span>
                            <span className="text-white/40 font-bold text-xs">{slides.length}</span>
                        </div>
                        <button
                            onClick={nextSlide}
                            disabled={currentSlide === slides.length - 1}
                            className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center disabled:opacity-20 transition-all text-white"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Right: Visual Planner Sidebar */}
                <AnimatePresence>
                    {showVisuals && (
                        <motion.div
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            className="w-80 border-l border-white/10 bg-black/40 backdrop-blur-xl p-6 overflow-y-auto"
                        >
                            <div className="flex items-center gap-2 text-primary mb-6">
                                <Layout className="w-4 h-4" />
                                <h4 className="text-xs font-black uppercase tracking-widest">Görsel Planyacı</h4>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="w-3 h-3 text-yellow-400" />
                                        <span className="text-[10px] font-bold text-white/40 uppercase">Diyagram Önerisi</span>
                                    </div>
                                    <p className="text-xs text-white/80 leading-relaxed font-medium">
                                        {slide.visual_suggestion}
                                    </p>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MonitorPlay className="w-3 h-3 text-blue-400" />
                                        <span className="text-[10px] font-bold text-white/40 uppercase">Yerleşim Tipi</span>
                                    </div>
                                    <p className="text-xs text-white/80 font-black uppercase tracking-widest">
                                        {slide.layout_type}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Önerilen Aksiyonlar</p>
                                    <button className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 py-3 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2">
                                        <ImageIcon className="w-3 h-3" />
                                        AI Görseli Üret
                                    </button>
                                    <button className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-3 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2">
                                        <Presentation className="w-3 h-3" />
                                        Sunum Kumandasını Aç
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
