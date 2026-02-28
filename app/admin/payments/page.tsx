"use client";

import { useEffect, useState } from 'react';
import {
    CreditCard,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Clock,
    Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminPayments() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10'
            });
            const response = await fetch(`/api/admin/payments?${params}`);
            const data = await response.json();
            if (data.payments) {
                setPayments(data.payments);
                setTotalCount(data.total);
                setTotalPages(Math.ceil(data.total / 10));
            }
        } catch (error) {
            console.error('Fetch payments error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [page]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                        Ödeme <span className="text-primary italic">Kayıtları</span>
                    </h1>
                    <p className="text-gray-500 font-medium italic">Toplam {totalCount.toLocaleString()} işlem kaydı bulundu.</p>
                </div>
                <button className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
                    <Download className="w-5 h-5" />
                    CSV Olarak İndir
                </button>
            </div>

            {/* Payments Table */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-5 font-black">İşlem ID</th>
                                <th className="px-6 py-5 font-black">Kullanıcı</th>
                                <th className="px-6 py-5 font-black text-center">Tutar</th>
                                <th className="px-6 py-5 font-black text-center">Durum</th>
                                <th className="px-6 py-5 font-black text-right">Tarih</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                                        <span className="text-gray-500 font-medium italic">Ödeme verileri yükleniyor...</span>
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                        Henüz ödeme kaydı bulunmuyor.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-mono text-gray-400">#{payment.id.slice(0, 8)}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white tracking-tight">{payment.profiles?.full_name || 'İsimsiz'}</span>
                                                <span className="text-xs text-gray-500 font-medium italic">{payment.profiles?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-sm font-black text-white">₺{payment.amount}</span>
                                            <p className="text-[10px] text-primary uppercase font-bold tracking-widest">{payment.package_id}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col items-center gap-1">
                                                {payment.status === 'success' ? (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                        <span className="text-[9px] uppercase font-black text-emerald-500 tracking-widest">BAŞARILI</span>
                                                    </>
                                                ) : payment.status === 'failed' ? (
                                                    <>
                                                        <XCircle className="w-4 h-4 text-red-500" />
                                                        <span className="text-[9px] uppercase font-black text-red-500 tracking-widest">BAŞARISIZ</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock className="w-4 h-4 text-yellow-500" />
                                                        <span className="text-[9px] uppercase font-black text-yellow-500 tracking-widest">BEKLEMEDE</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-300 font-medium">{new Date(payment.created_at).toLocaleDateString('tr-TR')}</span>
                                                <span className="text-[10px] text-gray-500 uppercase">{new Date(payment.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
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
