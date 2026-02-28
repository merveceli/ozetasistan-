"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Paperclip, Mic, Image as ImageIcon, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Merhaba! Ben Özet Asistanı. Akademik çalışmalarınızda, okumalarınızda veya araştırma süreçlerinizde size nasıl yardımcı olabilirim?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    history: history
                })
            });

            if (!response.ok) {
                throw new Error('Yanıt alınamadı');
            }

            const data = await response.json();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant", // data.role might be 'model' or 'assistant'
                content: data.message || "Bir hata oluştu, lütfen tekrar deneyin.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);

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
            alert('Tarayıcınız sesli not özelliğini desteklemiyor. Lütfen Chrome veya Edge kullanın.');
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
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);
                if (event.error === 'no-speech') {
                    alert('Ses algılanamadı. Lütfen tekrar deneyin.');
                } else if (event.error === 'not-allowed') {
                    alert('Mikrofon erişimi reddedildi. Lütfen tarayıcı ayarlarından izin verin.');
                }
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };
        }

        try {
            setIsRecording(true);
            recognitionRef.current.start();
        } catch (error) {
            console.error('Failed to start recording:', error);
            setIsRecording(false);
        }
    };

    const stopVoiceRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background rounded-2xl overflow-hidden glass-card border border-white/5">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-foreground">Asistan</h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            Çevrimiçi
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            "flex gap-4 max-w-[80%]",
                            message.role === "user" ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div
                            className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                message.role === "user" ? "bg-primary" : "bg-card border border-white/10"
                            )}
                        >
                            {message.role === "user" ? (
                                <User className="h-5 w-5 text-primary-foreground" />
                            ) : (
                                <Bot className="h-5 w-5 text-primary" />
                            )}
                        </div>

                        <div
                            className={cn(
                                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                message.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-card border border-white/5 text-foreground rounded-tl-none"
                            )}
                        >
                            {message.content}
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
                ))}

                {isLoading && (
                    <div className="flex gap-4 max-w-[80%]">
                        <div className="h-8 w-8 rounded-full bg-card border border-white/10 flex items-center justify-center shrink-0">
                            <Bot className="h-5 w-5 text-primary animate-pulse" />
                        </div>
                        <div className="bg-card border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-0" />
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-150" />
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce delay-300" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background/50 backdrop-blur-md border-t border-white/5">
                <form
                    onSubmit={handleSendMessage}
                    className="flex items-end gap-2 bg-card border border-white/10 rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-lg"
                >
                    <div className="flex gap-1 pb-2 pl-2">
                        <button type="button" className="p-2 text-muted-foreground hover:text-primary hover:bg-white/5 rounded-lg transition-colors">
                            <Paperclip className="h-5 w-5" />
                        </button>
                        <button type="button" className="p-2 text-muted-foreground hover:text-primary hover:bg-white/5 rounded-lg transition-colors">
                            <ImageIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 min-h-[44px] relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Bir şeyler yazın..."
                            className="w-full h-full bg-transparent border-0 focus:ring-0 resize-none py-3 text-sm max-h-32 custom-scrollbar"
                            rows={1}
                        />
                    </div>

                    <div className="flex gap-1 pb-2 pr-2">
                        {input.trim().length === 0 && (
                            <button
                                type="button"
                                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                                className={cn(
                                    "p-2 rounded-lg transition-all duration-200",
                                    isRecording
                                        ? "bg-red-500 text-white animate-pulse"
                                        : "text-muted-foreground hover:text-primary hover:bg-white/5"
                                )}
                            >
                                <Mic className="h-5 w-5" />
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className={cn(
                                "p-2 rounded-lg transition-all duration-200",
                                input.trim() && !isLoading
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transform hover:scale-105"
                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                            )}
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-muted-foreground">
                        Yapay zeka hatalı yanıtlar verebilir. Önemli bilgileri kontrol edin.
                    </p>
                </div>
            </div>
        </div>
    );
}
