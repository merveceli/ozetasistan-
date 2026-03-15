"use client";

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function SignupForm() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleGoogleSignup = async () => {
        setIsGoogleLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Google ile kayıt olurken bir hata oluştu');
            setIsGoogleLoading(false);
        }
    };

    const features = [
        "Sınırsız sohbet & analiz",
        "Zihin haritası, sunum oluşturma",
        "Görsel analiz desteği",
        "Sohbet geçmişi",
        "Reklam izleyerek ekstra kredi",
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 md:p-6">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-primary/20 rounded-full blur-3xl opacity-40" />
            <div className="absolute bottom-0 left-0 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-blue-500/10 rounded-full blur-3xl" />

            <div className="relative w-full max-w-xl">
                {/* Logo & Title */}
                <div className="text-center mb-6 md:mb-8">
                    <Link href="/landing" className="inline-flex items-center space-x-3 mb-6">
                        <Image src="/logo.png" alt="Logo" width={44} height={44} className="rounded-xl" />
                        <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Özet Asistanı
                        </span>
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Ücretsiz Hesap Oluştur</h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Akademik yolculuğunuza bugün başlayın — tamamen ücretsiz
                    </p>
                </div>

                {/* Feature list */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                    {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>{f}</span>
                        </div>
                    ))}
                </div>

                {/* Signup Card */}
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
                    {error && (
                        <div className={`mb-5 p-4 rounded-xl flex items-start space-x-3 ${
                            error.includes('başarılı')
                                ? 'bg-emerald-500/10 border border-emerald-500/20'
                                : 'bg-red-500/10 border border-red-500/20'
                        }`}>
                            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${error.includes('başarılı') ? 'text-emerald-500' : 'text-red-500'}`} />
                            <p className={`text-sm ${error.includes('başarılı') ? 'text-emerald-500' : 'text-red-500'}`}>{error}</p>
                        </div>
                    )}

                    <div className="mb-8 text-center">
                        <p className="text-muted-foreground text-sm mb-6">
                            Güvenliğiniz için sadece Google hesabınızla hızlıca hesap oluşturabilirsiniz.
                        </p>

                        {/* Google Sign Up */}
                        <button
                            onClick={handleGoogleSignup}
                            disabled={isGoogleLoading}
                            className="w-full py-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl font-bold transition-all flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl disabled:opacity-60 transform hover:-translate-y-0.5"
                        >
                            {isGoogleLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                            ) : (
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            )}
                            <span className="text-lg">Google ile Hesap Oluştur</span>
                        </button>
                    </div>

                    <div className="pt-6 border-t border-border text-center">
                        <p className="text-sm text-muted-foreground">
                            Zaten hesabın var mı?{' '}
                            <Link href="/auth/login" className="text-primary hover:underline font-bold">
                                Giriş Yap
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <SignupForm />
        </Suspense>
    );
}
