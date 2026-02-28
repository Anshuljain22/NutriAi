"use client";

import { useState } from "react";
import { ExerciseData, MuscleGroup, SetData, WorkoutSession } from "@/types/workout";
import SetRow from "./SetRow";
import { Plus, Trash2, Dumbbell, TrendingUp, AlertTriangle } from "lucide-react";
import { getProgressiveOverloadStatus } from "@/utils/workoutLogic";

interface ExerciseCardProps {
    exercise: ExerciseData;
    history: WorkoutSession[];
    onUpdate: (updated: ExerciseData) => void;
    onRemove: (id: string) => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Other"];

export default function ExerciseCard({ exercise, history, onUpdate, onRemove }: ExerciseCardProps) {

    const addSet = () => {
        const newSet: SetData = {
            id: crypto.randomUUID(),
            reps: 0,
            weight: 0,
            volume: 0,
        };
        const newSets = [...exercise.sets, newSet];
        onUpdate({ ...exercise, sets: newSets });
    };

    const removeSet = (setId: string) => {
        const newSets = exercise.sets.filter((s) => s.id !== setId);
        const newTotalVolume = newSets.reduce((acc, s) => acc + s.volume, 0);
        onUpdate({ ...exercise, sets: newSets, total_volume: newTotalVolume });
    };

    const updateSet = (setId: string, field: "reps" | "weight", value: number) => {
        const newSets = exercise.sets.map((s) => {
            if (s.id === setId) {
                const reps = field === "reps" ? value : s.reps;
                const weight = field === "weight" ? value : s.weight;
                return { ...s, [field]: value, volume: reps * weight };
            }
            return s;
        });

        const newTotalVolume = newSets.reduce((acc, s) => acc + s.volume, 0);
        onUpdate({ ...exercise, sets: newSets, total_volume: newTotalVolume });
    };

    const overloadStatus = getProgressiveOverloadStatus(history, exercise.name, exercise.total_volume);

    return (
        <div className="glass-panel p-4 sm:p-6 rounded-2xl relative overflow-hidden group transition-all shrink-0">

            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start mb-6">
                <div className="flex-1 w-full space-y-3">
                    <div className="flex items-center justify-between w-full">
                        <input
                            type="text"
                            value={exercise.name}
                            onChange={(e) => onUpdate({ ...exercise, name: e.target.value })}
                            placeholder="Exercise Name (e.g. Bench Press)"
                            className="bg-transparent text-xl font-bold text-white placeholder-gray-600 focus:outline-none focus:border-b border-emerald-500/50 pb-1 w-full sm:w-[80%] transition-all"
                        />
                        <button
                            onClick={() => onRemove(exercise.id)}
                            className="text-gray-500 hover:text-red-400 p-2 sm:hidden shrink-0"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <select
                            value={exercise.muscle_group}
                            onChange={(e) => onUpdate({ ...exercise, muscle_group: e.target.value as MuscleGroup })}
                            className="bg-white/5 border border-white/10 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                        >
                            {MUSCLE_GROUPS.map((mg) => (
                                <option key={mg} value={mg} className="bg-gray-900">{mg}</option>
                            ))}
                        </select>

                        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-medium flex items-center gap-1.5 border border-emerald-500/20">
                            <Dumbbell className="w-4 h-4" />
                            Volume: {exercise.total_volume}
                        </div>

                        {/* Intelligent Overload Indicator */}
                        {exercise.name.length > 2 && exercise.total_volume > 0 && overloadStatus !== "neutral" && (
                            <div title="Progressive Overload Tracking vs Historic Average" className={`px-2 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider border ${overloadStatus === "up"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}>
                                {overloadStatus === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                {overloadStatus === "up" ? "Volume Up" : "Volume Drop"}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => onRemove(exercise.id)}
                    className="hidden sm:flex text-gray-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Sets List */}
            <div className="space-y-1 mt-4">
                {/* Table Header Labels */}
                <div className="flex items-center gap-4 px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="w-8 text-center">Set</div>
                    <div className="flex-1 flex gap-2 sm:gap-4 pl-1">
                        <div className="flex-1 text-center">Reps</div>
                        <div className="flex-1 text-center">Weight</div>
                    </div>
                    <div className="w-16 text-right mr-10">Vol</div>
                </div>

                {exercise.sets.map((set, idx) => (
                    <SetRow
                        key={set.id}
                        index={idx}
                        set={set}
                        onUpdate={updateSet}
                        onRemove={removeSet}
                    />
                ))}
            </div>

            {/* Add Set Button */}
            <button
                onClick={addSet}
                className="w-full mt-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-gray-400 hover:text-emerald-400 text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" />
                Add Set
            </button>

        </div>
    );
}
