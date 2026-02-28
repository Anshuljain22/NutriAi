"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/components/AuthProvider";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, ShieldCheck, Users, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CommunityPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();
    const [community, setCommunity] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // New Post State
    const [showNewPost, setShowNewPost] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newBody, setNewBody] = useState("");

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/communities/${id}`);
            if (res.ok) {
                const data = await res.json();
                setCommunity(data.community);
                setPosts(data.posts || []);
            } else {
                router.push("/communities");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, user]);

    const toggleJoin = async () => {
        if (!user) return alert("Log in to join.");
        const method = community.is_member ? "DELETE" : "POST";

        // Optimistic UI
        setCommunity({
            ...community,
            is_member: !community.is_member,
            members: community.is_member ? community.members - 1 : community.members + 1
        });

        try {
            const res = await fetch(`/api/communities/${id}/join`, { method });
            if (!res.ok) {
                const err = await res.json();
                alert(err.error);
                fetchData(); // Rollback on explicit error
            }
        } catch (e) {
            fetchData(); // Rollback
        }
    };

    const handlePostSubmit = async () => {
        if (!newTitle.trim() || !newBody.trim()) return;

        try {
            const res = await fetch(`/api/communities/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newTitle, body: newBody })
            });

            if (res.ok) {
                setNewTitle("");
                setNewBody("");
                setShowNewPost(false);
                fetchData(); // Refresh posts
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (e) {
            alert("Failed to submit post.");
        }
    };

    const handleVote = async (postId: string, voteValue: number) => {
        if (!user) return alert("Log in to vote.");

        // Optimistic Update
        setPosts(prev => prev.map(p => {
            if (p.post_id === postId) {
                const isRemovingVote = p.user_vote === voteValue;
                const newVote = isRemovingVote ? 0 : voteValue;
                const scoreDiff = newVote - p.user_vote;
                return { ...p, user_vote: newVote, score: p.score + scoreDiff };
            }
            return p;
        }));

        try {
            await fetch("/api/social/interact/vote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ target_id: postId, target_type: "post", vote_value: voteValue })
            });
        } catch (e) {
            fetchData(); // Revert
        }
    };


    if (loading) return (
        <div className="flex justify-center py-20 text-emerald-500 animate-pulse">Loading Hub...</div>
    );

    if (!community) return null;

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8 animate-in fade-in pb-20">

            {/* Community Banner */}
            <div className="glass-panel p-6 md:p-10 rounded-3xl relative overflow-hidden border-emerald-500/20 shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-20"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-white tracking-tight">{community.name}</h1>
                            {community.privacy === 'private' && (
                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-teal-400 bg-teal-400/10 px-2 py-1 rounded-md tracking-wider border border-teal-400/20">
                                    <ShieldCheck className="w-3 h-3" /> Private
                                </span>
                            )}
                        </div>
                        <p className="text-gray-300 text-lg mb-4 max-w-2xl">{community.description}</p>

                        <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
                            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {community.members} Members</span>
                            <span>•</span>
                            <span>Created by p/{community.creator}</span>
                        </div>
                    </div>

                    {user && (
                        <button
                            onClick={toggleJoin}
                            className={`shrink-0 px-8 py-3 rounded-full font-bold transition-all shadow-lg ${community.is_member
                                ? "bg-white/10 text-white hover:bg-white/20"
                                : "bg-emerald-500 text-gray-900 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                }`}
                        >
                            {community.is_member ? "Joined" : "Join Hub"}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">

                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Discussions</h2>
                    {community.is_member && (
                        <button
                            onClick={() => setShowNewPost(!showNewPost)}
                            className="text-emerald-400 font-medium hover:text-emerald-300"
                        >
                            + New Post
                        </button>
                    )}
                </div>

                {/* New Post Box */}
                {showNewPost && community.is_member && (
                    <div className="glass-panel p-6 rounded-2xl border-emerald-500/30 animate-in slide-in-from-top-4">
                        <input
                            type="text"
                            placeholder="Title"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-emerald-500 font-bold mb-4"
                            value={newTitle} onChange={e => setNewTitle(e.target.value)}
                            maxLength={100}
                        />
                        <textarea
                            placeholder="What's on your mind?"
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-emerald-500 resize-none mb-4"
                            value={newBody} onChange={e => setNewBody(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowNewPost(false)} className="px-5 py-2 text-gray-400 hover:text-white">Cancel</button>
                            <button onClick={handlePostSubmit} className="px-6 py-2 bg-emerald-500 text-gray-900 font-bold rounded-xl flex items-center gap-2">
                                <Send className="w-4 h-4" /> Post
                            </button>
                        </div>
                    </div>
                )}

                {/* Posts List */}
                {community.privacy === 'private' && !community.is_member ? (
                    <div className="text-center py-20 px-4 glass-panel rounded-3xl border-dashed border-2 border-white/10 text-gray-400">
                        Join this private community to see its discussions.
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-16 px-4 glass-panel rounded-3xl border-dashed border-2 border-white/10 text-gray-400">
                        No discussions started yet.
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post.post_id} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 hover:border-emerald-500/20 transition-all">
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
                                <Link href={`/profile/${post.author_id}`} className="hover:text-emerald-400 transition-colors">
                                    u/{post.author_name}
                                </Link>
                                <span>•</span>
                                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                            </div>

                            <Link href={`/communities/${id}/post/${post.post_id}`} className="block hover:text-emerald-400 transition-colors">
                                <h3 className="text-xl font-bold text-white leading-snug">{post.title}</h3>
                            </Link>
                            <p className="text-gray-300 leading-relaxed max-w-3xl whitespace-pre-wrap">
                                {post.body}
                            </p>

                            <div className="flex items-center gap-6 pt-4 mt-2 border-t border-white/5">
                                <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1 border border-white/10">
                                    <button
                                        onClick={() => handleVote(post.post_id, 1)}
                                        className={`transition-colors p-1 rounded-full ${post.user_vote === 1 ? "text-emerald-500 bg-emerald-500/10" : "text-gray-400 hover:text-emerald-400 hover:bg-white/10"}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                        </svg>
                                    </button>
                                    <span className={`font-bold text-sm ${post.user_vote === 1 ? "text-emerald-500" : post.user_vote === -1 ? "text-red-500" : "text-white"}`}>{post.score}</span>
                                    <button
                                        onClick={() => handleVote(post.post_id, -1)}
                                        className={`transition-colors p-1 rounded-full ${post.user_vote === -1 ? "text-red-500 bg-red-500/10" : "text-gray-400 hover:text-red-400 hover:bg-white/10"}`}
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>

                                <Link href={`/communities/${id}/post/${post.post_id}`} className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-emerald-400 transition-colors group">
                                    <MessageSquare className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                                    <span>{post.comment_count} Comment{post.comment_count !== 1 ? 's' : ''}</span>
                                </Link>
                            </div>
                        </div>
                    ))
                )}

            </div>
        </div>
    );
}
