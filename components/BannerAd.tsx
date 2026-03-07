"use client";

import { useEffect, useRef, useState } from 'react';
import { X, ExternalLink, BookOpen, GraduationCap, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BannerAdProps {
    variant?: 'horizontal' | 'vertical' | 'compact' | 'adsense';
    className?: string;
    slot?: number;
    adSlotId?: string; // Google AdSense slot ID
}

// AdSense Publisher ID
const ADSENSE_PUB_ID = 'ca-pub-1484212824373758';

// ─── Fallback reklam içerikleri (AdSense yüklenemezse gösterilir) ─────────────
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

// ─── Google AdSense Unit bileşeni ─────────────────────────────────────────────
function AdSenseUnit({ adSlotId, className }: { adSlotId: string; className?: string }) {
    const adRef = useRef<HTMLModElement>(null);
    const [failed, setFailed] = useState(false);
    const [isMounted, setIsMounted] = useState(false); // SSR → CSR geçiş koruması

    // SSR'da hiçbir şey render etme, sadece client'ta göster
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        let attempts = 0;
        const maxAttempts = 20; // 20 × 500ms = 10 saniye max bekleme

        // Script yüklenene kadar bekle, sonra push yap
        const tryPush = () => {
            const adsbyg = (window as any).adsbygoogle;

            if (adsbyg && adRef.current && !adRef.current.innerHTML) {
                try {
                    adsbyg.push({});
                } catch (err) {
                    console.warn('[AdSense] push error:', err);
                    setFailed(true);
                }

                const checkTimer = setTimeout(() => {
                    if (!adRef.current) return;
                    const status = adRef.current.getAttribute('data-ad-status');
                    if (status === 'unfilled' || !adRef.current.querySelector('iframe')) {
                        setFailed(true);
                    }
                }, 4000);

                return () => clearTimeout(checkTimer);
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(tryPush, 500);
            }
        };

        tryPush();
    }, [isMounted, adSlotId]);

    // SSR veya başarısız → null döndür (üst bileşen fallback gösterir)
    if (!isMounted || failed) return null;

    return (
        <ins
            ref={adRef}
            className={cn('adsbygoogle', className)}
            style={{ display: 'block' }}
            data-ad-client={ADSENSE_PUB_ID}
            data-ad-slot={adSlotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
        />
    );
}


export function BannerAd({ variant = 'horizontal', className, slot = 0, adSlotId }: BannerAdProps) {
    const [dismissed, setDismissed] = useState(false);
    const ad = adContents[slot % adContents.length];
    const Icon = ad.icon;

    if (dismissed) return null;

    // ─── Gerçek AdSense varyantı ──────────────────────────────────────────────
    if (variant === 'adsense') {
        // Eğer gerçek slot ID'niz yoksa, AdSense 400 hatası verebilir.
        // Bu yüzden slot ID boşsa reklam kutusunu hiç render etmeyip fallback göstermek daha sağlıklı olabilir.
        if (!adSlotId) {
            return <BannerAd variant="horizontal" slot={slot} className={className} />;
        }
        const activeSlotId = adSlotId;
        return (
            <div className={cn('relative my-4 bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-2 backdrop-blur-sm', className)}>
                {/* "Reklam" etiketi */}
                <div className="absolute top-1 left-2 text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest select-none z-10">
                    Reklam
                </div>
                <AdSenseUnit adSlotId={activeSlotId} className="min-h-[90px] w-full" />
            </div>
        );
    }

    // ─── Compact varyant — kenar çubukları için ────────────────────────────────
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
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-white/5')}>
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

    // ─── Vertical varyant ─────────────────────────────────────────────────────
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
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mx-auto bg-white/5')}>
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

    // ─── Horizontal (default) varyant ─────────────────────────────────────────
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
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/5')}>
                    <Icon className={cn('w-5 h-5', ad.iconColor)} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('text-[9px] font-black uppercase tracking-widest', ad.labelColor)}>{ad.label}</span>
                        <span className="text-[8px] text-muted-foreground/40 font-medium">Reklam</span>
                    </div>
                    <p className="text-sm font-bold text-foreground truncate">{ad.title}</p>
                    <p className="text-xs text-muted-foreground truncate hidden sm:block">{ad.desc}</p>
                </div>

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
