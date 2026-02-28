"use client";

import { SetData } from "@/types/workout";
import { Trash2 } from "lucide-react";

interface SetRowProps {
    index: number;
    set: SetData;
    onUpdate: (setId: string, field: "reps" | "weight", value: number) => void;
    onRemove: (setId: string) => void;
}

export default function SetRow({ index, set, onUpdate, onRemove }: SetRowProps) {
    return (
        <div className="flex items-center gap-4 py-2 animate-in slide-in-from-top-2">
            <div className="w-8 text-center text-gray-500 font-medium">{index + 1}</div>

            <div className="flex-1 flex gap-2 sm:gap-4">
                <div className="relative flex-1">
                    <label className="absolute -top-2 left-2 text-[10px] text-gray-400 bg-[#1e1e22] px-1 font-semibold uppercase tracking-wider z-10">Reps</label>
                    <input
                        type="number"
                        min="0"
                        value={set.reps || ""}
                        onChange={(e) => onUpdate(set.id, "reps", parseInt(e.target.value) || 0)}
                        className="w-full bg-[#1e1e22] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 transition-colors text-center"
                        placeholder="0"
                    />
                </div>

                <div className="relative flex-1">
                    <label className="absolute -top-2 left-2 text-[10px] text-gray-400 bg-[#1e1e22] px-1 font-semibold uppercase tracking-wider z-10">Lbs</label>
                    <input
                        type="number"
                        min="0"
                        step="2.5"
                        value={set.weight || ""}
                        onChange={(e) => onUpdate(set.id, "weight", parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#1e1e22] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500/50 transition-colors text-center"
                        placeholder="0"
                    />
                </div>
            </div>

            <div className="w-16 text-right font-mono text-emerald-400/80 font-medium">
                {set.volume > 0 ? set.volume : "-"}
            </div>

            <button
                onClick={() => onRemove(set.id)}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors focus:outline-none"
                title="Remove Set"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
