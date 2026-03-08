"use client";

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { MonitorPlay, Search, ChevronRight, Loader2, AlertCircle, Palette, Lock, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Document } from '@/types';
import Link from 'next/link';
import { UpgradeModal } from '@/components/modals/UpgradeModal';
import { PresentationView } from '@/components/PresentationView';
import { Toaster, toast } from 'sonner';

export default function PresentationPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [presentationData, setPresentationData] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [selectedTheme, setSelectedTheme] = useState('classic');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState('');
    const [showPresentationMode, setShowPresentationMode] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch('/api/user');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            }
        };
        fetchUser();
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await fetch('/api/documents');
            if (response.ok) {
                const data = await response.json();
                setDocuments(data.documents || []);
            }
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async (doc: Document) => {
        setSelectedId(doc.id);
        setIsGenerating(true);
        setPresentationData(null);

        try {
            // First we need the analysis package
            const analyzeRes = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId: doc.id, level: 'analysis_package' })
            });

            if (!analyzeRes.ok) throw new Error('Analiz paketi alınamadı');
            const { analysis_package } = await analyzeRes.json();

            // Then generate slides
            const slideRes = await fetch('/api/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisPackage: analysis_package })
            });

            if (!slideRes.ok) throw new Error('Sunum oluşturulamadı');
            const data = await slideRes.json();
            setPresentationData(data);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const filteredDocs = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            <Header />

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <MonitorPlay className="text-primary w-8 h-8" />
                            Akademik Sunum Üret
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Analiz paketi hazır olan makalelerinden tek tıkla profesyonel sunum taslağı oluştur.
                        </p>
                    </div>

                    {!presentationData ? (
                        <div className="space-y-6">
                            {/* Search bar */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Analiz edilen makalelerde ara..."
                                    className="w-full bg-card border border-border rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-24 bg-secondary/20 rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredDocs.length === 0 ? (
                                <div className="text-center py-12 bg-secondary/10 rounded-3xl border border-dashed border-border px-6">
                                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <h3 className="text-lg font-semibold">Gösterilecek döküman bulunamadı</h3>
                                    <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
                                        Sunum üretebilmek için önce bir makale yüklemeli ve analizini tamamlamalısınız.
                                    </p>
                                    <Link href="/" className="inline-block mt-4 text-primary font-medium hover:underline">
                                        Yükleme Ekranına Git
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredDocs.map(doc => {
                                        const isReady = doc.analysis_status === 'completed';
                                        return (
                                            <button
                                                key={doc.id}
                                                onClick={() => isReady && handleGenerate(doc)}
                                                disabled={isGenerating || !isReady}
                                                className={cn(
                                                    "flex items-center justify-between p-6 bg-card border border-border rounded-2xl transition-all text-left group",
                                                    isReady ? "hover:border-primary/50 cursor-pointer" : "opacity-60 cursor-not-allowed",
                                                    selectedId === doc.id && "ring-2 ring-primary border-primary"
                                                )}
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                                        isReady ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white" : "bg-secondary text-muted-foreground"
                                                    )}>
                                                        <MonitorPlay className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold line-clamp-1">{doc.title}</h4>
                                                        <p className={cn(
                                                            "text-xs uppercase tracking-widest mt-1 font-semibold",
                                                            doc.analysis_status === 'completed' ? "text-emerald-500" :
                                                                doc.analysis_status === 'failed' ? "text-red-500" : "text-muted-foreground"
                                                        )}>
                                                            {doc.analysis_status === 'completed' ? 'Analiz Hazır' :
                                                                doc.analysis_status === 'processing' ? 'Analiz Ediliyor...' :
                                                                    doc.analysis_status === 'failed' ? 'Hata Oluştu' : 'Beklemede'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isGenerating && selectedId === doc.id ? (
                                                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                                ) : isReady ? (
                                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors transition-transform group-hover:translate-x-1" />
                                                ) : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Oluşturulan Sunum Taslağı</h2>
                                <button
                                    onClick={() => setPresentationData(null)}
                                    className="text-sm text-muted-foreground hover:text-foreground underline"
                                >
                                    Farklı Bir Makale Seç
                                </button>
                            </div>

                            {/* Background Customization Panel */}
                            <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Palette className="w-5 h-5 text-primary" />
                                        <h3 className="font-bold">Sunum Teması</h3>
                                        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                            Özel
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {(user?.subscription_tier === 'free' || !user) && (
                                            <div className="flex items-center space-x-1 text-xs text-orange-500 font-medium">
                                                <Lock className="w-3 h-3" />
                                                <span>Yükselt</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { id: 'classic', name: 'Klasik Beyaz', class: 'bg-card border-border' },
                                        { id: 'academic', name: 'Akademik Mavi', class: 'bg-gradient-to-br from-blue-900/40 to-slate-900/40 border-blue-500/30' },
                                        { id: 'modern', name: 'Modern Mor', class: 'bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-500/30' },
                                        { id: 'professional', name: 'Profesyonel Siyah', class: 'bg-gradient-to-br from-black to-zinc-900 border-zinc-700' }
                                    ].map((theme) => {
                                        const isLocked = (user?.subscription_tier === 'free' || !user) && theme.id !== 'classic';
                                        return (
                                            <button
                                                key={theme.id}
                                                onClick={() => {
                                                    if (isLocked) {
                                                        setSelectedFeature("Sunum Temaları");
                                                        setShowUpgradeModal(true);
                                                    } else {
                                                        setSelectedTheme(theme.id);
                                                    }
                                                }}
                                                className={cn(
                                                    "p-3 rounded-xl border-2 transition-all text-xs font-medium text-center relative overflow-hidden h-20 flex flex-col items-center justify-center",
                                                    theme.class,
                                                    selectedTheme === theme.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/30",
                                                    isLocked && "opacity-60"
                                                )}
                                            >
                                                {theme.name}
                                                {isLocked && <Lock className="w-3 h-3 mt-1 text-muted-foreground" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {presentationData.slides.map((slide: any, i: number) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "border rounded-2xl p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group min-h-[300px] flex flex-col",
                                            selectedTheme === 'classic' && "bg-card border-border",
                                            selectedTheme === 'academic' && "bg-gradient-to-br from-blue-950/80 to-slate-900 border-blue-500/20 text-blue-50",
                                            selectedTheme === 'modern' && "bg-gradient-to-br from-purple-950/80 to-indigo-900 border-purple-500/20 text-purple-50",
                                            selectedTheme === 'professional' && "bg-zinc-950 border-zinc-800 text-zinc-100"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-0 left-0 w-1.5 h-full transition-colors",
                                            selectedTheme === 'classic' ? "bg-primary/20 group-hover:bg-primary" :
                                                selectedTheme === 'academic' ? "bg-blue-500" :
                                                    selectedTheme === 'modern' ? "bg-purple-500" : "bg-zinc-500"
                                        )} />

                                        <span className="absolute top-4 right-8 text-6xl font-black opacity-5 select-none leading-none">
                                            {slide.slide_number}
                                        </span>

                                        <h3 className={cn(
                                            "text-xl font-bold mb-4 relative z-10 pr-12",
                                            selectedTheme === 'classic' ? "text-primary" : "text-inherit"
                                        )}>
                                            {slide.title}
                                        </h3>

                                        <ul className="space-y-3 relative z-10 flex-1">
                                            {slide.content.map((point: string, idx: number) => (
                                                <li key={idx} className="text-sm flex items-start leading-relaxed opacity-90">
                                                    <div className={cn(
                                                        "mr-3 mt-1.5 w-1.5 h-1.5 rounded-full shrink-0",
                                                        selectedTheme === 'classic' ? "bg-primary" : "bg-current"
                                                    )} />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>

                                        {slide.speaker_notes && (
                                            <div className="mt-4 pt-4 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Notlar</p>
                                                <p className="text-[11px] italic line-clamp-2">{slide.speaker_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h4 className="font-bold text-lg">Sunumunuz Hazır!</h4>
                                    <p className="text-sm text-muted-foreground italic">Gelişmiş sunum modunu deneyin veya dışa aktarın.</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => setShowPresentationMode(true)}
                                        className="px-6 py-3 rounded-xl border border-primary text-primary hover:bg-primary/10 transition-colors text-sm font-bold flex items-center gap-2"
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                        Tam Ekran Başlat
                                    </button>
                                    <button
                                        onClick={() => toast.info('Dışa aktarma özelliği yakında aktif olacak!')}
                                        className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center space-x-2"
                                    >
                                        <span>Dışa Aktar (.PDF)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Presentation Mode Modal */}
            {showPresentationMode && (
                <PresentationView
                    data={presentationData}
                    theme={selectedTheme}
                    onClose={() => setShowPresentationMode(false)}
                />
            )}

            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                feature={selectedFeature}
            />
            <Toaster richColors position="top-right" theme="dark" />
        </div>
    );
}
