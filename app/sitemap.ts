import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ozetasistani.com';

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    // Statik sayfalar
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: `${SITE_URL}/landing`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/auth/login`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/auth/signup`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
    ];

    // Uygulama özellik sayfaları (giriş gerektiriyor ama indekslenebilir)
    const featurePages: MetadataRoute.Sitemap = [
        { url: `${SITE_URL}/calisma-merkezi`, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${SITE_URL}/focus-radio`, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${SITE_URL}/capraz-okuma`, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${SITE_URL}/zihin-haritasi`, changeFrequency: 'weekly', priority: 0.7 },
        { url: `${SITE_URL}/sunum-uret`, changeFrequency: 'weekly', priority: 0.7 },
        { url: `${SITE_URL}/gercek-kontrolu`, changeFrequency: 'weekly', priority: 0.7 },
    ].map(p => ({ ...p, lastModified: now }));

    return [...staticPages, ...featurePages];
}
