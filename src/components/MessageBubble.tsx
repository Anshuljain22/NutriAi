import React, { HTMLProps } from "react";
import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

export type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date | string | number;
};

export default function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === "user";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6`}
        >
            <div className={`flex max-w-[85%] sm:max-w-[75%] gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                    }`}>
                    {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm overflow-hidden ${isUser
                        ? "bg-emerald-600 text-white rounded-tr-sm"
                        : "glass-panel text-gray-200 rounded-tl-sm border-white/5"
                        }`}>
                        {isUser ? (
                            message.content
                        ) : (
                            <div className="styled-markdown">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeSanitize]}
                                    components={{
                                        p: ({ node, ...props }: any) => <p className="mb-2 last:mb-0 leading-relaxed text-[14px]" {...props} />,
                                        strong: ({ node, ...props }: any) => <strong className="font-semibold text-emerald-300" {...props} />,
                                        ul: ({ node, ...props }: any) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                        ol: ({ node, ...props }: any) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                        li: ({ node, ...props }: any) => <li className="text-[14px]" {...props} />,
                                        h1: ({ node, ...props }: any) => <h1 className="text-lg font-bold mb-2 text-white" {...props} />,
                                        h2: ({ node, ...props }: any) => <h2 className="text-base font-bold mb-2 text-white" {...props} />,
                                        h3: ({ node, ...props }: any) => <h3 className="text-[15px] font-semibold mb-1 text-white" {...props} />,
                                        a: ({ node, ...props }: any) => <a className="text-emerald-400 hover:text-emerald-300 underline" target="_blank" rel="noreferrer" {...props} />,
                                        code: ({ node, inline, className, children, ...props }: any) => {
                                            return !inline ? (
                                                <div className="bg-black/40 rounded-md p-3 my-2 text-xs overflow-x-auto border border-white/5">
                                                    <code {...props}>{children}</code>
                                                </div>
                                            ) : (
                                                <code className="bg-black/30 px-1.5 py-0.5 rounded text-emerald-200 text-[13px]" {...props}>{children}</code>
                                            )
                                        }
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                    <span className="text-xs text-gray-500 mt-1.5 px-1 font-medium">
                        {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date(message.timestamp))}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
