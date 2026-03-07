"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Network,
    MessageSquare,
    Settings,
    LogOut,
    Headphones,
    FlaskConical,
    BrainCircuit,
    ShieldCheck,
    History,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { BannerAd } from '@/components/BannerAd';

const mainNav = [
    { name: 'Ana Panel', href: '/', icon: LayoutDashboard },
    { name: 'Asistan', href: '/asistan', icon: MessageSquare },
    { name: 'Sohbet Geçmişi', href: '/asistan/gecmis', icon: History },
];

const toolsNav = [
    {
        name: 'Zihin Haritası',
        href: '/zihin-haritalari',
        icon: Network,
        badge: 'Yeni',
        color: 'text-violet-400',
    },
    {
        name: 'Focus Radio',
        href: '/focus-radio',
        icon: Headphones,
        badge: 'Yeni',
        color: 'text-blue-400',
    },
    {
        name: 'Sentez Lab',
        href: '/capraz-okuma',
        icon: FlaskConical,
        badge: 'Yeni',
        color: 'text-cyan-400',
    },
    {
        name: 'Çalışma Merkezi',
        href: '/calisma-merkezi',
        icon: BrainCircuit,
        badge: 'Yeni',
        color: 'text-emerald-400',
    },
    {
        name: 'Kaynak Doğrulama',
        href: '/kaynak-dogrulama',
        icon: ShieldCheck,
        badge: 'Yeni',
        color: 'text-orange-400',
    },
];

export function Sidebar() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/user');
                const data = await response.json();
                if (data.user?.is_admin) setIsAdmin(true);
            } catch (err) {
                console.error('Failed to fetch user', err);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    return (
        <div className="flex flex-col h-full w-64 bg-card border-r border-border">
            <Link href="/" className="p-5 flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <Image
                    src="/logo.png"
                    alt="Özet Asistanı Logo"
                    width={36}
                    height={36}
                    className="rounded-lg"
                />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Özet Asistanı
                </span>
            </Link>

            <nav className="flex-1 px-4 overflow-y-auto space-y-6 mt-2 pb-4">
                {/* ─── Ana Bölüm ─── */}
                <div>
                    <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                        Ana
                    </p>
                    <div className="space-y-1">
                        {mainNav.map((item) => (
                            <NavLink key={item.name} item={item} />
                        ))}
                    </div>
                </div>

                {/* ─── Araçlar Bölümü ─── */}
                <div>
                    <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                        Araçlar
                    </p>
                    <div className="space-y-1">
                        {toolsNav.map((item) => (
                            <NavLink key={item.name} item={item} />
                        ))}
                    </div>
                </div>

                {isAdmin && (
                    <div>
                        <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                            Yönetim
                        </p>
                        <div className="space-y-1">
                            <NavLink item={{ name: 'Admin Paneli', href: '/admin', icon: ShieldCheck, color: 'text-primary' }} />
                            <NavLink item={{ name: 'Mesajlar', href: '/admin/messages', icon: MessageSquare, color: 'text-primary' }} />
                        </div>
                    </div>
                )}
            </nav>

            {/* Reklam alanı */}
            <div className="px-4 mb-4">
                <BannerAd variant="adsense" className="min-h-[100px]" />
            </div>

            {/* ─── Bottom: Settings ─── */}
            <div className="p-4 border-t border-border space-y-1">
                <Link
                    href="/settings"
                    className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-colors"
                >
                    <Settings className="w-5 h-5" />
                    <span className="text-sm font-medium">Ayarlar</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors text-left"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Çıkış Yap</span>
                </button>
            </div>
        </div>
    );
}

function NavLink({ item }: { item: any }) {
    const pathname = usePathname();
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
        <Link href={item.href} className="block">
            <div
                className={cn(
                    "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group w-full",
                    isActive
                        ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(124,58,237,0.2)]"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                )}
            >
                <div className="flex items-center space-x-3">
                    <Icon
                        style={{ width: 18, height: 18 }}
                        className={cn(
                            "transition-transform group-hover:scale-110 shrink-0",
                            isActive ? "text-primary" : (item.color ?? "")
                        )}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                </div>

                {item.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
                        {item.badge}
                    </span>
                )}
            </div>
        </Link>
    );
}
