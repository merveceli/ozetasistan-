"use client";

import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function BlogCTAButton({
    defaultText = "Ücretsiz Başla",
    className = ""
}: {
    defaultText?: string;
    className?: string;
}) {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
        };
        checkAuth();
    }, []);

    // Yüklenme durumu
    if (isLoggedIn === null) {
        return (
            <button
                disabled
                className={`inline-flex items-center justify-center gap-2 bg-muted text-muted-foreground px-8 py-3.5 rounded-2xl font-bold transition-all ${className}`}
            >
                <Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...
            </button>
        );
    }

    // Giriş yapmış kullanıcılar ana sayfaya sekilir
    if (isLoggedIn) {
        return (
            <Link
                href="/"
                className={`inline-flex items-center justify-center gap-2 bg-emerald-500 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 ${className}`}
            >
                Uygulamaya Dön <ArrowRight className="w-4 h-4" />
            </Link>
        );
    }

    // Standart (ziyaretçi) buton (signup'a atar)
    return (
        <Link
            href="/auth/signup"
            className={`inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 ${className}`}
        >
            {defaultText} <ArrowRight className="w-4 h-4" />
        </Link>
    );
}
