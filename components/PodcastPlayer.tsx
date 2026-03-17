"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Pause, Play, Download, X, Loader2, Radio, User, GraduationCap, Volume2, AudioLines, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface DialogueLine {
    speaker: 'SUNUCU' | 'UZMAN';
    text: string;
}

interface PodcastData {
    podcast_title: string;
    duration_estimate: string;
    dialogue: DialogueLine[];
}

interface PodcastPlayerProps {
    summary: string;
    keyPoints: string[];
    title?: string;
    onClose: () => void;
}

export function PodcastPlayer({ summary, keyPoints, title, onClose }: PodcastPlayerProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [podcastData, setPodcastData] = useState<PodcastData | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentLineIndex, setCurrentLineIndex] = useState(-1);
    const [usePremiumTTS, setUsePremiumTTS] = useState(true);
    
    // Ses çalma referansları
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const dialogueRef = useRef<DialogueLine[]>([]);
    const currentIndexRef = useRef(-1);
    const isPlayingRef = useRef(false);
    const audioCacheRef = useRef<Record<number, string>>({});

    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Ses motorunu temizle
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            // Tüm önbelleğe alınmış URL'leri temizle
            Object.values(audioCacheRef.current).forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    // Kalite değişince önbelleği temizle
    useEffect(() => {
        Object.values(audioCacheRef.current).forEach(url => URL.revokeObjectURL(url));
        audioCacheRef.current = {};
    }, [usePremiumTTS]);

    const generatePodcast = async () => {
        setIsGenerating(true);
        toast.loading('Podcast scripti hazırlanıyor...', { id: 'podcast-gen' });
        try {
            const res = await fetch('/api/generate-podcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary, keyPoints, title }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Script oluşturulamadı.');
            }
            const data: PodcastData = await res.json();
            setPodcastData(data);
            dialogueRef.current = data.dialogue;
            toast.success('Podcast hazır! ▶️ Oynat butonuna bas.', { id: 'podcast-gen' });
        } catch (error: any) {
            toast.error(error.message, { id: 'podcast-gen' });
        } finally {
            setIsGenerating(false);
        }
    };

    // Sıradaki sesi önceden yükle
    const prefetchNext = useCallback(async (index: number) => {
        if (index >= dialogueRef.current.length || audioCacheRef.current[index]) return;
        
        try {
            const line = dialogueRef.current[index];
            const res = await fetch('/api/synthesize-podcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: line.text, speaker: line.speaker, usePremiumTTS }),
            });
            if (res.ok) {
                const audioBlob = await res.blob();
                if (audioBlob.size > 1000) {
                    audioCacheRef.current[index] = URL.createObjectURL(audioBlob);
                }
            }
        } catch (e) {
            console.warn("Prefetch error:", e);
        }
    }, [usePremiumTTS]);

    const speakLine = useCallback(async (index: number) => {
        if (!isPlayingRef.current || index >= dialogueRef.current.length) {
            setIsPlaying(false);
            setCurrentLineIndex(-1);
            isPlayingRef.current = false;
            // Temizlik
            Object.values(audioCacheRef.current).forEach(url => URL.revokeObjectURL(url));
            audioCacheRef.current = {};
            return;
        }

        const line = dialogueRef.current[index];
        currentIndexRef.current = index;
        setCurrentLineIndex(index);

        // Birrakindeki satırı önceden çekmeye başla
        prefetchNext(index + 1);

        try {
            let audioUrl = audioCacheRef.current[index];
            
            if (!audioUrl) {
                const res = await fetch('/api/synthesize-podcast', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: line.text, speaker: line.speaker, usePremiumTTS }),
                });

                if (!res.ok) throw new Error('API hatası');
                const audioBlob = await res.blob();
                if (audioBlob.size < 1000) throw new Error('Geçersiz ses verisi');
                audioUrl = URL.createObjectURL(audioBlob);
            }

            if (audioRef.current) {
                audioRef.current.pause();
            }

            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            
            audio.onended = () => {
                if (isPlayingRef.current) {
                    // Dinamik gecikme: Eğer kısa bir tepkiyse ("Aynen", "Vay canına") daha hızlı geç
                    const nextLine = dialogueRef.current[index + 1];
                    let delay = 600;
                    
                    if (nextLine) {
                        const text = nextLine.text.toLowerCase();
                        if (text.length < 20 || text.includes('aynen') || text.includes('vaun') || text.includes('hadi')) {
                            delay = 150; // Neredeyse anında
                        } else if (text.includes('aslında') || text.includes('yani')) {
                            delay = 300; // Düşünme arası
                        }
                    }
                    
                    setTimeout(() => speakLine(index + 1), delay);
                }
            };

            audio.onerror = () => {
                console.warn("API Sesi çalınamadı, fallback'e geçiliyor...");
                playFallback(line.text, line.speaker, index);
            };

            await audio.play();
        } catch (error) {
            console.error("Neural TTS Error, using fallback:", error);
            playFallback(line.text, line.speaker, index);
        }
    }, [prefetchNext, usePremiumTTS]);

    // Tarayıcının kendi sesi (SpeechSynthesis) - API bozulursa devreye girer
    const playFallback = (text: string, speaker: 'SUNUCU' | 'UZMAN', index: number) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        utterance.rate = 1.0;
        utterance.pitch = speaker === 'SUNUCU' ? 1.1 : 0.9;
        
        // Türkçe ses bulmaya çalış
        const voices = window.speechSynthesis.getVoices();
        const trVoice = voices.find(v => v.lang.startsWith('tr'));
        if (trVoice) utterance.voice = trVoice;

        utterance.onend = () => {
            if (isPlayingRef.current) {
                setTimeout(() => speakLine(index + 1), 600);
            }
        };
        
        utterance.onerror = () => {
            if (isPlayingRef.current) speakLine(index + 1);
        };

        window.speechSynthesis.speak(utterance);
    };

    const handlePlay = () => {
        if (!podcastData) return;
        isPlayingRef.current = true;
        setIsPlaying(true);
        speakLine(0);
    };

    const handlePause = () => {
        isPlayingRef.current = false;
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const handleResume = () => {
        if (currentLineIndex >= 0) {
            isPlayingRef.current = true;
            setIsPlaying(true);
            if (audioRef.current) {
                audioRef.current.play().catch(err => {
                    console.error("Playback failed:", err);
                    speakLine(currentLineIndex);
                });
            } else {
                speakLine(currentLineIndex);
            }
        } else {
            handlePlay();
        }
    };

    // İnanılmaz Hack: Tarayıcı içinde çalanı MediaRecorder ile kaydedip direkt dosyaya dönüştürüyoruz.  🚀 0 Sunucu Maliyeti
    const startRecording = async () => {
        try {
            // Sistemin duyduğu sesi kaydet (tarayıcı izni veya sekme izni isteyebilir)
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                }
            });
            
            const options = { mimeType: 'audio/webm' };
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const a = document.createElement('a');
                a.href = audioUrl;
                a.download = `ozetasistani_podcast_${Date.now()}.webm`;
                a.click();
                URL.revokeObjectURL(audioUrl);
                toast.success('Ses dosyası (Podcast) başarıyla indirildi!');
                stream.getTracks().forEach(track => track.stop()); // Stream'i tam kapat
                setIsRecording(false);
            };

            mediaRecorder.start();
            setIsRecording(true);
            toast.info('Ses kaydı başladı. Lütfen tüm sesin bitmesini bekleyin ve sonra İndir butonuna tekrar basın.');
            
            // Oynatmayı başlat
            if(!isPlaying) {
                handlePlay();
            }

        } catch (err: any) {
            console.error("Yakalama hatası:", err);
            toast.error('Ses indirmek için "Şu Anki Sekme (This Tab)" ve "Sesi Paylaş (Share Audio)" izinleri gereklidir.', { duration: 6000 });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
    };

    const handleDownloadAudio = () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    };

    const handleDownloadScript = () => {
        if (!podcastData) return;
        const scriptText = [
            `🎙️ ${podcastData.podcast_title}`,
            `Tahmini Süre: ${podcastData.duration_estimate}`,
            `Özet Asistanı tarafından oluşturuldu`,
            `${'─'.repeat(50)}`,
            '',
            ...podcastData.dialogue.map(line =>
                `[${line.speaker}]: ${line.text}`
            )
        ].join('\n');

        const blob = new Blob([scriptText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `podcast-script-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Script indirildi!');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-card border-t sm:border border-border rounded-t-[2.5rem] sm:rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/20 p-5 sm:p-6 border-b border-border/50 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                                <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-sm sm:text-lg leading-tight">
                                    {podcastData ? podcastData.podcast_title : 'AI Podcast Üretici'}
                                </h3>
                                <p className="text-[10px] sm:text-xs text-muted-foreground">
                                    {podcastData
                                        ? `${podcastData.duration_estimate} • ${podcastData.dialogue.length} konuşma`
                                        : 'Belgenizden otomatik podcast oluşturur'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => { handlePause(); onClose(); }} 
                            className="p-2 hover:bg-secondary rounded-xl transition-all hover:rotate-90"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
                    {!podcastData ? (
                        /* Generate State */
                        <div className="text-center py-8 sm:py-12 flex flex-col items-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Mic className="w-10 h-10 text-primary" />
                            </div>
                            <h4 className="font-black text-2xl mb-2">Türkçe AI Podcast</h4>
                            <p className="text-muted-foreground text-sm mb-4 max-w-xs mx-auto">
                                Belgenizi <strong>Sunucu</strong> ve <strong>Uzman Akademisyen</strong> arasındaki sohbet formatında seslendirir.
                            </p>
                            <div className="bg-secondary/30 rounded-2xl p-3 text-[10px] text-muted-foreground mb-8">
                                NotebookLM tarzı ultra gerçekçi Türkçe seslendirme 🎧
                            </div>
                            <button
                                onClick={generatePodcast}
                                disabled={isGenerating}
                                className="inline-flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-2xl font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 disabled:opacity-60 group"
                            >
                                {isGenerating
                                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Script Hazırlanıyor...</>
                                    : <><Mic className="w-5 h-5 group-hover:scale-110 transition-transform" /> Podcast Oluştur</>
                                }
                            </button>
                        </div>
                    ) : (
                        /* Player State */
                        <div>
                            {/* Premium Toggle */}
                            <div className="flex justify-center mb-6">
                                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer bg-secondary/50 px-4 py-2 rounded-2xl border border-border/50 hover:bg-secondary/80 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        className="hidden" 
                                        checked={usePremiumTTS} 
                                        onChange={(e) => setUsePremiumTTS(e.target.checked)} 
                                    />
                                    <div className={`relative w-8 h-4 rounded-full transition-colors ${usePremiumTTS ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                                        <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${usePremiumTTS ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                    <span className="flex items-center gap-1.5">
                                        <Sparkles className={`w-3.5 h-3.5 ${usePremiumTTS ? 'text-amber-500' : 'text-muted-foreground'}`} />
                                        <span className={usePremiumTTS ? 'text-foreground' : 'text-muted-foreground'}>
                                            Ultra Gerçekçi Ses {usePremiumTTS ? '(Aktif)' : '(Kapalı)'}
                                        </span>
                                    </span>
                                </label>
                            </div>

                            {/* Waveform Animation */}
                            <div className="flex items-center justify-center gap-1 h-12 mb-6">
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 rounded-full transition-all duration-300 ${
                                            isPlaying ? 'bg-primary animate-bounce' : 'bg-border'
                                        }`}
                                        style={{
                                            height: isPlaying ? `${Math.random() * 32 + 8}px` : '8px',
                                            animationDelay: `${i * 0.05}s`,
                                            animationDuration: `${0.5 + Math.random() * 0.5}s`
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Dialogue Script */}
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 mb-8 scrollbar-hide px-1">
                                {podcastData.dialogue.map((line, i) => (
                                    <div
                                        key={i}
                                        className={`flex gap-3 p-4 rounded-2xl transition-all duration-500 ${
                                            currentLineIndex === i
                                                ? 'bg-primary/10 border border-primary/20 shadow-sm scale-[1.02]'
                                                : i < currentLineIndex
                                                    ? 'opacity-40 grayscale-[0.5]'
                                                    : 'opacity-70'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-md ${
                                            line.speaker === 'SUNUCU' ? 'bg-emerald-500' : 'bg-purple-500'
                                        }`}>
                                            {line.speaker === 'SUNUCU'
                                                ? <User className="w-5 h-5" />
                                                : <GraduationCap className="w-5 h-5" />
                                            }
                                        </div>
                                        <div className="flex-1">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] block mb-1 ${
                                                line.speaker === 'SUNUCU' ? 'text-emerald-500' : 'text-purple-500'
                                            }`}>{line.speaker}</span>
                                            <p className="text-sm sm:text-base leading-relaxed font-medium">{line.text}</p>
                                        </div>
                                        {currentLineIndex === i && isPlaying && (
                                            <div className="flex items-center self-start mt-4">
                                                <div className="flex gap-0.5">
                                                    <div className="w-0.5 h-3 bg-primary animate-[bounce_0.6s_infinite]" />
                                                    <div className="w-0.5 h-3 bg-primary animate-[bounce_0.8s_infinite_0.1s]" />
                                                    <div className="w-0.5 h-3 bg-primary animate-[bounce_0.7s_infinite_0.2s]" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Controls */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-border/50 pt-6 mt-auto">
                                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                                    <button
                                        onClick={handleDownloadScript}
                                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-all px-4 py-2.5 rounded-xl hover:bg-secondary border border-transparent hover:border-border whitespace-nowrap"
                                    >
                                        <Download className="w-4 h-4" />
                                        Script
                                    </button>
                                    <button
                                        onClick={handleDownloadAudio}
                                        className={`flex items-center gap-2 text-xs font-bold transition-all px-4 py-2.5 rounded-xl border whitespace-nowrap ${
                                            isRecording 
                                                ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' 
                                                : 'text-primary border-primary/10 hover:bg-primary/10 hover:border-primary/20'
                                        }`}
                                    >
                                        <AudioLines className="w-4 h-4" />
                                        {isRecording ? 'Kaydı Bitir' : 'Ses İndir'}
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                    <button
                                        onClick={() => { handlePause(); setPodcastData(null); setCurrentLineIndex(-1); }}
                                        className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-xl hover:bg-secondary transition-all"
                                    >
                                        Sıfırla
                                    </button>
                                    
                                    {!isPlaying ? (
                                        <button
                                            onClick={currentLineIndex >= 0 ? handleResume : handlePlay}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-primary text-white px-10 py-4 rounded-2xl font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <Play className="w-5 h-5 fill-current" />
                                            {currentLineIndex >= 0 ? 'Devam Et' : 'Oynat'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handlePause}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-secondary text-foreground px-10 py-4 rounded-2xl font-black hover:bg-secondary/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <Pause className="w-5 h-5 fill-current" />
                                            Duraklat
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
