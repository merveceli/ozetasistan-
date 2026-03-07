import React from 'react';
import { Header } from '@/components/Header';
import { Mail, MessageSquare, Send } from 'lucide-react';

export const metadata = {
    title: 'İletişim',
    description: 'Bize ulaşın, öneri ve görüşlerinizi iletin.',
};

export default function Contact() {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header />
            <div className="flex-1 overflow-y-auto p-6 md:p-12">
                <div className="max-w-4xl mx-auto space-y-12 pb-12">
                    {/* Header Section */}
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-2">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight">Bizimle İletişime Geçin</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Her türlü soru, öneri ve geri bildirimleriniz bizim için çok değerli.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Contact Information */}
                        <div className="bg-card border border-border/50 rounded-[2rem] p-8 md:p-12 space-y-8 flex flex-col justify-center">
                            <h2 className="text-3xl font-bold text-foreground">İletişim Bilgileri</h2>
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4 p-4 bg-secondary/30 rounded-2xl">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground uppercase font-semibold">E-posta</p>
                                        <p className="text-xl font-medium tracking-tight">info@ozetasistan.io</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-muted-foreground leading-relaxed italic">
                                Sorularınızı en geç 24 saat içinde yanıtlamaya çalışıyoruz.
                                Akademik işbirlikleri ve büyük ölçekli kullanım için doğrudan e-posta yoluyla bize ulaşabilirsiniz.
                            </p>
                        </div>

                        {/* Contact Form (Decorative for now, but looks premium) */}
                        <div className="bg-gradient-to-br from-primary/5 via-card to-card border border-border/50 rounded-[2rem] p-8 md:p-12 space-y-6">
                            <h2 className="text-3xl font-bold text-foreground mb-4">Mesaj Gönder</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground ml-1">İsim Soyisim</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="w-full bg-background/50 border border-border/50 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground ml-1">E-posta</label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        className="w-full bg-background/50 border border-border/50 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground ml-1">Mesajınız</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Dosya yükleme sorunu yaşıyorum..."
                                        className="w-full bg-background/50 border border-border/50 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                                    />
                                </div>
                                <button className="w-full bg-primary hover:bg-primary/90 text-white p-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center shadow-lg shadow-primary/20 group">
                                    Gönder
                                    <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
