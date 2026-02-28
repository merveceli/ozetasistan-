"use client";

import { useEffect, useState } from 'react';
import {
    FileText,
    Search,
    Brain,
    Headphones,
    MessageSquare,
    Network,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: any = {
    'summary': FileText,
    'mindmap': Network,
    'focus-radio': Headphones,
    'chat': MessageSquare,
    'analysis': Brain,
};

export default function AdminAnalyses() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '15'
            });
            const response = await fetch(`/api/admin/analyses?${params}`);
            const data = await response.json();
            if (data.logs) {
                setLogs(data.logs);
                setTotalCount(data.total);
                setTotalPages(Math.ceil(data.total / 15));
            }
        } catch (error) {
            console.error('Fetch analyses error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                    Analiz <span className="text-primary italic">Günlüğü</span>
                </h1>
                <p className="text-gray-500 font-medium italic">Toplam {totalCount.toLocaleString()} işlem kaydı gerçekleştirildi.</p>
            </div>

            {/* Usage Table */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-5 font-black">Özellik</th>
                                <th className="px-6 py-5 font-black">Kullanıcı</th>
                                <th className="px-6 py-5 font-black">Döküman</th>
                                <th className="px-6 py-5 font-black text-center">Token</th>
                                <th className="px-6 py-5 font-black text-right">Tarih</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                                        <span className="text-gray-500 font-medium italic">Analiz verileri yükleniyor...</span>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                        Henüz işlem kaydı bulunmuyor.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => {
                                    const Icon = iconMap[log.feature_name] || Zap;
                                    return (
                                        <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-sm font-bold capitalize text-white tracking-tight">{log.feature_name.replace('-', ' ')}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-200">{log.profiles?.full_name || 'Misafir'}</span>
                                                    <span className="text-xs text-gray-500">{log.profiles?.email || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] block italic">
                                                    {log.documents?.title || 'Genel Soru / Dosyasız'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/5">
                                                    <Zap className="w-3 h-3 text-yellow-500" />
                                                    <span className="text-xs font-black text-white">{log.tokens_used}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-300 font-medium">{new Date(log.created_at).toLocaleDateString('tr-TR')}</span>
                                                    <span className="text-[10px] text-gray-500 uppercase">{new Date(log.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                    <p className="text-xs text-gray-500 font-medium"> Sayfa {page} / {totalPages}</p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl disabled:opacity-30 border border-white/5 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl disabled:opacity-30 border border-white/5 transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
