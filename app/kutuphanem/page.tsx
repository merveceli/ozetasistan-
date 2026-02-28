"use client";

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { FileText, Mic, Video, MoreVertical, CheckSquare, Square, ArrowRight, GitCompare, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Document } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LibraryPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await fetch('/api/documents');
            if (response.ok) {
                const data = await response.json();
                setDocuments(data.documents);
            }
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleCompare = () => {
        if (selectedIds.length < 2) return;
        const query = selectedIds.join(',');
        router.push(`/compare?ids=${query}`);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            <Header />

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">Kütüphanem</h1>
                            <p className="text-muted-foreground mt-1">
                                Tüm dokümanlarınız ve analizleriniz burada.
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            + Yeni Yükle
                        </Link>
                    </div>

                    {/* Filters / Toolbar TODO */}

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-48 bg-secondary/30 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border">
                            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">Henüz doküman yok</h3>
                            <p className="text-muted-foreground mb-4">Analiz etmek için ilk dokümanınızı yükleyin.</p>
                            <Link href="/" className="text-primary hover:underline">Yükleme ekranına git</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-24">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className={cn(
                                        "group relative bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer",
                                        selectedIds.includes(doc.id) ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"
                                    )}
                                    onClick={() => toggleSelection(doc.id)}
                                >
                                    <div className="p-4 flex items-start justify-between">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center",
                                            doc.file_type === 'pdf' ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                                        )}>
                                            {doc.file_type === 'pdf' ? <FileText className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                        </div>
                                        <button className="text-muted-foreground hover:text-foreground">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="px-4 pb-4">
                                        <h3 className="font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">{doc.title}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(doc.created_at).toLocaleDateString('tr-TR')} • {doc.file_type.toUpperCase()}
                                        </p>
                                    </div>

                                    {/* Selection Overlay/Checkbox */}
                                    <div className="absolute top-4 right-12 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => toggleSelection(doc.id)}>
                                            {selectedIds.includes(doc.id) ? (
                                                <CheckCircle2 className="w-5 h-5 text-primary fill-current" />
                                            ) : (
                                                <Square className="w-5 h-5 text-muted-foreground" />
                                            )}
                                        </button>
                                    </div>
                                    {/* Always show check if selected */}
                                    {selectedIds.includes(doc.id) && (
                                        <div className="absolute top-4 right-4">
                                            <div className="bg-primary text-white rounded-full p-0.5">
                                                <CheckSquare className="w-4 h-4" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Action Bar for Comparison */}
            {selectedIds.length > 0 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in">
                    <div className="bg-foreground text-background px-6 py-3 rounded-full shadow-xl flex items-center space-x-6">
                        <span className="font-medium text-sm">
                            {selectedIds.length} doküman seçildi
                        </span>

                        <div className="h-4 w-px bg-background/20" />

                        {selectedIds.length >= 2 ? (
                            <button
                                onClick={handleCompare}
                                className="flex items-center space-x-2 font-bold hover:text-primary transition-colors"
                            >
                                <GitCompare className="w-4 h-4" />
                                <span>Karşılaştır ve Sentezle</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <span className="text-sm opacity-50 flex items-center">
                                <GitCompare className="w-4 h-4 mr-2" />
                                Karşılaştırmak için en az 2 seçim yapın
                            </span>
                        )}

                        <button
                            onClick={() => setSelectedIds([])}
                            className="ml-2 text-xs opacity-70 hover:opacity-100"
                        >
                            İptal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
