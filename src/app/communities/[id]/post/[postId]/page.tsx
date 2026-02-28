"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/components/AuthProvider";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function CommentThread({ comment, onReply, onVote, user }: { comment: any, onReply: any, onVote: any, user: any }) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");

    const handleReplySubmit = () => {
        if (!replyContent.trim()) return;
        onReply(comment.id, replyContent);
        setIsReplying(false);
        setReplyContent("");
    };

    return (
        <div className="flex border-l-2 border-white/5 pl-4 py-2 mt-4 space-x-3">
            <div className="flex flex-col items-center gap-1 min-w-[32px]">
                <button
                    onClick={() => onVote(comment.id, 'comment', 1)}
                    className={`transition-colors p-1 rounded-full ${comment.user_vote === 1 ? "text-emerald-500 bg-emerald-500/10" : "text-gray-400 hover:text-emerald-400 hover:bg-white/10"}`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                </button>
                <span className={`font-bold text-sm ${comment.user_vote === 1 ? "text-emerald-500" : comment.user_vote === -1 ? "text-red-500" : "text-white"}`}>{comment.vote_score}</span>
                <button
                    onClick={() => onVote(comment.id, 'comment', -1)}
                    className={`transition-colors p-1 rounded-full ${comment.user_vote === -1 ? "text-red-500 bg-red-500/10" : "text-gray-400 hover:text-red-400 hover:bg-white/10"}`}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <Link href={`/profile/${comment.user_id}`} className="hover:text-emerald-400 transition-colors">
                        u/{comment.author_name}
                    </Link>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">{comment.content}</p>
                <div className="flex items-center gap-4 pt-1">
                    <button onClick={() => {
                        if (!user) return alert("Log in to reply");
                        setIsReplying(!isReplying);
                    }} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-400 transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" /> Reply
                    </button>
                </div>

                {isReplying && (
                    <div className="mt-2 glass-panel p-3 rounded-xl border border-emerald-500/20 flex flex-col gap-2">
                        <textarea
                            placeholder="Write your reply..."
                            className="w-full h-20 bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:ring-emerald-500 resize-none"
                            value={replyContent} onChange={e => setReplyContent(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsReplying(false)} className="px-3 py-1 text-xs text-gray-400 hover:text-white">Cancel</button>
                            <button onClick={handleReplySubmit} className="px-4 py-1.5 bg-emerald-500 text-gray-900 font-bold rounded-lg text-xs">Reply</button>
                        </div>
                    </div>
                )}

                {/* Recursive Nested Comments */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2">
                        {comment.replies.map((reply: any) => (
                            <CommentThread key={reply.id} comment={reply} onReply={onReply} onVote={onVote} user={user} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


export default function PostThreadPage({ params }: { params: Promise<{ id: string, postId: string }> }) {
    const { id: commId, postId } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/communities/${commId}/post/${postId}`);
            if (res.ok) {
                const data = await res.json();
                setPost(data.post);
                setComments(data.comments || []);
            } else {
                router.push(`/communities/${commId}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [commId, postId, user]);

    const handleVote = async (targetId: string, targetType: string, voteValue: number) => {
        if (!user) return alert("Log in to vote.");

        // Optimistic Update
        const applyOptimistic = (currentVote: number, score: number) => {
            const isRemovingVote = currentVote === voteValue;
            const newVote = isRemovingVote ? 0 : voteValue;
            const scoreDiff = newVote - currentVote;
            return { newVote, newScore: score + scoreDiff };
        };

        if (targetType === 'post') {
            setPost((prev: any) => {
                const { newVote, newScore } = applyOptimistic(prev.user_vote, prev.score);
                return { ...prev, user_vote: newVote, score: newScore };
            });
        } else {
            // Recursive comment search map
            const recursiveMap = (list: any[]): any[] => list.map(c => {
                if (c.id === targetId) {
                    const { newVote, newScore } = applyOptimistic(c.user_vote, c.vote_score);
                    return { ...c, user_vote: newVote, vote_score: newScore };
                }
                if (c.replies && c.replies.length > 0) {
                    return { ...c, replies: recursiveMap(c.replies) };
                }
                return c;
            });
            setComments(prev => recursiveMap(prev));
        }

        try {
            await fetch("/api/social/interact/vote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ target_id: targetId, target_type: targetType, vote_value: voteValue })
            });
        } catch (e) {
            fetchData(); // Revert
        }
    };

    const handleCommentSubmit = async (parentCommentId: string | null = null, content: string = newComment) => {
        if (!user) return alert("Log in to comment.");
        if (!content.trim()) return;

        try {
            const res = await fetch("/api/social/interact/comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ post_id: postId, parent_comment_id: parentCommentId, content })
            });

            if (res.ok) {
                if (!parentCommentId) setNewComment("");
                fetchData(); // Refresh to inject new comment into the tree
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (e) {
            alert("Failed to post comment.");
        }
    };


    if (loading) return (
        <div className="flex justify-center py-20 text-emerald-500 animate-pulse">Loading Thread...</div>
    );

    if (!post) return null;

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in pb-32">

            <Link href={`/communities/${commId}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 font-medium mb-2 transition-colors w-fit">
                <ArrowLeft className="w-4 h-4" /> Back to Community
            </Link>

            {/* Post Wrapper */}
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-emerald-500/10 shadow-xl flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 bg-white/[0.02]">

                {/* Voting Column */}
                <div className="flex sm:flex-col items-center gap-2 bg-white/5 sm:bg-transparent rounded-full sm:rounded-none px-4 py-2 sm:p-0 w-fit mx-auto sm:mx-0">
                    <button
                        onClick={() => handleVote(post.id, 'post', 1)}
                        className={`transition-colors p-2 rounded-full ${post.user_vote === 1 ? "text-emerald-500 bg-emerald-500/10" : "text-gray-400 hover:text-emerald-400 hover:bg-white/10"}`}
                    >
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    <span className={`font-black text-xl ${post.user_vote === 1 ? "text-emerald-500" : post.user_vote === -1 ? "text-red-500" : "text-white"}`}>{post.score}</span>
                    <button
                        onClick={() => handleVote(post.id, 'post', -1)}
                        className={`transition-colors p-2 rounded-full ${post.user_vote === -1 ? "text-red-500 bg-red-500/10" : "text-gray-400 hover:text-red-400 hover:bg-white/10"}`}
                    >
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {/* Post Content */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <Link href={`/profile/${post.user_id}`} className="hover:text-emerald-400 transition-colors">
                            u/{post.author_name}
                        </Link>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                        {post.is_pinned === 1 && <span className="text-emerald-400 px-2 py-0.5 bg-emerald-400/10 rounded uppercase text-[10px] tracking-wider ml-2">Pinned</span>}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">{post.title}</h1>
                    <p className="text-gray-300 leading-relaxed max-w-3xl whitespace-pre-wrap text-[15px] sm:text-base">
                        {post.body}
                    </p>

                    <div className="flex items-center gap-2 pt-6 text-sm font-medium text-gray-400">
                        <MessageSquare className="w-5 h-5" />
                        <span>{post.comment_count} Comment{post.comment_count !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>

            {/* Comment Section Header */}
            <div className="pt-6 border-t border-white/10 space-y-8">

                {/* Top Level Reply Box */}
                <div className="glass-panel p-4 sm:p-6 rounded-2xl border-white/5 space-y-4">
                    <p className="text-sm font-bold text-gray-300">Comment as {user ? `u/${user.name}` : 'Guest'}</p>
                    <textarea
                        disabled={!user}
                        placeholder={user ? "What are your thoughts?" : "Log in to post a comment"}
                        className="w-full h-24 sm:h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-emerald-500 resize-none disabled:opacity-50"
                        value={newComment} onChange={e => setNewComment(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <button
                            disabled={!user || !newComment.trim()}
                            onClick={() => handleCommentSubmit(null, newComment)}
                            className="px-6 py-2.5 bg-emerald-500 text-gray-900 font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 hover:bg-emerald-400 transition-colors"
                        >
                            <Send className="w-4 h-4" /> Comment
                        </button>
                    </div>
                </div>

                {/* Recursive Comments Tree */}
                <div className="space-y-6">
                    {comments.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 italic">No comments yet. Be the first to share your thoughts!</div>
                    ) : (
                        comments.map(c => (
                            <CommentThread key={c.id} comment={c} onReply={handleCommentSubmit} onVote={handleVote} user={user} />
                        ))
                    )}
                </div>
            </div>

        </div>
    );
}
