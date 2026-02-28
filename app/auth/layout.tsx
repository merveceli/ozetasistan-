export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full bg-background flex flex-col">
            {/* Basit Header veya Logo eklenebilir, şimdilik sadece content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                {children}
            </main>
        </div>
    );
}
