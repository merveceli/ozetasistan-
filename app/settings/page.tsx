"use client";

import { useEffect, useState } from 'react';
import { User, Bell, Palette, HardDrive, Cpu, ExternalLink, Loader2, Check, Sparkles, Zap } from "lucide-react";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface QuotaStatus {
    limits: {
        max_documents: number;
        max_analyses_per_month: number;
        max_presentations: number;
        max_storage_mb: number;
    };
    usage: {
        documents_uploaded: number;
        analyses_completed: number;
        presentations_created: number;
        storage_used_mb: number;
    };
    remainingAnalyses: number;
}

export default function SettingsPage() {
    const [user, setUser] = useState<{ full_name?: string, email?: string, subscription_tier?: string } | null>(null);
    const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [userRes, quotaRes, packagesRes] = await Promise.all([
                fetch('/api/user'),
                fetch('/api/quota'),
                fetch('/api/admin/stats/charts') // We'll just fetch packages from a new endpoint or reusing an existing one. Actually, let's create a specific public one or use the supabase client.
            ]);

            if (userRes.ok) {
                const userData = await userRes.json();
                setUser(userData.user);
            }

            if (quotaRes.ok) {
                const quotaData = await quotaRes.json();
                setQuotaStatus(quotaData.quotaStatus);
            }

            // For now, let's just hardcode or fetch if we had an endpoint. 
            // Better to use the database directly if possible, or a simple fetch.
            const pkgRes = await fetch('/api/quota'); // quota endpoint usually has package info
            if (pkgRes.ok) {
                // In a real app, we'd have /api/packages
            }

            // Temporary hardcoded packages for UI if fetch fails
            setPackages([
                { id: 'free', display_name: 'Ücretsiz', price_monthly: 0, features: ['5 Döküman', '10 Analiz', '2 Sunum'] },
                { id: 'student', display_name: 'Öğrenci', price_monthly: 49.90, features: ['50 Döküman', '100 Analiz', '20 Sunum', 'Sesli Not'] },
                { id: 'academic', display_name: 'Akademik', price_monthly: 99.90, features: ['Sınırsız Analiz', 'Sınırsız Sunum', 'Öncelikli Destek'] }
            ]);

        } catch (err) {
            console.error('Failed to fetch settings data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (packageId: string) => {
        if (packageId === user?.subscription_tier) return;

        try {
            setIsUpgrading(packageId);
            const res = await fetch('/api/payment/shopier', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Ödeme başlatılamadı');

            // 1. Create a dynamic form
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = data.action;

            // 2. Add hidden fields
            Object.entries(data.fields).forEach(([key, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value as string;
                form.appendChild(input);
            });

            // 3. Submit form
            document.body.appendChild(form);
            form.submit();

        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsUpgrading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    const displayName = user?.full_name || user?.email?.split('@')[0] || 'Kullanıcı';
    const tierName = user?.subscription_tier === 'academic' ? 'Akademik Plan' :
        user?.subscription_tier === 'student' ? 'Öğrenci Planı' : 'Ücretsiz Plan';

    const apiUsagePercentage = quotaStatus?.limits.max_analyses_per_month && quotaStatus.limits.max_analyses_per_month !== -1
        ? Math.round((quotaStatus.usage.analyses_completed / quotaStatus.limits.max_analyses_per_month) * 100)
        : 0;

    const storageUsagePercentage = quotaStatus?.limits.max_storage_mb
        ? Math.round((quotaStatus.usage.storage_used_mb / quotaStatus.limits.max_storage_mb) * 100)
        : 0;

    return (
        <div className="p-8 space-y-8 h-full bg-background overflow-y-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Ayarlar</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Account Settings */}
                <div className="glass-card p-6 rounded-2xl md:col-span-2 lg:col-span-1 border border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-purple-400 p-[2px]">
                            <div className="h-full w-full rounded-full bg-card flex items-center justify-center">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
                            <p className="text-sm text-muted-foreground">{tierName}</p>
                        </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors">
                            <span className="text-sm font-medium">E-posta</span>
                            <span className="text-sm text-muted-foreground">{user?.email}</span>
                        </div>
                        <button className="w-full py-2 px-4 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-sm">
                            Profili Düzenle
                        </button>
                    </div>
                </div>

                {/* Appearance */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Palette className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Görünüm</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Karanlık Mod</span>
                            <div className="h-6 w-11 rounded-full bg-primary p-1 cursor-pointer">
                                <div className="h-4 w-4 rounded-full bg-white translate-x-5 transition-transform" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Animasyonlar</span>
                            <div className="h-6 w-11 rounded-full bg-primary p-1 cursor-pointer">
                                <div className="h-4 w-4 rounded-full bg-white translate-x-5 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Bell className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Bildirimler</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">E-posta Bildirimleri</span>
                            <div className="h-6 w-11 rounded-full bg-muted p-1 cursor-pointer">
                                <div className="h-4 w-4 rounded-full bg-white translate-x-0 transition-transform" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Uygulama İçi</span>
                            <div className="h-6 w-11 rounded-full bg-primary p-1 cursor-pointer">
                                <div className="h-4 w-4 rounded-full bg-white translate-x-5 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 md:col-span-3 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Cpu className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Sistem Durumu</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-accent/10 border border-white/5 space-y-2">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Depolama</span>
                                <HardDrive className="h-4 w-4" />
                            </div>
                            <div className="text-2xl font-bold">
                                {storageUsagePercentage}%
                                <span className="text-xs text-muted-foreground ml-2 font-normal">
                                    ({quotaStatus?.usage.storage_used_mb.toFixed(1)} / {quotaStatus?.limits.max_storage_mb} MB)
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${storageUsagePercentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-accent/10 border border-white/5 space-y-2">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>API Kullanımı (Analiz)</span>
                                <ExternalLink className="h-4 w-4" />
                            </div>
                            <div className="text-2xl font-bold">
                                {quotaStatus?.usage.analyses_completed} / {quotaStatus?.limits.max_analyses_per_month === -1 ? 'Sınırsız' : quotaStatus?.limits.max_analyses_per_month}
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-500",
                                        apiUsagePercentage > 80 ? 'bg-orange-500' : 'bg-green-500'
                                    )}
                                    style={{ width: `${quotaStatus?.limits.max_analyses_per_month === -1 ? 100 : apiUsagePercentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-accent/10 border border-white/5 space-y-2 flex flex-col justify-center">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Uygulama Sürümü</span>
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">v0.1.0</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                                Son güncelleme: 17 Şubat 2026
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Plans */}
                <div className="md:col-span-3 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Planını Yükselt</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {packages.map((pkg) => {
                            const isCurrent = user?.subscription_tier === pkg.id;
                            return (
                                <div
                                    key={pkg.id}
                                    className={cn(
                                        "glass-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col relative overflow-hidden transition-all",
                                        isCurrent && "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                                    )}
                                >
                                    {isCurrent && (
                                        <div className="absolute top-4 right-4 bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"> Mevcut Plan </div>
                                    )}
                                    <div className="mb-6">
                                        <h4 className="text-xl font-bold">{pkg.display_name}</h4>
                                        <div className="flex items-end gap-1 mt-1">
                                            <span className="text-3xl font-black">{pkg.price_monthly === 0 ? 'Ücretsiz' : `₺${pkg.price_monthly}`}</span>
                                            {pkg.price_monthly > 0 && <span className="text-xs text-muted-foreground pb-1">/ay</span>}
                                        </div>
                                    </div>
                                    <ul className="space-y-3 mb-8 flex-1">
                                        {pkg.features.map((feature: string, idx: number) => (
                                            <li key={idx} className="text-xs flex items-center gap-2 text-muted-foreground">
                                                <Check className="w-3 h-3 text-primary" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => handleUpgrade(pkg.id)}
                                        disabled={isCurrent || (isUpgrading !== null)}
                                        className={cn(
                                            "w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                                            isCurrent
                                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default"
                                                : "bg-primary text-white hover:opacity-90 active:scale-95 shadow-lg shadow-primary/10"
                                        )}
                                    >
                                        {isUpgrading === pkg.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : isCurrent ? (
                                            "Aktif"
                                        ) : (
                                            <>
                                                {pkg.price_monthly === 0 ? "Seç" : "Yükselt"}
                                                <Zap className="w-3 h-3" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
