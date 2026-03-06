"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Headphones, Play, Pause, SkipBack, SkipForward,
    Volume2, VolumeX, FileText, RefreshCw,
    Loader2, AlertCircle, CheckCircle2,
    Timer, Coffee, Trophy, Flame, ChevronRight, BarChart2, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Pomodoro Types ──────────────────────────────────────────────────────────
type PomodoroPhase = 'work' | 'break';
interface PomodoroSession {
    date: string;
    focusMinutes: number;
    completedPomodoros: number;
}

const POMODORO_PRESETS = [
    { label: '25 / 5', work: 25, break: 5 },
    { label: '50 / 10', work: 50, break: 10 },
    { label: '90 / 20', work: 90, break: 20 },
] as const;

interface DocumentItem {
    id: string;
    title: string;
    file_type: string;
    created_at: string;
    analysis_status: string;
}

interface VoiceOption {
    id: string;
    label: string;
    gender: 'female' | 'male';
    icon: string;
    pitch: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const VOICE_OPTIONS: VoiceOption[] = [
    { id: 'female-soft', label: 'Ayşe — Kadın, Sakin', gender: 'female', icon: '👩‍🏫', pitch: 1.15 },
    { id: 'female-clear', label: 'Zeynep — Kadın, Net', gender: 'female', icon: '👩‍💼', pitch: 1.05 },
    { id: 'male-deep', label: 'Mehmet — Erkek, Derin', gender: 'male', icon: '👨‍🏫', pitch: 0.80 },
    { id: 'male-clear', label: 'Ali — Erkek, Net', gender: 'male', icon: '👨‍💼', pitch: 0.90 },
];

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;
type PlaybackRate = typeof PLAYBACK_RATES[number];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRelativeTime(d: string) {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 60) return `${mins} dk önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days === 1) return 'Dün';
    return `${days} gün önce`;
}

/**
 * Metni cümle bazlı parçalara böler.
 * Noktalama işaretlerine göre cümleleri ayırır.
 */
function buildChunks(text: string): string[] {
    const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) ?? [text];
    return sentences.map(s => s.trim()).filter(Boolean);
}

/**
 * Tarayıcıdaki en uygun Türkçe sesi döndürür.
 * Cinsiyet eşleşmesi heuristic + tam liste arama ile yapılır.
 */
function getTurkishVoice(gender: 'male' | 'female'): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined') return null;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    // 1. Türkçe + cinsiyet eşleşmesi
    const trVoices = voices.filter(v => v.lang.startsWith('tr'));
    if (trVoices.length > 0) {
        const genderKeywords =
            gender === 'female'
                ? /female|kadın|kadin|woman|girl|emel|ayşe|zeynep/i
                : /male|erkek|man|boy|tolga|ahmet|kemal/i;
        const match = trVoices.find(v => genderKeywords.test(v.name));
        if (match) return match;

        // 2. Türkçe var ama cinsiyet eşleşmedi — en azından Türkçe dön
        return trVoices[0];
    }

    // 3. Türkçe ses yok, genel cinsiyet eşleşmesi dene
    const genderKeywords =
        gender === 'female'
            ? /female|woman|girl/i
            : /male|man|guy/i;
    const generalMatch = voices.find(v => genderKeywords.test(v.name));
    if (generalMatch) return generalMatch;

    // 4. Hiçbiri yoksa ilk sesi dön
    return voices[0];
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function WaveBars({ isPlaying, barCount = 36 }: { isPlaying: boolean; barCount?: number }) {
    return (
        <div className="flex items-end gap-[3px] h-12">
            {Array.from({ length: barCount }).map((_, i) => (
                <motion.div
                    key={i}
                    className="flex-1 rounded-full bg-gradient-to-t from-primary to-cyan-400 min-h-[4px]"
                    animate={isPlaying ? {
                        height: [
                            `${20 + Math.sin(i * 0.8) * 15}%`,
                            `${60 + Math.sin(i * 0.5 + 1) * 30}%`,
                            `${30 + Math.cos(i * 0.7) * 20}%`,
                            `${20 + Math.sin(i * 0.8) * 15}%`,
                        ],
                    } : { height: '15%' }}
                    transition={{
                        duration: isPlaying ? 1.2 + (i % 5) * 0.15 : 0.4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.03,
                    }}
                />
            ))}
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FocusRadioPage() {

    // ── Documents
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [docsLoading, setDocsLoading] = useState(true);

    // ── Selected doc & summary
    const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
    const [summaryText, setSummaryText] = useState('');
    const [fetchingDoc, setFetchingDoc] = useState(false);
    const [fetchError, setFetchError] = useState('');

    // ── Player state (single source of truth)
    const [playerState, setPlayerState] = useState<'idle' | 'playing' | 'paused' | 'generating'>('idle');
    const [selectedVoiceId, setSelectedVoiceId] = useState<string>(VOICE_OPTIONS[0].id);
    const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1);
    const [volume, setVolume] = useState(0.9);
    const [isMuted, setIsMuted] = useState(false);
    const [currentChunk, setCurrentChunk] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);

    // ── Refs
    const chunksRef = useRef<string[]>([]);
    const currentChunkRef = useRef(0);          // ref copy for callbacks
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const selectedVoiceIdRef = useRef(selectedVoiceId);
    const playbackRateRef = useRef(playbackRate);
    const volumeRef = useRef(volume);
    const isMutedRef = useRef(isMuted);
    const isPlayingRef = useRef(false);          // guard against stale closure

    // Keep refs in sync
    useEffect(() => { selectedVoiceIdRef.current = selectedVoiceId; }, [selectedVoiceId]);
    useEffect(() => { playbackRateRef.current = playbackRate; }, [playbackRate]);
    useEffect(() => { volumeRef.current = volume; }, [volume]);
    useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

    // ── Derived
    const selectedVoice = VOICE_OPTIONS.find(v => v.id === selectedVoiceId) ?? VOICE_OPTIONS[0];
    const progress = totalChunks > 0 ? Math.round((currentChunk / totalChunks) * 100) : 0;
    const isPlaying = playerState === 'playing';
    const isPaused = playerState === 'paused';

    // ── Pomodoro State
    const [pomodoroActive, setPomodoroActive] = useState(false);
    const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>('work');
    const [pomodoroPresetIdx, setPomodoroPresetIdx] = useState(0);
    const [pomodoroSecondsLeft, setPomodoroSecondsLeft] = useState(25 * 60);
    const [completedPomodoros, setCompletedPomodoros] = useState(0);
    const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);
    const [showPomodoroReport, setShowPomodoroReport] = useState(false);
    const [showPomodoroPanel, setShowPomodoroPanel] = useState(false);
    const pomodoroIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const currentPreset = POMODORO_PRESETS[pomodoroPresetIdx];

    // Pomodoro Tick
    useEffect(() => {
        if (!pomodoroActive) {
            if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current);
            return;
        }
        pomodoroIntervalRef.current = setInterval(() => {
            setPomodoroSecondsLeft(prev => {
                if (prev <= 1) {
                    // Phase switch
                    setPomodoroPhase(ph => {
                        if (ph === 'work') {
                            setCompletedPomodoros(c => c + 1);
                            setTotalFocusSeconds(s => s + currentPreset.work * 60);
                            return 'break';
                        } else {
                            return 'work';
                        }
                    });
                    return 0; // Will be reset by phase change effect
                }
                if (pomodoroPhase === 'work') {
                    setTotalFocusSeconds(s => s + 1);
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (pomodoroIntervalRef.current) clearInterval(pomodoroIntervalRef.current); };
    }, [pomodoroActive, pomodoroPhase, currentPreset]);

    // Reset timer on phase switch
    useEffect(() => {
        const secs = pomodoroPhase === 'work'
            ? currentPreset.work * 60
            : currentPreset.break * 60;
        setPomodoroSecondsLeft(secs);
    }, [pomodoroPhase, currentPreset]);

    const pomodoroMinutes = Math.floor(pomodoroSecondsLeft / 60);
    const pomodoroSecs = pomodoroSecondsLeft % 60;
    const pomodoroProgressPct = pomodoroPhase === 'work'
        ? ((currentPreset.work * 60 - pomodoroSecondsLeft) / (currentPreset.work * 60)) * 100
        : ((currentPreset.break * 60 - pomodoroSecondsLeft) / (currentPreset.break * 60)) * 100;

    const handlePomodoroToggle = () => {
        if (!pomodoroActive) {
            setPomodoroPhase('work');
            setPomodoroSecondsLeft(currentPreset.work * 60);
        } else {
            // Show report on stop
            if (totalFocusSeconds > 0) setShowPomodoroReport(true);
        }
        setPomodoroActive(a => !a);
    };

    /* ── Load documents ──────────────────────────────────────────────────── */
    useEffect(() => {
        fetch('/api/documents')
            .then(r => r.json())
            .then(data => {
                const completed = (data.documents || []).filter(
                    (d: DocumentItem) => d.analysis_status === 'completed'
                );
                setDocuments(completed);
            })
            .catch(() => setDocuments([]))
            .finally(() => setDocsLoading(false));
    }, []);

    /* ── Fetch summary ───────────────────────────────────────────────────── */
    const fetchSummary = async (doc: DocumentItem): Promise<string> => {
        const cacheKey = `analysis_${doc.id}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (parsed.summary) return parsed.summary as string;
            } catch { }
        }

        setFetchingDoc(true);
        setFetchError('');
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId: doc.id, level: 'student' }),
            });
            if (!res.ok) throw new Error('Analiz başarısız');
            const data = await res.json();
            if (data.summary) {
                localStorage.setItem(cacheKey, JSON.stringify(data));
                return data.summary as string;
            }
            throw new Error('Özet bulunamadı');
        } finally {
            setFetchingDoc(false);
        }
    };

    const handleSelectDoc = async (doc: DocumentItem) => {
        cancelSpeech();
        setSelectedDoc(doc);
        setSummaryText('');
        setCurrentChunk(0);
        setTotalChunks(0);
        setPlayerState('idle');
        try {
            const text = await fetchSummary(doc);
            setSummaryText(text);
            const chunks = buildChunks(text);
            chunksRef.current = chunks;
            setTotalChunks(chunks.length);
        } catch (e: any) {
            setFetchError(e.message || 'Özet alınamadı');
        }
    };

    /* ── TTS core ────────────────────────────────────────────────────────── */

    /**
     * İçeride her zaman refs kullanır → stale closure problemi olmaz.
     * cancel() sonrası isPlayingRef.current = false, böylece onend tetiklenmez.
     */
    const speakAt = useCallback((index: number) => {
        const chunks = chunksRef.current;
        if (!isPlayingRef.current || index >= chunks.length) {
            // Bitti
            if (index >= chunks.length) {
                isPlayingRef.current = false;
                setPlayerState('idle');
                setCurrentChunk(chunks.length);
            }
            return;
        }

        const voiceOption = VOICE_OPTIONS.find(v => v.id === selectedVoiceIdRef.current) ?? VOICE_OPTIONS[0];
        const vol = isMutedRef.current ? 0 : volumeRef.current;

        const utt = new SpeechSynthesisUtterance(chunks[index]);
        utt.lang = 'tr-TR';
        utt.pitch = voiceOption.pitch;
        utt.rate = playbackRateRef.current;
        utt.volume = vol;

        // Sesi seç — voices listesi async yüklenebilir
        const voice = getTurkishVoice(voiceOption.gender);
        if (voice) utt.voice = voice;

        utt.onend = () => {
            if (!isPlayingRef.current) return; // cancel() çağrıldıysa dur
            const next = index + 1;
            currentChunkRef.current = next;
            setCurrentChunk(next);
            speakAt(next);
        };

        utt.onerror = (e) => {
            // "interrupted" hatasını yoksay (cancel() sonrası normal)
            if ((e as SpeechSynthesisErrorEvent).error === 'interrupted') return;
            isPlayingRef.current = false;
            setPlayerState('idle');
        };

        utteranceRef.current = utt;
        window.speechSynthesis.speak(utt);
    }, []); // intentionally no deps — uses refs

    const cancelSpeech = useCallback(() => {
        isPlayingRef.current = false;
        window.speechSynthesis.cancel();
        utteranceRef.current = null;
    }, []);

    const startSpeech = useCallback((fromIndex = 0) => {
        if (!summaryText || !('speechSynthesis' in window)) return;
        cancelSpeech();

        const chunks = buildChunks(summaryText);
        chunksRef.current = chunks;
        setTotalChunks(chunks.length);
        currentChunkRef.current = fromIndex;
        setCurrentChunk(fromIndex);
        setPlayerState('playing');
        isPlayingRef.current = true;

        // Chrome'da voices async yüklenebilir, biraz bekle
        const doSpeak = () => speakAt(fromIndex);
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.onvoiceschanged = null;
                doSpeak();
            };
        } else {
            doSpeak();
        }
    }, [summaryText, cancelSpeech, speakAt]);

    const pauseSpeech = useCallback(() => {
        isPlayingRef.current = false;
        window.speechSynthesis.cancel();           // pause() bazı tarayıcılarda bozuk
        setPlayerState('paused');
    }, []);

    const resumeSpeech = useCallback(() => {
        // pause state'indeki chunk'tan devam et
        startSpeech(currentChunkRef.current);
    }, [startSpeech]);

    const skipForward = useCallback(() => {
        if (chunksRef.current.length === 0) return;
        const next = Math.min(chunksRef.current.length - 1, currentChunkRef.current + 1);
        startSpeech(next);
    }, [startSpeech]);

    const skipBack = useCallback(() => {
        if (chunksRef.current.length === 0) return;
        const prev = Math.max(0, currentChunkRef.current - 1);
        startSpeech(prev);
    }, [startSpeech]);

    /* ── Voice change handler ────────────────────────────────────────────── */
    const handleVoiceChange = useCallback((voiceId: string) => {
        setSelectedVoiceId(voiceId);
        // Eğer şu an çalıyorsa, aynı chunk'tan yeniden başlat (yeni sesle)
        if (playerState === 'playing' || playerState === 'paused') {
            const resumeFrom = currentChunkRef.current;
            // selectedVoiceIdRef will be updated by the useEffect above
            // We need a tiny timeout so the ref syncs first
            setTimeout(() => {
                startSpeech(resumeFrom);
            }, 50);
        }
    }, [playerState, startSpeech]);

    /* ── Playback rate change ────────────────────────────────────────────── */
    const handleRateChange = useCallback((rate: PlaybackRate) => {
        setPlaybackRate(rate);
        // Eğer çalıyorsa, mevcut chunk'tan yeniden başlat
        if (playerState === 'playing') {
            const resumeFrom = currentChunkRef.current;
            setTimeout(() => startSpeech(resumeFrom), 50);
        }
    }, [playerState, startSpeech]);

    /* ── Volume / mute ───────────────────────────────────────────────────── */
    // Volume değişimi çalışmaya devam ederken uygulanamaz (Web Speech API limiti),
    // bu yüzden sadece state'i güncelliyoruz; bir sonraki utterance'ta geçerli olacak.
    const handleVolumeChange = (val: number) => {
        setVolume(val);
        setIsMuted(false);
    };

    /* ── Cleanup on unmount & Pomodoro Playback Logic ─────────────────────── */
    const prevPhaseRef = useRef<PomodoroPhase>(pomodoroPhase);

    useEffect(() => {
        if (!pomodoroActive) return;
        if (prevPhaseRef.current === 'work' && pomodoroPhase === 'break') {
            if (playerState === 'playing') pauseSpeech();
        } else if (prevPhaseRef.current === 'break' && pomodoroPhase === 'work') {
            if (summaryText && (playerState === 'paused' || playerState === 'idle')) resumeSpeech();
        }
        prevPhaseRef.current = pomodoroPhase;
    }, [pomodoroPhase, pomodoroActive, playerState, summaryText, pauseSpeech, resumeSpeech]);

    useEffect(() => () => {
        isPlayingRef.current = false;
        window.speechSynthesis?.cancel();
    }, []);

    /* ── UI ──────────────────────────────────────────────────────────────── */
    return (
        <div className="flex flex-col h-full overflow-hidden bg-background relative">

            {/* ── Pomodoro Report Modal ── */}
            <AnimatePresence>
                {showPomodoroReport && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPomodoroReport(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-card border border-border rounded-3xl p-8 w-full max-w-sm shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center">
                                        <Trophy className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Odak Raporu</p>
                                        <p className="text-lg font-black">Harika İş!</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPomodoroReport(false)} className="p-1.5 hover:bg-secondary rounded-xl transition-colors">
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                                    <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                                    <p className="text-2xl font-black tabular-nums">{Math.round(totalFocusSeconds / 60)}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Odak Dakikası</p>
                                </div>
                                <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                                    <BarChart2 className="w-6 h-6 text-primary mx-auto mb-2" />
                                    <p className="text-2xl font-black tabular-nums">{completedPomodoros}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Pomodoro</p>
                                </div>
                            </div>
                            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
                                <p className="text-sm font-bold">{Math.round(totalFocusSeconds / 60)} dakika kesintisiz odaklandınız! 🎉</p>
                                <p className="text-xs text-muted-foreground mt-1">{completedPomodoros} Pomodoro tamamlandı.</p>
                            </div>
                            <button
                                onClick={() => { setShowPomodoroReport(false); setTotalFocusSeconds(0); setCompletedPomodoros(0); }}
                                className="mt-4 w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                            >
                                Yeni Oturum Başlat
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Page Header ── */}
            <div className="shrink-0 px-8 pt-8 pb-4">
                <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-lg shadow-primary/20">
                            <Headphones className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Focus Radio</h1>
                            <p className="text-xs text-muted-foreground font-medium">Özetlenen makalelerini sesli dinle</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPomodoroPanel(p => !p)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all",
                            showPomodoroPanel
                                ? "bg-primary/20 border-primary/40 text-primary"
                                : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                    >
                        <Timer className="w-4 h-4" />
                        Pomodoro
                        {pomodoroActive && (
                            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-black bg-primary text-white rounded-md tabular-nums">
                                {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSecs).padStart(2, '0')}
                            </span>
                        )}
                    </button>
                </div>

                <AnimatePresence>
                    {showPomodoroPanel && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mt-4"
                        >
                            <div className="bg-card/50 border border-border rounded-2xl p-5 flex flex-wrap items-center gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="relative w-20 h-20">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                                            <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-secondary" />
                                            <circle cx="40" cy="40" r="34" fill="none"
                                                stroke={pomodoroPhase === 'work' ? '#7C3AED' : '#10B981'}
                                                strokeWidth="6" strokeLinecap="round"
                                                strokeDasharray={`${2 * Math.PI * 34}`}
                                                strokeDashoffset={`${2 * Math.PI * 34 * (1 - pomodoroProgressPct / 100)}`}
                                                style={{ transition: 'stroke-dashoffset 1s linear' }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-lg font-black tabular-nums">
                                                {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSecs).padStart(2, '0')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={cn("mt-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                                        pomodoroPhase === 'work' ? 'bg-primary/20 text-primary' : 'bg-emerald-500/20 text-emerald-400'
                                    )}>
                                        {pomodoroPhase === 'work' ? '🔥 Çalışma' : '☕ Mola'}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Süre Ayarı</p>
                                    <div className="flex gap-2">
                                        {POMODORO_PRESETS.map((preset, idx) => (
                                            <button key={preset.label} onClick={() => { if (!pomodoroActive) setPomodoroPresetIdx(idx); }}
                                                disabled={pomodoroActive}
                                                className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                                                    pomodoroPresetIdx === idx
                                                        ? "bg-primary/20 border-primary/40 text-primary"
                                                        : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary disabled:opacity-50"
                                                )}
                                            >{preset.label} dk</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <p className="text-xl font-black tabular-nums text-orange-400">{completedPomodoros}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Pomodoro</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xl font-black tabular-nums text-primary">{Math.round(totalFocusSeconds / 60)}</p>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">Odak dk</p>
                                    </div>
                                </div>
                                <button onClick={handlePomodoroToggle}
                                    className={cn("ml-auto px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                                        pomodoroActive
                                            ? "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
                                            : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                                    )}>
                                    {pomodoroActive ? <><Coffee className="w-4 h-4" /> Durdur</> : <><Timer className="w-4 h-4" /> Başlat</>}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-0">

                {/* ── Left Panel: Playlist ─────────────────────────── */}
                <div className="md:w-80 shrink-0 border-r border-border flex flex-col overflow-hidden">
                    <div className="px-6 py-4 border-b border-border">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            Analiz Edilmiş Dokümanlar
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {docsLoading && (
                            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm">Yükleniyor...</span>
                            </div>
                        )}

                        {!docsLoading && documents.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center gap-3 text-muted-foreground px-4">
                                <FileText className="w-10 h-10 opacity-30" />
                                <p className="text-sm font-medium">Henüz analiz edilmiş doküman yok.</p>
                                <p className="text-xs opacity-60">Ana panelden bir PDF analiz et, ardından buradan dinle.</p>
                            </div>
                        )}

                        {documents.map(doc => (
                            <button
                                key={doc.id}
                                onClick={() => handleSelectDoc(doc)}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl border transition-all group",
                                    selectedDoc?.id === doc.id
                                        ? "border-primary/50 bg-primary/10 text-foreground"
                                        : "border-border bg-card/50 hover:border-border hover:bg-card"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                                        selectedDoc?.id === doc.id
                                            ? "bg-primary/20 text-primary"
                                            : "bg-secondary text-muted-foreground"
                                    )}>
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold leading-tight truncate mb-1">
                                            {doc.title}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {doc.file_type.toUpperCase()} · {getRelativeTime(doc.created_at)}
                                        </p>
                                    </div>
                                    {selectedDoc?.id === doc.id && isPlaying && (
                                        <div className="shrink-0 flex gap-[2px] items-end h-5 mt-1">
                                            {[1, 2, 3].map(i => (
                                                <motion.div
                                                    key={i}
                                                    className="w-1 bg-primary rounded-full"
                                                    animate={{ height: ['4px', '12px', '4px'] }}
                                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Right Panel: Player ──────────────────────────── */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">

                    {/* Empty state */}
                    {!selectedDoc && (
                        <div className="text-center text-muted-foreground space-y-3">
                            <div className="w-20 h-20 rounded-3xl bg-secondary/50 border border-border flex items-center justify-center mx-auto">
                                <Headphones className="w-9 h-9 opacity-30" />
                            </div>
                            <p className="font-semibold">Sol listeden bir doküman seç</p>
                            <p className="text-xs opacity-60">Yapay zeka özetini sesli olarak okuyacak</p>
                        </div>
                    )}

                    {selectedDoc && (
                        <div className="w-full max-w-2xl space-y-8">

                            {/* ── Fetch error ──────────────────────── */}
                            {fetchError && (
                                <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <div>
                                        <p className="font-bold">Özet alınamadı</p>
                                        <p className="text-xs opacity-80 mt-0.5">{fetchError}</p>
                                    </div>
                                    <button
                                        onClick={() => handleSelectDoc(selectedDoc)}
                                        className="ml-auto p-2 hover:bg-destructive/10 rounded-lg"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* ── Generating / loading state ───────── */}
                            {fetchingDoc && (
                                <div className="flex flex-col items-center gap-4 py-8">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                        <Headphones className="w-6 h-6 absolute inset-0 m-auto text-primary" />
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium animate-pulse">
                                        Özet hazırlanıyor...
                                    </p>
                                </div>
                            )}

                            {/* ── Player card ──────────────────────── */}
                            {!fetchingDoc && summaryText && (
                                <>
                                    {/* Album art + title */}
                                    <div className="flex items-center gap-6">
                                        <motion.div
                                            animate={isPlaying ? { rotate: [0, 5, -5, 0] } : {}}
                                            transition={{ duration: 3, repeat: Infinity }}
                                            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-primary/30 shrink-0"
                                        >
                                            <Headphones className="w-9 h-9 text-white" />
                                        </motion.div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                                <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                                                    AI Özeti Hazır
                                                </span>
                                            </div>
                                            <h2 className="text-xl font-black tracking-tight truncate">
                                                {selectedDoc.title}
                                            </h2>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                {selectedDoc.file_type.toUpperCase()} · {selectedVoice.icon} {selectedVoice.label.split(' — ')[0]}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Waveform + progress */}
                                    <div className="bg-card/50 border border-border rounded-2xl p-5">
                                        <WaveBars isPlaying={isPlaying} />

                                        <div className="mt-4 space-y-1">
                                            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full"
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                                                <span>
                                                    {currentChunk} / {totalChunks} cümle
                                                </span>
                                                <span>%{progress}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Playback controls */}
                                    <div className="flex items-center justify-between">
                                        {/* Volume */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setIsMuted(m => !m)}
                                                className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-secondary"
                                            >
                                                {isMuted
                                                    ? <VolumeX className="w-5 h-5" />
                                                    : <Volume2 className="w-5 h-5" />
                                                }
                                            </button>
                                            <input
                                                type="range" min={0} max={1} step={0.05}
                                                value={isMuted ? 0 : volume}
                                                onChange={e => handleVolumeChange(+e.target.value)}
                                                className="w-20 h-1 accent-primary"
                                            />
                                        </div>

                                        {/* Skip / Play / Pause */}
                                        <div className="flex items-center gap-4">
                                            <button
                                                id="fr-skip-back"
                                                onClick={skipBack}
                                                disabled={totalChunks === 0 || currentChunk === 0}
                                                className="p-2.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 rounded-xl hover:bg-secondary"
                                                title="Önceki cümle"
                                            >
                                                <SkipBack className="w-5 h-5" />
                                            </button>

                                            <motion.button
                                                id="fr-play-pause"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                disabled={fetchingDoc}
                                                onClick={() => {
                                                    if (isPlaying) pauseSpeech();
                                                    else if (isPaused) resumeSpeech();
                                                    else startSpeech(0);
                                                }}
                                                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl shadow-white/10 hover:shadow-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {fetchingDoc
                                                    ? <Loader2 className="w-6 h-6 animate-spin text-black" />
                                                    : isPlaying
                                                        ? <Pause className="w-6 h-6 fill-current" />
                                                        : <Play className="w-6 h-6 fill-current ml-0.5" />
                                                }
                                            </motion.button>

                                            <button
                                                id="fr-skip-forward"
                                                onClick={skipForward}
                                                disabled={totalChunks === 0 || currentChunk >= totalChunks - 1}
                                                className="p-2.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 rounded-xl hover:bg-secondary"
                                                title="Sonraki cümle"
                                            >
                                                <SkipForward className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Playback speed */}
                                        <div className="flex items-center gap-1">
                                            {PLAYBACK_RATES.map(rate => (
                                                <button
                                                    key={rate}
                                                    id={`fr-rate-${String(rate).replace('.', '-')}`}
                                                    onClick={() => handleRateChange(rate)}
                                                    className={cn(
                                                        "px-2 py-1 rounded-lg text-[11px] font-bold transition-all",
                                                        playbackRate === rate
                                                            ? "bg-primary text-white shadow-md shadow-primary/30"
                                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                                    )}
                                                >
                                                    {rate}x
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Voice selection */}
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                                            Ses Karakteri
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {VOICE_OPTIONS.map(voice => (
                                                <button
                                                    key={voice.id}
                                                    id={`fr-voice-${voice.id}`}
                                                    onClick={() => handleVoiceChange(voice.id)}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                                                        selectedVoiceId === voice.id
                                                            ? "border-primary/50 bg-primary/10 text-foreground"
                                                            : "border-border bg-card/50 hover:border-border hover:bg-card text-muted-foreground"
                                                    )}
                                                >
                                                    <span className="text-xl">{voice.icon}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold leading-tight">
                                                            {voice.label.split(' — ')[0]}
                                                        </p>
                                                        <p className="text-[10px] opacity-60">
                                                            {voice.label.split(' — ')[1]}
                                                        </p>
                                                    </div>
                                                    {selectedVoiceId === voice.id && (
                                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Voice status badge */}
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={selectedVoiceId}
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 4 }}
                                                className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground"
                                            >
                                                <span>{selectedVoice.icon}</span>
                                                <span className="font-medium">{selectedVoice.label}</span>
                                                {(isPlaying || isPaused) && (
                                                    <span className="ml-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-bold">
                                                        Yeniden başlatıldı
                                                    </span>
                                                )}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    {/* Summary text preview */}
                                    <div className="bg-card/50 border border-border rounded-2xl p-5">
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                                            Özet Metni
                                        </p>
                                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                                            {summaryText}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
