"use client";

import { useEffect, useState } from "react";
import { Flame, Activity, CalendarDays, Trophy, Medal } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LeaderboardsPage() {
    const [data, setData] = useState<{ streaks: any[], volume: any[], consistency: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                const res = await fetch("/api/leaderboard");
                if (res.ok) {
                    const json = await res.json();
                    setData(json.leaderboards);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboards();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-[50vh] text-emerald-500">Loading Leaderboards...</div>;
    }

    if (!data) {
        return <div className="text-center text-red-500 mt-20">Failed to load leaderboards.</div>;
    }

    const renderList = (items: any[], type: "streak" | "volume" | "days", icon: React.ReactNode) => {
        return (
            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="text-center text-gray-500 py-4 text-sm">No data available yet.</div>
                ) : (
                    items.map((user, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={user.id}
                        >
                            <Link href={`/profile/${user.id}`}>
                                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:-translate-y-1 ${index === 0 ? "glass-panel border-amber-500/30 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]" :
                                        index === 1 ? "glass-panel border-gray-400/30 bg-gray-400/5" :
                                            index === 2 ? "glass-panel border-orange-700/30 bg-orange-700/5" :
                                                "bg-white/5 border-white/5 hover:border-white/10"
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 font-black text-sm text-gray-400">
                                            {index === 0 ? <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" /> :
                                                index === 1 ? <Medal className="w-4 h-4 text-gray-300 fill-gray-300" /> :
                                                    index === 2 ? <Medal className="w-4 h-4 text-orange-600 fill-orange-600" /> :
                                                        `#${index + 1}`}
                                        </div>
                                        <div>
                                            <p className={`font-bold ${index === 0 ? "text-amber-500" : "text-white"}`}>{user.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-2">
                                        <div className="font-black text-lg tracking-tight">
                                            {type === "volume" && user.score.toLocaleString()}
                                            {type !== "volume" && user.score}
                                        </div>
                                        <div className="text-gray-500">
                                            {icon}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))
                )}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in pb-20">
            <div className="mb-8 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Global Leaderboards</h1>
                <p className="text-gray-400">See how you stack up against the best in the community.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Longest Streak */}
                <div className="glass-panel p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-full bg-amber-500/10">
                            <Flame className="w-6 h-6 text-amber-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Longest Streaks</h2>
                    </div>
                    {renderList(data.streaks, "streak", <span className="text-xs uppercase font-bold">Days</span>)}
                </div>

                {/* Lifetime Volume */}
                <div className="glass-panel p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-full bg-emerald-500/10">
                            <Activity className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Lifetime Volume</h2>
                    </div>
                    {renderList(data.volume, "volume", <span className="text-xs uppercase font-bold">Lbs</span>)}
                </div>

                {/* Most Consistent */}
                <div className="glass-panel p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-full bg-blue-500/10">
                            <CalendarDays className="w-6 h-6 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Most Active Days</h2>
                    </div>
                    {renderList(data.consistency, "days", <span className="text-xs uppercase font-bold">Days</span>)}
                </div>
            </div>
        </div>
    );
}
