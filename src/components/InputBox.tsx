"use client";

import { Send, Loader2 } from "lucide-react";

interface InputBoxProps {
    input: string;
    setInput: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
}

export default function InputBox({ input, setInput, onSubmit, isLoading }: InputBoxProps) {
    return (
        <form onSubmit={onSubmit} className="relative mt-4 flex items-end gap-3 w-full">
            <div className="relative w-full glass-panel rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            onSubmit(e as unknown as React.FormEvent);
                        }
                    }}
                    placeholder="Ask about calories, ingredients, or health benefits..."
                    className="w-full max-h-48 min-h-[60px] bg-transparent text-white px-5 py-4 resize-none focus:outline-none placeholder-gray-500 text-[15px]"
                    rows={1}
                />
            </div>
            <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 h-[60px] w-[60px] bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/30 disabled:text-emerald-200/50 text-gray-900 rounded-2xl flex items-center justify-center transition-all disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    <Send className="w-6 h-6" />
                )}
            </button>
        </form>
    );
}
