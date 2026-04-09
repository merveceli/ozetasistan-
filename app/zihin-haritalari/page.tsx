"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Network,
    Plus,
    Minus,
    Search,
    Share2,
    ChevronRight,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';

interface NodeData {
    name: string;
    children?: NodeData[];
    // UI specific
    x?: number;
    y?: number;
    id?: number;
}

interface ProcessedNode extends NodeData {
    id: number;
    x: number;
    y: number;
    type: 'root' | 'branch' | 'leaf';
    color?: string;
}

export default function MindMapPage() {
    const [documents, setDocuments] = useState<unknown[]>([]);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [mindMapData, setMindMapData] = useState<ProcessedNode[] | null>(null);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await fetch('/api/documents');
            if (response.ok) {
                const data = await response.json();
                setDocuments(data.documents || []);
            }
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setIsLoadingDocs(false);
        }
    };

    const handleGenerate = async (doc: { id: string }) => {
        setSelectedDocId(doc.id);
        setIsGenerating(true);
        setMindMapData(null);

        try {
            toast.loading('Analiz paketi hazırlanıyor...', { id: 'mm-gen' });

            const analyzeRes = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId: doc.id, level: 'analysis_package' })
            });

            if (!analyzeRes.ok) {
                throw new Error('Analiz paketi alınamadı');
            }
            const analyzeData = await analyzeRes.json();
            const analysis_package = analyzeData?.analysis_package;

            toast.loading('Zihin haritası oluşturuluyor...', { id: 'mm-gen' });

            const mmRes = await fetch('/api/generate-mindmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisPackage: analysis_package })
            });

            if (!mmRes.ok) {
                throw new Error('Zihin haritası oluşturulamadı');
            }
            const data = await mmRes.json();

            if (data.mind_map) {
                processMindMapData(data.mind_map);
                toast.success('Zihin haritası başarıyla oluşturuldu!', { id: 'mm-gen' });
            } else {
                throw new Error('Geçersiz veri formatı');
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu';
            toast.error(errorMessage, { id: 'mm-gen' });
        } finally {
            setIsGenerating(false);
        }
    };

    const processMindMapData = (rawMap: NodeData) => {
        const processed: ProcessedNode[] = [];
        const centerX = 400;
        const centerY = 300;

        // Root
        processed.push({
            id: 1,
            name: rawMap.name,
            x: centerX,
            y: centerY,
            type: 'root'
        });

        if (rawMap.children) {
            const colors = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

            rawMap.children.forEach((child, index) => {
                const angle = (index / (rawMap.children?.length || 1)) * 2 * Math.PI;
                const distance = 200;
                const branchX = centerX + Math.cos(angle) * distance;
                const branchY = centerY + Math.sin(angle) * distance;
                const branchId = index + 2;
                const color = colors[index % colors.length];

                processed.push({
                    id: branchId,
                    name: child.name,
                    x: branchX,
                    y: branchY,
                    type: 'branch',
                    color
                });

                if (child.children) {
                    child.children.forEach((leaf, leafIndex) => {
                        const leafAngle = angle + (leafIndex - (child.children!.length - 1) / 2) * 0.3;
                        const leafDistance = 350;
                        const leafX = centerX + Math.cos(leafAngle) * leafDistance;
                        const leafY = centerY + Math.sin(leafAngle) * leafDistance;

                        processed.push({
                            id: 100 + branchId * 10 + leafIndex,
                            name: leaf.name,
                            x: leafX,
                            y: leafY,
                            type: 'leaf',
                            color
                        });
                    });
                }
            });
        }

        setMindMapData(processed);
    };

    const filteredDocs = (documents as any[]).filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#030014] text-white flex flex-col overflow-hidden">
            <Header />
            <Toaster richColors position="top-right" theme="dark" />

            <div className="flex-1 p-6 md:p-8 overflow-hidden flex flex-col">
                <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col space-y-6 overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex justify-between items-center backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-2xl flex-wrap gap-3 shrink-0">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <Network className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black tracking-tight">Akademik Zihin Haritası</h1>
                                <p className="text-xs text-white/50 font-medium">Karmaşık kavramları hiyerarşik olarak vizualize edin</p>
                            </div>
                        </div>

                        {mindMapData && (
                            <div className="flex items-center space-x-2 flex-wrap gap-2">
                                <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Minus className="w-4 h-4" /></button>
                                    <span className="px-4 flex items-center text-xs font-bold tabular-nums">%{Math.round(zoom * 100)}</span>
                                    <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
                                </div>
                                <button onClick={() => setMindMapData(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-xs font-bold">Değiştir</button>
                                <button className="p-3 bg-primary hover:bg-primary/80 rounded-xl shadow-lg shadow-primary/20 transition-all"><Share2 className="w-5 h-5" /></button>
                            </div>
                        )}
                    </div>

                    {!mindMapData ? (
                        <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
                            <div className="max-w-2xl mx-auto w-full space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Makale ara..."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {isLoadingDocs ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)}
                                    </div>
                                ) : filteredDocs.length === 0 ? (
                                    <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 px-6">
                                        <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold">Gösterilecek döküman bulunamadı</h3>
                                        <p className="text-white/40 mt-1">Önce bir makale yükleyin.</p>
                                        <Link href="/" className="inline-block mt-4 text-primary font-medium hover:underline">Yükleme Ekranına Git</Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2">
                                        {filteredDocs.map(doc => {
                                            const isReady = doc.analysis_status === 'completed';
                                            return (
                                                <button
                                                    key={doc.id}
                                                    onClick={() => isReady && handleGenerate(doc)}
                                                    disabled={isGenerating || !isReady}
                                                    className={cn(
                                                        "flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl transition-all text-left group",
                                                        isReady ? "hover:border-primary/50 cursor-pointer" : "opacity-40 cursor-not-allowed",
                                                        selectedDocId === doc.id && "ring-2 ring-primary border-primary"
                                                    )}
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                            isReady ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white" : "bg-white/10 text-white/20"
                                                        )}>
                                                            <Network className="w-5 h-5" />
                                                        </div>
                                                        <h4 className="font-bold line-clamp-1 text-sm">{doc.title}</h4>
                                                    </div>
                                                    {isGenerating && selectedDocId === doc.id ? (
                                                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                                                    ) : isReady ? (
                                                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                                                    ) : null}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 relative border border-white/10 bg-white/[0.02] rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                            <motion.div
                                className="absolute inset-0"
                                animate={{ scale: zoom }}
                                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                style={{ transformOrigin: 'center center' }}
                            >
                                {/* Connection Lines */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    {mindMapData.filter(n => n.type !== 'root').map(node => {
                                        // Find parent
                                        let parent;
                                        if (node.type === 'branch') {
                                            parent = mindMapData.find(n => n.type === 'root');
                                        } else {
                                            // Leaf parent is the branch
                                            const branchId = Math.floor((node.id - 100) / 10);
                                            parent = mindMapData.find(n => n.id === branchId);
                                        }

                                        if (!parent) return null;

                                        return (
                                            <motion.line
                                                key={`line-${node.id}`}
                                                x1={parent.x} y1={parent.y}
                                                x2={node.x} y2={node.y}
                                                stroke={node.color || "#3B82F6"}
                                                strokeWidth={node.type === 'branch' ? "2" : "1"}
                                                strokeDasharray={node.type === 'leaf' ? "4 4" : "0"}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 0.35 }}
                                                transition={{ duration: 1 }}
                                            />
                                        );
                                    })}
                                </svg>

                                {/* Nodes */}
                                {mindMapData.map(node => (
                                    <motion.div
                                        key={node.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', damping: 12, delay: node.id * 0.01 }}
                                        className="absolute"
                                        style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className={cn(
                                                "group relative cursor-default rounded-2xl border backdrop-blur-xl transition-all duration-300 p-4 text-center",
                                                node.type === 'root' ? "bg-primary/20 border-primary min-w-[200px]" :
                                                node.type === 'branch' ? "bg-white/10 border-white/20 min-w-[150px]" :
                                                "bg-white/5 border-white/10 min-w-[120px] p-2"
                                            )}
                                            style={node.color && node.type !== 'root' ? { borderColor: `${node.color}50` } : {}}
                                        >
                                            <h3 className={cn("font-bold", node.type === 'root' ? "text-base" : "text-xs")}>
                                                {node.name}
                                            </h3>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Status Overlay */}
                            <div className="absolute bottom-6 left-6 flex items-center space-x-3 bg-white/5 border border-white/10 backdrop-blur-xl p-3 rounded-2xl">
                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Dinamik Analiz Aktif</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
