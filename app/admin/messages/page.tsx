"use client";

import { useEffect, useState } from 'react';
import {
    MessageSquare,
    Trash2,
    CheckCircle,
    Clock,
    Mail,
    User,
    Loader2,
    AlertCircle,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminMessages() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/messages');
            if (!response.ok) throw new Error('Mesajlar yüklenemedi');
            const data = await response.json();
            setMessages(data.messages || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleReadStatus = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch('/api/admin/messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_read: !currentStatus })
            });

            if (response.ok) {
                setMessages(messages.map(m => m.id === id ? { ...m, is_read: !currentStatus } : m));
                toast.success('Mesaj durumu güncellendi');
            }
        } catch (err) {
            toast.error('Hata oluştu');
        }
    };

    const deleteMessage = async (id: string) => {
        if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;

        try {
            const response = await fetch(`/api/admin/messages?id=${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setMessages(messages.filter(m => m.id !== id));
                toast.success('Mesaj silindi');
            }
        } catch (err) {
            toast.error('Silme işlemi başarısız');
        }
    };

    const filteredMessages = messages.filter(m =>
        m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-gray-500 font-medium italic">Mesajlar yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                        Gelen <span className="text-primary italic">Mesajlar</span>
                    </h1>
                    <p className="text-gray-500 italic">Kullanıcılardan gelen destek ve iletişim talepleri.</p>
                </div>

                <div className="relative group max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Mesajlarda ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                    />
                </div>
            </div>

            {error ? (
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl flex flex-col items-center gap-4 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <p className="text-gray-400">{error}</p>
                    <button onClick={fetchMessages} className="bg-primary px-6 py-2 rounded-xl text-white font-bold">Tekrar Dene</button>
                </div>
            ) : filteredMessages.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 italic">Henüz mesaj bulunmuyor.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "group relative bg-white/5 border rounded-3xl p-6 transition-all duration-300 hover:border-primary/40",
                                msg.is_read ? "border-white/5 opacity-70" : "border-primary/20 bg-primary/5"
                            )}
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Left: User Info */}
                                <div className="md:w-64 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold border border-white/5">
                                            <User className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{msg.full_name}</p>
                                            <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> {msg.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        {new Date(msg.created_at).toLocaleString('tr-TR', {
                                            day: 'numeric', month: 'long',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                </div>

                                {/* Right: Message Content */}
                                <div className="flex-1 space-y-4">
                                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {msg.message}
                                    </p>

                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            onClick={() => toggleReadStatus(msg.id, msg.is_read)}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                                msg.is_read
                                                    ? "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
                                                    : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                            )}
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            {msg.is_read ? 'Okunmadı İşaretle' : 'Okundu İşaretle'}
                                        </button>
                                        <button
                                            onClick={() => deleteMessage(msg.id)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
