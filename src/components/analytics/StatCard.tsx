"use client";

import { Info } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    icon?: React.ReactNode;
}

export default function StatCard({ title, value, subtitle, trend, trendValue, icon }: StatCardProps) {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <p className="text-gray-400 text-sm font-medium">{title}</p>
                {icon ? (
                    <div className="text-emerald-500/80 bg-emerald-500/10 p-2 rounded-lg">
                        {icon}
                    </div>
                ) : (
                    <Info className="w-4 h-4 text-gray-600" />
                )}
            </div>

            <div>
                <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>

                <div className="flex items-center gap-2 mt-2 min-h-[20px]">
                    {trend && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${trend === "up" ? "bg-emerald-500/10 text-emerald-400" :
                                trend === "down" ? "bg-red-500/10 text-red-400" :
                                    "bg-gray-500/10 text-gray-400"
                            }`}>
                            {trendValue}
                        </span>
                    )}
                    {subtitle && (
                        <span className="text-xs text-gray-500">{subtitle}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
