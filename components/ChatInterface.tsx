"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send, User, Bot, Image as ImageIcon, Mic, X, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    imagePreview?: string;
}

function generateSessionId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function ChatInterface() {
    const searchParams = useSearchParams();
    const sessionIdParam = searchParams.get('session');

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Merhaba! Ben Özet Asistanı. Akademik çalışmalarınızda, okumalarınızda veya araştırma süreçlerinizde size nasıl yardımcı olabilirim? Soru sorabilir, metin analizi yaptırabilir veya görsel gönderebilirsiniz.",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
    const [sessionId, setSessionId] = useState(() => sessionIdParam || generateSessionId());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (sessionIdParam) {
            setSessionId(sessionIdParam);
            const loadHistory = async () => {
                setIsLoading(true);
                try {
                    const res = await fetch(`/api/chat/messages?session_id=${sessionIdParam}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.messages && data.messages.length > 0) {
                            const formatted: Message[] = data.messages.map((m: any) => ({
                                id: m.id,
                                role: m.role,
                                content: m.content,
                                timestamp: new Date(m.created_at),
                                // API'miz [Görsel eklendi] diye string koyuyor
                                imagePreview: m.image_url === '[Görsel eklendi]' ? undefined : m.image_url,
                            }));
                            setMessages(formatted);
                        }
                    }
                } catch (error) {
                    console.error("Tarhiçe yüklenemedi", error);
                } finally {
                    setIsLoading(false);
                }
            };
            loadHistory();
        }
    }, [sessionIdParam]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
        }
    }, [input]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Lütfen geçerli bir görsel dosyası seçin.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Görsel boyutu 5MB\'dan küçük olmalıdır.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target?.result as string;
            // base64 data URL'den pure base64 al
            const base64 = result.split(',')[1];
            setSelectedImage({
                base64,
                mimeType: file.type,
                preview: result,
            });
        };
        reader.readAsDataURL(file);
        // Input'u sıfırla (aynı dosyayı tekrar seçebilmek için)
        e.target.value = '';
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!input.trim() && !selectedImage) || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim() || (selectedImage ? "Görseli analiz et." : ""),
            timestamp: new Date(),
            imagePreview: selectedImage?.preview,
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        const currentInput = input.trim();
        const currentImage = selectedImage;
        setInput("");
        setSelectedImage(null);
        setIsLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const body: any = {
                message: userMessage.content,
                history,
                sessionId,
            };

            if (currentImage) {
                body.imageBase64 = currentImage.base64;
                body.imageMimeType = currentImage.mimeType;
            }

            body.stream = true; // Stream özelliğini aktif ediyoruz

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error('Yanıt alınamadı');
            }

            const contentType = response.headers.get('content-type') || '';

            if (contentType.includes('application/json')) {
                const data = await response.json();

                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.message || data.error || "Bir hata oluştu, lütfen tekrar deneyin.",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, aiMessage]);
            } else {
                const reader = response.body?.getReader();
                if (!reader) throw new Error('Reader alınamadı');

                const decoder = new TextDecoder();
                let aiText = "";
                const aiMessageId = (Date.now() + 1).toString();

                setMessages((prev) => [
                    ...prev,
                    { id: aiMessageId, role: "assistant", content: "", timestamp: new Date() }
                ]);

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    aiText += decoder.decode(value, { stream: true });

                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === aiMessageId ? { ...msg, content: aiText } : msg
                        )
                    );
                }
            }

        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Üzgünüm, şu anda yanıt veremiyorum. Lütfen bağlantınızı kontrol edip tekrar deneyin.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const startVoiceRecording = () => {
        if (typeof window === 'undefined') return;
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error('Tarayıcınız sesli not özelliğini desteklemiyor. Lütfen Chrome veya Edge kullanın.');
            return;
        }

        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = 'tr-TR';
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(prev => prev + (prev ? ' ' : '') + transcript);
                setIsRecording(false);
            };
            recognitionRef.current.onerror = (event: any) => {
                setIsRecording(false);
                if (event.error === 'not-allowed') {
                    toast.error('Mikrofon erişimi reddedildi.');
                }
            };
            recognitionRef.current.onend = () => setIsRecording(false);
        }

        try {
            setIsRecording(true);
            recognitionRef.current.start();
        } catch (error) {
            setIsRecording(false);
        }
    };

    const stopVoiceRecording = () => {
        recognitionRef.current?.stop();
        setIsRecording(false);
    };

    // Format message content with basic markdown
    const formatContent = (content: string) => {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded text-xs font-mono">$1</code>')
            .replace(/\n/g, '<br />');
    };

    return (
        <div className="flex flex-col h-full bg-background rounded-2xl overflow-hidden border border-white/5">
            {/* Header */}
            <div className="p-3 md:p-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground text-sm md:text-base">Akademik Asistan</h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            Çevrimiçi · Görsel destekli
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 md:space-y-6">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            "flex gap-3 md:gap-4 max-w-[90%] md:max-w-[80%]",
                            message.role === "user" ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div
                            className={cn(
                                "h-7 w-7 md:h-8 md:w-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                                message.role === "user" ? "bg-primary" : "bg-card border border-white/10"
                            )}
                        >
                            {message.role === "user" ? (
                                <User className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
                            ) : (
                                <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            {/* Image preview in message */}
                            {message.imagePreview && (
                                <div className={cn(
                                    "rounded-xl overflow-hidden max-w-xs",
                                    message.role === "user" ? "ml-auto" : ""
                                )}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={message.imagePreview}
                                        alt="Gönderilen görsel"
                                        className="w-full max-h-48 object-cover rounded-xl border border-white/10"
                                    />
                                </div>
                            )}

                            <div
                                className={cn(
                                    "p-3 md:p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                    message.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-card border border-white/5 text-foreground rounded-tl-none"
                                )}
                            >
                                <div
                                    dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
                                    className="whitespace-pre-wrap"
                                />
                                <div
                                    className={cn(
                                        "text-[10px] mt-2 opacity-70 text-right",
                                        message.role === "user" ? "text-primary-foreground/80" : "text-muted-foreground"
                                    )}
                                >
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3 md:gap-4 max-w-[80%]">
                        <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-card border border-white/10 flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary animate-pulse" />
                        </div>
                        <div className="bg-card border border-white/5 p-3 md:p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-background/50 backdrop-blur-md border-t border-white/5 shrink-0">
                {/* Image Preview */}
                {selectedImage && (
                    <div className="mb-2 flex items-center gap-2 p-2 bg-white/5 rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={selectedImage.preview}
                            alt="Seçilen görsel"
                            className="h-12 w-12 object-cover rounded-lg border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground truncate">Görsel seçildi</p>
                            <p className="text-[10px] text-muted-foreground/60">Göndermek için mesaj yazın veya doğrudan gönderin</p>
                        </div>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <form
                    onSubmit={handleSendMessage}
                    className="flex items-end gap-2 bg-card border border-white/10 rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-lg"
                >
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                    />

                    {/* Action buttons */}
                    <div className="flex gap-1 pb-1">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                selectedImage
                                    ? "text-primary bg-primary/10"
                                    : "text-muted-foreground hover:text-primary hover:bg-white/5"
                            )}
                            title="Görsel ekle (günlük 3 hak)"
                        >
                            <ImageIcon className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                    </div>

                    <div className="flex-1 min-h-[36px] md:min-h-[44px] relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Bir şeyler yazın... (Enter ile gönder, Shift+Enter ile satır atlayın)"
                            className="w-full h-full bg-transparent border-0 focus:ring-0 resize-none py-2 md:py-3 text-sm"
                            rows={1}
                            style={{ maxHeight: '128px' }}
                        />
                    </div>

                    <div className="flex gap-1 pb-1">
                        {input.trim().length === 0 && !selectedImage && (
                            <button
                                type="button"
                                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                                className={cn(
                                    "p-2 rounded-lg transition-all duration-200",
                                    isRecording
                                        ? "bg-red-500 text-white animate-pulse"
                                        : "text-muted-foreground hover:text-primary hover:bg-white/5"
                                )}
                                title="Sesle yaz"
                            >
                                <Mic className="h-4 w-4 md:h-5 md:w-5" />
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={(!input.trim() && !selectedImage) || isLoading}
                            className={cn(
                                "p-2 rounded-lg transition-all duration-200",
                                (input.trim() || selectedImage) && !isLoading
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                            )}
                        >
                            <Send className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                    </div>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-muted-foreground">
                        Sohbetleriniz otomatik kaydedilir · Görsel gönderebilirsiniz (maks. 5MB)
                    </p>
                </div>
            </div>
        </div>
    );
}
