import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // ─── HTTP Security Headers ───────────────────────────────────────────────
  // CSP, AdSense'in doğru çalışması için gerekli domainleri içermeli.
  // Vercel deployment'ında bu header'lar öncelik taşır.
  async headers() {
    return [
      {
        // Tüm sayfalara uygula
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              // Default olarak kendi domainden ve güvenilir kaynaklardan
              "default-src 'self'",

              // Script kaynakları — AdSense için pagead2, partner, tpc domainleri gerekli
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "  https://pagead2.googlesyndication.com",
              "  https://partner.googleadservices.com",
              "  https://www.googletagservices.com",
              "  https://www.google-analytics.com",
              "  https://www.googletagmanager.com",
              "  https://adservice.google.com",
              "  https://securepubads.g.doubleclick.net",
              "  https://tpc.googlesyndication.com",
              "  https://fundingchoicesmessages.google.com",

              // Stil kaynakları
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

              // Font kaynakları
              "font-src 'self' https://fonts.gstatic.com",

              // Frame kaynakları — AdSense iframe'leri için zorunlu
              "frame-src 'self'",
              "  https://googleads.g.doubleclick.net",
              "  https://tpc.googlesyndication.com",
              "  https://www.google.com",
              "  https://www.googletagmanager.com",
              "  https://fundingchoicesmessages.google.com",

              // Connect kaynakları — API çağrıları için
              "connect-src 'self'",
              "  https://*.supabase.co",
              "  https://generativelanguage.googleapis.com",
              "  https://pagead2.googlesyndication.com",
              "  https://www.google-analytics.com",
              "  https://adservice.google.com",

              // Resim kaynakları
              "img-src 'self' data: blob:",
              "  https://*.supabase.co",
              "  https://pagead2.googlesyndication.com",
              "  https://www.google.com",
              "  https://www.googletagmanager.com",
              "  https://googleads.g.doubleclick.net",
              "  https://*.gstatic.com https://*.googleapis.com",

              // Media
              "media-src 'self' blob: data:",

              // Worker (Next.js için)
              "worker-src 'self' blob:",
            ].join(' '),
          },
          {
            // X-Frame-Options: AdSense renderini engelleyebileceği için SAMEORIGIN kullan
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Permissions Policy — reklamların çalışması için geosensor engellenmesin
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
        ],
      },
      {
        // ads.txt'nin doğru MIME type ile serve edilmesi
        source: '/ads.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
