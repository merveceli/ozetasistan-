import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DashboardLayout } from '@/components/DashboardLayout';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';
// import { Sidebar } from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Özet Asistanı',
  description: 'Yapay Zeka Destekli Akademik Asistan',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={cn(inter.className, "bg-background text-foreground antialiased overflow-hidden")}>
        <DashboardLayout>{children}</DashboardLayout>
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}
