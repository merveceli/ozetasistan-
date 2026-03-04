"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Trash2, Clock, ArrowRight, Bot, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ChatSession {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export default function ChatHistoryPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await fetch('/api/chat/sessions');
            if (response.ok) {
                const data = await response.json();
                setSessions(data.sessions || []);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Bu sohbeti silmek istediğinizden emin misiniz?')) return;

        setDeletingId(sessionId);
        try {
            const response = await fetch('/api/chat/sessions', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId }),
            });

            if (response.ok) {
                setSessions(prev => prev.filter(s => s.id !== sessionId));
                toast.success('Sohbet silindi.');
            } else {
                toast.error('Sohbet silinemedi.');
            }
        } catch (error) {
            toast.error('Bir hata oluştu.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return 'Bugün ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Dün ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        } else if (days < 7) {
            return `${days} gün önce`;
        } else {
            return date.toLocaleDateString('tr-TR');
        }
    };

    const filteredSessions = sessions.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-border bg-card/50 backdrop-blur shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                            Sohbet Geçmişi
                        </h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            {sessions.length} kayıtlı sohbet
                        </p>
                    </div>
                    <Link
                        href="/asistan"
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Yeni Sohbet</span>
                    </Link>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Sohbetlerde ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 bg-secondary/20 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Bot className="w-8 h-8 text-primary/50" />
                        </div>
                        <h3 className="font-semibold mb-2">
                            {searchQuery ? 'Sonuç bulunamadı' : 'Henüz sohbet yok'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            {searchQuery
                                ? 'Farklı bir arama terimi deneyin.'
                                : 'Asistan ile ilk sohbetinizi başlatın!'
                            }
                        </p>
                        {!searchQuery && (
                            <Link
                                href="/asistan"
                                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Sohbet Başlat
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2 md:space-y-3">
                        {filteredSessions.map((session) => (
                            <div
                                key={session.id}
                                className="group relative flex items-center gap-4 p-4 md:p-5 bg-card border border-border hover:border-primary/30 rounded-xl transition-all hover:bg-primary/5 cursor-pointer"
                            >
                                <Link
                                    href={`/asistan?session=${session.id}`}
                                    className="absolute inset-0"
                                />

                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <MessageSquare className="w-5 h-5 text-primary" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm md:text-base truncate pr-2">
                                        {session.title || 'İsimsiz Sohbet'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="w-3 h-3 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(session.updated_at || session.created_at)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-0.5 transition-transform" />
                                    <button
                                        onClick={(e) => handleDelete(session.id, e)}
                                        disabled={deletingId === session.id}
                                        className={cn(
                                            "relative z-10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100",
                                            deletingId === session.id
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                                        )}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
