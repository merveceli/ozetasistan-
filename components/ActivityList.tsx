'use client';

import { useEffect, useState } from 'react';
import { FileText, Mic, Video, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Document } from '@/types';

const icons = {
    pdf: FileText,
    audio: Mic,
    video: Video,
    url: FileText,
};

const statusStyles = {
    completed: 'bg-secondary text-muted-foreground',
    processing: 'bg-secondary text-muted-foreground animate-pulse',
    pending: 'bg-secondary text-muted-foreground',
    failed: 'bg-destructive/20 text-destructive',
};

const statusLabels = {
    completed: 'Analiz Tamamlandı',
    processing: 'Analiz Ediliyor',
    pending: 'Beklemede',
    failed: 'Başarısız',
};

function getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
}

export function ActivityList() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRecentDocuments();
    }, []);

    const fetchRecentDocuments = async () => {
        try {
            const response = await fetch('/api/documents');
            if (response.ok) {
                const data = await response.json();
                // Get the 3 most recent documents
                const recent = data.documents?.slice(0, 3) || [];
                setDocuments(recent);
            }
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-card/50 border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="flex items-center text-lg font-semibold">
                        <span className="mr-2">↺</span> Son Aktiviteler
                    </h3>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-secondary/30 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="bg-card/50 border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="flex items-center text-lg font-semibold">
                        <span className="mr-2">↺</span> Son Analizler
                    </h3>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Henüz bir analiziniz bulunmuyor.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card/50 border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center text-lg font-semibold">
                    <span className="mr-2">↺</span> Son Analizler
                </h3>
            </div>

            <div className="space-y-4">
                {documents.map((doc) => {
                    const Icon = icons[doc.file_type] || FileText;
                    const status = doc.analysis_status;

                    return (
                        <Link
                            href={`/analyze/${doc.id}`}
                            key={doc.id}
                            className="group flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/60 border border-border/50 hover:border-border rounded-xl transition-all cursor-pointer"
                        >
                            <div className="flex items-center space-x-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                    doc.file_type === 'pdf' ? "bg-purple-500/10 text-purple-400" :
                                        doc.file_type === 'audio' ? "bg-blue-500/10 text-blue-400" :
                                            "bg-orange-500/10 text-orange-400"
                                )}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{doc.title}</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {doc.file_type.toUpperCase()} • {getRelativeTime(doc.created_at)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <span className={cn("px-3 py-1 rounded-full text-xs font-medium", statusStyles[status])}>
                                    {statusLabels[status]}
                                </span>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
