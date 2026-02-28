"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Brain,
    BarChart3,
    Activity,
    LogOut,
    Shield,
    ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
    { label: 'Panel', icon: LayoutDashboard, href: '/admin' },
    { label: 'Kullanıcılar', icon: Users, href: '/admin/users' },
    { label: 'Ödemeler', icon: CreditCard, href: '/admin/payments' },
    { label: 'Analizler', icon: Brain, href: '/admin/analyses' },
    { label: 'İstatistikler', icon: BarChart3, href: '/admin/stats' },
    { label: 'Sistem Durumu', icon: Activity, href: '/admin/system' },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-72 h-full bg-[#0a0a0a] border-r border-white/5 flex flex-col shadow-2xl overflow-y-auto flex-shrink-0">
            <div className="p-8">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10">
                        <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter text-white">ASİSTAN</h1>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-[0.3em] italic">Yönetici Paneli</p>
                    </div>
                </div>

                <nav className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary text-white shadow-xl shadow-primary/30 border border-primary/50"
                                        : "text-gray-500 hover:text-white hover:bg-white/[0.03] border border-transparent"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50" />
                                )}
                                <Icon className={cn(
                                    "w-5 h-5 transition-transform duration-500 relative z-10",
                                    isActive ? "scale-110" : "group-hover:scale-110 group-hover:text-primary"
                                )} />
                                <span className="font-bold text-sm tracking-tight relative z-10">{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white] relative z-10" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-8 border-t border-white/5 bg-white/[0.01]">
                <Link
                    href="/"
                    className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 transition-all font-bold group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm">Platforma Dön</span>
                </Link>
            </div>
        </aside>
    );
}
