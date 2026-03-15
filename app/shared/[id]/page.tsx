"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SummaryView } from '@/components/SummaryView';
import { UserRole } from '@/types';
import { Sparkles, BrainCircuit, Share, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SharedAnalysisPage() {
    const params = useParams();
    const router = useRouter();
    const documentId = params.id as string;

    const [level, setLevel] = useState<UserRole>('student');
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (documentId) {
            fetchAnalysis(level);
        }
    }, [documentId, level]);

    const fetchAnalysis = async (targetLevel: UserRole) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/shared/${documentId}?level=${targetLevel}`);

            const text = await response.text();
            let result;
            try {
                result = text ? JSON.parse(text) : null;
            } catch (e) {
                console.error('JSON parse error:', text);
                throw new Error(`Sunucudan hatalı yanıt geldi.`);
            }

            if (!response.ok) {
                // If the level is not found, maybe show an error saying "Bu seviyede analiz yok"
                throw new Error(result?.error || 'Analiz bulunamadı');
            }

            setData(result);
        } catch (error: any) {
            console.error('Error fetching shared analysis:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col h-screen overflow-hidden bg-background">
                {/* Minimal Header */}
                <header className="px-6 py-4 flex items-center justify-between bg-card border-b border-border/50 sticky top-0 z-50">
                    <button onClick={() => router.push('/')} className="flex items-center space-x-2 group">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center transform group-hover:scale-105 transition-all shadow-lg shadow-primary/20">
                            <BrainCircuit className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-xl tracking-tight text-foreground">
                            Özet<span className="text-primary font-bold">Asistanı</span>
                        </span>
                    </button>
                    <button onClick={() => router.push('/auth')} className="text-sm font-bold bg-primary text-primary-foreground px-4 py-2 rounded-xl">
                        Ücretsiz Kayıt Ol
                    </button>
                </header>
                <div className="flex-1 p-6 flex items-center justify-center">
                    <div className="bg-destructive/10 border border-destructive/20 p-8 rounded-2xl max-w-md text-center">
                        <h3 className="text-xl font-bold text-destructive mb-2">Paylaşılan İçerik Hatası</h3>
                        <p className="text-muted-foreground">{error}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-6 px-6 py-2.5 bg-secondary text-foreground rounded-xl font-bold hover:bg-secondary/80 transition-all"
                        >
                            Ana Sayfaya Dön
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            {/* Minimal Header with CTA for new users */}
            <header className="px-6 py-3 flex items-center justify-between bg-card border-b border-border/50 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/')} className="flex items-center space-x-2 group">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center transform group-hover:scale-105 transition-all shadow-lg shadow-primary/20">
                            <BrainCircuit className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-xl tracking-tight hidden sm:block">
                            Özet<span className="text-primary font-bold">Asistanı</span>
                        </span>
                    </button>
                    <div className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold flex items-center">
                        <Share className="w-3 h-3 mr-1.5" />
                        Paylaşılan Analiz
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <p className="hidden md:block text-xs font-medium text-muted-foreground">Bu bir kullanıcı tarafından paylaşılan analizdir.</p>
                    <button onClick={() => router.push('/')} className="text-sm font-bold bg-primary text-primary-foreground px-5 py-2 rounded-xl hover:bg-primary/90 transition-all shadow-lg ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                        Kendin Dene (Ücretsiz)
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-6xl mx-auto h-full">
                    <SummaryView
                        data={data}
                        isLoading={isLoading}
                        currentLevel={level}
                        onLevelChange={setLevel}
                        // onRefresh özelliğini burada KESİNLİKLE göndermiyoruz, paylaşım modunda tekrar AI nesnesine dokunulmamalı!
                    />
                </div>
            </div>
        </div>
    );
}
