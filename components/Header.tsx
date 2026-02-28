"use client";

import { useEffect, useState, useRef } from 'react';
import { Bell, Search, GraduationCap, BookOpen, LogOut, Zap, TrendingUp, Lock, ShieldCheck, X, Play, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UpgradeModal } from './modals/UpgradeModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface QuotaStatus {
    limits: {
        max_documents: number;
        max_analyses_per_month: number;
        max_presentations: number;
    };
    usage: {
        documents_uploaded: number;
        analyses_completed: number;
        presentations_created: number;
    };
    remainingAnalyses: number;
}

interface Notification {
    id: number;
    text: string;
    read: boolean;
    type?: 'info' | 'success' | 'warning';
    time?: string;
}

export function Header() {
    const router = useRouter();
    const [user, setUser] = useState<{ full_name?: string, email?: string, subscription_tier?: string, is_admin?: boolean } | null>(null);
    const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState("");
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const [adProgress, setAdProgress] = useState(0);
    const [showAdModal, setShowAdModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, text: "Hoş geldiniz! Yeni özelliklerimizi keşfedin.", read: false, type: 'info', time: 'Az önce' },
        { id: 2, text: "Web üzerinden link analiz özelliği aktif edildi!", read: false, type: 'success', time: '5 dk önce' },
    ]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const adIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchUser();
        fetchQuota();
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();
            if (data.user) setUser(data.user);
        } catch (err) {
            console.error('Failed to fetch user', err);
        }
    };

    const fetchQuota = async () => {
        try {
            const response = await fetch('/api/quota');
            if (response.ok) {
                const data = await response.json();
                setQuotaStatus(data.quotaStatus);
            }
        } catch (err) {
            console.error('Failed to fetch quota', err);
        }
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/landing');
        router.refresh();
    };

    const handleModeClick = (mode: string, requiredTier: 'student' | 'academic') => {
        const userTier = user?.subscription_tier || 'free';
        const isAllowed = (requiredTier === 'student' && userTier !== 'free') ||
            (requiredTier === 'academic' && userTier === 'academic');

        if (isAllowed) {
            toast.success(`${mode} modu aktif.`);
        } else {
            setSelectedFeature(`${mode} Modu`);
            setShowUpgradeModal(true);
        }
    };

    const handleWatchAd = () => {
        setShowAdModal(true);
        setAdProgress(0);
        let prog = 0;
        adIntervalRef.current = setInterval(() => {
            prog += 2;
            setAdProgress(prog);
            if (prog >= 100) {
                if (adIntervalRef.current) clearInterval(adIntervalRef.current);
                // Call API
                fetch('/api/watch-ad', { method: 'POST' })
                    .then(res => {
                        if (res.ok) {
                            setShowAdModal(false);
                            toast.success('🎉 Tebrikler! +1 Analiz Hakkı kazandınız!');
                            setQuotaStatus(prev => {
                                if (prev) {
                                    return {
                                        ...prev,
                                        usage: { ...prev.usage, analyses_completed: Math.max(0, prev.usage.analyses_completed - 1) },
                                        remainingAnalyses: prev.remainingAnalyses + 1
                                    };
                                }
                                return prev;
                            });
                            addNotification("Reklam izleyerek +1 Analiz Hakkı kazandınız! 🎉", 'success');
                        } else {
                            setShowAdModal(false);
                            toast.error('Giriş yapmanız gerekmektedir.');
                        }
                    })
                    .catch(() => {
                        setShowAdModal(false);
                        toast.error('Hata oluştu.');
                    })
                    .finally(() => setIsWatchingAd(false));
            }
        }, 60); // ~3 seconds for 100%
    };

    const addNotification = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
        setNotifications(prev => [
            { id: Date.now(), text, read: false, type, time: 'Az önce' },
            ...prev
        ]);
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const displayName = user?.full_name || user?.email?.split('@')[0] || 'Kullanıcı';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    const getQuotaPercentage = () => {
        if (!quotaStatus) return 0;
        if (quotaStatus.limits.max_analyses_per_month === -1) return 0;
        const percentage = (quotaStatus.usage.analyses_completed / quotaStatus.limits.max_analyses_per_month) * 100;
        return Math.min(percentage, 100);
    };

    const quotaPercentage = getQuotaPercentage();
    const isNearLimit = quotaPercentage > 80;
    const currentTier = user?.subscription_tier || 'free';
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <header className="h-16 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center justify-between z-10 shrink-0">
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    feature={selectedFeature}
                />

                {/* Mode Toggle */}
                <div className="flex items-center space-x-2 bg-secondary/50 p-1 rounded-full border border-border">
                    <button
                        onClick={() => handleModeClick("Öğrenci", "student")}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-2 transition-all",
                            currentTier === 'student' ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Öğrenci</span>
                        {currentTier === 'free' && <Lock className="w-3 h-3 opacity-50" />}
                    </button>
                    <button
                        onClick={() => handleModeClick("Akademik", "academic")}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-2 transition-all",
                            currentTier === 'academic' ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <GraduationCap className="w-4 h-4" />
                        <span>Akademik</span>
                        {currentTier !== 'academic' && <Lock className="w-3 h-3 opacity-50" />}
                    </button>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-4">
                    {/* Search */}
                    <div className="relative hidden md:block w-56">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Ara..."
                            className="w-full bg-secondary/50 border border-border rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    {/* Quota Status */}
                    {user && quotaStatus && (
                        <div className="hidden lg:flex items-center space-x-3 px-4 py-2 rounded-full bg-secondary/30 border border-border/50">
                            <Zap className={cn("w-4 h-4", isNearLimit ? "text-orange-500" : "text-primary")} />
                            <div className="flex items-center space-x-3">
                                <div className="flex flex-col">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-medium">
                                            {quotaStatus.limits.max_analyses_per_month === -1 ? 'Sınırsız' : `${quotaStatus.remainingAnalyses} Analiz`}
                                        </span>
                                    </div>
                                    {quotaStatus.limits.max_analyses_per_month !== -1 && (
                                        <div className="w-24 h-1 bg-secondary rounded-full overflow-hidden mt-1">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all",
                                                    isNearLimit ? "bg-orange-500" : "bg-primary"
                                                )}
                                                style={{ width: `${quotaPercentage}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                                {currentTier === 'free' && quotaStatus.limits.max_analyses_per_month !== -1 && (
                                    <button
                                        onClick={handleWatchAd}
                                        disabled={isWatchingAd}
                                        className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-1 rounded-md hover:bg-primary/30 transition-all disabled:opacity-50 flex items-center gap-1"
                                    >
                                        <Play className="w-2.5 h-2.5" />
                                        {isWatchingAd ? 'İzleniyor...' : '+1 Kazan'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-secondary/50"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full border-2 border-card text-[9px] font-black text-white flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="p-4 border-b border-border bg-accent/5 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm">Bildirimler</p>
                                        {unreadCount > 0 && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-black bg-primary/20 text-primary rounded-full">
                                                {unreadCount} yeni
                                            </span>
                                        )}
                                    </div>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllRead} className="text-[10px] text-primary hover:underline font-semibold">
                                            Tümünü okundu işaretle
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-72 overflow-y-auto">
                                    {notifications.length > 0 ? notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={cn(
                                                "p-4 border-b border-border/50 flex gap-3 items-start",
                                                !n.read && "bg-primary/5"
                                            )}
                                        >
                                            <div className={cn(
                                                "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px]",
                                                n.type === 'success' ? "bg-emerald-500/20 text-emerald-500" :
                                                    n.type === 'warning' ? "bg-orange-500/20 text-orange-500" :
                                                        "bg-primary/20 text-primary"
                                            )}>
                                                <CheckCircle2 className="w-3 h-3" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn("text-sm", !n.read ? "text-foreground font-medium" : "text-muted-foreground")}>{n.text}</p>
                                                {n.time && <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>}
                                            </div>
                                            {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                                        </div>
                                    )) : (
                                        <div className="p-8 text-center text-sm text-muted-foreground">
                                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                            Bildirim yok.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Profile */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-3 pl-4 border-l border-border hover:opacity-80 transition-opacity"
                        >
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium">{displayName}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                    {currentTier === 'free' ? 'Ücretsiz' : currentTier === 'student' ? 'Öğrenci' : 'Akademik'}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-primary/20 overflow-hidden relative border border-primary/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">{initials}</span>
                            </div>
                        </button>

                        {showUserMenu && user && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="p-4 border-b border-border bg-accent/5">
                                    <p className="font-bold text-sm">{displayName}</p>
                                    <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
                                    <div className={cn(
                                        "mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                        currentTier === 'academic' ? "bg-purple-500/20 text-purple-400" :
                                            currentTier === 'student' ? "bg-blue-500/20 text-blue-400" :
                                                "bg-secondary text-muted-foreground"
                                    )}>
                                        {currentTier === 'free' ? 'Ücretsiz Plan' : currentTier === 'student' ? 'Öğrenci Planı' : 'Akademik Plan'}
                                    </div>
                                </div>
                                <div className="p-2">
                                    <Link
                                        href="/settings"
                                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <TrendingUp className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-medium">Paketimi Yükselt</span>
                                    </Link>
                                    {user.is_admin && (
                                        <Link
                                            href="/admin"
                                            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            <span className="text-sm font-medium">Admin Paneli</span>
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors text-left"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-sm font-medium">Çıkış Yap</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Ad Modal */}
            {showAdModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Play className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-1">Reklam İzleniyor</h3>
                            <p className="text-sm text-muted-foreground">
                                Reklam tamamlandığında <span className="text-primary font-bold">+1 Analiz Hakkı</span> kazanacaksınız.
                            </p>
                        </div>

                        {/* Simulated ad content */}
                        <div className="bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-2xl h-32 mb-6 flex items-center justify-center border border-primary/20 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
                            <div className="text-center">
                                <div className="text-2xl font-black text-primary mb-1">📚</div>
                                <p className="text-xs font-bold text-muted-foreground">Özet Asistanı Premium</p>
                                <p className="text-[10px] text-muted-foreground">Sınırsız analiz için paketinizi yükseltin</p>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Reklam yükleniyor...</span>
                                <span className="font-bold text-primary">{Math.round(adProgress)}%</span>
                            </div>
                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-100"
                                    style={{ width: `${adProgress}%` }}
                                />
                            </div>
                        </div>

                        {adProgress < 100 && (
                            <p className="text-center text-xs text-muted-foreground mt-4">
                                Lütfen reklamın bitmesini bekleyin...
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
