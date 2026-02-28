"use client";

import { X, Sparkles, Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    feature?: string;
}

export function UpgradeModal({ isOpen, onClose, title, description, feature }: UpgradeModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header Image/Pattern */}
                <div className="h-32 bg-gradient-to-br from-primary via-purple-500 to-blue-600 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:20px_20px]" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-4 left-6">
                        <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 w-fit">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Premium Özellik</span>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <h2 className="text-2xl font-bold mb-2">
                        {title || (feature ? `${feature} Özelliğini Aç` : 'Yolculuğunuza Devam Edin')}
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        {description || 'Bu özellik ve daha fazlası için planınızı yükseltin. Akademik başarınızı bir üst seviyeye taşıyın.'}
                    </p>

                    <div className="space-y-4 mb-8">
                        {[
                            "Sınırsız Doküman Analizi",
                            "Video ve Sesli Not Desteği",
                            "Gelişmiş Sunum Özelleştirme",
                            "Akademik Derinlik Düzeyi"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center space-x-3 text-sm">
                                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                    <Check className="w-3 h-3 text-green-500" />
                                </div>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col space-y-3">
                        <button
                            onClick={() => {
                                router.push('/landing');
                                onClose();
                            }}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity group"
                        >
                            <span>Planları İncele</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                        >
                            Belki daha sonra
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
