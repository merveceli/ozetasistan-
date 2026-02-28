import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Network,
    MessageSquare,
    Settings,
    LogOut,
    Hexagon,
    Lock,
    Sparkles,
    Headphones,
    FlaskConical,
    BrainCircuit,
    ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UpgradeModal } from './modals/UpgradeModal';

const mainNav = [
    { name: 'Ana Panel', href: '/', icon: LayoutDashboard },
    { name: 'Asistan', href: '/asistan', icon: MessageSquare },
];

const toolsNav = [
    {
        name: 'Zihin Haritası',
        href: '/zihin-haritalari',
        icon: Network,
        badge: 'Yeni',
        color: 'text-violet-400',
    },
    {
        name: 'Focus Radio',
        href: '/focus-radio',
        icon: Headphones,
        badge: 'Yeni',
        color: 'text-blue-400',
    },
    {
        name: 'Sentez Lab',
        href: '/capraz-okuma',
        icon: FlaskConical,
        badge: 'Yeni',
        color: 'text-cyan-400',
    },
    {
        name: 'Çalışma Merkezi',
        href: '/calisma-merkezi',
        icon: BrainCircuit,
        badge: 'Yeni',
        color: 'text-emerald-400',
    },
    {
        name: 'Kaynak Doğrulama',
        href: '/kaynak-dogrulama',
        icon: ShieldCheck,
        badge: 'Yeni',
        color: 'text-orange-400',
    },
];

export function Sidebar() {
    const router = useRouter();
    const [user, setUser] = useState<{ subscription_tier: string } | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/user');
                const data = await response.json();
                if (data.user) setUser(data.user);
            } catch (err) {
                console.error('Failed to fetch user', err);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        router.push('/auth/login');
    };

    return (
        <div className="flex flex-col h-full w-64 bg-card border-r border-border">
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                feature={selectedFeature}
            />

            <Link href="/" className="p-6 flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Hexagon className="w-5 h-5 text-primary-foreground fill-current" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Özet Asistanı
                </span>
            </Link>

            <nav className="flex-1 px-4 overflow-y-auto space-y-6 mt-2 pb-4">
                {/* ─── Ana Bölüm ─── */}
                <div>
                    <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                        Ana
                    </p>
                    <div className="space-y-1">
                        {mainNav.map((item) => (
                            <NavLink
                                key={item.name}
                                item={item}
                                userTier={user?.subscription_tier || 'free'}
                                onRestrictedClick={(name) => {
                                    setSelectedFeature(name);
                                    setShowUpgradeModal(true);
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* ─── Araçlar Bölümü ─── */}
                <div>
                    <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                        Araçlar
                    </p>
                    <div className="space-y-1">
                        {toolsNav.map((item) => (
                            <NavLink
                                key={item.name}
                                item={item}
                                userTier={user?.subscription_tier || 'free'}
                                onRestrictedClick={(name) => {
                                    setSelectedFeature(name);
                                    setShowUpgradeModal(true);
                                }}
                            />
                        ))}
                    </div>
                </div>
            </nav>

            {/* ─── Bottom: Tier + Settings ─── */}
            <div className="p-4 border-t border-border space-y-1">
                {user && (
                    <div className="px-4 py-2 mb-2">
                        <span className={cn(
                            "inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                            user.subscription_tier === 'academic'
                                ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                                : user.subscription_tier === 'student'
                                    ? 'bg-primary/15 text-primary border border-primary/20'
                                    : 'bg-white/5 text-muted-foreground border border-border'
                        )}>
                            <Sparkles className="w-3 h-3" />
                            {user.subscription_tier === 'academic' ? 'Akademik Plan'
                                : user.subscription_tier === 'student' ? 'Öğrenci Planı'
                                    : 'Ücretsiz Plan'}
                        </span>
                    </div>
                )}
                <Link
                    href="/settings"
                    className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-colors"
                >
                    <Settings className="w-5 h-5" />
                    <span className="text-sm font-medium">Ayarlar</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors text-left"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Çıkış Yap</span>
                </button>
            </div>
        </div>
    );
}

function NavLink({ item, userTier, onRestrictedClick }: {
    item: any;
    userTier: string;
    onRestrictedClick: (name: string) => void;
}) {
    const pathname = usePathname();
    const isActive = pathname === item.href;

    const isLocked = item.requiredTier && (
        (item.requiredTier === 'student' && userTier === 'free') ||
        (item.requiredTier === 'academic' && userTier !== 'academic')
    );

    const Icon = item.icon;

    const content = (
        <div
            className={cn(
                "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group w-full",
                isActive
                    ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(124,58,237,0.2)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                isLocked && "opacity-60"
            )}
        >
            <div className="flex items-center space-x-3">
                <Icon
                    style={{ width: 18, height: 18 }}
                    className={cn(
                        "transition-transform group-hover:scale-110 shrink-0",
                        isActive ? "text-primary" : (item.color ?? "")
                    )}
                />
                <span className="text-sm font-medium">{item.name}</span>
            </div>

            <div className="flex items-center gap-1.5">
                {item.badge && !isLocked && (
                    <span className={cn(
                        "text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wider",
                        item.badge === 'Pro'
                            ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"
                            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                    )}>
                        {item.badge}
                    </span>
                )}
                {isLocked && (
                    <Lock className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                )}
                {item.requiredTier === 'academic' && !isLocked && (
                    <Sparkles className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                )}
            </div>
        </div>
    );

    if (isLocked) {
        return (
            <button onClick={() => onRestrictedClick(item.name)} className="w-full text-left">
                {content}
            </button>
        );
    }

    return (
        <Link href={item.href} className="block">
            {content}
        </Link>
    );
}
