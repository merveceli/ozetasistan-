"use client";

import { Check, X, GitMerge } from 'lucide-react';

interface ComparisonData {
    common_themes: string[];
    synthesis: string;
    conflicts: string[];
    comparison_table: {
        columns: string[];
        rows: string[][];
    };
}

export function ComparisonView({ data }: { data: ComparisonData }) {
    if (!data) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5">
            {/* Synthesis Section */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4 flex items-center text-primary">
                    <GitMerge className="w-6 h-6 mr-2" />
                    Sentez & Ortak Temalar
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                    {data.synthesis}
                </p>

                <div className="flex flex-wrap gap-2">
                    {data.common_themes.map((theme, i) => (
                        <span key={i} className="bg-secondary/50 px-3 py-1 rounded-full text-sm font-medium text-foreground">
                            #{theme}
                        </span>
                    ))}
                </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border bg-secondary/5">
                    <h3 className="font-semibold text-lg">Karşılaştırma Tablosu</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-secondary/20">
                                {data.comparison_table.columns.map((col, i) => (
                                    <th key={i} className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {data.comparison_table.rows.map((row, i) => (
                                <tr key={i} className="hover:bg-secondary/10 transition-colors">
                                    {row.map((cell, j) => (
                                        <td key={j} className="px-6 py-4 text-sm text-foreground align-top">
                                            {j === 0 ? <span className="font-medium text-primary">{cell}</span> : cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Conflicts/Contradictions */}
            {data.conflicts.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                    <h3 className="font-semibold text-red-500 mb-4 flex items-center">
                        <X className="w-5 h-5 mr-2" /> Çelişkiler ve Karşıt Görüşler
                    </h3>
                    <ul className="space-y-2">
                        {data.conflicts.map((conflict, i) => (
                            <li key={i} className="flex items-start text-sm text-muted-foreground">
                                <span className="mr-2 text-red-400">•</span> {conflict}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
