"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Pause, Play, Download, X, Loader2, Radio, User, GraduationCap, Volume2, AudioLines } from 'lucide-react';
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
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const dialogueRef = useRef<DialogueLine[]>([]);
    const currentIndexRef = useRef(-1);
    const isPlayingRef = useRef(false);

    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Sesleri yükle
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis.cancel(); };
    }, []);

    const getTurkishVoice = useCallback((gender: 'male' | 'female') => {
        // Türkçe sesler önce
        const trVoices = voices.filter(v => v.lang.startsWith('tr'));
        if (trVoices.length >= 2) return gender === 'female' ? trVoices[0] : trVoices[1];
        if (trVoices.length === 1) return trVoices[0];
        // Fallback: herhangi bir ses
        return voices[gender === 'female' ? 0 : Math.min(1, voices.length - 1)] || null;
    }, [voices]);

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

    const speakLine = useCallback((index: number) => {
        if (!isPlayingRef.current || index >= dialogueRef.current.length) {
            setIsPlaying(false);
            setCurrentLineIndex(-1);
            isPlayingRef.current = false;
            return;
        }

        const line = dialogueRef.current[index];
        currentIndexRef.current = index;
        setCurrentLineIndex(index);

        const utterance = new SpeechSynthesisUtterance(line.text);
        utterance.lang = 'tr-TR';
        utterance.rate = 0.95;

        // SUNUCU = kadın sesi (daha yüksek pitch), UZMAN = erkek sesi (daha düşük)
        if (line.speaker === 'SUNUCU') {
            utterance.pitch = 1.2;
            utterance.rate = 1.0;
            const voice = getTurkishVoice('female');
            if (voice) utterance.voice = voice;
        } else {
            utterance.pitch = 0.85;
            utterance.rate = 0.9;
            const voice = getTurkishVoice('male');
            if (voice) utterance.voice = voice;
        }

        utterance.onend = () => {
            if (isPlayingRef.current) {
                setTimeout(() => speakLine(index + 1), 400); // satırlar arası kısa duraklama
            }
        };
        utterance.onerror = () => {
            isPlayingRef.current = false;
            setIsPlaying(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }, [getTurkishVoice]);

    const handlePlay = () => {
        if (!podcastData) return;
        isPlayingRef.current = true;
        setIsPlaying(true);
        speakLine(0);
    };

    const handlePause = () => {
        isPlayingRef.current = false;
        setIsPlaying(false);
        window.speechSynthesis.cancel();
    };

    const handleResume = () => {
        if (currentLineIndex >= 0) {
            isPlayingRef.current = true;
            setIsPlaying(true);
            speakLine(currentLineIndex);
        } else {
            handlePlay();
        }
    };

    // İnanılmaz Hack: Tarayıcı içinde çalanı MediaRecorder ile kaydedip direkt dosyaya dönüştürüyoruz.  🚀 0 Sunucu Maliyeti
    const startRecording = async () => {
        try {
            // Sistemin duyduğu sesi kaydet (tarayıcı izni veya sekme izni isteyebilir)
            // Bu API deneyseldir, kullanıcıya sekme paylaşma penceresi açtırarak 
            // sadece şu anki 'tab'ın sesini kaydetmesini isteriz, bu sayede stüdyo mp3 üretimi yapmış oluruz.
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true, // video true zorunlu olabiliyor ama gizli yapıyoruz
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
        toast.success('Script indirildi! Spotify\'a yüklemek için ses kayıt programıyla dinleyip kayıt alabilirsin.');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 p-6 border-b border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                                <Radio className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg">
                                    {podcastData ? podcastData.podcast_title : 'AI Podcast Üretici'}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {podcastData
                                        ? `${podcastData.duration_estimate} • ${podcastData.dialogue.length} konuşma`
                                        : 'Belgenizden otomatik podcast oluşturur'}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => { handlePause(); onClose(); }} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!podcastData ? (
                        /* Generate State */
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mic className="w-10 h-10 text-primary" />
                            </div>
                            <h4 className="font-bold text-xl mb-2">Türkçe AI Podcast</h4>
                            <p className="text-muted-foreground text-sm mb-2 max-w-sm mx-auto">
                                Belgenizi <strong>Sunucu</strong> ve <strong>Uzman Akademisyen</strong> arasındaki sohbet formatında seslendirir.
                            </p>
                            <p className="text-xs text-muted-foreground/60 mb-8">
                                NotebookLM'in Audio Overview özelliğinin Türkçe versiyonu 🎧
                            </p>
                            <button
                                onClick={generatePodcast}
                                disabled={isGenerating}
                                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-60"
                            >
                                {isGenerating
                                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Script Hazırlanıyor...</>
                                    : <><Mic className="w-5 h-5" /> Podcast Oluştur</>
                                }
                            </button>
                        </div>
                    ) : (
                        /* Player State */
                        <div>
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
                            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 mb-6 scrollbar-hide">
                                {podcastData.dialogue.map((line, i) => (
                                    <div
                                        key={i}
                                        className={`flex gap-3 p-3 rounded-2xl transition-all duration-300 ${
                                            currentLineIndex === i
                                                ? 'bg-primary/15 border border-primary/30 scale-[1.01]'
                                                : i < currentLineIndex
                                                    ? 'opacity-40'
                                                    : 'opacity-80'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                                            line.speaker === 'SUNUCU' ? 'bg-emerald-500' : 'bg-purple-500'
                                        }`}>
                                            {line.speaker === 'SUNUCU'
                                                ? <User className="w-4 h-4" />
                                                : <GraduationCap className="w-4 h-4" />
                                            }
                                        </div>
                                        <div className="flex-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest block mb-0.5 ${
                                                line.speaker === 'SUNUCU' ? 'text-emerald-500' : 'text-purple-500'
                                            }`}>{line.speaker}</span>
                                            <p className="text-sm leading-relaxed">{line.text}</p>
                                        </div>
                                        {currentLineIndex === i && isPlaying && (
                                            <Volume2 className="w-4 h-4 text-primary animate-pulse shrink-0 mt-1" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-between border-t border-border/50 pt-4">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={handleDownloadScript}
                                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-secondary"
                                    >
                                        <Download className="w-4 h-4" />
                                        Script İndir
                                    </button>
                                    <button
                                        onClick={handleDownloadAudio}
                                        className={`flex items-center gap-2 text-xs font-bold transition-colors px-3 py-2 rounded-xl border ${
                                            isRecording 
                                                ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' 
                                                : 'text-primary border-primary/20 hover:bg-primary/10'
                                        }`}
                                    >
                                        <AudioLines className="w-4 h-4" />
                                        {isRecording ? 'Kaydı Bitir & İndir' : 'Ses Olarak İndir (MP3)'}
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    {!isPlaying ? (
                                        <button
                                            onClick={currentLineIndex >= 0 ? handleResume : handlePlay}
                                            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                        >
                                            <Play className="w-4 h-4" />
                                            {currentLineIndex >= 0 ? 'Devam Et' : 'Oynat'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handlePause}
                                            className="flex items-center gap-2 bg-secondary text-foreground px-6 py-2.5 rounded-xl font-bold hover:bg-secondary/80 transition-all"
                                        >
                                            <Pause className="w-4 h-4" />
                                            Duraklat
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { handlePause(); setPodcastData(null); setCurrentLineIndex(-1); }}
                                        className="text-xs text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl hover:bg-secondary transition-colors"
                                    >
                                        Yeniden Üret
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
