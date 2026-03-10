import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AdSenseScript } from '@/components/AdSenseScript';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ozetasistani.com';
const SITE_NAME = 'Özet Asistanı';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  // ─── Temel ──────────────────────────────────────────────────────────────────
  title: {
    default: 'Özet Asistanı — AI Destekli Akademik PDF Analiz Aracı',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Türkçe PDF, makale ve akademik dokümanları saniyeler içinde özetleyen, flashcard ve sunum üreten yapay zeka asistanı. Öğrenci ve akademisyenler için tasarlandı.',
  keywords: [
    'pdf özetleme', 'akademik makale analizi', 'türkçe yapay zeka', 'AI özet',
    'makale özetleme', 'flashcard oluşturma', 'akademik asistan', 'pdf analiz',
    'yapay zeka öğrenci', 'otomatik sunum', 'zihin haritası', 'çapraz okuma',
    'Gemini AI', 'ödev yardımcısı', 'araştırma asistanı',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'education',

  // ─── Robots / İndexleme ──────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ─── OpenGraph (Sosyal Medya) ────────────────────────────────────────────────
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Özet Asistanı — Türkçe PDF & Makale Analizi',
    description:
      'Binlerce sayfalık akademik içeriği anında özetleyen, flashcard ve sunum üreten Türkçe yapay zeka asistanı.',
    images: [
      {
        url: `${SITE_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: 'Özet Asistanı — AI Destekli Akademik Asistan',
        type: 'image/png',
      },
    ],
  },

  // ─── Twitter / X Card ────────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'Özet Asistanı — AI Destekli Akademik PDF Analizi',
    description: 'PDF, makale ve akademik dokümanları anında özetleyen Türkçe yapay zeka asistanı.',
    images: [`${SITE_URL}/og-image.png`],
    creator: '@ozetasistani',
  },

  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/logo.png',
  },

  // ─── Manifest (PWA) ──────────────────────────────────────────────────────────
  // manifest: '/site.webmanifest', -> Artık otomatik app/manifest.ts kullanılıyor

  // ─── Verification ─────────────────────────────────────────────────────────────
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },

  // ─── AdSense ──────────────────────────────────────────────────────────────────
  other: {
    'google-adsense-account': 'ca-pub-1484212824373758',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: "dark" class SSR/CSR arasında uyumsuzluk yaratabilir
    <html lang="tr" className="dark" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-background text-foreground antialiased")}>
        <DashboardLayout>{children}</DashboardLayout>
        <Toaster richColors position="top-right" theme="dark" />

        {/* 
          Manuel AdSense Script Yükleyici:
          Next.js Script bileşeni AdSense tarafından reddedilen metadata'lar eklediği için
          saf bir manuel enjeksiyon yapıyoruz.
        */}
        <AdSenseScript />
      </body>
    </html>
  );
}

