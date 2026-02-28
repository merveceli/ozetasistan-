"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { ComparisonView } from '@/components/ComparisonView';
import { GitCompare } from 'lucide-react';

export default function ComparePage() {
    const searchParams = useSearchParams();
    const ids = searchParams.get('ids')?.split(',') || [];

    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (ids.length >= 2) {
            fetchComparison();
        }
    }, []);

    const fetchComparison = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentIds: ids }),
            });

            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Comparison failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            <Header />
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold flex items-center">
                            <GitCompare className="w-8 h-8 mr-3 text-primary" />
                            Çapraz Okuma ve Sentez
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {ids.length} doküman analiz ediliyor ve karşılaştırılıyor.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 border border-dashed border-border rounded-xl bg-secondary/5">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
                            <h3 className="text-xl font-medium">Sentez Oluşturuluyor</h3>
                            <p className="text-muted-foreground mt-2 animate-pulse">Dokümanlar arasındaki ilişkiler analiz ediliyor...</p>
                        </div>
                    ) : (
                        <ComparisonView data={data!} />
                    )}
                </div>
            </div>
        </div>
    );
}
