"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { WorkoutSession } from "@/types/workout";

interface ProgressionChartProps {
    history: WorkoutSession[];
    exerciseName: string; // the exercise we are plotting over time
}

export default function ProgressionChart({ history, exerciseName }: ProgressionChartProps) {

    // Transform history into a timeline series for the specific exercise (Max weight per session)
    const data = history
        .slice()
        .reverse() // from oldest to newest if history is newest-first
        .map((session) => {
            // Find the exercise in this session
            const exMatch = session.exercises.find(
                (ex) => ex.name.toLowerCase().trim() === exerciseName.toLowerCase().trim()
            );

            let maxWeight = 0;
            if (exMatch) {
                maxWeight = Math.max(...exMatch.sets.map(s => s.weight), 0);
            }

            return {
                date: new Date(session.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                maxWeight: maxWeight > 0 ? maxWeight : null, // null skips points gracefully in Recharts
            };
        })
        .filter(point => point.maxWeight !== null); // Only plot sessions where they actually did the exercise

    if (data.length < 2) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-2xl glass-panel p-4 text-center">
                <p className="text-sm">Not enough data to graph <span className="text-white font-medium">{exerciseName}</span> progression.</p>
                <p className="text-xs mt-1">Log this exercise at least twice to view trends.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-80 glass-panel p-4 rounded-2xl pt-6">
            <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-gray-400 text-sm font-medium">Weight Progression</h3>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded tracking-wide uppercase font-semibold">
                    {exerciseName}
                </span>
            </div>

            <ResponsiveContainer width="100%" height="75%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(15, 15, 17, 0.95)', borderColor: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px' }}
                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                        labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                        formatter={(val: any) => [`${val} lbs`, 'Max Weight']}
                    />
                    <Line
                        type="monotone"
                        dataKey="maxWeight"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#0f0f11' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
