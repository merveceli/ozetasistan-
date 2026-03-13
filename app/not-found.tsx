'use client';

import Link from 'next/link';
import { Home, Search, BookOpen, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <main className="min-h-screen flex items-center justify-center px-6">
            <div className="text-center max-w-lg">
                {/* Animated 404 */}
                <div className="relative mb-8">
                    <div className="text-[120px] md:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-b from-primary via-purple-400 to-blue-500 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 text-[120px] md:text-[160px] font-black text-primary/10 blur-2xl leading-none select-none">
                        404
                    </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold mb-4">
                    Sayfa Bulunamadı
                </h1>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                    Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
                    Ana sayfaya dönebilir ya da aşağıdaki bağlantıları inceleyebilirsiniz.
                </p>

                {/* Quick Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                    <Link
                        href="/"
                        id="not-found-home"
                        className="flex items-center justify-center gap-2 p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/40 transition-all group"
                    >
                        <Home className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-semibold">Ana Sayfa</span>
                    </Link>
                    <Link
                        href="/blog"
                        id="not-found-blog"
                        className="flex items-center justify-center gap-2 p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/40 transition-all group"
                    >
                        <BookOpen className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-semibold">Blog</span>
                    </Link>
                    <Link
                        href="/landing"
                        id="not-found-landing"
                        className="flex items-center justify-center gap-2 p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/40 transition-all group"
                    >
                        <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-semibold">Özellikler</span>
                    </Link>
                </div>

                <Link
                    href="/landing"
                    id="not-found-cta"
                    className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Başa Dön
                </Link>
            </div>
        </main>
    );
}
