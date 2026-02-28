"use client";

import { useEffect, useState, useRef } from 'react';
import {
    Users,
    Search,
    Shield,
    Loader2,
    ChevronLeft,
    ChevronRight,
    UserCog,
    CheckCircle2,
    XCircle,
    ChevronDown,
    Coins,
    Calendar,
    RefreshCw,
    AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const TIERS = [
    { id: 'free', label: 'Free', color: 'bg-white/5 text-gray-400 border-white/10' },
    { id: 'student', label: 'Öğrenci', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { id: 'academic', label: 'Akademik', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_12px_rgba(234,179,8,0.08)]' },
];

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedTier, setSelectedTier] = useState('all');
    const [updatingUser, setUpdatingUser] = useState<string | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                search: searchQuery,
                tier: selectedTier,
            });
            const response = await fetch(`/api/admin/users?${params}`);
            const data = await response.json();
            if (data.users) {
                setUsers(data.users);
                setTotalCount(data.total);
                setTotalPages(Math.ceil(data.total / 10));
            }
        } catch (error) {
            console.error('Fetch users error:', error);
            toast.error('Kullanıcılar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, page, selectedTier]);

    // Dropdown dışına tıklayınca kapat
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleUpdateTier = async (userId: string, newTier: string, currentTier: string) => {
        if (newTier === currentTier) {
            setOpenDropdown(null);
            return;
        }
        setUpdatingUser(userId);
        setOpenDropdown(null);
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    updates: {
                        subscription_tier: newTier,
                        subscription_status: 'active',
                    },
                }),
            });

            if (!response.ok) throw new Error('Güncelleme başarısız');

            const tierLabel = TIERS.find(t => t.id === newTier)?.label || newTier;
            toast.success(`Kullanıcı planı "${tierLabel}" olarak güncellendi`);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setUpdatingUser(null);
        }
    };

    const handleAddCredits = async (userId: string, amount: number = 5) => {
        setUpdatingUser(userId);
        try {
            const response = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    updates: { user_credits: amount },
                    action: 'add_credits',
                }),
            });

            if (!response.ok) throw new Error('Kredi eklenemedi');
            toast.success(`${amount} analiz kredisi eklendi`);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setUpdatingUser(null);
        }
    };

    const getTierStyle = (tier: string) => {
        return TIERS.find(t => t.id === tier)?.color || 'bg-white/5 text-gray-400 border-white/10';
    };

    const getTierLabel = (tier: string) => {
        return TIERS.find(t => t.id === tier)?.label || tier;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                        Kullanıcı <span className="text-primary italic">Yönetimi</span>
                    </h1>
                    <p className="text-gray-500">
                        Toplam <span className="text-white font-bold">{totalCount.toLocaleString()}</span> kayıtlı kullanıcı.
                    </p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                    title="Yenile"
                >
                    <RefreshCw className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:rotate-180 transition-all duration-500" />
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="İsim veya e-posta ile ara..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <select
                    className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium transition-all"
                    value={selectedTier}
                    onChange={(e) => {
                        setSelectedTier(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="all" className="bg-black">Tüm Planlar</option>
                    {TIERS.map(t => (
                        <option key={t.id} value={t.id} className="bg-black">{t.label}</option>
                    ))}
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl" ref={dropdownRef}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-white/5 bg-white/[0.02]">
                                <th className="px-6 py-5 font-black">Kullanıcı</th>
                                <th className="px-6 py-5 font-black text-center">Abonelik Planı</th>
                                <th className="px-6 py-5 font-black text-center">Kredi</th>
                                <th className="px-6 py-5 font-black text-center">Durum</th>
                                <th className="px-6 py-5 font-black">Kayıt Tarihi</th>
                                <th className="px-6 py-5 font-black text-right">Aksiyon</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                            <span className="text-gray-500 font-medium animate-pulse">Kullanıcı listesi getiriliyor...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-500">
                                            <AlertCircle className="w-8 h-8" />
                                            <span className="italic">Eşleşen kullanıcı bulunamadı.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                        {/* Kullanıcı */}
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-sm font-bold border border-white/5 shadow-lg">
                                                    {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold flex items-center gap-2 text-white">
                                                        {user.full_name || 'İsimsiz Kullanıcı'}
                                                        {user.is_admin && <Shield className="w-3.5 h-3.5 text-primary" />}
                                                    </p>
                                                    <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Plan Dropdown */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                                                    disabled={updatingUser === user.id}
                                                    className={cn(
                                                        "inline-flex items-center gap-2 text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest border transition-all hover:scale-105",
                                                        getTierStyle(user.subscription_tier || 'free'),
                                                        updatingUser === user.id && "opacity-50 cursor-wait"
                                                    )}
                                                >
                                                    {updatingUser === user.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <>
                                                            {getTierLabel(user.subscription_tier || 'free')}
                                                            <ChevronDown className="w-3 h-3" />
                                                        </>
                                                    )}
                                                </button>

                                                {/* Dropdown Menu */}
                                                {openDropdown === user.id && (
                                                    <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-950 border border-white/15 rounded-2xl p-2 shadow-2xl min-w-[160px] backdrop-blur-xl">
                                                        <p className="text-[9px] uppercase tracking-widest text-gray-600 px-3 py-1 mb-1 font-bold">Plan Seç</p>
                                                        {TIERS.map((tier) => (
                                                            <button
                                                                key={tier.id}
                                                                onClick={() => handleUpdateTier(user.id, tier.id, user.subscription_tier)}
                                                                className={cn(
                                                                    "w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 transition-all",
                                                                    user.subscription_tier === tier.id
                                                                        ? "bg-white/10 text-white"
                                                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                                                )}
                                                            >
                                                                {tier.label}
                                                                {user.subscription_tier === tier.id && (
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Kredi */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Coins className="w-3.5 h-3.5 text-yellow-500" />
                                                <span className="text-sm font-bold text-yellow-400">
                                                    {user.user_credits ?? 0}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Durum */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    user.subscription_status === 'active'
                                                        ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                        : user.subscription_status === 'expired'
                                                            ? "bg-red-500"
                                                            : "bg-yellow-500"
                                                )} />
                                                <span className="text-[10px] uppercase font-bold text-gray-500">
                                                    {user.subscription_status === 'active' ? 'Aktif' :
                                                        user.subscription_status === 'expired' ? 'Süresi Doldu' :
                                                            user.subscription_status || 'aktif'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Kayıt Tarihi */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-300 font-medium">
                                                    {new Date(user.created_at).toLocaleDateString('tr-TR')}
                                                </span>
                                                {user.subscription_end_date && (
                                                    <span className="text-[10px] text-primary/70 uppercase tracking-tighter flex items-center gap-1 mt-0.5">
                                                        <Calendar className="w-2.5 h-2.5" />
                                                        {new Date(user.subscription_end_date).toLocaleDateString('tr-TR')} bitiş
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Aksiyon */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleAddCredits(user.id, 5)}
                                                    disabled={updatingUser === user.id}
                                                    className="p-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-xl transition-all border border-yellow-500/20 text-xs font-bold flex items-center gap-1.5"
                                                    title="+5 Kredi Ekle"
                                                >
                                                    <Coins className="w-3.5 h-3.5" />
                                                    +5
                                                </button>
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
                    <p className="text-xs text-gray-500 font-medium italic">
                        Sayfa <span className="text-primary font-bold">{page}</span> / {totalPages}
                        <span className="ml-2 text-gray-600">({totalCount} kayıt)</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl disabled:opacity-30 border border-white/5 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            disabled={page === totalPages || totalPages === 0}
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
