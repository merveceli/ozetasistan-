"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Mail, Lock, User, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedPackage, setSelectedPackage] = useState('free');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const packageParam = searchParams.get('package');
        if (packageParam) {
            setSelectedPackage(packageParam);
        }
    }, [searchParams]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
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

            // Sign up the user
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        subscription_tier: selectedPackage,
                    },
                },
            });

            if (signUpError) throw signUpError;

            if (data.session) {
                // User is authenticated immediately
                router.push('/');
                router.refresh();
            } else if (data.user) {
                // Confirmation email sent
                setError('Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.');
            }
        } catch (err: any) {
            console.error('Signup error detail:', err);
            setError(err.message || 'Kayıt olurken bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?package=${selectedPackage}`,
                },
            });

            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Google ile kayıt olurken bir hata oluştu');
        }
    };

    const packages = [
        { id: 'free', name: 'Ücretsiz', price: '₺0', badge: null },
        { id: 'student', name: 'Öğrenci', price: '₺49.90', badge: 'Popüler' },
        { id: 'academic', name: 'Akademik', price: '₺99.90', badge: 'Pro' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl" />

            <div className="relative w-full max-w-2xl">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <Link href="/landing" className="inline-flex items-center space-x-2 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Özet Asistanı
                        </span>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Hesap Oluştur</h1>
                    <p className="text-muted-foreground">Akademik yolculuğunuza bugün başlayın</p>
                </div>

                {/* Signup Card */}
                <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-500">{error}</p>
                        </div>
                    )}

                    {/* Package Selection */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium mb-3">Paket Seçimi</label>
                        <div className="grid grid-cols-3 gap-3">
                            {packages.map((pkg) => (
                                <button
                                    key={pkg.id}
                                    type="button"
                                    onClick={() => setSelectedPackage(pkg.id)}
                                    className={`relative p-4 rounded-xl border-2 transition-all ${selectedPackage === pkg.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border bg-secondary/30 hover:border-primary/50'
                                        }`}
                                >
                                    {pkg.badge && (
                                        <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full font-bold">
                                            {pkg.badge}
                                        </div>
                                    )}
                                    {selectedPackage === pkg.id && (
                                        <CheckCircle2 className="absolute top-2 left-2 w-4 h-4 text-primary" />
                                    )}
                                    <div className="text-center">
                                        <div className="font-bold text-sm mb-1">{pkg.name}</div>
                                        <div className="text-xs text-muted-foreground">{pkg.price}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                                Ad Soyad
                            </label>
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
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                E-posta
                            </label>
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

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-2">
                                    Şifre
                                </label>
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
                                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                    Şifre Tekrar
                                </label>
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
                            className="w-full py-3 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Hesap oluşturuluyor...</span>
                                </>
                            ) : (
                                <span>Hesap Oluştur</span>
                            )}
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-card text-muted-foreground">veya</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleSignup}
                        className="w-full py-3 bg-secondary/50 hover:bg-secondary/70 border border-border rounded-xl font-medium transition-all flex items-center justify-center space-x-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span>Google ile Kayıt Ol</span>
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Zaten hesabın var mı?{' '}
                            <Link href="/auth/login" className="text-primary hover:underline font-medium">
                                Giriş Yap
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .bg-grid {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }
      `}</style>
        </div>
    );
}
