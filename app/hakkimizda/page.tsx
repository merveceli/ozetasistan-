import React from 'react';
import { Header } from '@/components/Header';
import { Info, Sparkles, Target, Zap } from 'lucide-react';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hakkımızda — Özet Asistanı Kimdir?',
    description:
        'Özet Asistanı, Türk öğrenci ve akademisyenlerin akademik makaleleri, tezleri ve PDF\'leri saniyeler içinde anlamasını sağlayan yapay zeka platformudur. Misyonumuz, vizyonumuz ve teknolojimiz hakkında.',
    openGraph: {
        title: 'Özet Asistanı Hakkında — AI Destekli Akademik Çalışma Platformu',
        description:
            'Türkiye\'nin en gelişmiş akademik AI asistanı: Gemini AI ile PDF özetleme, flashcard ve sunum üretimi. Misyonumuz ve ekibimiz hakkında bilgi edinin.',
    },
    alternates: {
        canonical: 'https://ozetasistani.com/hakkimizda',
    },
};

export default function AboutUs() {
    const features = [
        {
            icon: <Zap className="w-6 h-6 text-yellow-400" />,
            title: "Hızlı Analiz",
            description: "Yüzlerce sayfalık akademik makaleleri saniyeler içinde analiz eder."
        },
        {
            icon: <Sparkles className="w-6 h-6 text-purple-400" />,
            title: "Yapay Zeka Destekli",
            description: "En gelişmiş Gemini AI modellerini kullanarak size en doğru özetleri sunar."
        },
        {
            icon: <Target className="w-6 h-6 text-emerald-400" />,
            title: "Akademik Odak",
            description: "Öğrenciler ve araştırmacılar için özel olarak optimize edilmiş araçlar içerir."
        }
    ];

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header />
            <div className="flex-1 overflow-y-auto p-6 md:p-12">
                <div className="max-w-4xl mx-auto space-y-12 pb-12">
                    {/* Header Section */}
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-2">
                            <Info className="w-8 h-8" />
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight">Özet Asistanı Nedir?</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Akademik dünyanın bilgi yoğunluğunu aşmak için tasarlanmış, yapay zeka tabanlı bir asistan.
                        </p>
                    </div>

                    {/* Vision Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="p-6 bg-card border border-border/50 rounded-3xl space-y-4 hover:border-primary/30 transition-all group">
                                <div className="p-3 bg-secondary/50 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold">{f.title}</h3>
                                <p className="text-muted-foreground text-sm">{f.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Story Section */}
                    <div className="bg-gradient-to-br from-primary/5 via-card to-card border border-border/50 rounded-[2rem] p-8 md:p-12 space-y-6">
                        <h2 className="text-3xl font-bold text-foreground">Hikayemiz</h2>
                        <div className="prose prose-invert max-w-none text-foreground/80 leading-relaxed text-lg space-y-6">
                            <p>
                                Özet Asistanı, öğrencilerin ve araştırmacıların binlerce sayfalık akademik metinler arasında boğulmasını önlemek amacıyla hayata geçti.
                                Bilginin her geçen gün katlanarak arttığı bu dönemde, kaliteli içeriğe en hızlı şekilde ulaşmak bir lüks değil, zorunluluktur.
                            </p>
                            <p>
                                Biz, en karmaşık teorileri basitleştiren, uzun makalelerden saniyeler içinde anlamlı yapılar kuran ve öğrenme sürecini hızlandıran teknolojik araçlar geliştiriyoruz.
                                Misyonumuz, akademik verimliliği artırmak ve bilginin herkes için daha erişilebilir olmasını sağlamaktır.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
