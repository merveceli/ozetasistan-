"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Sparkles } from "lucide-react";

const facts = [
    "Yapay zeka ile karmaşık makaleleri saniyeler içinde anlayabilirsiniz.",
    "Görsel haritalandırma, hafızada kalıcılığı %60 oranında artırır.",
    "Aktif okuma yapan öğrenciler, pasif okuyanlara göre %40 daha başarılıdır.",
    "Düzenli aralıklarla tekrar ('spaced repetition'), uzun süreli belleği güçlendirir.",
    "Gemini 2.5 Flash, milyonlarca akademik makaleyi işleyebilecek kapasiteye sahiptir.",
    "Akademik verimliliğinizi artırmak için zihin haritaları oluşturmayı deneyin.",
];

export default function Loading() {
    const [factIndex, setFactIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [fadeIn, setFadeIn] = useState(true);

    useEffect(() => {
        const factInterval = setInterval(() => {
            setFadeIn(false);
            setTimeout(() => {
                setFactIndex((prev) => (prev + 1) % facts.length);
                setFadeIn(true);
            }, 400);
        }, 3500);

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 8;
            });
        }, 500);

        return () => {
            clearInterval(factInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-6 text-center">
                {/* Spinner */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                    {/* Outer ring */}
                    <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                    {/* Spinning ring */}
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    {/* Inner pulsing dot */}
                    <div className="absolute inset-4 border-2 border-primary/20 border-b-transparent rounded-full animate-[spin_2s_linear_infinite_reverse]" />
                    {/* Icon */}
                    <div className="relative bg-primary/10 rounded-full p-4">
                        <BrainCircuit className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                </div>

                {/* Title */}
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                        Özet Asistanı
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Akademik içerik hazırlanıyor...
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden border border-border/50">
                    <div
                        className="h-full bg-gradient-to-r from-primary via-purple-500 to-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 90)}%` }}
                    />
                </div>

                {/* Fact Box */}
                <div
                    className="bg-secondary/30 border border-primary/10 rounded-2xl p-5 w-full transition-opacity duration-400"
                    style={{ opacity: fadeIn ? 1 : 0 }}
                >
                    <p className="text-xs font-bold text-primary flex items-center justify-center gap-2 mb-2 uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" />
                        Biliyor muydunuz?
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {facts[factIndex]}
                    </p>
                </div>
            </div>
        </div>
    );
}
