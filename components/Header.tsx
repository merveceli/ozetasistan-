"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Bell, Search, LogOut, Zap, TrendingUp, ShieldCheck, X, Play, CheckCircle2, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
    const [remainingAds, setRemainingAds] = useState<number | null>(null);
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const [adProgress, setAdProgress] = useState(0);
    const [showAdModal, setShowAdModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, text: "Hoş geldiniz! Yeni özelliklerimizi keşfedin.", read: false, type: 'info', time: 'Az önce' },
        { id: 2, text: "Görsel ekleme özelliği aktif edildi!", read: false, type: 'success', time: '5 dk önce' },
    ]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const notifRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const adIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchUser();
        fetchRemainingAds();
    }, []);

    useEffect(() => {
        if (showAdModal) {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (err) {
                console.error("AdSense error:", err);
            }
        }
    }, [showAdModal]);


    // Close dropdowns on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Search logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setSearchLoading(true);
                setShowSearchResults(true);
                try {
                    const response = await fetch(`/api/documents?q=${encodeURIComponent(searchQuery)}`);
                    if (response.ok) {
                        const data = await response.json();
                        setSearchResults(data.documents || []);
                    }
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setSearchLoading(false);
                }
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();
            if (data.user) setUser(data.user);
        } catch (err) {
            console.error('Failed to fetch user', err);
        }
    };

    const fetchRemainingAds = async () => {
        try {
            const response = await fetch('/api/watch-ad/remaining');
            if (response.ok) {
                const data = await response.json();
                setRemainingAds(data.remaining);
            }
        } catch (err) {
            console.error('Failed to fetch remaining ads', err);
        }
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/landing');
        router.refresh();
    };

    const handleWatchAd = () => {
        if (remainingAds !== null && remainingAds <= 0) {
            toast.error('Bugünlük reklam hakkınızı kullandınız. Yarın tekrar deneyin.');
            return;
        }
        setShowAdModal(true);
        setAdProgress(0);
        let prog = 0;
        adIntervalRef.current = setInterval(() => {
            prog += 2;
            setAdProgress(prog);
            if (prog >= 100) {
                if (adIntervalRef.current) clearInterval(adIntervalRef.current);
                fetch('/api/watch-ad', { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        setShowAdModal(false);
                        if (data.success) {
                            toast.success('🎉 Tebrikler! +1 Analiz Hakkı kazandınız!');
                            setRemainingAds(data.remaining);
                            addNotification("Reklam izleyerek +1 Analiz Hakkı kazandınız! 🎉", 'success');
                        } else {
                            toast.error(data.error || 'Bir hata oluştu.');
                        }
                    })
                    .catch(() => {
                        setShowAdModal(false);
                        toast.error('Hata oluştu.');
                    })
                    .finally(() => setIsWatchingAd(false));
            }
        }, 60);
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
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <header className="h-16 border-b border-border bg-card/50 backdrop-blur px-4 md:px-6 flex items-center justify-between z-10 shrink-0">
                {/* Logo (mobile) */}
                <Link href="/" className="flex items-center space-x-2 md:hidden">
                    <Image src="/logo.png" alt="Logo" width={28} height={28} className="rounded-md" priority />
                    <span className="font-bold text-sm">Özet Asistanı</span>
                </Link>

                {/* Search */}
                <div className="relative hidden md:block w-72" ref={searchRef}>
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Dokümanlarında ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                        className="w-full bg-secondary/50 border border-border rounded-full pl-10 pr-10 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                    {searchLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Search Results Dropdown */}
                    {showSearchResults && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="max-h-80 overflow-y-auto">
                                {searchResults.length > 0 ? (
                                    <div className="p-2 space-y-1">
                                        <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 mb-1">
                                            Eşleşen Dokümanlar
                                        </p>
                                        {searchResults.map((doc) => (
                                            <button
                                                key={doc.id}
                                                onClick={() => {
                                                    router.push(`/analyze/${doc.id}`);
                                                    setShowSearchResults(false);
                                                    setSearchQuery('');
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-left group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{doc.title}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">{doc.file_type} • {new Date(doc.created_at).toLocaleDateString('tr-TR')}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-20" />
                                        <p className="text-sm text-muted-foreground italic">Sonuç bulunamadı.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-2 md:space-x-4">
                    {/* Watch Ad Button */}
                    <button
                        onClick={handleWatchAd}
                        disabled={isWatchingAd || (remainingAds !== null && remainingAds <= 0)}
                        className={cn(
                            "hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all",
                            remainingAds !== null && remainingAds <= 0
                                ? "bg-secondary/30 text-muted-foreground cursor-not-allowed"
                                : "bg-primary/20 text-primary hover:bg-primary/30"
                        )}
                        title={remainingAds !== null ? `Kalan günlük hak: ${remainingAds}/3` : ''}
                    >
                        <Play className="w-3 h-3" />
                        {isWatchingAd ? 'İzleniyor...' : `+1 Kazan ${remainingAds !== null ? `(${remainingAds}/3)` : ''}`}
                    </button>

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
                            className="flex items-center space-x-2 md:space-x-3 pl-2 md:pl-4 border-l border-border hover:opacity-80 transition-opacity"
                        >
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium">{displayName}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Ücretsiz</p>
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
                                </div>
                                <div className="p-2">
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

                        {/* Actual AdSense content */}
                        <div className="bg-white rounded-2xl h-48 mb-6 flex items-center justify-center border border-primary/20 relative overflow-hidden">
                            <ins
                                className="adsbygoogle w-full h-full block"
                                data-ad-client="ca-pub-1484212824373758"
                                data-ad-format="auto"
                                data-full-width-responsive="true"
                            />
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
