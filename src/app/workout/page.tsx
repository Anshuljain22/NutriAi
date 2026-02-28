import WorkoutSessionManager from "@/components/workout/WorkoutSession";

export const metadata = {
    title: "Workout | NutriAI",
    description: "Live Workout Session Tracking",
};

export default function WorkoutPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8 relative">
            <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
            <WorkoutSessionManager />
        </div>
    );
}
