"use client";

import { UploadCloud, Link as LinkIcon, Loader2, Lock, Sparkles, FileText, Globe, X, Send, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UpgradeModal } from './modals/UpgradeModal';
import { toast } from 'sonner';

interface UploadOptionProps {
    icon: any;
    title: string;
    description: string;
    onClick?: () => void;
    isLoading?: boolean;
    tier?: 'free' | 'student' | 'academic';
    requiredTier?: 'student' | 'academic';
    userTier?: string;
}

function UploadOption({
    icon: Icon,
    title,
    description,
    onClick,
    isLoading,
    requiredTier,
    userTier
}: UploadOptionProps) {
    const isLocked = requiredTier && (!userTier || (requiredTier === 'student' && userTier === 'free') || (requiredTier === 'academic' && userTier !== 'academic'));

    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className={cn(
                "flex flex-col items-center justify-center p-8 bg-secondary/20 hover:bg-secondary/40 border border-border hover:border-primary/50 rounded-2xl transition-all group h-48 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden",
                isLocked && "opacity-80"
            )}
        >
            {/* Tier Badge */}
            {requiredTier && (
                <div className={cn(
                    "absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1",
                    requiredTier === 'academic' ? "bg-purple-500/20 text-purple-400 border border-purple-500/20" : "bg-blue-500/20 text-blue-400 border border-blue-500/20"
                )}>
                    <Sparkles className="w-3 h-3" />
                    <span>{requiredTier === 'academic' ? 'Academic' : 'Premium'}</span>
                </div>
            )}

            <div className="w-12 h-12 rounded-full bg-secondary group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
                {isLoading ? (
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : isLocked ? (
                    <Lock className="w-6 h-6 text-muted-foreground" />
                ) : (
                    <Icon className="w-6 h-6 text-primary" />
                )}
            </div>
            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-xs text-muted-foreground text-center">{description}</p>
        </button>
    );
}

