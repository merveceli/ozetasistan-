"use client";

import { useEffect, useState } from 'react';
import {
    Users,
    TrendingUp,
    CreditCard,
    FileCheck,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    BookOpen,
    Network,
    Mic,
    Globe,
    Brain,
    Layers,
    AlertCircle,
    Loader2,
    Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const FEATURE_META: Record<string, { label: string; icon: any; color: string }> = {
    summary: { label: 'Özet', icon: FileCheck, color: 'text-emerald-400 bg-emerald-400/10' },
    mindmap: { label: 'Zihin Haritası', icon: Network, color: 'text-blue-400 bg-blue-400/10' },
    'focus-radio': { label: 'Odak Radyo', icon: Mic, color: 'text-pink-400 bg-pink-400/10' },
    compare: { label: 'Karşılaştır', icon: Layers, color: 'text-orange-400 bg-orange-400/10' },
    sentez: { label: 'Sentez', icon: Brain, color: 'text-purple-400 bg-purple-400/10' },
    'web-scrape': { label: 'Web Tarama', icon: Globe, color: 'text-cyan-400 bg-cyan-400/10' },
    kaynak: { label: 'Kaynak', icon: BookOpen, color: 'text-yellow-400 bg-yellow-400/10' },
};

function getFeatureMeta(name: string) {
    return FEATURE_META[name] ?? { label: name, icon: Zap, color: 'text-gray-400 bg-gray-400/10' };
}

function timeAgo(dateStr: string): string {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s önce`;
    if (diff < 3600) return `${Math.floor(diff / 60)}d önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}sa önce`;
    return `${Math.floor(diff / 86400)}g önce`;
}

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats');
                if (!response.ok) throw new Error('İstatistikler yüklenemedi');
                const result = await response.json();
                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-gray-500 font-medium italic">Sistem verileri hazırlanıyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl flex flex-col items-center gap-4 text-center">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">Hata Oluştu</h3>
                    <p className="text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    const { stats, recentUsers, recentActivity } = data;

    const formatTrend = (val: number) => {
        if (val === null || val === undefined) return { label: '—', up: null };
        const sign = val > 0 ? '+' : '';
        return { label: `${sign}${val}%`, up: val >= 0 };
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                        Sistem <span className="text-primary italic">Özeti</span>
                    </h1>
                    <p className="text-gray-500 italic">Platformun anlık performansı ve gerçek zamanlı kullanıcı hareketliliği.</p>
                </div>
                <Link
                    href="/admin/messages"
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 group"
                >
                    <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Mesajları Görüntüle
                    {stats.unreadMessages > 0 && (
                        <span className="bg-white text-primary px-2 py-0.5 rounded-full text-[10px] ml-1 animate-pulse">
                            {stats.unreadMessages} Yeni
                        </span>
                    )}
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Toplam Kullanıcı"
                    value={stats.totalUsers.toLocaleString()}
                    trend={formatTrend(stats.trendUsers)}
                    icon={Users}
                    description="Tüm zamanlar"
                />
                <StatCard
                    title="Aktif Aboneler"
                    value={stats.activeSubscribers.toLocaleString()}
                    trend={formatTrend(stats.trendSubscribers)}
                    icon={CreditCard}
                    description="Pro & Akademik"
                />
                <StatCard
                    title="Toplam Analiz"
                    value={stats.totalAnalyses.toLocaleString()}
                    trend={formatTrend(stats.trendAnalyses)}
                    icon={FileCheck}
                    description="Son 30 gün"
                />
                <StatCard
                    title="Gelen Mesajlar"
                    value={stats.totalMessages.toLocaleString()}
                    trend={{ label: `${stats.unreadMessages} okunmadı`, up: stats.unreadMessages > 0 ? false : null }}
                    icon={MessageSquare}
                    description="Destek & İletişim"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Users Table */}
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="font-bold text-xl flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            Son <span className="text-primary italic">Kullanıcılar</span>
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/5">
                                    <th className="px-6 py-4 font-black">Kullanıcı</th>
                                    <th className="px-6 py-4 font-black">Paket</th>
                                    <th className="px-6 py-4 font-black">Kayıt Tarihi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-sm">
                                            Henüz kullanıcı yok
                                        </td>
                                    </tr>
                                ) : recentUsers.map((user: any) => (
                                    <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[10px] font-bold border border-white/5">
                                                    {user.full_name?.charAt(0) || user.email?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold group-hover:text-primary transition-colors">{user.full_name || 'İsimsiz'}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-wider",
                                                user.subscription_tier === 'academic' ? "bg-primary/20 text-primary" :
                                                    user.subscription_tier === 'student' ? "bg-blue-500/20 text-blue-400" :
                                                        "bg-gray-500/20 text-gray-400"
                                            )}>
                                                {user.subscription_tier}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                    <h2 className="font-bold text-xl mb-5 flex items-center gap-3">
                        <Activity className="w-5 h-5 text-primary" />
                        Son <span className="text-primary italic">Aktivite</span>
                    </h2>

                    <div className="space-y-3 relative z-10">
                        {recentActivity?.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">Henüz aktivite yok</p>
                        ) : recentActivity?.map((log: any) => {
                            const meta = getFeatureMeta(log.feature_name);
                            const IconComp = meta.icon;
                            const profile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
                            return (
                                <div key={log.id} className="flex items-start gap-3 group">
                                    <div className={cn("p-2 rounded-xl flex-shrink-0 mt-0.5", meta.color)}>
                                        <IconComp className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-white truncate">
                                            {profile?.full_name || profile?.email || 'Bilinmeyen'}
                                        </p>
                                        <p className="text-[10px] text-gray-400">
                                            {meta.label}
                                            {log.tokens_used > 0 && (
                                                <span className="ml-1 text-gray-600">· {log.tokens_used.toLocaleString()} token</span>
                                            )}
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-gray-600 flex-shrink-0 mt-0.5">
                                        {timeAgo(log.created_at)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon: Icon, description }: {
    title: string;
    value: string;
    trend: { label: string; up: boolean | null };
    icon: any;
    description: string;
}) {
    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-primary/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-2xl bg-white/5 group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <div className={cn(
                    "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                    trend.up === true ? "text-emerald-400 bg-emerald-400/10" :
                        trend.up === false ? "text-red-400 bg-red-400/10" :
                            "text-gray-500 bg-gray-500/10"
                )}>
                    {trend.up === true ? <ArrowUpRight className="w-3 h-3" /> :
                        trend.up === false ? <ArrowDownRight className="w-3 h-3" /> :
                            <Minus className="w-3 h-3" />}
                    {trend.label}
                </div>
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-2">{description}</p>
            </div>
        </div>
    );
}
