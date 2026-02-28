import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { history } = await req.json();

        // Mock API delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (!history || history.length === 0) {
            return NextResponse.json({
                insight: "It looks like you haven't logged any workouts yet. Time to hit the gym and start building your foundation!"
            });
        }

        const totalWorkouts = history.length;
        const totalVolume = history.reduce((acc: number, sess: any) => acc + sess.total_volume, 0);

        // Find most frequent muscle group
        const volumeMap = new Map<string, number>();
        history.forEach((session: any) => {
            session.exercises.forEach((ex: any) => {
                if (ex.total_volume > 0) {
                    const current = volumeMap.get(ex.muscle_group) || 0;
                    volumeMap.set(ex.muscle_group, current + ex.total_volume);
                }
            });
        });

        let topMuscle = "various muscle groups";
        let maxVol = 0;
        volumeMap.forEach((vol, name) => {
            if (vol > maxVol) {
                maxVol = vol;
                topMuscle = name;
            }
        });

        // Generate synthetic insight based on the data
        let insight = `Great job logging ${totalWorkouts} workouts! Your total volume lifted is an impressive ${totalVolume.toLocaleString()} lbs. `;

        if (topMuscle !== "various muscle groups") {
            insight += `It looks like you've been heavily focusing on your ${topMuscle.toLowerCase()}. Make sure to balance out your training by hitting opposing muscle groups to prevent imbalances!`;
        } else {
            insight += `You've got a well-rounded training split. Keep pushing the intensity to see continued growth.`;
        }

        return NextResponse.json({ insight }, { status: 200 });

    } catch (error) {
        console.error("AI Insights error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
