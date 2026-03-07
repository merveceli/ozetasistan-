import React from 'react';
import Link from 'next/link';

export function Footer() {
    return (
        <footer className="mt-auto border-t border-border/50 bg-card/30 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-1 text-center md:text-left">
                        <p className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Özet Asistanı
                        </p>
                        <p className="text-xs text-muted-foreground">
                            © {new Date().getFullYear()} Tüm hakları saklıdır.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-muted-foreground">
                        <Link href="/hakkimizda" className="hover:text-primary transition-colors">
                            Hakkımızda
                        </Link>
                        <Link href="/gizlilik-politikasi" className="hover:text-primary transition-colors">
                            Gizlilik Politikası
                        </Link>
                        <Link href="/iletisim" className="hover:text-primary transition-colors">
                            İletişim
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
