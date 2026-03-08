"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { SummaryView } from '@/components/SummaryView';
import { UserRole } from '@/types';
import { getUserSettings } from '@/lib/userSettings';

export default function AnalysisPage() {
    const params = useParams();
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

    const fetchAnalysis = async (targetLevel: UserRole, force: boolean = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const settings = getUserSettings();

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    documentId,
                    level: targetLevel,
                    settings,
                    force
                }),
            });

            const text = await response.text();
            let result;
            try {
                result = text ? JSON.parse(text) : null;
            } catch (e) {
                console.error('JSON parse error:', text);
                throw new Error(`Sunucudan hatalı yanıt geldi: ${text.substring(0, 100)}...`);
            }

            if (!response.ok) {
                throw new Error(result?.error || 'Analiz işlemi başarısız oldu');
            }

            setData(result);

            // Cache for Focus Radio (and other features)
            try {
                localStorage.setItem(`analysis_${documentId}`, JSON.stringify(result));
            } catch { }

        } catch (error: any) {
            console.error('Error fetching analysis:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col h-screen overflow-hidden bg-background">
                <Header />
                <div className="flex-1 p-6 flex items-center justify-center">
                    <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-xl max-w-md text-center">
                        <h3 className="text-xl font-bold text-destructive mb-2">Hata Oluştu</h3>
                        <p className="text-muted-foreground">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            <Header />
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-6xl mx-auto h-full">
                    <SummaryView
                        data={data}
                        isLoading={isLoading}
                        currentLevel={level}
                        onLevelChange={setLevel}
                        onRefresh={() => fetchAnalysis(level, true)}
                    />
                </div>
            </div>
        </div>
    );
}
