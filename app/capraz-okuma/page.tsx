"use client";

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { BookOpenCheck, Sparkles, Network, ArrowRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UpgradeModal } from '@/components/modals/UpgradeModal';

export default function CrossReadingPage() {
    const [user, setUser] = useState<{ subscription_tier: string } | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch('/api/user');
            const data = await res.json();
            if (data.user) setUser(data.user);
        };
        fetchUser();
    }, []);

    const isAcademic = user?.subscription_tier === 'academic';

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
            <Header />
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                feature="Çapraz Okuma"
            />

            <div className="flex-1 overflow-y-auto p-6 md:p-12 relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />

                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <BookOpenCheck className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold italic tracking-tight">Çapraz Okuma & Sentez</h1>
                        <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                            Academic Only
                        </div>
                    </div>

                    <p className="text-muted-foreground text-lg max-w-2xl mb-12">
                        Birden fazla makaleyi birleştirin, ortak temaları bulun ve kendi özgün sentez metninizi oluşturun.
                        Akademik yazım sürecinizi 10 kat hızlandırın.
                    </p>

                    {!isAcademic ? (
                        <div className="relative group overflow-hidden rounded-[40px] border border-white/5 bg-secondary/10 p-12 text-center backdrop-blur-xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 opacity-50" />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-20 h-20 bg-card rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                    <Lock className="w-10 h-10 text-primary animate-pulse" />
                                </div>
                                <h2 className="text-3xl font-bold mb-4 italic">Bu Özellik Akademik Plan Gerektirir</h2>
                                <p className="text-muted-foreground max-w-lg mb-10 leading-relaxed text-lg">
                                    Çapraz okuma ve semantik sentezleme motoru sadece Akademik pakette mevcuttur.
                                    Karmaşık makaleleri birbirleriyle konuşturmak için planınızı şimdi yükseltin.
                                </p>

                                <button
                                    onClick={() => setShowUpgradeModal(true)}
                                    className="px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xl flex items-center space-x-3 hover:opacity-90 transition-all shadow-2xl shadow-primary/20 group"
                                >
                                    <span>Hemen Yükselt</span>
                                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                </button>
                            </div>

                            {/* Decorative Preview */}
                            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-30 blur-[2px] pointer-events-none scale-95 grayscale">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-card border border-border p-6 rounded-3xl h-64 flex flex-col justify-end">
                                        <div className="w-12 h-1 bg-primary mb-4" />
                                        <div className="space-y-2">
                                            <div className="h-4 bg-muted w-full rounded" />
                                            <div className="h-4 bg-muted w-2/3 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Implementation for Academic users would go here */}
                            <div className="col-span-2 p-12 bg-secondary/10 rounded-[40px] border border-dashed border-primary/20 text-center">
                                <Network className="w-16 h-16 text-primary mx-auto mb-6 opacity-50" />
                                <h2 className="text-2xl font-bold mb-2">Çapraz Okuma Motoru Hazırlanıyor</h2>
                                <p className="text-muted-foreground">Makalelerinizi sol taraftaki panelden seçerek sentezlemeye başlayabilirsiniz.</p>
                                <button className="mt-8 px-8 py-3 bg-secondary rounded-xl font-bold">Doküman Seç</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
