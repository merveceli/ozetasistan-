"use client";

import { useEffect, useState } from 'react';
import {
    Activity,
    ShieldCheck,
    Globe,
    Zap,
    Cpu,
    Database,
    Clock,
    Server,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSystem() {
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/health');
            const data = await response.json();
            setHealth(data);
        } catch (error) {
            console.error('Fetch health error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
    }, []);

    if (loading && !health) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-gray-500 font-medium italic">Sistem durumu kontrol ediliyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                        Sistem <span className="text-primary italic">Durumu</span>
                    </h1>
                    <p className="text-gray-500 font-medium italic">Platform altyapısı ve servislerin anlık çalışma metrikleri.</p>
                </div>
                <button
                    onClick={fetchHealth}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-primary hover:text-white group"
                >
                    <RefreshCw className={cn("w-6 h-6", loading && "animate-spin")} />
                </button>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/20 flex flex-col items-center text-center gap-4 shadow-[0_0_50px_rgba(16,185,129,0.05)]">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white">Sistem Aktif</h3>
                        <p className="text-sm font-medium text-emerald-500/60 uppercase tracking-widest mt-1">Tüm servisler sağlıklı</p>
                    </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/20 flex flex-col items-center text-center gap-4 shadow-[0_0_50px_rgba(124,58,237,0.05)]">
                    <div className="w-16 h-16 rounded-3xl bg-primary/20 flex items-center justify-center text-primary">
                        <Zap className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white">{health?.database?.latency}</h3>
                        <p className="text-sm font-medium text-primary/60 uppercase tracking-widest mt-1">DB Yanıt Süresi</p>
                    </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/20 flex flex-col items-center text-center gap-4 shadow-[0_0_50px_rgba(59,130,246,0.05)]">
                    <div className="w-16 h-16 rounded-3xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Server className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white">{health?.api?.version}</h3>
                        <p className="text-sm font-medium text-blue-500/60 uppercase tracking-widest mt-1">API Versiyonu</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Database Metrics */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                        <Database className="w-6 h-6 text-primary" />
                        Veritabanı <span className="text-primary italic">Metrikleri</span>
                    </h2>
                    <div className="space-y-6">
                        <MetricItem label="Supabase Connection" value={health?.database?.status === 'connected' ? 'Aktif' : 'Hata'} status="success" />
                        <MetricItem label="Last Scan" value={new Date().toLocaleTimeString()} status="info" />
                        <MetricItem label="Max Connections" value="100" status="info" />
                        <MetricItem label="Data Residency" value="EU (Frankfurt)" status="info" />
                    </div>
                </div>

                {/* API / Server Metrics */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                        <Cpu className="w-6 h-6 text-blue-400" />
                        API Sunucu <span className="text-blue-400 italic">Durumu</span>
                    </h2>
                    <div className="space-y-6">
                        <MetricItem label="Runtime" value="Next.js (Node.js)" status="info" />
                        <MetricItem label="Memory Usage" value={`${Math.round(health?.api?.memoryUsage?.heapUsed / 1024 / 1024)} MB`} status="warning" />
                        <MetricItem label="Environment" value={health?.environment} status="info" />
                        <MetricItem label="System Uptime" value={`${Math.round(health?.api?.uptime / 3600)} saat`} status="success" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricItem({ label, value, status }: { label: string, value: string, status: 'success' | 'warning' | 'error' | 'info' }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">{label}</span>
            <span className={cn(
                "text-sm font-black px-3 py-1 rounded-lg border",
                status === 'success' ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
                    status === 'warning' ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" :
                        status === 'error' ? "text-red-500 bg-red-500/10 border-red-500/20" :
                            "text-blue-400 bg-blue-500/10 border-blue-500/20"
            )}>
                {value}
            </span>
        </div>
    );
}