export function UploadArea() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [user, setUser] = useState<{ subscription_tier: string } | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState("");
    const [activeMode, setActiveMode] = useState<'file' | 'url' | 'text' | null>(null);
    const [urlInput, setUrlInput] = useState("");
    const [textInput, setTextInput] = useState("");

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();
            if (data.user) setUser(data.user);
        } catch (err) {
            console.error('Failed to fetch user', err);
        }
    };

    const handleFeatureClick = (feature: string, requiredTier: 'student' | 'academic', action: () => void) => {
        const userTier = user?.subscription_tier || 'free';

        const isAllowed = (requiredTier === 'student' && userTier !== 'free') ||
            (requiredTier === 'academic' && userTier === 'academic');

        if (isAllowed) {
            action();
        } else {
            setSelectedFeature(feature);
            setShowUpgradeModal(true);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setActiveMode('file');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'pdf');

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Yükleme başarısız oldu');
            }

            const data = await response.json();
            router.refresh();

            if (data.document && data.document.id) {
                toast.success(`"${file.name}" başarıyla yüklendi! Analiz başlıyor...`);
                router.push(`/analyze/${data.document.id}`);
            } else {
                toast.success('Dosya başarıyla yüklendi! Analiz için hazırlanıyor.');
            }

        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleTextSubmit = async () => {
        if (!textInput.trim()) return;
        if (textInput.trim().length < 50) {
            toast.warning('Lütfen analiz edilecek yeterli metin girin (en az 50 karakter).');
            return;
        }
        setIsUploading(true);
        const formData = new FormData();
        const blob = new Blob([textInput], { type: 'text/plain' });
        formData.append('file', blob, 'pasted_text.txt');
        formData.append('type', 'txt');

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Yükleme başarısız oldu');
            const data = await response.json();
            toast.success('Metin analiz ediliyor...');
            if (data.document?.id) router.push(`/analyze/${data.document.id}`);
        } catch (error: any) {
            toast.error(error.message || 'Hata oluştu.');
        } finally {
            setIsUploading(false);
            setTextInput('');
        }
    };

    const handleUrlSubmit = async () => {
        if (!urlInput.trim()) return;
        try { new URL(urlInput); } catch { toast.error('Geçerli bir URL girin. (örn: https://...)'); return; }
        setIsUploading(true);
        const formData = new FormData();
        const blob = new Blob([urlInput], { type: 'text/plain' });
        formData.append('file', blob, 'url_link.url');
        formData.append('type', 'url');

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('URL ekleme başarısız oldu');
            const data = await response.json();
            toast.success('Web sayfası analiz ediliyor...');
            if (data.document?.id) router.push(`/analyze/${data.document.id}`);
        } catch (error: any) {
            toast.error(error.message || 'Hata oluştu.');
        } finally {
            setIsUploading(false);
            setUrlInput('');
        }
    };

    return (
        <div className="space-y-4">
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                feature={selectedFeature}
            />

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
            />

            <div className="bg-gradient-to-r from-primary/10 to-blue-500/5 border border-primary/20 rounded-xl p-6 backdrop-blur relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-primary text-xs font-bold uppercase tracking-wider flex items-center">
                            <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
                            Yapay Zeka Destekli
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Zeki Yükleme Alanı</h2>
                    <p className="text-muted-foreground text-sm max-w-lg">
                        Analiz etmek istediğiniz dokümanı, linki veya ses kaydını buraya bırakın.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <UploadOption
                    icon={UploadCloud}
                    title="PDF veya Dosya"
                    description="Sürükle veya tıkla"
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={isUploading && activeMode === 'file'}
                    userTier={user?.subscription_tier}
                />
                <UploadOption
                    icon={Globe}
                    title="Web Bağlantısı"
                    description="Makale veya Web URL"
                    userTier={user?.subscription_tier}
                    onClick={() => setActiveMode(activeMode === 'url' ? null : 'url')}
                />
                <UploadOption
                    icon={FileText}
                    title="Metin Yapıştır"
                    description="Doğrudan metin girin"
                    userTier={user?.subscription_tier}
                    onClick={() => setActiveMode(activeMode === 'text' ? null : 'text')}
                />
            </div>

            {/* Input Areas based on Mode */}
            {activeMode === 'text' && (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                    <div className="relative">
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Özetlemek veya analiz etmek istediğiniz metni buraya yapıştırın...&#10;&#10;Not: En iyi sonucu almak için en az bir paragraf metin girin."
                            className="w-full h-48 bg-secondary/20 border border-border rounded-xl p-4 pr-12 resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm leading-relaxed transition-all"
                        />
                        {textInput && (
                            <button
                                onClick={() => setTextInput('')}
                                className="absolute top-3 right-3 p-1 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-xs font-medium",
                                textInput.length < 50 && textInput.length > 0 ? "text-orange-500" : "text-muted-foreground"
                            )}>
                                {textInput.length} karakter
                            </span>
                            {textInput.length > 0 && textInput.length < 50 && (
                                <span className="flex items-center gap-1 text-[10px] text-orange-500">
                                    <AlertCircle className="w-3 h-3" /> En az 50 karakter gerekli
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handleTextSubmit}
                            disabled={isUploading || !textInput.trim() || textInput.trim().length < 50}
                            className="flex items-center gap-2 text-sm bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                        >
                            {isUploading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Analiz Ediliyor...</>
                            ) : (
                                <><Send className="w-4 h-4" /> Metni Analiz Et</>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {activeMode === 'url' && (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="url"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                                placeholder="https://ornek-makale.com/makale-basligi"
                                className="w-full bg-secondary/20 border border-border rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm transition-all"
                            />
                        </div>
                        <button
                            onClick={handleUrlSubmit}
                            disabled={isUploading || !urlInput.trim()}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 whitespace-nowrap shadow-lg shadow-primary/20"
                        >
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {isUploading ? 'Analiz Ediliyor...' : 'Analiz Et'}
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        Halkık erisime açık web sayfaları desteklenmektedir. Login gerektiren sayfalar analiz edilemeyebilir.
                    </p>
                </div>
            )}

            {/* Cloud Sources Section (Point 4) */}
            <div className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Bulut & Kaynak Entegrasyonları
                    </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { id: 'drive', name: 'Google Drive', icon: 'bg-blue-500/10 text-blue-500', requiredTier: 'academic' },
                        { id: 'zotero', name: 'Zotero', icon: 'bg-red-500/10 text-red-500', requiredTier: 'academic' },
                        { id: 'mendeley', name: 'Mendeley', icon: 'bg-orange-500/10 text-orange-500', requiredTier: 'academic' },
                        { id: 'dropbox', name: 'Dropbox', icon: 'bg-blue-400/10 text-blue-400', requiredTier: 'student' }
                    ].map((source) => (
                        <button
                            key={source.id}
                            onClick={() => handleFeatureClick(source.name, source.requiredTier as any, () => alert(`${source.name} entegrasyonu yakında eklenecek!`))}
                            className="flex items-center space-x-3 p-4 bg-secondary/10 hover:bg-secondary/20 border border-border rounded-xl transition-all group overflow-hidden relative"
                        >
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", source.icon)}>
                                <span className="font-black text-[10px]">{source.name[0]}</span>
                            </div>
                            <span className="text-xs font-bold truncate">{source.name}</span>

                            {/* Lock icon for tier restriction */}
                            {((source.requiredTier === 'academic' && user?.subscription_tier !== 'academic') ||
                                (source.requiredTier === 'student' && user?.subscription_tier === 'free')) && (
                                    <Lock className="w-3 h-3 absolute top-2 right-2 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
