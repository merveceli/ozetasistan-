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

                    <div className="prose prose-invert max-w-none space-y-8 text-foreground/80 leading-relaxed">
                        <section className="space-y-4 bg-card/50 p-8 rounded-3xl border border-border/50 shadow-sm">
                            <h2 className="text-2xl font-bold text-foreground">1. Veri Sorumlusu ve Giriş</h2>
                            <p>
                                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Özet Asistanı ("Platform") olarak, kişisel verilerinizin güvenliğine ve gizliliğine en üst düzeyde önem veriyoruz. Bu politika, platformumuzu kullandığınızda hangi verilerin işlendiğini, hukuki sebeplerini ve haklarınızı detaylandırmaktadır.
                            </p>
                        </section>

                        <section className="space-y-4 bg-card/50 p-8 rounded-3xl border border-border/50">
                            <h2 className="text-2xl font-bold text-foreground">2. İşlenen Veri Kategorileri ve Amaçları</h2>
                            <p>
                                Platformumuz tarafından işlenen veriler, "Veri Minimizasyonu" ilkesine uygun olarak sadece hizmetin sunulması için gerekli olanlarla sınırlıdır:
                            </p>
                            <ul className="list-disc pl-6 space-y-4">
                                <li>
                                    <strong className="text-foreground">Kimlik ve İletişim Bilgileri:</strong>
                                    Hesap oluşturma, kimlik doğrulama ve kullanıcıya özel çalışma alanının (Kütüphanem) oluşturulması amacıyla e-posta adresiniz ve ad-soyad bilgileriniz işlenmektedir.
                                </li>
                                <li>
                                    <strong className="text-foreground">Kullanım Verileri ve Analiz İçerikleri:</strong>
                                    Yüklediğiniz dökümanlar, yapay zeka tarafından sadece talep ettiğiniz analizlerin (özet, sunum, zihin haritası vb.) üretilmesi amacıyla anlık olarak işlenir. <strong>İçerikleriniz asla yapay zeka modellerinin eğitimi için kullanılmaz.</strong>
                                </li>
                                <li>
                                    <strong className="text-foreground">Teknik İşlem Bilgileri:</strong>
                                    IP adresi, log kayıtları ve tarayıcı bilgileri, 5651 sayılı kanun kapsamındaki yükümlülüklerimizin yerine getirilmesi ve sistem güvenliğinin sağlanması amacıyla işlenir.
                                </li>
                            </ul>
                        </section>

                        <section className="space-y-4 bg-card/50 p-8 rounded-3xl border border-border/50">
                            <h2 className="text-2xl font-bold text-foreground">3. Çerezler ve Reklamcılık</h2>
                            <p>
                                Kullanıcı deneyimini optimize etmek ve sürdürülebilir bir hizmet sunabilmek amacıyla Google AdSense üzerinden reklam gösterimi yapılmaktadır:
                            </p>
                            <div className="bg-primary/5 border-l-4 border-primary p-6 my-4 italic rounded-r-2xl text-sm space-y-3">
                                <p className="font-bold text-foreground">Google Reklam Çerezleri Hakkında:</p>
                                <p>Google, kullanıcıların sitemizi ve internetteki diğer siteleri ziyaretlerine dayalı olarak reklam sunmak için çerezlerden yararlanır. Kullanıcılar, kişiselleştirilmiş reklamcılığı devre dışı bırakmak için <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">Google Reklam Ayarlarını</a> kullanabilirler.</p>
                            </div>
                        </section>

                        <section className="space-y-4 bg-card/50 p-8 rounded-3xl border border-border/50">
                            <h2 className="text-2xl font-bold text-foreground">4. Veri Saklama ve İmha</h2>
                            <p>
                                Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca veya ilgili mevzuatta öngörülen kanuni süreler (Genellikle kullanıcı hesabı aktif olduğu sürece) saklanır. Kullanıcı hesabını sildiğinde veya talep ettiğinde, tüm döküman ve analiz verileri sistemimizden <strong>geri döndürülemez şekilde</strong> silinir.
                            </p>
                        </section>

                        <section className="space-y-4 bg-card/50 p-8 rounded-3xl border border-border/50">
                            <h2 className="text-2xl font-bold text-foreground">5. Kullanıcı Hakları (KVKK Madde 11)</h2>
                            <p>Veri sahibi olarak KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm italic">
                                <li>• Verilerinizin işlenip işlenmediğini öğrenme</li>
                                <li>• İşleme amacını ve kullanımını denetleme</li>
                                <li>• Eksik verilerin düzeltilmesini isteme</li>
                                <li>• Verilerin silinmesini veya yok edilmesini talep etme</li>
                                <li>• Veri aktarılan taraflar hakkında bilgi alma</li>
                                <li>• Zararın giderilmesini talep etme</li>
                            </ul>
                        </section>

                        <section className="space-y-4 bg-card/50 p-8 rounded-3xl border border-border/50 text-center">
                            <h2 className="text-2xl font-bold text-foreground">6. Yürürlük ve İletişim</h2>
                            <p>
                                Bu politika platformda yayınlandığı tarihte yürürlüğe girer. Sorularınız için "İletişim" sayfamızdaki kanallar üzerinden veri sorumlusuna ulaşabilirsiniz.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
