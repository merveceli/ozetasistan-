import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ozetasistani.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                // Genel arama botları — landing ve özellik sayfaları açık
                userAgent: '*',
                allow: [
                    '/',
                    '/landing',
                    '/auth/login',
                    '/auth/signup',
                    '/calisma-merkezi',
                    '/focus-radio',
                    '/capraz-okuma',
                    '/zihin-haritasi',
                    '/sunum-uret',
                    '/gercek-kontrolu',
                ],
                disallow: [
                    '/admin',
                    '/api/',
                    '/auth/callback',
                    '/auth/auth-code-error',
                    '/analyze/',        // Kişisel analiz sayfaları gizli
                    '/_next/',
                ],
            },
            {
                // Google AI (Bard, AI Mode, Gemini) — içerik özetlemede kullanmasını sınırla
                // AIzaSy… değil, bot tanımlayıcısı budur
                userAgent: 'Google-Extended',
                disallow: '/',  // Google AI'ın içeriği eğitim verisi olarak kullanmasını engelle
            },
            {
                // Bing AI (Copilot) crawler
                userAgent: 'GPTBot',
                disallow: '/',
            },
            {
                // ChatGPT tarayıcısı
                userAgent: 'ChatGPT-User',
                disallow: '/',
            },
            {
                // Anthropic Claude
                userAgent: 'anthropic-ai',
                disallow: '/',
            },
            {
                // Common Crawl (büyük veri seti tarayıcıları)
                userAgent: 'CCBot',
                disallow: '/',
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
