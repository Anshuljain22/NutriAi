"use client";

import { useState, useEffect, useRef } from "react";
import MessageBubble, { Message } from "./MessageBubble";
import InputBox from "./InputBox";

export default function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize session and load history
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch("/api/chat/history");
                if (res.ok) {
                    const data = await res.json();
                    if (data.history && data.history.length > 0) {
                        setMessages(data.history);
                    } else {
                        // Default welcome message if no DB history
                        setMessages([
                            {
                                id: "welcome",
                                role: "assistant",
                                content: "Hello! I am your personal AI Nutritionist. How can I help you today?",
                                timestamp: new Date().toISOString(),
                            }
                        ]);
                    }
                }
            } catch (err) {
                console.error("Failed to load secure chat history");
            }
        };

        fetchHistory();
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        // Async save user message to DB
        fetch("/api/chat/history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "user", content: userMsg.content }),
        }).catch(console.error);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg.content }),
            });

            if (!response.ok) throw new Error("API Error");

            const data = await response.json();

            const botMsg: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.reply || "Sorry, I couldn't process that request.",
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, botMsg]);

            // Async save assistant message to DB
            fetch("/api/chat/history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: "assistant", content: botMsg.content }),
            }).catch(console.error);

        } catch (error) {
            const errorMsg: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "Oops! Something went wrong while fetching the nutritional info.",
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const sampleQueries = [
        "How many calories are in a medium apple?",
        "What are the health benefits of spinach?",
        "Give me a high-protein breakfast idea.",
        "Is avocado good for weight loss?"
    ];

    const handleSampleClick = (query: string) => {
        setInput(query);
    };

    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto w-full px-2 sm:px-4 scroll-smooth pb-4 custom-scrollbar">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && (
                    <div className="flex justify-start mb-6">
                        <div className="glass-panel px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2 border-white/5 shadow-none">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="pt-2 shrink-0">
                {messages.length <= 1 && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-3 px-1 text-center sm:text-left">Suggested queries:</p>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            {sampleQueries.map((query, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSampleClick(query)}
                                    className="text-xs sm:text-sm px-4 py-2 rounded-full glass-button text-emerald-100 hover:text-emerald-300 active:scale-95 transition-all text-left"
                                >
                                    {query}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <InputBox
                    input={input}
                    setInput={setInput}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
