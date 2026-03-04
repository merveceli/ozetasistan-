"use client";

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { BookOpenCheck, Sparkles, Network, ArrowRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UpgradeModal } from '@/components/modals/UpgradeModal';

export default function CrossReadingPage() {
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            <Header />
            <div className="flex-1 overflow-y-auto p-6 md:p-12 relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />

                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <BookOpenCheck className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold italic tracking-tight">Çapraz Okuma & Sentez</h1>
                        <div className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                            Ücretsiz Özellik
                        </div>
                    </div>

                    <p className="text-muted-foreground text-lg max-w-2xl mb-12">
                        Birden fazla makaleyi birleştirin, ortak temaları bulun ve kendi özgün sentez metninizi oluşturun.
                        Akademik yazım sürecinizi 10 kat hızlandırın.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Implementation for Academic users would go here */}
                        <div className="col-span-2 p-12 bg-secondary/10 rounded-[40px] border border-dashed border-primary/20 text-center">
                            <Network className="w-16 h-16 text-primary mx-auto mb-6 opacity-50" />
                            <h2 className="text-2xl font-bold mb-2">Çapraz Okuma Motoru Parçaları...</h2>
                            <p className="text-muted-foreground">Makalelerinizi sol taraftaki panelden seçerek sentezlemeye başlayabilirsiniz.</p>
                            <button className="mt-8 px-8 py-3 bg-primary text-black rounded-xl font-bold">Doküman Seç</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
