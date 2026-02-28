import { WorkoutSession, MuscleGroup } from "../types/workout";

const STORAGE_KEY = "workout_history";

/** Retrieves entire workout history from localStorage */
export const getWorkoutHistory = (): WorkoutSession[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

/** Saves entire history array to localStorage */
export const saveWorkoutHistory = (history: WorkoutSession[]) => {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
};

/** Adds a single completed workout to the history */
export const addWorkoutToHistory = (session: WorkoutSession) => {
    const history = getWorkoutHistory();
    history.push(session);
    saveWorkoutHistory(history);
};

/** Analyzes history to flag if a muscle group was trained within last 48 hours */
export const checkMuscleRecovery = (history: WorkoutSession[], currentGroups: MuscleGroup[]): MuscleGroup[] => {
    const now = new Date();
    const fortyEightHoursMs = 48 * 60 * 60 * 1000;

    const warnings: Set<MuscleGroup> = new Set();

    // Look only at the past 48 hours bounds
    const recentWorkouts = history.filter(w => {
        const end = w.end_time ? new Date(w.end_time) : new Date(w.start_time);
        return now.getTime() - end.getTime() < fortyEightHoursMs;
    });

    for (const session of recentWorkouts) {
        for (const ex of session.exercises) {
            if (currentGroups.includes(ex.muscle_group)) {
                warnings.add(ex.muscle_group);
            }
        }
    }

    return Array.from(warnings);
};

/** Computes max weight ever hit for a specific exercise name */
export const getPersonalRecord = (history: WorkoutSession[], exerciseName: string): number => {
    let maxWeight = 0;
    const nameMatch = exerciseName.toLowerCase().trim();

    for (const session of history) {
        for (const ex of session.exercises) {
            if (ex.name.toLowerCase().trim() === nameMatch) {
                for (const set of ex.sets) {
                    if (set.weight > maxWeight) maxWeight = set.weight;
                }
            }
        }
    }
    return maxWeight;
};

/** Calculates consecutive days worked out (Streak) */
export const getWorkoutStreak = (history: WorkoutSession[]): number => {
    if (history.length === 0) return 0;

    // Extract and deduplicate unique calendar dates of workouts
    const uniqueDates = Array.from(new Set(
        history.map(w => new Date(w.start_time).toDateString())
    )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // newest first

    if (uniqueDates.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();

    // Reset date's time to midnight for accurate day comparison
    currentDate.setHours(0, 0, 0, 0);

    const mostRecentWorkoutDate = new Date(uniqueDates[0]);
    mostRecentWorkoutDate.setHours(0, 0, 0, 0);

    // If the last workout was > 1 day ago (not today or yesterday), streak is 0
    const msInDay = 24 * 60 * 60 * 1000;
    const daysSinceLatest = Math.floor((currentDate.getTime() - mostRecentWorkoutDate.getTime()) / msInDay);
    if (daysSinceLatest > 1) return 0;

    let expectedDate = mostRecentWorkoutDate;

    for (const dateStr of uniqueDates) {
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);

        if (d.getTime() === expectedDate.getTime()) {
            streak++;
            expectedDate = new Date(expectedDate.getTime() - msInDay); // decrement by 1 day
        } else {
            break; // Streak broken
        }
    }

    return streak;
};

/** Progressive Overload Indicator: compares active exercise volume to historical average for that exercise */
export const getProgressiveOverloadStatus = (history: WorkoutSession[], activeExerciseName: string, currentVolume: number): "up" | "down" | "neutral" => {
    const nameMatch = activeExerciseName.toLowerCase().trim();
    let totalHistoricVolume = 0;
    let instanceCount = 0;

    for (const session of history) {
        for (const ex of session.exercises) {
            if (ex.name.toLowerCase().trim() === nameMatch && ex.total_volume > 0) {
                totalHistoricVolume += ex.total_volume;
                instanceCount++;
            }
        }
    }

    if (instanceCount === 0 || currentVolume === 0) return "neutral";
    const avgVolume = totalHistoricVolume / instanceCount;

    // 5% buffer for neutral status
    if (currentVolume > avgVolume * 1.05) return "up";
    if (currentVolume < avgVolume * 0.95) return "down";
    return "neutral";
};
