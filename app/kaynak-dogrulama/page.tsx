import SmartSummary from '@/components/SmartSummary';

export const metadata = {
    title: 'Kaynak Doğrulama — Özet Asistanı',
    description: 'Akademik metinlerdeki bilgileri yapay zeka ile doğrulayın ve otomatik kaynakça oluşturun.',
};

export default function KaynakDogrulamaPage() {
    return (
        <div className="flex-1 overflow-y-auto p-8 min-h-screen bg-[#030014]">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black tracking-tight text-white mb-3">
                        Kaynak Doğrulama & Atıf
                    </h1>
                    <p className="text-white/50 text-lg max-w-xl mx-auto">
                        Metin içindeki her iddiayı yapay zeka ile doğrulayın. Hover'la kaynağa ulaşın, tek tıkla APA/MLA atıf oluşturun.
                    </p>
                </div>
                <SmartSummary />
            </div>
        </div>
    );
}
