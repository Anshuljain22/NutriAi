"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MuscleGroupVolume } from "@/types/workout";

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#14b8a6', '#64748b'];

interface VolumeChartProps {
    data: MuscleGroupVolume[];
}

export default function VolumeChart({ data }: VolumeChartProps) {

    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                Not enough data
            </div>
        );
    }

    return (
        <div className="w-full h-80 glass-panel p-4 rounded-2xl">
            <h3 className="text-gray-400 text-sm font-medium mb-4 px-2">Volume by Muscle Group</h3>
            <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: any) => [`${value} lbs`, "Volume"]}
                        contentStyle={{ backgroundColor: 'rgba(15, 15, 17, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend style={{ fontSize: '12px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
