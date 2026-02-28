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
    Globe,
    Clock,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

    const { stats, recentUsers } = data;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                    Sistem <span className="text-primary italic">Özeti</span>
                </h1>
                <p className="text-gray-500 italic">Platformun anlık performansı ve gerçek zamanlı kullanıcı hareketliliği.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Toplam Kullanıcı"
                    value={stats.totalUsers.toLocaleString()}
                    trend="+12%"
                    trendUp={true}
                    icon={Users}
                    description="Tüm zamanlar"
                />
                <StatCard
                    title="Aktif Aboneler"
                    value={stats.activeSubscribers.toLocaleString()}
                    trend="+5%"
                    trendUp={true}
                    icon={CreditCard}
                    description="Pro & Akademik"
                />
                <StatCard
                    title="Aylık Gelir"
                    value={`₺${stats.monthlyRevenue.toLocaleString()}`}
                    trend="+18%"
                    trendUp={true}
                    icon={TrendingUp}
                    description="Son 30 gün"
                />
                <StatCard
                    title="Toplam Analiz"
                    value={stats.totalAnalyses.toLocaleString()}
                    trend="-2%"
                    trendUp={false}
                    icon={FileCheck}
                    description="AI İşlem adedi"
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
                        <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Tümünü Gör</button>
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
                                {recentUsers.map((user: any) => (
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

                {/* System Health */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
                        <h2 className="font-bold text-xl mb-6 flex items-center gap-3">
                            <Activity className="w-5 h-5 text-primary" />
                            Sistem <span className="text-primary italic">Nabzı</span>
                        </h2>

                        <div className="space-y-6">
                            <HealthItem label="Server Uptime" value="99.98%" icon={Globe} color="text-emerald-400" />
                            <HealthItem label="API Latency" value="142ms" icon={Zap} color="text-yellow-400" />
                            <HealthItem label="DB Load" value="12%" icon={Activity} color="text-blue-400" />
                            <HealthItem label="Token Oranı" value="Düşük" icon={Clock} color="text-purple-400" />
                        </div>

                        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Aylık Kota Kullanımı</span>
                                <span className="text-xs font-bold text-primary">78%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '78%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, trendUp, icon: Icon, description }: any) {
    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-primary/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-2xl bg-white/5 group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <div className={cn(
                    "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                    trendUp ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
                )}>
                    {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {trend}
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

function HealthItem({ label, value, icon: Icon, color }: any) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl bg-white/5", color)}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-gray-300">{label}</span>
            </div>
            <span className="font-bold text-sm">{value}</span>
        </div>
    );
}
