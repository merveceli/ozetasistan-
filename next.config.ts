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
  // @ts-ignore - Some versions of Next.js have type mismatches in config
  eslint: {
    ignoreDuringBuilds: true,
  },
  // @ts-ignore
  typescript: {
    ignoreBuildErrors: true,
  },

  // ─── HTTP Security Headers ───────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://adservice.google.com https://partner.googleadservices.com https://tpc.googlesyndication.com https://www.googletagservices.com https://www.google-analytics.com https://www.googletagmanager.com https://securepubads.g.doubleclick.net https://fundingchoicesmessages.google.com;",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
              "font-src 'self' https://fonts.gstatic.com;",
              "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com https://www.google-analytics.com https://www.googletagmanager.com https://fundingchoicesmessages.google.com https://*.doubleclick.net https://*.googlesyndication.com;",
              "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://pagead2.googlesyndication.com https://www.google-analytics.com https://adservice.google.com https://*.google.com https://*.adtrafficquality.google https://*.doubleclick.net https://*.googlesyndication.com https://ep1.adtrafficquality.google;",
              "img-src 'self' data: blob: https://*.supabase.co https://pagead2.googlesyndication.com https://www.google.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://*.gstatic.com https://*.googleapis.com https://*.doubleclick.net https://*.googlesyndication.com;",
              "media-src 'self' blob: data:;",
              "worker-src 'self' blob:;",
            ].join(' '),
          },
          {
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
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
        ],
      },
      {
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
