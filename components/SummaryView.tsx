"use client";

import { useState, useCallback, useEffect } from 'react';
import {
    BookOpen, List, GraduationCap, BrainCircuit,
    CheckCircle2, XCircle, Search, Quote, Network, ChevronDown,
    ChevronRight, Presentation, X, ChevronLeft, Sparkles, Mic,
    Copy, Check, Download, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import { BannerAd } from '@/components/BannerAd';

interface MindMapNode {
    name: string;
    children?: MindMapNode[];
}

interface AnalysisData {
    summary: string;
    key_points: string[];
    glossary: Record<string, string>;
    critique: {
        strengths: string[];
        weaknesses: string[];
        methodology: string;
    };
    level_specific_insight: string;
    mind_map?: MindMapNode;
    citation_metadata?: {
        title: string;
        author: string;
        year: string;
        doi: string;
        publisher: string;
    };
    study_module?: {
        flashcards: { front: string; back: string }[];
        quiz: { question: string; options: string[]; answer: number }[];
    };
}

interface SummaryViewProps {
    data: AnalysisData | null;
    isLoading: boolean;
    currentLevel: UserRole;
    onLevelChange: (level: UserRole) => void;
}

const formatCitation = (meta: any, style: 'APA' | 'MLA' | 'IEEE') => {
    if (!meta) return '';
    const { author, year, title, publisher, doi } = meta;

    switch (style) {
        case 'APA':
            return `${author} (${year}). ${title}. ${publisher}. ${doi !== 'N/A' && doi ? `https://doi.org/${doi}` : ''}`;
        case 'MLA':
            return `${author}. "${title}." ${publisher}, ${year}.`;
        case 'IEEE':
            return `${author}, "${title}," ${publisher}, ${year}.`;
        default:
            return `${author} (${year}). ${title}.`;
    }
};

function MindMapTree({ node, depth = 0 }: { node: MindMapNode; depth?: number }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className={cn("ml-4 border-l border-border/50 pl-4 py-1", depth === 0 && "ml-0 border-0 pl-0")}>
            <div
                className={cn(
                    "flex items-center space-x-2 p-2 rounded-lg transition-colors cursor-pointer group",
                    depth === 0 ? "bg-primary/10 text-primary font-bold text-lg" : "hover:bg-secondary/40 text-sm"
                )}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {hasChildren && (
                    isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
                {!hasChildren && depth > 0 && <div className="w-4 h-4" />}
                <span className={cn(depth === 0 ? "text-primary" : "text-foreground")}>{node.name}</span>
            </div>
            {hasChildren && isExpanded && (
                <div className="mt-1 animate-in fade-in slide-in-from-left-2 duration-200">
                    {node.children!.map((child, i) => (
                        <MindMapTree key={i} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function SummaryView({ data, isLoading, currentLevel, onLevelChange }: SummaryViewProps) {
    const [activeTab, setActiveTab] = useState<'summary' | 'glossary' | 'critique' | 'citation' | 'mind_map' | 'study'>('summary');

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showSlides, setShowSlides] = useState(false);
    const [slides, setSlides] = useState<any[]>([]);
    const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Study Mode States
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const loadingFacts = [
        "Biliyor muydunuz? Yapay zeka ile karmaşık makaleleri saniyeler içinde anlayabilirsiniz.",
        "Biliyor muydunuz? Görsel haritalandırma, hafızada kalıcılığı %60 oranında artırır.",
        "Biliyor muydunuz? Sistemimiz aynı anda birden fazla kaynağı analiz edebilir.",
        "Akademik araştırmalarınızda aktif okuma yapmak başarı oranınızı doğrudan artırır."
    ];
    const [currentFactIndex, setCurrentFactIndex] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            interval = setInterval(() => {
                setCurrentFactIndex((prev) => (prev + 1) % loadingFacts.length);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isLoading, loadingFacts.length]);

    const handleCopy = useCallback((text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            toast.success('Metin panoya kopyalandı!');
            setTimeout(() => setCopiedId(null), 2000);
        }).catch(() => toast.error('Kopyalama başarısız.'));
    }, []);

    const handleDownload = (format: 'pdf' | 'word') => {
        if (!data) return;
        const fullText = [
            `ÖZET ASİSTANI - DÖKÜMAN ANALİZİ`,
            `${'='.repeat(50)}`,
            ``,
            `📋 GENEL ÖZET`,
            `${'-'.repeat(30)}`,
            data.summary,
            ``,
            `🔑 ANA NOKTALAR`,
            `${'-'.repeat(30)}`,
            ...data.key_points.map((p, i) => `${i + 1}. ${p}`),
            ``,
            `📖 TERİMLER SÖZLÜĞÜ`,
            `${'-'.repeat(30)}`,
            ...Object.entries(data.glossary).map(([t, d]) => `• ${t}: ${d}`),
            ``,
            `🔬 KRİTİK ANALİZ`,
            `${'-'.repeat(30)}`,
            `Metodoloji: ${data.critique.methodology}`,
            ``,
            `Güçlü Yönler:`,
            ...data.critique.strengths.map(s => `  ✓ ${s}`),
            ``,
            `Eksikler:`,
            ...data.critique.weaknesses.map(w => `  ✗ ${w}`),
            ``,
            data.citation_metadata ? [
                `📚 KAYNAKÇA (APA)`,
                `${'-'.repeat(30)}`,
                `${data.citation_metadata.author} (${data.citation_metadata.year}). ${data.citation_metadata.title}. ${data.citation_metadata.publisher}.`,
            ].join('\n') : '',
            ``,
            `Özet Asistanı tarafından oluşturulmuştur. © ${new Date().getFullYear()}`,
        ].join('\n');

        if (format === 'pdf') {
            // Create a printable HTML page
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Özet Analizi</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a2e; line-height: 1.7; }
    h1 { color: #6366f1; border-bottom: 3px solid #6366f1; padding-bottom: 10px; }
    h2 { color: #6366f1; margin-top: 30px; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px; }
    .badge { background: #6366f1; color: white; padding: 2px 8px; border-radius: 20px; font-size: 11px; }
    .section { background: #f9f9ff; border-left: 4px solid #6366f1; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }
    .tag-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag { background: #eff0ff; color: #6366f1; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
    ul { padding-left: 20px; } li { margin: 6px 0; }
    footer { margin-top: 60px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <h1>📄 Özet Asistanı — Döküman Analizi</h1>
  <h2>📋 Genel Özet</h2>
  <div class="section"><p>${data.summary}</p></div>
  <h2>🔑 Ana Noktalar</h2>
  <ul>${data.key_points.map(p => `<li>${p}</li>`).join('')}</ul>
  <h2>🔬 Kritik Analiz</h2>
  <div class="section"><p><strong>Metodoloji:</strong> ${data.critique.methodology}</p></div>
  <h2>✅ Güçlü Yönler</h2><ul>${data.critique.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
  <h2>⚠️ Eksikler</h2><ul>${data.critique.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
  ${data.citation_metadata ? `<h2>📚 Kaynakça</h2><div class="section"><p>${data.citation_metadata.author} (${data.citation_metadata.year}). <em>${data.citation_metadata.title}</em>. ${data.citation_metadata.publisher}.</p></div>` : ''}
  <footer>Özet Asistanı tarafından oluşturulmuştur • ${new Date().toLocaleDateString('tr-TR')}</footer>
</body>
</html>`);
                printWindow.document.close();
                setTimeout(() => printWindow.print(), 500);
            }
            toast.success('PDF indirme penceresi açıldı!');
        } else {
            // Word-compatible RTF
            const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Ozet_Analizi_${new Date().toISOString().slice(0, 10)}.txt`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Döküman indirildi!');
        }
    };

    const handleSpeak = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                return;
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'tr-TR';
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Tarayıcınız sesli okuma özelliğini desteklemiyor.');
        }
    };

    const generatePresentation = async () => {
        if (!data) return;

        setIsGeneratingSlides(true);
        try {
            const analysisPackage = `
ÖZET: ${data.summary}
ANA NOKTALAR: ${data.key_points.join(', ')}
METODOLOJİ: ${data.critique.methodology}
            `.trim();

            const response = await fetch('/api/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisPackage })
            });

            if (!response.ok) throw new Error('Sunum oluşturulamadı');

            const result = await response.json();
            setSlides(result.slides || []);
            setCurrentSlideIndex(0);
            setShowSlides(true);
        } catch (error) {
            console.error('Presentation error:', error);
            alert('Hata oluştu.');
        } finally {
            setIsGeneratingSlides(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Sentezleme İşlemi Yapılıyor</h3>
                <p className="text-muted-foreground animate-pulse mb-8">Doküman derinlemesine inceleniyor, lütfen bekleyin...</p>

                <div className="max-w-md bg-secondary/30 border border-primary/10 p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
                    <p className="text-sm font-medium text-primary mb-1 flex items-center justify-center">
                        <BrainCircuit className="w-4 h-4 mr-2" /> Bilgi Kutusu
                    </p>
                    <p className="text-muted-foreground text-sm italic min-h-[40px] transition-opacity duration-300">
                        {loadingFacts[currentFactIndex]}
                    </p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const flashcards = data.study_module?.flashcards || [];
    const quiz = data.study_module?.quiz || [];

    // Mode config for theming
    const modeConfig = {
        student: {
            label: 'Öğrenci',
            sublabel: 'Öğretmen gibi anlat',
            icon: <BookOpen className="w-4 h-4" />,
            activeClass: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30',
            badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            insightClass: 'bg-emerald-500/10 border-emerald-500/30',
            insightTitle: '📚 Öğrenci Rehberi',
            insightTitleClass: 'text-emerald-500',
        },
        academic: {
            label: 'Akademik',
            sublabel: 'PDF kalite değerlendirmesi',
            icon: <GraduationCap className="w-4 h-4" />,
            activeClass: 'bg-blue-500 text-white shadow-md shadow-blue-500/30',
            badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            insightClass: 'bg-blue-500/10 border-blue-500/30',
            insightTitle: '📊 Akademik Değerlendirme Raporu',
            insightTitleClass: 'text-blue-500',
        },
        professor: {
            label: 'Profesör',
            sublabel: 'İleri düzey analiz',
            icon: <BrainCircuit className="w-4 h-4" />,
            activeClass: 'bg-purple-500 text-white shadow-md shadow-purple-500/30',
            badgeClass: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            insightClass: 'bg-purple-500/10 border-purple-500/30',
            insightTitle: '🎓 Profesör Modu — İleri Düzey Analiz',
            insightTitleClass: 'text-purple-500',
        },
        admin: {
            label: 'Admin',
            sublabel: 'Sistem yöneticisi',
            icon: <BrainCircuit className="w-4 h-4" />,
            activeClass: 'bg-gray-600 text-white shadow-md',
            badgeClass: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
            insightClass: 'bg-gray-500/10 border-gray-500/30',
            insightTitle: '⚙️ Admin Analizi',
            insightTitleClass: 'text-gray-400',
        },
    } as const;
    const cfg = modeConfig[currentLevel as keyof typeof modeConfig] ?? modeConfig.student;

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Level Selector */}
            <div className="flex flex-col items-center gap-2 mb-4">
                <div className="bg-secondary/50 p-1 rounded-2xl border border-border flex space-x-1">
                    {(['student', 'academic', 'professor'] as Array<keyof typeof modeConfig>).map((level) => {
                        const mc = modeConfig[level];
                        return (
                            <button
                                key={level}
                                onClick={() => onLevelChange(level)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-0.5",
                                    currentLevel === level ? mc.activeClass : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                )}
                            >
                                <span className="flex items-center gap-1.5">{mc.icon}{mc.label}</span>
                                <span className={cn("text-[9px] font-normal opacity-80", currentLevel === level ? "text-white/80" : "text-muted-foreground")}>{mc.sublabel}</span>
                            </button>
                        );
                    })}
                </div>
                <div className={cn("text-[11px] font-semibold px-3 py-1 rounded-full border", cfg.badgeClass)}>
                    {currentLevel === 'student' && '🎒 Öğrenci Modu: Konuyu öğretmen gibi açıklıyoruz'}
                    {currentLevel === 'academic' && '🔬 Akademik Mod: PDF kalitesi ve kaynak yeterliliği değerlendiriliyor'}
                    {currentLevel === 'professor' && '🎓 Profesör Modu: Epistemolojik ve metodolojik derinlemesine analiz'}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Main Content Area */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 glass-card overflow-y-auto max-h-[80vh]">
                    <div className="flex space-x-4 border-b border-border mb-6 overflow-x-auto scrollbar-hide">
                        {[
                            { id: 'summary', name: 'Özet' },
                            { id: 'study', name: 'Sınav 🔥' },
                            { id: 'mind_map', name: 'Zihin Haritası' },
                            { id: 'critique', name: 'Kritik' },
                            { id: 'glossary', name: 'Terimler' },
                            { id: 'citation', name: 'Kaynakça' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "pb-3 border-b-2 font-medium transition-colors whitespace-nowrap px-2",
                                    activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'summary' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold flex items-center" style={{ color: 'inherit' }}>
                                    {currentLevel === 'student' && <><BookOpen className="w-5 h-5 mr-2 text-emerald-500" /> <span className="text-emerald-500">Öğretmen Anlatımı</span></>}
                                    {currentLevel === 'academic' && <><GraduationCap className="w-5 h-5 mr-2 text-blue-500" /> <span className="text-blue-500">Akademik Değerlendirme</span></>}
                                    {currentLevel === 'professor' && <><BrainCircuit className="w-5 h-5 mr-2 text-purple-500" /> <span className="text-purple-500">Derinlemesine Analiz</span></>}
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleCopy(data.summary, 'summary')}
                                        className={cn(
                                            "text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5",
                                            copiedId === 'summary'
                                                ? "bg-emerald-500/20 text-emerald-500"
                                                : "bg-secondary hover:bg-secondary/80 text-foreground"
                                        )}
                                    >
                                        {copiedId === 'summary' ? <><Check className="w-3 h-3" /> Kopyalandı!</> : <><Copy className="w-3 h-3" /> Kopyala</>}
                                    </button>
                                    <button onClick={() => handleSpeak(data.summary)} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20 transition-all">
                                        {isSpeaking ? 'Durdur' : 'Sesli Dinle'}
                                    </button>
                                </div>
                            </div>

                            {/* Özet - öğrenci modunda bölüm başlıkları ile render */}
                            <div className="space-y-1">
                                {data.summary.split('\n').map((line, i) => {
                                    const trimmed = line.trim();
                                    if (!trimmed) return <div key={i} className="h-3" />;

                                    // Büyük harfli bölüm başlıkları (GİRİŞ:, TEMEL KAVRAMLAR:, vb.)
                                    const isSectionHeading = /^[A-ZÇĞİÖŞÜa-zçğişöü\s]{3,30}:$/.test(trimmed) ||
                                        /^(GİRİŞ|TEMEL KAVRAMLAR?|ANA KONULAR?|UYGULAMA|ÖZET|GIRIS|TEMEL|ANA|BAGLAM|SONUC)/i.test(trimmed);

                                    if (isSectionHeading) {
                                        return (
                                            <div key={i} className={cn(
                                                'mt-5 mb-2 pb-1 border-b flex items-center gap-2',
                                                currentLevel === 'student' ? 'border-emerald-500/30' :
                                                    currentLevel === 'academic' ? 'border-blue-500/30' :
                                                        'border-purple-500/30'
                                            )}>
                                                <span className={cn(
                                                    'text-xs font-black uppercase tracking-widest',
                                                    currentLevel === 'student' ? 'text-emerald-500' :
                                                        currentLevel === 'academic' ? 'text-blue-500' :
                                                            'text-purple-500'
                                                )}>{trimmed}</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <p key={i} className="text-sm text-muted-foreground leading-relaxed">{trimmed}</p>
                                    );
                                })}
                            </div>

                            {/* Banner Reklam - özet ve rehber arası */}
                            <BannerAd variant="horizontal" slot={0} className="my-2" />

                            {/* Level-specific insight - moda göre renkli kutu */}
                            <div className={cn("p-5 rounded-2xl border", cfg.insightClass)}>
                                <h4 className={cn("font-bold mb-3 flex items-center text-sm", cfg.insightTitleClass)}>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    {cfg.insightTitle}
                                </h4>
                                <div className="space-y-1.5">
                                    {data.level_specific_insight.split('\n').map((line, i) => {
                                        const trimmed = line.trim();
                                        if (!trimmed) return <div key={i} className="h-1" />;
                                        // Büyük harfle başlayan başlık satırları
                                        const isHeading = /^[A-ZÇĞIÖŞÜ]{2}/.test(trimmed) && !trimmed.startsWith('-');
                                        return isHeading ? (
                                            <p key={i} className={cn("font-bold text-xs mt-3 first:mt-0 uppercase tracking-wide", cfg.insightTitleClass)}>{trimmed}</p>
                                        ) : (
                                            <p key={i} className="text-xs text-muted-foreground pl-2 leading-relaxed">{trimmed}</p>
                                        );
                                    })}
                                </div>
                            </div>

                            <ul className="space-y-3">
                                {data.key_points.map((point, i) => (
                                    <li key={i} className={cn("flex gap-4 p-4 rounded-xl border",
                                        currentLevel === 'student' ? 'bg-emerald-500/5 border-emerald-500/20' :
                                            currentLevel === 'academic' ? 'bg-blue-500/5 border-blue-500/20' :
                                                'bg-purple-500/5 border-purple-500/20'
                                    )}>
                                        <span className={cn("w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-black text-white",
                                            currentLevel === 'student' ? 'bg-emerald-500' :
                                                currentLevel === 'academic' ? 'bg-blue-500' :
                                                    'bg-purple-500'
                                        )}>{i + 1}</span>
                                        <span className="text-sm">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {activeTab === 'study' && (
                        <div className="space-y-10 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-lg font-bold mb-6 flex items-center"><BrainCircuit className="w-5 h-5 mr-2 text-primary" /> Flashcard Modu</h3>
                                {flashcards.length > 0 ? (
                                    <div className="flex flex-col items-center">
                                        <div className="perspective-1000 w-full max-w-md aspect-[3/2] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                                            <div className={cn("relative w-full h-full transition-transform duration-500 transform-style-3d", isFlipped && "rotate-y-180")}>
                                                <div className="absolute inset-0 backface-hidden bg-secondary/20 border-2 border-primary/20 rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-xl">
                                                    <span className="text-[10px] uppercase tracking-tighter text-muted-foreground mb-4 font-bold">Terim / Soru</span>
                                                    <p className="text-xl font-bold">{flashcards[currentCardIndex].front}</p>
                                                </div>
                                                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-primary text-primary-foreground rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-xl">
                                                    <span className="text-[10px] uppercase tracking-tighter text-white/50 mb-4 font-bold">Tanım / Cevap</span>
                                                    <p className="text-lg font-medium">{flashcards[currentCardIndex].back}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 mt-6">
                                            <button onClick={() => { setCurrentCardIndex(c => Math.max(0, c - 1)); setIsFlipped(false); }} className="p-2 rounded-full hover:bg-secondary"><ChevronLeft /></button>
                                            <span className="text-sm font-bold">{currentCardIndex + 1} / {flashcards.length}</span>
                                            <button onClick={() => { setCurrentCardIndex(c => Math.min(flashcards.length - 1, c + 1)); setIsFlipped(false); }} className="p-2 rounded-full hover:bg-secondary"><ChevronRight /></button>
                                        </div>
                                    </div>
                                ) : <p>Veri hazır değil.</p>}
                            </div>

                            <div className="pt-8 border-t border-border">
                                <h3 className="text-lg font-bold mb-6 flex items-center"><CheckCircle2 className="w-5 h-5 mr-2 text-green-500" /> Bilgi Testi</h3>
                                <div className="space-y-6">
                                    {quiz.map((q, qIdx) => (
                                        <QuizQuestion
                                            key={qIdx}
                                            question={q.question}
                                            options={q.options}
                                            correctAnswer={q.answer}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'mind_map' && data.mind_map && (
                        <div className="animate-in fade-in duration-300">
                            <h3 className="text-lg font-bold mb-4 flex items-center text-indigo-400"><Network className="w-5 h-5 mr-2" /> Kavram Haritası</h3>
                            <div className="bg-secondary/10 p-6 rounded-2xl border border-border">
                                <MindMapTree node={data.mind_map} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'glossary' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                            {Object.entries(data.glossary).map(([term, def], i) => (
                                <div key={i} className="p-4 bg-secondary/10 border border-border rounded-2xl">
                                    <h4 className="font-bold text-primary mb-1">{term}</h4>
                                    <p className="text-xs text-muted-foreground">{def}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'critique' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="bg-orange-500/10 p-5 rounded-2xl border border-orange-500/20">
                                <h4 className="font-bold text-orange-500 mb-2 flex items-center"><Search className="w-4 h-4 mr-2" /> Metodoloji</h4>
                                <p className="text-sm text-muted-foreground">{data.critique.methodology}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-bold text-green-500 text-sm">Güçlü Yönler</h4>
                                    {data.critique.strengths.map((s, i) => <p key={i} className="text-xs text-muted-foreground">• {s}</p>)}
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-red-500 text-sm">Eksikler</h4>
                                    {data.critique.weaknesses.map((w, i) => <p key={i} className="text-xs text-muted-foreground">• {w}</p>)}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'citation' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <h3 className="text-lg font-bold flex items-center"><Quote className="w-5 h-5 mr-2" /> Kaynakça</h3>
                            {data.citation_metadata ? ['APA', 'MLA', 'IEEE'].map((style) => (
                                <div key={style} className="p-4 bg-secondary/10 border border-border rounded-xl group relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-primary uppercase">{style}</span>
                                        <button
                                            onClick={() => handleCopy(formatCitation(data.citation_metadata, style as any), `citation-${style}`)}
                                            className={cn(
                                                "text-[10px] px-2 py-1 rounded-md font-bold transition-all flex items-center gap-1",
                                                copiedId === `citation-${style}` ? "bg-emerald-500/20 text-emerald-500" : "bg-secondary hover:bg-secondary/70 text-muted-foreground"
                                            )}
                                        >
                                            {copiedId === `citation-${style}` ? <><Check className="w-2.5 h-2.5" /> Kopyalandı</> : <><Copy className="w-2.5 h-2.5" /> Kopyala</>}
                                        </button>
                                    </div>
                                    <p className="text-sm font-mono break-all text-muted-foreground">{formatCitation(data.citation_metadata, style as any)}</p>
                                </div>
                            )) : <p>Bilgi yok.</p>}
                        </div>
                    )}
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h4 className="text-xs font-black uppercase text-muted-foreground mb-4 tracking-widest">Panel Araçları</h4>
                        <button onClick={generatePresentation} disabled={isGeneratingSlides} className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-xl transition-all text-sm font-bold">
                            <Presentation className="w-5 h-5 text-purple-500" />
                            {isGeneratingSlides ? 'Üretiliyor...' : 'Sunum Taslağı'}
                        </button>
                        <button
                            onClick={() => handleDownload('pdf')}
                            className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-xl transition-all text-sm font-bold group"
                        >
                            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                <Download className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold">PDF İndir</p>
                                <p className="text-[10px] text-muted-foreground">Yazdırılabilir format</p>
                            </div>
                        </button>
                        <button
                            onClick={() => handleDownload('word')}
                            className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-xl transition-all text-sm font-bold group"
                        >
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                <FileText className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold">Word İndir</p>
                                <p className="text-[10px] text-muted-foreground">Düzenlenebilir metin</p>
                            </div>
                        </button>
                        <div className="mt-3 pt-3 border-t border-border">
                            <button
                                onClick={() => handleCopy(data.summary + '\n\n' + data.key_points.join('\n'), 'all-content')}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-bold group",
                                    copiedId === 'all-content' ? "bg-emerald-500/10" : "hover:bg-secondary"
                                )}
                            >
                                <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                                    copiedId === 'all-content' ? "bg-emerald-500/20" : "bg-secondary group-hover:bg-secondary/80"
                                )}>
                                    {copiedId === 'all-content' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                                </div>
                                <div className="text-left">
                                    <p className={cn("text-sm font-bold", copiedId === 'all-content' && "text-emerald-500")}>Tümünü Kopyala</p>
                                    <p className="text-[10px] text-muted-foreground">Özet + Ana noktalar</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Banner Reklamları */}
                    <BannerAd variant="compact" slot={1} />
                    <BannerAd variant="compact" slot={2} />
                </div>
            </div>

            {/* Podcast Mode Floating Player */}
            <div className={cn(
                "fixed bottom-8 right-8 z-40 transition-all duration-500 transform",
                isSpeaking ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
            )}>
                <div className="bg-card/80 backdrop-blur-2xl border border-primary/20 p-4 rounded-3xl shadow-2xl flex items-center gap-6 min-w-[320px]">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center animate-pulse">
                        <Mic className="text-white w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Podcast Modu Aktif</span>
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-1 h-2 bg-primary animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
                            </div>
                        </div>
                        <p className="text-xs font-bold truncate max-w-[180px]">Doküman Özeti Seslendiriliyor...</p>
                    </div>
                    <button
                        onClick={() => handleSpeak('')}
                        className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Slide Viewer (Simplified) */}
            {showSlides && (
                <div className="fixed inset-0 bg-black/90 z-50 flex flex-col p-8">
                    <button onClick={() => setShowSlides(false)} className="absolute top-4 right-4 text-white"><X /></button>
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="bg-white text-black aspect-video w-full max-w-4xl rounded-3xl p-16 shadow-2xl flex flex-col justify-center">
                            <h2 className="text-4xl font-black mb-8">{slides[currentSlideIndex]?.title}</h2>
                            <ul className="space-y-4">
                                {slides[currentSlideIndex]?.content.map((c: string, i: number) => <li key={i} className="text-xl opacity-80">• {c}</li>)}
                            </ul>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-white max-w-4xl mx-auto w-full">
                        <button onClick={() => setCurrentSlideIndex(s => Math.max(0, s - 1))}><ChevronLeft size={48} /></button>
                        <span className="text-2xl font-black">{currentSlideIndex + 1} / {slides.length}</span>
                        <button onClick={() => setCurrentSlideIndex(s => Math.min(slides.length - 1, s + 1))}><ChevronRight size={48} /></button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .transform-style-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
            `}</style>
        </div>
    );
}

function QuizQuestion({ question, options, correctAnswer }: { question: string, options: string[], correctAnswer: number }) {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const handleSelect = (idx: number) => {
        if (isAnswered) return;
        setSelectedOption(idx);
        setIsAnswered(true);
    };

    return (
        <div className="bg-secondary/10 p-5 rounded-2xl border border-border transition-all">
            <p className="font-bold mb-4">{question}</p>
            <div className="grid grid-cols-1 gap-2">
                {options.map((opt, oIdx) => {
                    let buttonClass = "text-left p-3 text-sm bg-card border border-border rounded-xl transition-all";
                    if (isAnswered) {
                        if (oIdx === correctAnswer) {
                            buttonClass = "text-left p-3 text-sm bg-green-500/20 border-green-500 rounded-xl transition-all text-green-400";
                        } else if (oIdx === selectedOption) {
                            buttonClass = "text-left p-3 text-sm bg-red-500/20 border-red-500 rounded-xl transition-all text-red-400";
                        }
                    } else {
                        buttonClass += " hover:border-primary cursor-pointer";
                    }

                    return (
                        <button
                            key={oIdx}
                            onClick={() => handleSelect(oIdx)}
                            className={buttonClass}
                        >
                            <div className="flex items-center justify-between">
                                <span>{opt}</span>
                                {isAnswered && oIdx === correctAnswer && <CheckCircle2 className="w-4 h-4" />}
                                {isAnswered && oIdx === selectedOption && oIdx !== correctAnswer && <XCircle className="w-4 h-4" />}
                            </div>
                        </button>
                    );
                })}
            </div>
            {isAnswered && (
                <p className={cn(
                    "mt-3 text-xs font-bold",
                    selectedOption === correctAnswer ? "text-green-500" : "text-red-500"
                )}>
                    {selectedOption === correctAnswer ? "Doğru Cevap!" : `Yanlış. Doğru cevap: ${options[correctAnswer]}`}
                </p>
            )}
        </div>
    );
}
