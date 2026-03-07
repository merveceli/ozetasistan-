import React from 'react';
import { Header } from '@/components/Header';
import { Shield } from 'lucide-react';

export const metadata = {
    title: 'Gizlilik Politikası',
    description: 'Özet Asistanı gizlilik politikası ve veri kullanım şartları.',
};

export default function PrivacyPolicy() {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header />
            <div className="flex-1 overflow-y-auto p-6 md:p-12">
                <div className="max-w-4xl mx-auto space-y-8 pb-12">
                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-2">
                            <Shield className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Gizlilik Politikası</h1>
                        <p className="text-muted-foreground">Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
                    </div>

                    <div className="prose prose-invert max-w-none space-y-6 text-foreground/80 leading-relaxed">
                        <section className="space-y-4 bg-card/50 p-6 rounded-2xl border border-border/50">
                            <h2 className="text-xl font-semibold text-foreground">1. Giriş</h2>
                            <p>
                                Özet Asistanı olarak gizliliğinize önem veriyoruz. Bu Gizlilik Politikası, web sitemizi kullandığınızda hangi bilgilerin toplandığını, bunların nasıl kullanıldığını ve güvenliğinin nasıl sağlandığını açıklar.
                            </p>
                        </section>

                        <section className="space-y-4 bg-card/50 p-6 rounded-2xl border border-border/50">
                            <h2 className="text-xl font-semibold text-foreground">2. Toplanan Bilgiler</h2>
                            <p>
                                Hizmetlerimizi sunabilmek için aşağıdaki veri türlerini toplayabiliriz:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Kullanıcı Bilgileri:</strong> Kayıt sırasında paylaştığınız e-posta adresi ve isim.</li>
                                <li><strong>Log Dosyaları:</strong> Birçok standart web sunucusu gibi Özet Asistanı da istatistiksel amaçlı log dosyaları tutmaktadır. Bu dosyalar; IP adresiniz, servis sağlayıcınız, tarayıcınızın özellikleri, işletim sisteminiz ve siteye giriş-çıkış sayfalarınız gibi standart bilgileri içermektedir.</li>
                            </ul>
                        </section>

                        <section className="space-y-4 bg-card/50 p-6 rounded-2xl border border-border/50">
                            <h2 className="text-xl font-semibold text-foreground">3. Çerezler ve Reklamcılık (Google AdSense)</h2>
                            <p>
                                Özet Asistanı, kullanıcı deneyimini iyileştirmek için çerezler (cookies) kullanmaktadır. Ayrıca sitemizde reklam yayınlamak için üçüncü taraf reklam şirketlerini (özellikle Google) kullanmaktayız.
                            </p>
                            <div className="bg-primary/5 border-l-4 border-primary p-4 my-4 italic">
                                <p className="font-medium text-foreground mb-2">Google AdSense ve Çerez Bilgilendirmesi:</p>
                                <ul className="list-disc pl-6 space-y-2 text-sm">
                                    <li>Google dahil üçüncü taraf satıcılar, kullanıcının web sitemize veya diğer web sitelerine yaptığı önceki ziyaretlere dayalı olarak reklam yayınlamak için çerez kullanmaktadır.</li>
                                    <li>Google'ın reklam çerezlerini kullanması, Google ve ortaklarının sitemizi ve/veya internetteki diğer siteleri ziyaret eden kullanıcılarımıza reklam sunmasına olanak tanır.</li>
                                    <li>Kullanıcılar, <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Reklam Ayarları</a> sayfasını ziyaret ederek kişiselleştirilmiş reklamcılığı devre dışı bırakabilirler.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-4 bg-card/50 p-6 rounded-2xl border border-border/50">
                            <h2 className="text-xl font-semibold text-foreground">4. Veri Güvenliği</h2>
                            <p>
                                Verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemlerini uygulamaktayız. Ancak, internet üzerinden iletilen hiçbir yöntemin %100 güvenli olmadığını hatırlatmak isteriz.
                            </p>
                        </section>

                        <section className="space-y-4 bg-card/50 p-6 rounded-2xl border border-border/50">
                            <h2 className="text-xl font-semibold text-foreground">5. İletişim</h2>
                            <p>
                                Gizlilik politikamız ile ilgili her türlü soru, görüş ve önerinizi İletişim sayfamız üzerinden bize iletebilirsiniz.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
