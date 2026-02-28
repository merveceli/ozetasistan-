"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    Waves,
    Headphones,
    Download,
    Share2
} from 'lucide-react';

export default function FocusRadio() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(35);
    const [hoverWave, setHoverWave] = useState<number | null>(null);

    // Mock waveform data
    const waveBars = Array.from({ length: 40 }).map(() => Math.random() * 100);

    return (
        <div className="w-full max-w-4xl mx-auto p-8">
            <div className="relative group p-10 rounded-[3rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl overflow-hidden shadow-2xl">
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-700" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    {/* Album Art / Cover */}
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        className="relative w-48 h-48 rounded-[2rem] overflow-hidden shadow-2xl bg-gradient-to-br from-primary via-purple-500 to-blue-500 p-1 flex items-center justify-center"
                    >
                        <div className="absolute inset-0 bg-black/20" />
                        <Headphones className="w-20 h-20 text-white relative z-10 drop-shadow-2xl" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-white/80">AI Voice</span>
                            <span className="text-white/80">12:40</span>
                        </div>
                    </motion.div>

                    {/* Controls & Waveform */}
                    <div className="flex-1 w-full">
                        <div className="mb-6">
                            <div className="flex items-center space-x-2 mb-2 text-primary font-bold text-xs uppercase tracking-widest">
                                <Waves className="w-4 h-4" />
                                <span>Şimdi Oynatılıyor</span>
                            </div>
                            <h2 className="text-3xl font-black mb-2 tracking-tight">Focus Radio: Derin Analiz</h2>
                            <p className="text-white/50 text-sm font-medium leading-relaxed">
                                Makale: "Kuantum Mekaniğinde Gözlemci Etkisi ve Modern Fizik"
                            </p>
                        </div>

                        {/* Interactive Waveform */}
                        <div className="h-20 flex items-end gap-1 mb-8 relative">
                            {waveBars.map((height, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 10 }}
                                    animate={{
                                        height: isPlaying ? `${height}%` : `${height * 0.4}%`,
                                        opacity: progress > (i / waveBars.length) * 100 ? 1 : 0.3
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 20,
                                        delay: i * 0.01
                                    }}
                                    className={`flex-1 rounded-full ${progress > (i / waveBars.length) * 100 ? 'bg-gradient-to-t from-primary to-blue-400' : 'bg-white/20'}`}
                                    onMouseEnter={() => setHoverWave(i)}
                                    onMouseLeave={() => setHoverWave(null)}
                                />
                            ))}
                            <div
                                className="absolute inset-0 cursor-pointer"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    setProgress((x / rect.width) * 100);
                                }}
                            />
                        </div>

                        {/* Playback Controls */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <button className="text-white/40 hover:text-white transition-colors"><SkipBack className="w-6 h-6" /></button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl shadow-white/10 hover:shadow-white/20 transition-all"
                                >
                                    {isPlaying ? <Pause className="fill-current w-7 h-7" /> : <Play className="fill-current w-7 h-7 ml-1" />}
                                </motion.button>
                                <button className="text-white/40 hover:text-white transition-colors"><SkipForward className="w-6 h-6" /></button>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="hidden sm:flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                                    <Volume2 className="w-4 h-4 text-white/50" />
                                    <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="w-2/3 h-full bg-white/40" />
                                    </div>
                                </div>
                                <button className="p-3 hover:bg-white/5 rounded-xl transition-colors"><Download className="w-5 h-5 text-white/40" /></button>
                                <button className="p-3 hover:bg-white/5 rounded-xl transition-colors"><Share2 className="w-5 h-5 text-white/40" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
