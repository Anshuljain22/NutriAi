import React from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, subMonths, isAfter } from 'date-fns';

interface HeatmapProps {
    history: any[]; // Array of workout sessions containing start_time
}

export default function Heatmap({ history }: HeatmapProps) {
    const today = new Date();

    // Get past 3 months to show a quarterly heatmap
    const months = [
        subMonths(today, 2),
        subMonths(today, 1),
        today
    ];

    // Extract all workout dates
    const workoutDates = history.map(w => new Date(w.start_time));

    const checkWorkoutOnDate = (date: Date) => {
        return workoutDates.some(wDate => isSameDay(wDate, date));
    };

    return (
        <div className="glass-panel p-6 rounded-3xl border border-white/5 overflow-x-auto w-full">
            <h3 className="text-xl font-bold text-white mb-6">Activity Heatmap</h3>

            <div className="flex gap-8 min-w-max pb-2">
                {months.map((month, idx) => {
                    const start = startOfMonth(month);
                    const end = endOfMonth(month);
                    const days = eachDayOfInterval({ start, end });

                    // Pad start of month to align with weekday grid (0 = Sunday, 1 = Monday...)
                    const startDayOfWeek = start.getDay();
                    const paddedDays = Array(startDayOfWeek).fill(null).concat(days);

                    return (
                        <div key={idx} className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-gray-400 mb-2">{format(month, 'MMMM yyyy')}</span>
                            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                                {/* Weekday headers */}
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                    <div key={i} className="text-[10px] sm:text-xs text-gray-500 text-center font-medium w-6 sm:w-8">{d}</div>
                                ))}

                                {/* Day cells */}
                                {paddedDays.map((date, i) => {
                                    if (!date) return <div key={i} className="w-6 h-6 sm:w-8 sm:h-8" />; // Empty padding cell

                                    const hasWorkout = checkWorkoutOnDate(date as Date);
                                    const isFuture = isAfter(date as Date, today);

                                    return (
                                        <div
                                            key={i}
                                            className={`
                                                w-6 h-6 sm:w-8 sm:h-8 rounded sm:rounded-md transition-colors
                                                ${isFuture ? 'bg-transparent' : hasWorkout ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-white/5 border border-white/5'}
                                            `}
                                            title={`${format(date as Date, 'MMM d, yyyy')}${hasWorkout ? ' - Workout Completed' : ''}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center gap-2 mt-6 text-sm text-gray-400 justify-end">
                <span>Less</span>
                <div className="w-3 h-3 rounded bg-white/5 border border-white/5"></div>
                <div className="w-3 h-3 rounded bg-emerald-500"></div>
                <span>More</span>
            </div>
        </div>
    );
}
