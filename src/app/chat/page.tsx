import ChatWindow from "@/components/ChatWindow";

export const metadata = {
    title: "Chat | NutriAI",
    description: "Chat with your personal AI Nutritionist.",
};

export default function ChatPage() {
    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] relative w-full overflow-hidden p-4 md:p-8">
            {/* Background ambient light */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

            <div className="flex-1 w-full max-w-4xl glass-panel rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden relative backdrop-blur-3xl z-10 h-full">
                {/* Header */}
                <div className="h-16 border-b border-white/10 flex items-center px-6 bg-white/5 shrink-0">
                    <h1 className="text-xl font-semibold text-white">Dietary Assistant</h1>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-sm text-gray-300 font-medium tracking-wide">AI Online</span>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-hidden flex flex-col p-2 md:p-6 bg-transparent h-[calc(100%-4rem)]">
                    <ChatWindow />
                </div>
            </div>
        </div>
    );
}
