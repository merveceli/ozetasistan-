"use client";

import { useEffect, useState, useCallback } from 'react';
import {
    User, Palette, HardDrive, Cpu, ExternalLink,
    Loader2, Moon, Sun, Globe, AlignLeft, Languages,
    Save, Check
} from "lucide-react";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

// ─── Ayar tipleri ─────────────────────────────────────────────────────────────
interface UserSettings {
    summaryLength: 'short' | 'medium' | 'detailed';
    summaryLanguage: 'tr' | 'en';
    darkMode: boolean;
    animations: boolean;
}

interface QuotaStatus {
    limits: { max_documents: number; max_analyses_per_month: number; max_storage_mb: number };
    usage: { documents_uploaded: number; analyses_completed: number; storage_used_mb: number };
}

const DEFAULT_SETTINGS: UserSettings = {
    summaryLength: 'medium',
    summaryLanguage: 'tr',
    darkMode: true,
    animations: true,
};

const STORAGE_KEY = 'ozetai_user_settings';

// ─── Küçük yardımcı bileşenler ─────────────────────────────────────────────────

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn(
            "rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6 space-y-5",
            className
        )}>
            {children}
        </div>
    );
}

function SectionTitle({ icon: Icon, label }: { icon: any; label: string }) {
    return (
        <div className="flex items-center gap-2.5 mb-1">
            <Icon className="h-4 w-4 text-primary opacity-80" />
            <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest">{label}</h3>
        </div>
    );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            role="switch"
            aria-checked={enabled}
            onClick={() => onChange(!enabled)}
            className={cn(
                "relative h-6 w-11 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
                enabled ? "bg-primary" : "bg-white/10"
            )}
        >
            <span className={cn(
                "absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
                enabled ? "translate-x-5" : "translate-x-0"
            )} />
        </button>
    );
}

function SelectPill<T extends string>({
    options, value, onChange,
}: {
    options: { value: T; label: string }[];
    value: T;
    onChange: (v: T) => void;
}) {
    return (
        <div className="flex gap-2 flex-wrap">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                        value === opt.value
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                            : "border-white/10 text-white/50 hover:text-white/80 hover:border-white/20"
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

function UsageBar({ label, used, max, icon: Icon, color = 'bg-primary' }: {
    label: string; used: number; max: number; icon: any; color?: string;
}) {
    const pct = max > 0 && max !== -1 ? Math.min(100, Math.round((used / max) * 100)) : (max === -1 ? 100 : 0);
    const isUnlimited = max === -1;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-white/40">
                <span className="flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" />{label}</span>
                <span className="font-mono">
                    {isUnlimited ? `${used} / ∞` : `${used} / ${max}`}
                </span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-700", color,
                        pct > 80 && !isUnlimited ? "bg-orange-500" : color
                    )}
                    style={{ width: `${isUnlimited ? 30 : pct}%` }}
                />
            </div>
        </div>
    );
}

