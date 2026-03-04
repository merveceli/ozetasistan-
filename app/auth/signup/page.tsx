"use client";

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function SignupForm() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }
        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır');
            return;
        }

        setIsLoading(true);
        try {
            const supabase = createClient();
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName },
                },
            });

            if (signUpError) throw signUpError;

            if (data.session) {
                router.push('/');
                router.refresh();
            } else if (data.user) {
                setError('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.');
            }
        } catch (err: any) {
            setError(err.message || 'Kayıt olurken bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

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

                    {/* Google Sign Up */}
                    <button
                        onClick={handleGoogleSignup}
                        disabled={isGoogleLoading}
                        className="w-full py-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl font-semibold transition-all flex items-center justify-center space-x-3 mb-6 shadow-sm disabled:opacity-60"
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        <span>Google ile Devam Et</span>
                    </button>

                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-card text-muted-foreground">veya e-posta ile kayıt ol</span>
                        </div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium mb-2">Ad Soyad</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Adınız Soyadınız"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">E-posta</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ornek@email.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-2">Şifre</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Tekrar</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Hesap oluşturuluyor...</span>
                                </>
                            ) : (
                                <span>Ücretsiz Hesap Oluştur</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-5 text-center">
                        <p className="text-sm text-muted-foreground">
                            Zaten hesabın var mı?{' '}
                            <Link href="/auth/login" className="text-primary hover:underline font-medium">
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
