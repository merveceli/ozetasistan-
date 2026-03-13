"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

import { Footer } from '@/components/Footer';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const isPublicPage = pathname === '/landing' ||
        pathname.startsWith('/auth') ||
        pathname === '/hakkimizda' ||
        pathname === '/gizlilik-politikasi' ||
        pathname === '/iletisim' ||
        pathname.startsWith('/blog');
    const isAdminPage = pathname.startsWith('/admin');
    const hideSidebar = isPublicPage || isAdminPage;

    return (
        <div className="flex min-h-screen w-full">
            {/* Sidebar - Desktop */}
            {!hideSidebar && (
                <aside className="hidden md:flex flex-col w-64 shrink-0">
                    <Sidebar />
                </aside>
            )}

            {/* Sidebar - Mobile Overlay */}
            {!hideSidebar && isMobileSidebarOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                    {/* Mobile Sidebar */}
                    <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-72 md:hidden animate-in slide-in-from-left duration-300">
                        <Sidebar />
                        <button
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </aside>
                </>
            )}

            {/* Main Content */}
            <main className="flex-1 relative bg-background flex flex-col min-h-screen">
                {/* Mobile hamburger button */}
                {!hideSidebar && (
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="md:hidden absolute top-4 left-4 z-30 p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors shadow-sm"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                )}
                <div className="flex-1">
                    {children}
                </div>
                <Footer />
            </main>
        </div>
    );
}
