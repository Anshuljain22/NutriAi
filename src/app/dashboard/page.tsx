"use client";

import { useEffect, useState } from "react";
import { WorkoutSession, MuscleGroupVolume } from "@/types/workout";
import { getWorkoutHistory, getWorkoutStreak, getPersonalRecord } from "@/utils/workoutLogic";
import StatCard from "@/components/analytics/StatCard";
import VolumeChart from "@/components/analytics/VolumeChart";
import ProgressionChart from "@/components/analytics/ProgressionChart";
import Heatmap from "@/components/analytics/Heatmap";
import NutritionDashboard from "@/components/nutrition/NutritionDashboard";
import NutritionAnalytics from "@/components/nutrition/NutritionAnalytics";
import { Activity, Flame, Dumbbell, Award, Timer, CalendarDays, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function DashboardPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState<WorkoutSession[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [aiInsight, setAiInsight] = useState<string>("");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                const [workRes, profRes] = await Promise.all([
                    fetch("/api/workout"),
                    fetch(`/api/users/${user.id}/profile`)
                ]);

                if (workRes.ok) {
                    const data = await workRes.json();
                    setHistory(data.history || []);

                    // Fetch AI Insight after getting history
                    if (data.history && data.history.length > 0) {
                        try {
                            const aiRes = await fetch("/api/ai/insights", {
                                method: "POST",
                                body: JSON.stringify({ history: data.history })
                            });
                            if (aiRes.ok) {
                                const aiData = await aiRes.json();
                                setAiInsight(aiData.insight);
                            }
                        } catch (e) {
                            console.error("AI Insight fetch failed", e);
                        }
                    }
                }
                if (profRes.ok) {
                    const profData = await profRes.json();
                    setProfile(profData.profile);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoaded(true);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (!isLoaded) return (
        <div className="flex items-center justify-center min-h-[50vh] text-emerald-500">
            Loading analytics...
        </div>
    );

    const totalWorkouts = history.length;
    const totalVolume = history.reduce((acc, sess) => acc + sess.total_volume, 0);
    const streak = profile?.current_streak || 0;
    const activeDays = profile?.total_active_days || 0;

    const msIn30Days = 30 * 24 * 60 * 60 * 1000;
    const nowMs = new Date().getTime();
    const activeDaysLast30 = Array.from(new Set(
        history
            .filter(w => (nowMs - new Date(w.start_time).getTime()) <= msIn30Days)
            .map(w => new Date(w.start_time).toDateString())
    )).length;

    const consistency30 = Math.round((activeDaysLast30 / 30) * 100);

    const avgDurationSecs = totalWorkouts
        ? history.reduce((acc, s) => acc + (s.duration || 0), 0) / totalWorkouts
        : 0;
    const avgDurationMins = Math.floor(avgDurationSecs / 60);

    // Calculate volume distribution for the Pie Chart
    const volumeMap = new Map<string, number>();
    history.forEach(session => {
        session.exercises.forEach(ex => {
            if (ex.total_volume > 0) {
                const current = volumeMap.get(ex.muscle_group) || 0;
                volumeMap.set(ex.muscle_group, current + ex.total_volume);
            }
        });
    });

    const volumeDistribution: MuscleGroupVolume[] = Array.from(volumeMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value); // sort descending

    const highestVolumeGroup = volumeDistribution.length > 0 ? volumeDistribution[0].name : "N/A";

    // For the progression chart, let's grab the most frequent exercise name out of their history
    const exerciseFrequency = new Map<string, number>();
    history.forEach(session => {
        session.exercises.forEach(ex => {
            const name = ex.name.toLowerCase().trim();
            if (name.length > 2) {
                exerciseFrequency.set(name, (exerciseFrequency.get(name) || 0) + 1);
            }
        });
    });

    let mostFrequentExercise = "Bench Press"; // default fallback
    let maxFreq = 0;
    exerciseFrequency.forEach((count, name) => {
        if (count > maxFreq) {
            maxFreq = count;
            mostFrequentExercise = name; // Top exercise tracked automatically
        }
    });

    // Calculate PR for their top exercise
    const topExercisePR = getPersonalRecord(history, mostFrequentExercise);

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in pb-20">

            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Analytics</h1>
                    <p className="text-gray-400">Track your volume, PRs, and intelligent progression.</p>
                </div>

                <Link
                    href="/workout"
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
                >
                    <Dumbbell className="w-5 h-5" />
                    Start Workout
                </Link>
            </div>

            {totalWorkouts === 0 ? (
                <div className="glass-panel p-12 rounded-3xl text-center border-dashed border-2 border-white/10 mt-10">
                    <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No data yet</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Your dashboard will populate with intelligent charts and analytics once you complete your first workout.
                    </p>
                </div>
            ) : (
                <>
                    {/* Nutrition Component goes above Workout Analytics */}
                    <div className="mb-4">
                        <NutritionDashboard />
                    </div>

                    <div className="mb-8">
                        <NutritionAnalytics />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <StatCard
                            title="Total Volume"
                            value={`${totalVolume.toLocaleString()} lbs`}
                            icon={<Activity className="w-5 h-5" />}
                        />
                        <StatCard
                            title="Workout Streak"
                            value={`${streak} Days`}
                            icon={<Flame className="w-5 h-5 text-amber-500" />}
                            trend={streak > 1 ? "up" : "neutral"}
                        />
                        <StatCard
                            title="Nutrition Streak"
                            value={`${profile?.nutrition_streak || 0} Days`}
                            icon={<Flame className="w-5 h-5 text-emerald-500" />}
                            trend={(profile?.nutrition_streak || 0) > 1 ? "up" : "neutral"}
                        />
                        <StatCard
                            title="Consistency (30d)"
                            value={`${consistency30}%`}
                            icon={<CalendarDays className="w-5 h-5 text-blue-500" />}
                            subtitle={`${activeDaysLast30} of 30 days`}
                        />
                        <StatCard
                            title="Avg. Session"
                            value={`${avgDurationMins}m`}
                            icon={<Timer className="w-5 h-5 text-emerald-500" />}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left: Progression Chart, PR Card & Heatmap */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* AI Insights Card */}
                            {aiInsight && (
                                <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex gap-4 items-start">
                                    <div className="p-3 bg-indigo-500/20 rounded-xl shrink-0">
                                        <BrainCircuit className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">NutriAI Focus</h3>
                                        <p className="text-gray-300 leading-relaxed text-sm">{aiInsight}</p>
                                    </div>
                                </div>
                            )}

                            <Heatmap history={history} />

                            <ProgressionChart history={history} exerciseName={mostFrequentExercise} />

                            {/* PR Callout Card */}
                            {topExercisePR > 0 && (
                                <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-emerald-500/20 bg-emerald-500/5">
                                    <div>
                                        <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-1">Personal Record</p>
                                        <p className="text-white text-lg">Your heaviest <span className="font-bold capitalize">{mostFrequentExercise}</span></p>
                                    </div>
                                    <div className="text-4xl font-black text-emerald-400 tracking-tighter shadow-sm">
                                        {topExercisePR} <span className="text-xl text-emerald-500/60 font-medium">lbs</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Muscle Group Volume Distribution */}
                        <div className="lg:col-span-1">
                            <VolumeChart data={volumeDistribution} />
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}
