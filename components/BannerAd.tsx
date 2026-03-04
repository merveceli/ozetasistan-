"use client";

import { useState } from 'react';
import { X, ExternalLink, Sparkles, BookOpen, GraduationCap, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BannerAdProps {
    variant?: 'horizontal' | 'vertical' | 'compact';
    className?: string;
    slot?: number; // farklı reklam slotları için
}

// Simüle edilmiş reklam içerikleri - gerçek reklam entegrasyonunda burası Google AdSense kodu olur
const adContents = [
    {
        id: 1,
        label: 'Sponsor',
        icon: BookOpen,
        accent: 'from-indigo-500/10 to-purple-500/10',
        border: 'border-indigo-500/20',
        iconColor: 'text-indigo-400',
        labelColor: 'text-indigo-400',
        title: 'Akademik Veritabanına Sınırsız Erişim',
        desc: 'Milyonlarca makale, tez ve araştırma — tek platformda',
        cta: 'Ücretsiz Dene →',
        ctaClass: 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30',
        href: '#',
    },
    {
        id: 2,
        label: 'Öne Çıkan',
        icon: GraduationCap,
        accent: 'from-emerald-500/10 to-teal-500/10',
        border: 'border-emerald-500/20',
        iconColor: 'text-emerald-400',
        labelColor: 'text-emerald-400',
        title: 'AI Destekli Ödev Asistanı',
        desc: 'Ödevlerinizi yapay zeka ile hızlandırın, kaynaklarınızı otomatik düzenleyin',
        cta: 'Keşfet →',
        ctaClass: 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30',
        href: '#',
    },
    {
        id: 3,
        label: 'Pro',
        icon: Zap,
        accent: 'from-amber-500/10 to-orange-500/10',
        border: 'border-amber-500/20',
        iconColor: 'text-amber-400',
        labelColor: 'text-amber-400',
        title: 'Özet Asistanı Pro\'ya Geç',
        desc: 'Sınırsız analiz, Profesör modu, öncelikli işleme ve daha fazlası',
        cta: 'Pro\'yu Keşfet →',
        ctaClass: 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30',
        href: '/settings',
    },
];

export function BannerAd({ variant = 'horizontal', className, slot = 0 }: BannerAdProps) {
    const [dismissed, setDismissed] = useState(false);
    const ad = adContents[slot % adContents.length];
    const Icon = ad.icon;

    if (dismissed) return null;

    // Compact varyant — kenar çubukları için
    if (variant === 'compact') {
        return (
            <div className={cn(
                'group relative rounded-2xl border bg-gradient-to-br p-4 transition-all duration-300 hover:scale-[1.01]',
                ad.accent, ad.border, className
            )}>
                <button
                    onClick={() => setDismissed(true)}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Kapat"
                >
                    <X className="w-3 h-3 text-muted-foreground" />
                </button>
                <div className="flex items-start gap-3">
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', `bg-${ad.iconColor.split('-')[1]}-500/10`)}>
                        <Icon className={cn('w-4 h-4', ad.iconColor)} />
                    </div>
                    <div className="min-w-0">
                        <span className={cn('text-[9px] font-black uppercase tracking-widest', ad.labelColor)}>{ad.label}</span>
                        <p className="text-xs font-semibold text-foreground mt-0.5 leading-snug">{ad.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-snug line-clamp-2">{ad.desc}</p>
                        <a
                            href={ad.href}
                            className={cn('mt-2 inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors', ad.ctaClass)}
                        >
                            {ad.cta}
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Vertical varyant
    if (variant === 'vertical') {
        return (
            <div className={cn(
                'group relative rounded-2xl border bg-gradient-to-b p-5 transition-all duration-300 hover:scale-[1.01]',
                ad.accent, ad.border, className
            )}>
                <button
                    onClick={() => setDismissed(true)}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Kapat"
                >
                    <X className="w-3 h-3 text-muted-foreground" />
                </button>
                <div className="text-center space-y-3">
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mx-auto', `bg-white/5`)}>
                        <Icon className={cn('w-6 h-6', ad.iconColor)} />
                    </div>
                    <span className={cn('text-[9px] font-black uppercase tracking-widest block', ad.labelColor)}>{ad.label}</span>
                    <p className="text-sm font-bold text-foreground leading-snug">{ad.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ad.desc}</p>
                    <a
                        href={ad.href}
                        className={cn('w-full block text-xs font-bold px-3 py-2 rounded-xl transition-colors text-center', ad.ctaClass)}
                    >
                        {ad.cta}
                    </a>
                    <p className="text-[9px] text-muted-foreground/50">Reklam</p>
                </div>
            </div>
        );
    }

    // Horizontal (default) varyant — sayfa arası
    return (
        <div className={cn(
            'group relative rounded-2xl border bg-gradient-to-r overflow-hidden transition-all duration-300 hover:border-white/10',
            ad.accent, ad.border, className
        )}>
            {/* Dekoratif arka plan */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }} />

            <div className="relative flex items-center gap-4 p-4">
                {/* İkon */}
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/5')}>
                    <Icon className={cn('w-5 h-5', ad.iconColor)} />
                </div>

                {/* İçerik */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('text-[9px] font-black uppercase tracking-widest', ad.labelColor)}>{ad.label}</span>
                        <span className="text-[8px] text-muted-foreground/40 font-medium">Reklam</span>
                    </div>
                    <p className="text-sm font-bold text-foreground truncate">{ad.title}</p>
                    <p className="text-xs text-muted-foreground truncate hidden sm:block">{ad.desc}</p>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 shrink-0">
                    <a
                        href={ad.href}
                        className={cn('text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap hidden sm:block', ad.ctaClass)}
                    >
                        {ad.cta}
                    </a>
                    <button
                        onClick={() => setDismissed(true)}
                        className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Kapat"
                    >
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                </div>
            </div>
        </div>
    );
}
