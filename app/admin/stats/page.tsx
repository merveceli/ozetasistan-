"use client";

import { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import {
    BarChart3,
    TrendingUp,
    Users,
    Zap,
    Loader2,
    ArrowUpRight,
    RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TIER_COLORS: Record<string, string> = {
    'Ücretsiz': '#6b7280',
    'Öğrenci': '#3b82f6',
    'Akademik': '#eab308',
};

const FEATURE_COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminStats() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        setRefreshing(true);
        try {
            const response = await fetch('/api/admin/stats/charts');
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Stats error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-gray-500 font-medium italic">Veriler analiz ediliyor...</p>
            </div>
        );
    }

    const totalFeatureUsage = (data?.featureStats || []).reduce(
        (acc: number, f: any) => acc + (f.count || 0), 0
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                        Gelişmiş <span className="text-primary italic">İstatistikler</span>
                    </h1>
                    <p className="text-gray-500 font-medium italic">Kullanım alışkanlıkları ve büyüme metrikleri.</p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-medium text-gray-400 hover:text-white transition-all"
                >
                    <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                    Yenile
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Günlük Aktivite */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <BarChart3 className="w-6 h-6 text-primary" />
                            Günlük <span className="text-primary italic">Aktivite</span>
                        </h2>
                        <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
                            <span>Son 7 gün</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.chartData || []}>
                                <defs>
                                    <linearGradient id="colorAnaliz" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#555"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#555"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#999' }}
                                    formatter={(value: any, name: any) => [value, name === 'analiz' ? 'Analiz' : 'Toplam']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="analiz"
                                    stroke="#7c3aed"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAnaliz)"
                                    name="Analiz"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    {totalFeatureUsage === 0 && (
                        <p className="text-center text-xs text-gray-600 mt-4 italic">
                            Henüz yeterli kullanım verisi yok — feature_usage_logs tablosu doluyor...
                        </p>
                    )}
                </div>

                {/* Kullanıcı Dağılımı */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                        <Users className="w-6 h-6 text-blue-400" />
                        Kullanıcı <span className="text-blue-400 italic">Dağılımı</span>
                    </h2>
                    {(data?.tierChartData || []).length > 0 ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.tierChartData || []} barCategoryGap="35%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#555"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#555"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value: any) => [value, 'Kullanıcı']}
                                    />
                                    <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={70}>
                                        {(data?.tierChartData || []).map((entry: any) => (
                                            <Cell
                                                key={entry.name}
                                                fill={TIER_COLORS[entry.name] || '#7c3aed'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-600 italic text-sm">
                            Henüz kullanıcı verisi yok
                        </div>
                    )}
                </div>
            </div>

            {/* Popüler Özellikler */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <Zap className="w-6 h-6 text-yellow-400" />
                        Popüler <span className="text-yellow-400 italic">Özellikler</span>
                    </h2>
                    <span className="text-xs text-gray-500 font-medium">
                        Toplam {totalFeatureUsage.toLocaleString()} kullanım (7g)
                    </span>
                </div>

                {(data?.featureStats || []).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.featureStats.map((feature: any, idx: number) => (
                            <FeatureStat
                                key={feature.label}
                                label={feature.label}
                                percentage={feature.percentage}
                                count={feature.count}
                                color={FEATURE_COLORS[idx % FEATURE_COLORS.length]}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: 'Özetleme', note: 'feature: "summary"' },
                            { label: 'Zihin Haritası', note: 'feature: "mindmap"' },
                            { label: 'Focus Radio', note: 'feature: "focus-radio"' },
                        ].map((f) => (
                            <div key={f.label} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold uppercase tracking-widest text-gray-500">{f.label}</span>
                                    <span className="text-xs text-gray-700">—</span>
                                </div>
                                <div className="w-full h-3 bg-white/5 rounded-full border border-white/5">
                                    <div className="h-full w-0 bg-gray-700 rounded-full" />
                                </div>
                                <p className="text-[10px] text-gray-700 italic">{f.note} logu bekleniyor</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function FeatureStat({ label, percentage, count, color }: any) {
    return (
        <div className="space-y-3 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
            <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-gray-300">{label}</span>
                <div className="text-right">
                    <span className="text-lg font-black text-white">{percentage}%</span>
                    <p className="text-[10px] text-gray-600">{count} kullanım</p>
                </div>
            </div>
            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}
