"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, Loader2, FileText, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function AdminHeader() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            if (searchQuery.length < 2) {
                setResults([]);
                return;
            }

            setSearchLoading(true);
            try {
                const response = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await response.json();
                setResults(data.results || []);
                setShowResults(true);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setSearchLoading(false);
            }
        };

        const timer = setTimeout(performSearch, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    return (
        <header className="h-20 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl flex items-center justify-between px-8 z-30 sticky top-0">
            <div className="flex items-center space-x-4 flex-1" ref={searchRef}>
                <div className="relative w-full max-w-xl">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Kullanıcı, döküman veya analiz ara..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                    />
                    {searchLoading && (
                        <Loader2 className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-spin" />
                    )}

                    {/* Search Results Dropdown */}
                    {showResults && (results.length > 0) && (
                        <div className="absolute top-full mt-2 left-0 right-0 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                                {results.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (item.type === 'user') router.push(`/admin/users?search=${item.email}`);
                                            setShowResults(false);
                                            setSearchQuery('');
                                        }}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 text-gray-500 group-hover:text-primary transition-colors">
                                            {item.type === 'user' ? <UserCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white leading-none mb-1">{item.full_name || item.title}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-mono">{item.type}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <button className="relative p-2.5 text-gray-400 hover:text-white transition-all bg-white/5 border border-white/5 rounded-xl hover:border-white/10">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-[#050505]"></span>
                </button>

                <div className="flex items-center space-x-4 pl-6 border-l border-white/10">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-white uppercase tracking-wider">Sistem Yöneticisi</p>
                        <p className="text-[9px] text-primary italic font-black uppercase tracking-[0.2em] mt-0.5">Role: SuperAdmin</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 p-[1px] shadow-lg shadow-primary/10">
                        <div className="w-full h-full bg-[#050505] rounded-[15px] flex items-center justify-center border border-white/5">
                            <User className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
