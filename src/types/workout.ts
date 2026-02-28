export type MuscleGroup =
    | "Chest"
    | "Back"
    | "Legs"
    | "Shoulders"
    | "Arms"
    | "Core"
    | "Cardio"
    | "Other";

export interface SetData {
    id: string; // uuid
    reps: number;
    weight: number;
    volume: number; // calculated: reps * weight
}

export interface ExerciseData {
    id: string; // uuid
    name: string;
    muscle_group: MuscleGroup;
    sets: SetData[];
    total_volume: number; // calculated: sum of all set volumes
}

export interface WorkoutSession {
    id: string; // uuid
    user_id: string;
    start_time: string; // ISO String
    end_time: string | null; // ISO String or null if active
    duration: number | null; // stored in seconds
    exercises: ExerciseData[];
    total_volume: number; // calculated: sum of all exercise total_volumes
}

// Type used specifically for Dashboard analytics data mapping
export interface MuscleGroupVolume {
    name: string; // Muscle group name
    value: number; // Cumulative volume
}