// ─── Ana bileşen ───────────────────────────────────────────────────────────────
export default function SettingsPage() {
    const [user, setUser] = useState<{ id?: string; full_name?: string; email?: string; subscription_tier?: string } | null>(null);
    const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [original, setOriginal] = useState<UserSettings>(DEFAULT_SETTINGS);

    const isDirty = JSON.stringify(settings) !== JSON.stringify(original);

    // localStorage'dan ayarları yükle
    const loadLocalSettings = useCallback(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as UserSettings;
                setSettings(parsed);
                setOriginal(parsed);
            }
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, quotaRes] = await Promise.all([
                    fetch('/api/user'),
                    fetch('/api/quota'),
                ]);
                if (userRes.ok) {
                    const d = await userRes.json();
                    setUser(d.user);
                }
                if (quotaRes.ok) {
                    const d = await quotaRes.json();
                    setQuotaStatus(d.quotaStatus);
                }
            } catch (err) {
                console.error('Settings fetch error', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        loadLocalSettings();
    }, [loadLocalSettings]);

    const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // 1) localStorage'a kaydet (hızlı, her zaman çalışır)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

            // 2) Giriş yapmış kullanıcı varsa Supabase profiles'a da yaz
            if (user?.id) {
                const supabase = createClient();
                await supabase
                    .from('profiles')
                    .update({
                        updated_at: new Date().toISOString(),
                        // JSON olarak saklıyoruz — profiles tablosunda metadata sütunu varsa kullan
                        // yoksa sadece localStorage yeterli
                    })
                    .eq('id', user.id);
            }

            setOriginal(settings);
            setSaved(true);
            toast.success('Ayarlar başarıyla güncellendi', {
                description: 'Tercihleriniz kaydedildi.',
                icon: <Check className="w-4 h-4 text-emerald-400" />,
            });
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Save error', err);
            toast.error('Kaydetme başarısız', { description: 'Lütfen tekrar deneyin.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    const displayName = user?.full_name || user?.email?.split('@')[0] || 'Kullanıcı';
    const tierLabel =
        user?.subscription_tier === 'academic' ? 'Akademik Plan' :
            user?.subscription_tier === 'student' ? 'Öğrenci Planı' : 'Ücretsiz Plan';
    const tierColor =
        user?.subscription_tier === 'academic' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
            user?.subscription_tier === 'student' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                'bg-white/5 text-white/40 border-white/10';

    return (
        <div className="min-h-full p-6 md:p-8 space-y-6 bg-background overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Ayarlar</h1>
                    <p className="text-sm text-white/40 mt-0.5">Tercihlerinizi özelleştirin</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={!isDirty || saving}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                        isDirty && !saving
                            ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                            : "bg-white/5 text-white/30 cursor-not-allowed"
                    )}
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Kaydediliyor…' : saved ? 'Kaydedildi!' : 'Kaydet'}
                </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {/* ── Profil ── */}
                <SectionCard>
                    <SectionTitle icon={User} label="Hesap" />
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-xl font-bold text-white select-none shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-base font-semibold text-white truncate">{displayName}</p>
                            <p className="text-xs text-white/40 truncate">{user?.email}</p>
                            <span className={cn(
                                "mt-1.5 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                tierColor
                            )}>
                                {tierLabel}
                            </span>
                        </div>
                    </div>
                </SectionCard>

                {/* ── Özet Tercihleri ── */}
                <SectionCard>
                    <SectionTitle icon={AlignLeft} label="Özet Tercihleri" />

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-white/50 font-medium">Özet Uzunluğu</label>
                            <SelectPill
                                options={[
                                    { value: 'short', label: 'Kısa' },
                                    { value: 'medium', label: 'Orta' },
                                    { value: 'detailed', label: 'Detaylı' },
                                ]}
                                value={settings.summaryLength}
                                onChange={v => updateSetting('summaryLength', v)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-white/50 font-medium flex items-center gap-1.5">
                                <Languages className="w-3.5 h-3.5" /> Çıktı Dili
                            </label>
                            <SelectPill
                                options={[
                                    { value: 'tr', label: '🇹🇷 Türkçe' },
                                    { value: 'en', label: '🇬🇧 İngilizce' },
                                ]}
                                value={settings.summaryLanguage}
                                onChange={v => updateSetting('summaryLanguage', v)}
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* ── Görünüm ── */}
                <SectionCard>
                    <SectionTitle icon={Palette} label="Görünüm" />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                {settings.darkMode
                                    ? <Moon className="w-4 h-4 text-indigo-400" />
                                    : <Sun className="w-4 h-4 text-yellow-400" />}
                                <span className="text-sm text-white/70">Karanlık Mod</span>
                            </div>
                            <Toggle
                                enabled={settings.darkMode}
                                onChange={v => updateSetting('darkMode', v)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Globe className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm text-white/70">Animasyonlar</span>
                            </div>
                            <Toggle
                                enabled={settings.animations}
                                onChange={v => updateSetting('animations', v)}
                            />
                        </div>
                    </div>

                    {/* Mod önizleme */}
                    <div className={cn(
                        "mt-2 rounded-xl p-3 border text-xs font-medium text-center transition-all",
                        settings.darkMode
                            ? "bg-black/40 border-white/5 text-white/30"
                            : "bg-white/10 border-white/20 text-white/60"
                    )}>
                        {settings.darkMode ? "🌙 Karanlık mod aktif" : "☀️ Açık mod aktif"}
                    </div>
                </SectionCard>

                {/* ── Kullanım / Kota ── */}
                <SectionCard className="md:col-span-2 xl:col-span-3">
                    <SectionTitle icon={Cpu} label="Sistem Durumu & Kota" />

                    <div className="grid sm:grid-cols-3 gap-6">
                        <UsageBar
                            label="Depolama"
                            used={quotaStatus?.usage.storage_used_mb ?? 0}
                            max={quotaStatus?.limits.max_storage_mb ?? 100}
                            icon={HardDrive}
                            color="bg-blue-500"
                        />
                        <UsageBar
                            label="Analiz (Bu Ay)"
                            used={quotaStatus?.usage.analyses_completed ?? 0}
                            max={quotaStatus?.limits.max_analyses_per_month ?? 10}
                            icon={ExternalLink}
                            color="bg-primary"
                        />
                        <UsageBar
                            label="Yüklenen Belgeler"
                            used={quotaStatus?.usage.documents_uploaded ?? 0}
                            max={quotaStatus?.limits.max_documents ?? 5}
                            icon={Cpu}
                            color="bg-emerald-500"
                        />
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs text-white/30">Uygulama Sürümü</span>
                        <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-mono border border-primary/20">
                            v1.0.0
                        </span>
                    </div>
                </SectionCard>

            </div>
        </div>
    );
}
