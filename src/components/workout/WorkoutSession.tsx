"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExerciseData, WorkoutSession } from "@/types/workout";
import { getWorkoutHistory, addWorkoutToHistory, checkMuscleRecovery } from "@/utils/workoutLogic";
import Timer from "./Timer";
import ExerciseCard from "./ExerciseCard";
import { Plus, Save, AlertTriangle } from "lucide-react";

export default function WorkoutSessionManager() {
    const router = useRouter();
    const [history, setHistory] = useState<WorkoutSession[]>([]);
    const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
    const [recoveryWarnings, setRecoveryWarnings] = useState<string[]>([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareCaption, setShareCaption] = useState("");
    const [sharePrivacy, setSharePrivacy] = useState("public");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Fetch Historical data to compare against
        const fetchHistory = async () => {
            try {
                const res = await fetch("/api/workout");
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data.history || []);
                }
            } catch (err) {
                console.error("Failed to load history for recovery check", err);
            }
        };
        fetchHistory();

        const savedActive = localStorage.getItem("active_workout");
        if (savedActive) {
            setActiveSession(JSON.parse(savedActive));
        } else {
            // Start a fresh session
            const newSession: WorkoutSession = {
                id: crypto.randomUUID(),
                user_id: "local_user",
                start_time: new Date().toISOString(),
                end_time: null,
                duration: null,
                exercises: [],
                total_volume: 0,
            };
            setActiveSession(newSession);
            localStorage.setItem("active_workout", JSON.stringify(newSession));
        }
    }, []);

    // Save changes to localStorage on every activeSession update and check muscle recovery
    useEffect(() => {
        if (activeSession) {
            localStorage.setItem("active_workout", JSON.stringify(activeSession));

            // Intelligent muscle recovery check
            const currentMuscles = activeSession.exercises.map(ex => ex.muscle_group);
            const warnings = checkMuscleRecovery(history, currentMuscles);
            setRecoveryWarnings(warnings);
        }
    }, [activeSession, history]);

    if (!activeSession) return null;

    const addExercise = () => {
        const newEx: ExerciseData = {
            id: crypto.randomUUID(),
            name: "",
            muscle_group: "Other",
            sets: [],
            total_volume: 0,
        };
        setActiveSession({
            ...activeSession,
            exercises: [...activeSession.exercises, newEx],
        });
    };

    const removeExercise = (id: string) => {
        const newExs = activeSession.exercises.filter((ex) => ex.id !== id);
        const totalVol = newExs.reduce((acc, ex) => acc + ex.total_volume, 0);
        setActiveSession({
            ...activeSession,
            exercises: newExs,
            total_volume: totalVol,
        });
    };

    const updateExercise = (updated: ExerciseData) => {
        const newExs = activeSession.exercises.map((ex) => (ex.id === updated.id ? updated : ex));
        const totalVol = newExs.reduce((acc, ex) => acc + ex.total_volume, 0);
        setActiveSession({
            ...activeSession,
            exercises: newExs,
            total_volume: totalVol,
        });
    };

    const endWorkout = async () => {
        if (activeSession.exercises.length === 0) {
            if (confirm("Cancel this empty workout?")) {
                localStorage.removeItem("active_workout");
                router.push("/dashboard");
            }
            return;
        }
        setShowShareModal(true);
    };

    const confirmAndSaveWorkout = async () => {
        setIsSaving(true);
        const endTime = new Date();
        const startTime = new Date(activeSession!.start_time);
        const durationSecs = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

        const completedSession: WorkoutSession = {
            ...activeSession!,
            end_time: endTime.toISOString(),
            duration: durationSecs,
        };

        try {
            // 1. Save Workout to base schema
            const res = await fetch("/api/workout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(completedSession)
            });

            if (!res.ok) throw new Error("Failed to save workout");

            // 2. If privacy is set, create a Social Post wrapper
            if (sharePrivacy !== 'private_only') {
                await fetch("/api/social/workouts/share", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        workout_id: completedSession.id,
                        caption: shareCaption,
                        privacy: sharePrivacy
                    })
                });
            }

            localStorage.removeItem("active_workout");
            router.push("/dashboard");
            router.refresh();

        } catch (err) {
            console.error(err);
            alert("Network error. Could not save workout.");
            setIsSaving(false);
            setShowShareModal(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 pb-24">

            {/* Recovery Intelligence Warning */}
            {recoveryWarnings.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-xl flex items-start gap-3 animate-in fade-in">
                    <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold mb-1">Muscle Recovery Warning</p>
                        <p className="opacity-90 leading-relaxed">
                            You trained {" "}
                            <span className="font-bold">{recoveryWarnings.join(", ")}</span> {" "}
                            within the last 48 hours. Ensure they are fully recovered to prevent overtraining and injury.
                        </p>
                    </div>
                </div>
            )}

            {/* Header Array */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Live Workout</h1>
                    <Timer startTime={activeSession.start_time} />
                </div>

                <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-2 border-white/5 whitespace-nowrap hidden sm:flex">
                    <span className="text-gray-400 text-sm">Session Vol:</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono text-shadow-sm">{activeSession.total_volume}</span>
                </div>
            </div>

            {/* Mobile Session Volume */}
            <div className="sm:hidden glass-panel px-6 py-3 rounded-2xl flex items-center justify-between border-white/5 w-full">
                <span className="text-gray-400 text-sm font-medium">Session Volume</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">{activeSession.total_volume} lbs</span>
            </div>

            {/* Exercises List */}
            <div className="space-y-6 mt-8">
                {activeSession.exercises.map((ex) => (
                    <ExerciseCard
                        key={ex.id}
                        exercise={ex}
                        history={history}
                        onUpdate={updateExercise}
                        onRemove={removeExercise}
                    />
                ))}
            </div>

            {activeSession.exercises.length === 0 && (
                <div className="text-center py-20 px-4 glass-panel rounded-3xl border-dashed border-2 border-white/10">
                    <p className="text-gray-400 text-lg">Your workout is empty.</p>
                    <p className="text-gray-500 text-sm mt-2">Add an exercise to start tracking your gains.</p>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl relative">
                        <h2 className="text-2xl font-bold text-white mb-2">Finish & Share</h2>
                        <p className="text-gray-400 text-sm mb-6">Your workout is complete. Do you want to share it to your feed?</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Caption</label>
                                <textarea
                                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none resize-none"
                                    placeholder="How was the lift?..."
                                    value={shareCaption}
                                    onChange={(e) => setShareCaption(e.target.value)}
                                    maxLength={200}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Privacy</label>
                                <select
                                    className="w-full bg-[#1a1a1c] border border-white/10 rounded-xl p-3 text-white appearance-none outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                                    value={sharePrivacy}
                                    onChange={(e) => setSharePrivacy(e.target.value)}
                                >
                                    <option value="public">🌎 Public</option>
                                    <option value="followers">👥 Followers Only</option>
                                    <option value="private_only">🔒 Do Not Share (Private)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowShareModal(false)}
                                disabled={isSaving}
                                className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAndSaveWorkout}
                                disabled={isSaving}
                                className="flex-1 py-3 rounded-xl bg-emerald-500 text-gray-900 font-bold hover:bg-emerald-400 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></span> : "Save Workout"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Sticky Bottom Actions */}
            <div className="fixed bottom-0 left-0 w-full p-4 glass-panel border-t border-white/10 z-40 bg-[#0f0f11]/80 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button
                        onClick={addExercise}
                        className="flex-1 glass-button py-4 rounded-xl text-white font-medium flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Exercise
                    </button>

                    <button
                        onClick={endWorkout}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-gray-900 shadow-[0_0_20px_rgba(16,185,129,0.3)] py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 focus:ring-4 focus:ring-emerald-500/30"
                    >
                        <Save className="w-5 h-5" />
                        Finish Workout
                    </button>
                </div>
            </div>

        </div>
    );
}
