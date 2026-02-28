"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine } from "recharts";
import { Brain, TrendingUp, Activity, Sparkles, Scale } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function NutritionAnalytics() {
    const { user } = useAuth();
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [generatingInsight, setGeneratingInsight] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`/api/nutrition/analytics?days=7`);
                if (res.ok) {
                    const data = await res.json();
                    setAnalyticsData(data);
                }
            } catch (e) {
                console.error("Failed to fetch analytics", e);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [user]);

    const generateInsight = async () => {
        setGeneratingInsight(true);
        try {
            const res = await fetch('/api/nutrition/insights');
            if (res.ok) {
                const data = await res.json();
                setAiInsight(data.insight);
            } else {
                setAiInsight("Unable to generate insights at this moment. Please ensure your profile is complete.");
            }
        } catch (e) {
            setAiInsight("An error occurred while communicating with the AI. Try again later.");
        } finally {
            setGeneratingInsight(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse h-64 bg-white/5 rounded-3xl mt-8"></div>;
    }

    if (!analyticsData) return null;

    const { nutrition_history, weight_history, targets } = analyticsData;
    const targetCalories = targets?.daily_calorie_target || 2000;

    // Format data for charts
    const chartData = nutrition_history.map((day: any) => ({
        date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        calories: day.total_calories,
        protein: day.total_protein_g,
        carbs: day.total_carbs_g,
        fat: day.total_fat_g,
    }));

    const weightChartData = weight_history.map((log: any) => ({
        date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: log.weight_kg
    }));

    return (
        <div className="w-full space-y-6 mt-8">

            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
                <h2 className="text-2xl font-bold text-white">Analytics & Insights</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Calories Trend Chart */}
                <div className="glass-panel p-6 rounded-3xl border-white/10 shadow-lg">
                    <h3 className="text-gray-400 font-bold mb-6 flex justify-between">
                        <span>Calorie Intake (7 Days)</span>
                        <span className="text-emerald-400 text-sm">Target: {targetCalories} kcal</span>
                    </h3>

                    {chartData.length > 0 ? (
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff05' }}
                                        contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#ffffff20', borderRadius: '12px' }}
                                        itemStyle={{ color: '#F97316', fontWeight: 'bold' }}
                                    />
                                    <ReferenceLine y={targetCalories} stroke="#10B981" strokeDasharray="3 3" label={{ position: 'top', value: 'Target', fill: '#10B981', fontSize: 10 }} />
                                    <Bar dataKey="calories" fill="#F97316" radius={[6, 6, 0, 0]} name="Calories" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 w-full flex flex-col items-center justify-center text-gray-500">
                            <Activity className="w-8 h-8 opacity-20 mb-2" />
                            <p>No nutrition data logged in the last 7 days.</p>
                        </div>
                    )}
                </div>

                {/* Macros & Weight Trend */}
                <div className="glass-panel p-6 rounded-3xl border-white/10 shadow-lg flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                    <h3 className="text-gray-400 font-bold mb-6 flex justify-between z-10">
                        <span>Weight Progression</span>
                        <Scale className="w-4 h-4 text-blue-400" />
                    </h3>

                    {weightChartData.length > 0 ? (
                        <div className="h-64 w-full z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weightChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis domain={['auto', 'auto']} stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#ffffff20', borderRadius: '12px' }}
                                        itemStyle={{ color: '#3B82F6', fontWeight: 'bold' }}
                                    />
                                    <Line type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 6 }} name="Weight (kg)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 w-full flex flex-col items-center justify-center text-gray-500 z-10">
                            <Scale className="w-8 h-8 opacity-20 mb-2" />
                            <p>No weight data logged recently.</p>
                            <p className="text-xs mt-1">Update weight in Profile &gt; Settings to track progress.</p>
                        </div>
                    )}
                </div>

                {/* Gemini AI Coach Insights */}
                <div className="glass-panel p-6 md:p-8 rounded-3xl border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)] lg:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-2xl font-black text-white flex items-center gap-2 mb-1">
                                <Sparkles className="w-6 h-6 text-indigo-400" />
                                AI Nutrition Coach
                            </h3>
                            <p className="text-sm text-indigo-200/60">Powered by Gemini. Get personalized weekly insights based on your logs and goals.</p>
                        </div>

                        {!aiInsight && !generatingInsight && (
                            <button
                                onClick={generateInsight}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25 z-10"
                            >
                                <Brain className="w-4 h-4" /> Analyze My Week
                            </button>
                        )}
                    </div>

                    <div className="w-full relative z-10">
                        {generatingInsight ? (
                            <div className="py-12 flex flex-col items-center justify-center space-y-4">
                                <div className="relative w-16 h-16">
                                    <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
                                    <Brain className="absolute inset-0 m-auto w-6 h-6 text-indigo-400 animate-pulse" />
                                </div>
                                <p className="text-indigo-300 font-medium animate-pulse">Gemini is analyzing your weekly macros and progress...</p>
                            </div>
                        ) : aiInsight ? (
                            <div className="prose prose-invert prose-indigo max-w-none text-gray-300">
                                <ReactMarkdown
                                    components={{
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-2 mt-4" {...props} />,
                                        li: ({ node, ...props }) => <li className="text-gray-300" {...props} />,
                                        strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                                        h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-white mt-6 mb-3" {...props} />,
                                        h4: ({ node, ...props }) => <h4 className="text-lg font-bold text-indigo-300 mt-4 mb-2" {...props} />,
                                        p: ({ node, ...props }) => <p className="leading-relaxed mb-4 text-sm md:text-base" {...props} />
                                    }}
                                >
                                    {aiInsight}
                                </ReactMarkdown>

                                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                                    <button
                                        onClick={generateInsight}
                                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                                    >
                                        <Sparkles className="w-3 h-3" /> Refresh Insights
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-10 text-center border-2 border-dashed border-indigo-500/20 rounded-2xl bg-indigo-500/5">
                                <Brain className="w-10 h-10 text-indigo-500/40 mx-auto mb-3" />
                                <p className="text-gray-400 font-medium">Click "Analyze My Week" to generate your first AI report.</p>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}
