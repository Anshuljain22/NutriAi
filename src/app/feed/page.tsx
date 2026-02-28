"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, Flame } from "lucide-react";
import Link from "next/link";
import { WorkoutSession } from "@/types/workout";

// Define shape of feed post based on the API response
type FeedPost = {
    post_id: string;
    author: { id: string; name: string };
    caption: string;
    privacy: string;
    created_at: string;
    likes: number;
    comments: number;
    has_liked: boolean;
    workout: WorkoutSession;
};

export default function FeedPage() {
    const { user } = useAuth();
    const [feed, setFeed] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortParam, setSortParam] = useState<"newest" | "trending">("newest");

    const fetchFeed = async (sort: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/social/feed?sort=${sort}`);
            if (res.ok) {
                const data = await res.json();
                setFeed(data.feed || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed(sortParam);
    }, [sortParam, user]);

    const toggleLike = async (postId: string, currentLikeStatus: boolean) => {
        if (!user) return alert("Please log in to interact.");

        // Optimistic UI Update
        setFeed((prev) =>
            prev.map((post) =>
                post.post_id === postId
                    ? { ...post, has_liked: !currentLikeStatus, likes: currentLikeStatus ? post.likes - 1 : post.likes + 1 }
                    : post
            )
        );

        const method = currentLikeStatus ? "DELETE" : "POST";
        try {
            await fetch("/api/social/interact/like", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ target_id: postId, target_type: "workout_post" })
            });
        } catch (e) {
            // Revert optimistic update
            setFeed((prev) =>
                prev.map((post) =>
                    post.post_id === postId
                        ? { ...post, has_liked: currentLikeStatus, likes: currentLikeStatus ? post.likes + 1 : post.likes - 1 }
                        : post
                )
            );
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 md:p-8 max-w-3xl mx-auto w-full space-y-8 animate-in fade-in pb-20">

            {/* Header & Sort Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Social Feed</h1>
                    <p className="text-gray-400">See what your friends are lifting.</p>
                </div>

                <div className="glass-panel p-1 rounded-xl flex gap-1">
                    <button
                        onClick={() => setSortParam("newest")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortParam === "newest" ? "bg-emerald-500 text-gray-900 shadow-md" : "text-gray-400 hover:text-white"}`}
                    >
                        Newest
                    </button>
                    <button
                        onClick={() => setSortParam("trending")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${sortParam === "trending" ? "bg-emerald-500 text-gray-900 shadow-md" : "text-gray-400 hover:text-white"}`}
                    >
                        <Flame className="w-4 h-4" /> Trending
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s] mr-1"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s] mr-1"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                </div>
            ) : feed.length === 0 ? (
                <div className="text-center py-20 px-4 glass-panel rounded-3xl border-dashed border-2 border-white/10 text-gray-400">
                    No posts found. Start following users to populate your feed!
                </div>
            ) : (
                <div className="space-y-6">
                    {feed.map((post) => (
                        <div key={post.post_id} className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 hover:border-emerald-500/20 transition-all shadow-lg hover:shadow-emerald-500/5">

                            {/* Post Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <Link href={`/profile/${post.author.id}`} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-lg font-black text-gray-900 hover:opacity-80 transition-opacity">
                                        {post.author.name.charAt(0).toUpperCase()}
                                    </Link>
                                    <div>
                                        <Link href={`/profile/${post.author.id}`} className="text-white font-bold hover:text-emerald-400 transition-colors">
                                            {post.author.name}
                                        </Link>
                                        <p className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                {post.privacy === 'followers' && (
                                    <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-400/10 px-2 py-1 rounded-md tracking-wider">Followers Only</span>
                                )}
                            </div>

                            {/* Caption */}
                            {post.caption && (
                                <p className="text-gray-200 text-lg leading-relaxed">{post.caption}</p>
                            )}

                            {/* Workout Snippet */}
                            <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 flex flex-wrap gap-4">
                                <div className="flex-1 min-w-[120px]">
                                    <p className="text-xs text-gray-400 font-medium">Total Volume</p>
                                    <p className="text-xl font-black text-emerald-400 tracking-tight">{post.workout.total_volume.toLocaleString()} <span className="text-sm font-medium text-emerald-500/60">lbs</span></p>
                                </div>
                                <div className="flex-1 min-w-[120px]">
                                    <p className="text-xs text-gray-400 font-medium">Duration</p>
                                    <p className="text-xl font-black text-white tracking-tight">{Math.floor((post.workout.duration || 0) / 60)} <span className="text-sm text-gray-500 font-medium">min</span></p>
                                </div>
                                <div className="flex-1 min-w-[120px]">
                                    <p className="text-xs text-gray-400 font-medium">Exercises</p>
                                    <p className="text-xl font-black text-white tracking-tight">{post.workout.exercises.length} <span className="text-sm text-gray-500 font-medium">mvmt</span></p>
                                </div>
                            </div>

                            {/* Micro-interactions Bar */}
                            <div className="flex items-center gap-6 pt-2 border-t border-white/5">
                                <button
                                    onClick={() => toggleLike(post.post_id, post.has_liked)}
                                    className="flex items-center gap-2 text-sm font-medium transition-colors group"
                                >
                                    <Heart className={`w-5 h-5 transition-all group-hover:scale-110 ${post.has_liked ? "fill-red-500 text-red-500" : "text-gray-400 group-hover:text-red-400"}`} />
                                    <span className={post.has_liked ? "text-red-500" : "text-gray-400 group-hover:text-red-400"}>{post.likes}</span>
                                </button>

                                <button className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-emerald-400 transition-colors group">
                                    <MessageSquare className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                                    <span>{post.comments} Comment{post.comments !== 1 ? 's' : ''}</span>
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
