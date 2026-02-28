"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Heart, MessageSquare, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationsDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Polling / Initialization
    useEffect(() => {
        const fetchNotifs = async () => {
            try {
                const res = await fetch("/api/notifications");
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || []);
                    setUnreadCount(data.unread || 0);
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchNotifs();
        const interval = setInterval(fetchNotifs, 30000); // 30s poll
        return () => clearInterval(interval);
    }, []);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOpen = async () => {
        setIsOpen(!isOpen);

        if (!isOpen && unreadCount > 0) {
            // Optimistic clearance
            setUnreadCount(0);
            try {
                await fetch("/api/notifications", { method: "PUT" });
            } catch (e) {
                console.error("Failed marking read");
            }
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'upvote_post': return <Heart className="w-5 h-5 text-emerald-500 fill-emerald-500" />;
            case 'comment_post': return <MessageSquare className="w-5 h-5 text-blue-400" />;
            case 'follow': return <UserPlus className="w-5 h-5 text-teal-400" />;
            case 'achievement': return <Bell className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
            default: return <Bell className="w-5 h-5 text-gray-400" />;
        }
    };

    const getMessage = (n: any) => {
        switch (n.type) {
            case 'upvote_post': return "upvoted your post.";
            case 'comment_post': return "replied to your post.";
            case 'follow': return "started following you.";
            case 'achievement': return "You unlocked a new achievement!";
            default: return "interacted with you.";
        }
    };

    const getHref = (n: any) => {
        switch (n.type) {
            case 'follow': return `/profile/${n.actor_id}`;
            case 'achievement': return `/profile/${n.user_id}`; // They can see it on their own profile
            default: return null; // Deep linking to specific post would use reference_id
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleOpen}
                className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-[#0f0f11] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 glass-panel border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-top-2">
                    <div className="p-4 border-b border-white/10 font-bold text-white bg-white/5">
                        Notifications
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-500">
                                You're all caught up!
                            </div>
                        ) : (
                            notifications.map(n => {
                                const href = getHref(n);
                                const content = (
                                    <div className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors flex items-start gap-4 ${n.is_read === 0 ? "bg-emerald-500/5" : ""}`}>
                                        <div className="mt-1 shrink-0">{getIcon(n.type)}</div>
                                        <div>
                                            <p className="text-sm text-gray-300">
                                                {n.type !== 'achievement' && <span className="font-bold text-white mr-1">{n.actor_name}</span>}
                                                {getMessage(n)}
                                            </p>
                                            <span className="text-xs text-gray-500 mt-1 block">
                                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                );

                                return href ? (
                                    <Link key={n.id} href={href} onClick={() => setIsOpen(false)}>
                                        {content}
                                    </Link>
                                ) : (
                                    <div key={n.id}>{content}</div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
