"use client";

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/lib/utils'; // Assuming utils exist

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPublicPage = pathname === '/landing' || pathname.startsWith('/auth');
    const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
    const hideSidebar = isPublicPage || isAdminPage;

    return (
        <div className="flex h-screen w-full">
            {/* Sidebar - sadece private sayfalarda */}
            {!hideSidebar && (
                <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 z-50">
                    <Sidebar />
                </aside>
            )}

            {/* Main Content */}
            <main className={cn(
                "flex-1 relative bg-background flex flex-col h-screen overflow-hidden",
                !hideSidebar && "ml-0 md:ml-64" // Sadece private sayfalarda margin
            )}>
                {children}
            </main>
        </div>
    );
}
