"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
    startTime: string | null;
}

export default function Timer({ startTime }: TimerProps) {
    const [elapsedString, setElapsedString] = useState("00:00:00");

    useEffect(() => {
        if (!startTime) return;

        const interval = setInterval(() => {
            const now = new Date();
            const start = new Date(startTime);
            const diffInSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);

            const hours = Math.floor(diffInSeconds / 3600);
            const minutes = Math.floor((diffInSeconds % 3600) / 60);
            const seconds = diffInSeconds % 60;

            const formatted = [
                hours.toString().padStart(2, "0"),
                minutes.toString().padStart(2, "0"),
                seconds.toString().padStart(2, "0"),
            ].join(":");

            setElapsedString(formatted);
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    if (!startTime) return null;

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full font-mono text-lg mb-4 w-fit border border-emerald-500/20">
            <Clock className="w-5 h-5" />
            <span>{elapsedString}</span>
        </div>
    );
}
