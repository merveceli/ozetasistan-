"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Network,
    Maximize2,
    Download,
    Plus,
    Minus,
    Search,
    Share2,
    Settings2
} from 'lucide-react';

const INITIAL_NODES = [
    { id: 1, label: 'Dijital Dönüşüm', x: 400, y: 300, type: 'root' },
    { id: 2, label: 'Yapay Zeka', x: 250, y: 150, type: 'branch' },
    { id: 3, label: 'Blockchain', x: 550, y: 150, type: 'branch' },
    { id: 4, label: 'IoT Sistemleri', x: 250, y: 450, type: 'branch' },
    { id: 5, label: 'Bulut Bilişim', x: 550, y: 450, type: 'branch' },
];

export default function MindMapPage() {
    const [zoom, setZoom] = useState(1);

    return (
        <div className="min-h-screen bg-[#030014] text-white p-8 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-1000" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            </div>

            {/* Header / Toolbar */}
            <div className="relative z-10 flex justify-between items-center mb-8 backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-2xl">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center">
                        <Network className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight">Akademik Zihin Haritası</h1>
                        <p className="text-xs text-white/50 font-medium">Makale: "Endüstri 4.0 ve Dijital Evrim"</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 mr-4">
                        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Minus className="w-4 h-4" /></button>
                        <span className="px-4 flex items-center text-xs font-bold tabular-nums">%{Math.round(zoom * 100)}</span>
                        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"><Search className="w-5 h-5" /></button>
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"><Download className="w-5 h-5" /></button>
                    <button className="p-3 bg-primary hover:bg-primary/80 rounded-xl shadow-lg shadow-primary/20 transition-all"><Share2 className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="relative h-[calc(100vh-180px)] border border-white/10 bg-white/[0.02] rounded-[2.5rem] overflow-hidden backdrop-blur-sm cursor-grab active:cursor-grabbing">
                <motion.div
                    className="absolute inset-0"
                    animate={{ scale: zoom }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                >
                    {/* Connection Lines (SVG) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#7C3AED" />
                                <stop offset="100%" stopColor="#3B82F6" />
                            </linearGradient>
                        </defs>
                        {INITIAL_NODES.slice(1).map(node => (
                            <motion.line
                                key={`line-${node.id}`}
                                x1={400} y1={300}
                                x2={node.x} y2={node.y}
                                stroke="url(#lineGrad)"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.3 }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                            />
                        ))}
                    </svg>

                    {/* Nodes */}
                    {INITIAL_NODES.map(node => (
                        <motion.div
                            key={node.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', delay: node.id * 0.1 }}
                            className="absolute"
                            style={{
                                left: node.x,
                                top: node.y,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <div className={`
                                group relative p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300
                                ${node.type === 'root'
                                    ? 'bg-primary/20 border-primary shadow-2xl shadow-primary/20 min-w-[200px]'
                                    : 'bg-white/5 border-white/10 hover:border-primary/50 min-w-[160px]'}
                            `}>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Maximize2 className="w-3 h-3" />
                                </div>
                                <h3 className={`text-center font-bold ${node.type === 'root' ? 'text-lg' : 'text-sm'}`}>
                                    {node.label}
                                </h3>
                                {node.type === 'root' && (
                                    <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-white"
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 2 }}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Mini-map or Overlay */}
                <div className="absolute bottom-8 left-8 flex items-center space-x-3 bg-white/5 border border-white/10 backdrop-blur-xl p-4 rounded-2xl">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-white/70 tracking-wider uppercase">AI Analiz Tamamlandı</span>
                </div>
            </div>
        </div>
    );
}
