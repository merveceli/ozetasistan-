import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ozetasistani.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    // Statik sayfalar
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: `${SITE_URL}/landing`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/auth/login`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/auth/signup`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        },
        {
            url: `${SITE_URL}/hakkimizda`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        },
        {
            url: `${SITE_URL}/gizlilik-politikasi`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.4,
        },
        {
            url: `${SITE_URL}/iletisim`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
    ];

    // Uygulama özellik sayfaları (giriş gerektiriyor ama indekslenebilir)
    const featurePages: MetadataRoute.Sitemap = [
        { url: `${SITE_URL}/calisma-merkezi`, changeFrequency: 'weekly' as const, priority: 0.85 },
        { url: `${SITE_URL}/focus-radio`, changeFrequency: 'weekly' as const, priority: 0.8 },
        { url: `${SITE_URL}/capraz-okuma`, changeFrequency: 'weekly' as const, priority: 0.85 },
        { url: `${SITE_URL}/zihin-haritalari`, changeFrequency: 'weekly' as const, priority: 0.8 },
        { url: `${SITE_URL}/sunum-uret`, changeFrequency: 'weekly' as const, priority: 0.8 },
        { url: `${SITE_URL}/sentez`, changeFrequency: 'weekly' as const, priority: 0.8 },
        { url: `${SITE_URL}/kaynak-dogrulama`, changeFrequency: 'weekly' as const, priority: 0.75 },
    ].map(p => ({ ...p, lastModified: now }));

    // Blog / İçerik sayfaları (SEO için kritik)
    const blogPages: MetadataRoute.Sitemap = [
        { url: `${SITE_URL}/blog`, changeFrequency: 'weekly' as const, priority: 0.9 },
        { url: `${SITE_URL}/blog/akademik-makale-nasil-ozetlenir`, changeFrequency: 'monthly' as const, priority: 0.8 },
        { url: `${SITE_URL}/blog/yapay-zeka-ile-pdf-analizi`, changeFrequency: 'monthly' as const, priority: 0.8 },
        { url: `${SITE_URL}/blog/flashcard-ile-hizli-ogrenme`, changeFrequency: 'monthly' as const, priority: 0.75 },
        { url: `${SITE_URL}/blog/zihin-haritasi-nedir`, changeFrequency: 'monthly' as const, priority: 0.75 },
        { url: `${SITE_URL}/blog/tez-okuma-teknikleri`, changeFrequency: 'monthly' as const, priority: 0.75 },
        { url: `${SITE_URL}/blog/yapay-zeka-ile-literatur-taramasi`, changeFrequency: 'monthly' as const, priority: 0.8 },
        { url: `${SITE_URL}/blog/pomodoro-teknigi-ile-ders-calisma`, changeFrequency: 'monthly' as const, priority: 0.75 },
        { url: `${SITE_URL}/blog/ingilizce-akademik-metin-cevirisi`, changeFrequency: 'monthly' as const, priority: 0.8 },
        { url: `${SITE_URL}/blog/sinav-kaygisi-nasil-yenilir`, changeFrequency: 'monthly' as const, priority: 0.75 },
        { url: `${SITE_URL}/blog/kurucunun-hikayesi`, changeFrequency: 'monthly' as const, priority: 0.85 },
    ].map(p => ({ ...p, lastModified: now }));

    return [...staticPages, ...featurePages, ...blogPages];
}
