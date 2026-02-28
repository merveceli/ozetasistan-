import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string;
    description: string;
    icon?: LucideIcon;
    trend?: string;
    className?: string;
}

export function StatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
    return (
        <div className={cn("bg-card border border-border rounded-xl p-6 flex flex-col justify-between h-full", className)}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                    <h3 className="text-3xl font-bold">{value}</h3>
                </div>
                {Icon && (
                    <div className="p-2 bg-secondary rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                )}
            </div>

            <div className="flex items-center text-xs text-muted-foreground">
                {trend && (
                    <span className="text-green-500 font-medium mr-2">{trend}</span>
                )}
                <span>{description}</span>
            </div>
        </div>
    );
}
