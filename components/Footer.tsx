import React from 'react';
import Link from 'next/link';
import { BookOpen, Cpu, ArrowRight, Network, Users } from 'lucide-react';

export function Footer() {
    return (
        <footer className="mt-auto pt-16 pb-10 border-t border-border/50 bg-card/20 backdrop-blur-xl relative z-20">
            <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-5 gap-12">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            Özet Asistanı
                        </span>
                    </div>
                    <p className="max-w-xs text-muted-foreground text-sm mb-8 leading-relaxed">
                        Akademik araştırma süreçlerini otomatize eden, öğrenci ve akademisyenlere özel akıllı üretkenlik yapay zekası.
                    </p>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-4 md:col-start-3">
                    <h5 className="font-black mb-6 uppercase tracking-widest text-[10px] text-muted-foreground">Uygulama Özellikleri</h5>
                    <div className="grid grid-cols-2 gap-4">
                        <ul className="space-y-4 text-sm font-medium text-muted-foreground relative">
                            <li className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Öğrenci Modu
                            </li>
                            <li className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Akademik Mod
                            </li>
                            <li className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Profesör Modu
                            </li>
                            <li className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Çalışma Merkezi
                            </li>
                        </ul>
                        <ul className="space-y-4 text-sm font-medium text-muted-foreground relative">
                            <li className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Odak Radyosu
                            </li>
                            <li className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Sentez Lab
                            </li>
                            <li className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Zihin Haritaları
                            </li>
                            <li className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Otomatik Sunum
                            </li>
                        </ul>
                    </div>
                </div>

                <div>
                    <h5 className="font-black mb-6 uppercase tracking-widest text-[10px] text-emerald-500/80">Geliştirici</h5>
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all group cursor-pointer shadow-lg">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                                <Cpu className="w-4 h-4 text-emerald-500 group-hover:animate-pulse" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-foreground truncate">Geliştirici Ekip</p>
                                <p className="text-[8px] text-emerald-500/60 uppercase tracking-widest font-black">AI ASİSTAN</p>
                            </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Akademik öğrenimi yapay zeka ile dönüştürme vizyonuyla tasarlandı.
                        </p>
                        <Link href="/iletisim" className="mt-4 inline-flex items-center text-[10px] font-bold text-emerald-500 hover:text-emerald-400">
                            İletişime Geçin <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-8">
                <p className="text-[10px] text-muted-foreground font-black tracking-widest uppercase flex-1">
                    © {new Date().getFullYear()} ÖZET ASİSTANI. TÜM HAKLARI SAKLIDIR.
                </p>

                <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                    <Link href="/hakkimizda" className="hover:text-primary transition-colors">Hakkımızda</Link>
                    <Link href="/gizlilik-politikasi" className="hover:text-primary transition-colors">Gizlilik Politikası</Link>
                    <Link href="/iletisim" className="hover:text-primary transition-colors">İletişim</Link>
                </div>

                <div className="flex space-x-6 text-muted-foreground">
                    <Link href="#" className="hover:text-foreground transition-colors"><Network className="w-4 h-4" /></Link>
                    <Link href="#" className="hover:text-foreground transition-colors"><Users className="w-4 h-4" /></Link>
                </div>
            </div>
        </footer>
    );
}
