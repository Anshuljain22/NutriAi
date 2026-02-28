"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Activity, Flame, Users, Dumbbell, ShieldCheck, Heart, Medal, Trophy, CalendarDays, Zap } from "lucide-react";
import StatCard from "@/components/analytics/StatCard";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followers, setFollowers] = useState(0);

    const [showSettings, setShowSettings] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Form initialized with empty defaults; hydrated later
    const [editForm, setEditForm] = useState({
        weight_kg: 0,
        height_cm: 0,
        age: 0,
        gender: "male",
        activity_level: "moderate",
        fitness_goal: "maintenance",
        dietary_preference: ""
    });

    const fetchProfile = async () => {
        try {
            const res = await fetch(`/api/users/${id}/profile`);
            if (res.ok) {
                const data = await res.json();
                setProfile(data.profile);
                setPosts(data.recent_posts);
                setIsFollowing(data.profile.is_following);
                setFollowers(data.profile.followers);

                // Hydrate edit form with actual data if available
                if (data.profile) {
                    setEditForm({
                        weight_kg: data.profile.weight_kg || 0,
                        height_cm: data.profile.height_cm || 0,
                        age: data.profile.age || 0,
                        gender: data.profile.gender || "male",
                        activity_level: data.profile.activity_level || "moderate",
                        fitness_goal: data.profile.fitness_goal || "maintenance",
                        dietary_preference: data.profile.dietary_preference || ""
                    });
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [id, user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/users/${id}/profile/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                // Instantly sync the calculated goals via re-fetching
                await fetchProfile();
                setShowSettings(false);
            } else {
                alert("Failed to update profile.");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred while saving.");
        } finally {
            setIsUpdating(false);
        }
    };

    const toggleFollow = async () => {
        if (!user) return alert("Please log in to follow users.");
        const method = isFollowing ? "DELETE" : "POST";
        setIsFollowing(!isFollowing);
        setFollowers(prev => isFollowing ? prev - 1 : prev + 1);

        try {
            await fetch("/api/social/follow", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ following_id: id }),
            });
        } catch (e) {
            // Revert on error
            setIsFollowing(isFollowing);
            setFollowers(prev => isFollowing ? prev + 1 : prev - 1);
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
                body: JSON.stringify({ target_id: postId, target_type: "workout_post", vote_value: voteValue })
            });
        } catch (e) {
            fetchProfile(); // Revert
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[50vh] text-emerald-500">
            <div className="flex gap-2 isolate">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
            </div>
        </div>
    );

    if (!profile) return (
        <div className="text-center py-20 text-gray-400">User not found.</div>
    );

    const isSelf = user?.id === id;

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in pb-20">

            {/* Profile Header Card */}
            <div className="glass-panel p-6 md:p-10 rounded-3xl relative overflow-hidden border-emerald-500/20 shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">

                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-3xl font-black text-gray-900 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                            {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                                {profile.name}
                                {isSelf && <ShieldCheck className="w-6 h-6 text-emerald-400" />}
                            </h1>
                            <div className="flex gap-4 mt-2 text-gray-400 text-sm font-medium">
                                <p><span className="text-white font-bold">{followers}</span> Followers</p>
                                <p><span className="text-white font-bold">{profile.following}</span> Following</p>
                            </div>
                        </div>
                    </div>

                    {!isSelf && user && (
                        <button
                            onClick={toggleFollow}
                            className={`px-8 py-3 rounded-full font-bold transition-all shadow-lg ${isFollowing
                                ? "bg-white/10 text-white hover:bg-white/20"
                                : "bg-emerald-500 text-gray-900 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                }`}
                        >
                            {isFollowing ? "Following" : "Follow"}
                        </button>
                    )}

                    {isSelf && (
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors shadow-lg"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    )}

                </div>
            </div>

            {/* Profile Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="glass-panel p-6 md:p-8 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto border-white/10 shadow-2xl relative">
                        <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Body Metrics & Goals</h2>
                                <p className="text-gray-400 text-sm">Update your stats to recount nutrition targets.</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Weight (kg)</label>
                                    <input type="number" step="0.1" value={editForm.weight_kg || ''} onChange={(e) => setEditForm(prev => ({ ...prev, weight_kg: parseFloat(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium placeholder-gray-500" placeholder="e.g. 75" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Height (cm)</label>
                                    <input type="number" step="1" value={editForm.height_cm || ''} onChange={(e) => setEditForm(prev => ({ ...prev, height_cm: parseInt(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium placeholder-gray-500" placeholder="e.g. 180" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Age</label>
                                    <input type="number" step="1" value={editForm.age || ''} onChange={(e) => setEditForm(prev => ({ ...prev, age: parseInt(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium placeholder-gray-500" placeholder="e.g. 28" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Gender</label>
                                    <select value={editForm.gender || 'male'} onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium" required>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Activity Level</label>
                                    <select value={editForm.activity_level || 'moderate'} onChange={(e) => setEditForm(prev => ({ ...prev, activity_level: e.target.value }))} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium" required>
                                        <option value="sedentary">Sedentary (Little or no exercise)</option>
                                        <option value="light">Lightly Active (1-3 days/week)</option>
                                        <option value="moderate">Moderately Active (3-5 days/week)</option>
                                        <option value="heavy">Very Active (6-7 days/week)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Primary Goal</label>
                                    <select value={editForm.fitness_goal || 'maintenance'} onChange={(e) => setEditForm(prev => ({ ...prev, fitness_goal: e.target.value }))} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium" required>
                                        <option value="fat_loss">Fat Loss</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="muscle_gain">Muscle Gain</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-300 mb-2">Dietary Preference (Optional)</label>
                                    <select value={editForm.dietary_preference || ''} onChange={(e) => setEditForm(prev => ({ ...prev, dietary_preference: e.target.value }))} className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium">
                                        <option value="">None / Omnivore</option>
                                        <option value="vegetarian">Vegetarian</option>
                                        <option value="vegan">Vegan</option>
                                        <option value="keto">Keto</option>
                                        <option value="paleo">Paleo</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" disabled={isUpdating} className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 mt-4 text-lg">
                                {isUpdating ? 'Saving...' : 'Save & Calculate Targets'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Nutrition Targets Summary (Shows if available) */}
            {profile.daily_calorie_target > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Flame className="w-6 h-6 text-orange-500" /> Daily Targets</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="glass-panel p-4 rounded-2xl border-orange-500/20 text-center">
                            <p className="text-xs text-gray-400 mb-1">Calories</p>
                            <p className="text-2xl font-black text-orange-400">{profile.daily_calorie_target}</p>
                        </div>
                        <div className="glass-panel p-4 rounded-2xl border-emerald-500/20 text-center">
                            <p className="text-xs text-gray-400 mb-1">Protein</p>
                            <p className="text-2xl font-black text-emerald-400">{profile.daily_protein_target}g</p>
                        </div>
                        <div className="glass-panel p-4 rounded-2xl border-blue-500/20 text-center">
                            <p className="text-xs text-gray-400 mb-1">Carbs</p>
                            <p className="text-2xl font-black text-blue-400">{profile.daily_carb_target}g</p>
                        </div>
                        <div className="glass-panel p-4 rounded-2xl border-yellow-500/20 text-center">
                            <p className="text-xs text-gray-400 mb-1">Fat</p>
                            <p className="text-2xl font-black text-yellow-400">{profile.daily_fat_target}g</p>
                        </div>
                        <div className="glass-panel p-4 rounded-2xl border-cyan-500/20 text-center">
                            <p className="text-xs text-gray-400 mb-1">Water</p>
                            <p className="text-2xl font-black text-cyan-400">{(profile.daily_water_goal / 1000).toFixed(1)}L</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Aggregate Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard title="Total Workouts" value={profile.total_workouts} icon={<Dumbbell className="w-5 h-5" />} />
                <StatCard title="Lifetime Volume" value={`${profile.lifetime_volume.toLocaleString()}`} icon={<Activity className="w-5 h-5" />} />
                <StatCard title="Top Muscle" value={profile.favorite_muscle} icon={<Flame className="w-5 h-5" />} />
                <StatCard title="Workout Streak" value={`${profile.current_streak} days`} icon={<Zap className="w-5 h-5 text-amber-500" />} />
                <StatCard title="Nutrition Streak" value={`${profile.nutrition_streak} days`} icon={<Heart className="w-5 h-5 text-rose-500" />} />
                <StatCard title="Active Days" value={`${profile.total_active_days} days`} icon={<CalendarDays className="w-5 h-5 text-blue-500" />} />
            </div>

            {/* Achievements */}
            {profile.achievements && profile.achievements.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Medal className="w-6 h-6 text-yellow-500" /> Trophies</h2>
                    <div className="flex flex-wrap gap-4">
                        {profile.achievements.map((ach: any, idx: number) => (
                            <div key={idx} className="glass-panel px-4 py-3 rounded-2xl border-yellow-500/30 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm capitalize">{ach.achievement_type.replace(/_/g, ' ')}</p>
                                    <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(ach.earned_at), { addSuffix: true })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Feed */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">Recent Workouts</h2>
                {posts.length === 0 ? (
                    <div className="text-center py-16 px-4 glass-panel rounded-3xl border-dashed border-2 border-white/10 text-gray-400">
                        No recent workouts shared.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <div key={post.post_id} className="glass-panel p-6 rounded-2xl border-white/5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">
                                            {post.privacy === 'public' ? 'Public' : 'Followers Only'}
                                        </div>
                                        <p className="text-white text-lg">{post.caption}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>

                                {/* Mini Workout Summary */}
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-wrap gap-4 mt-2">
                                    <div className="flex-1 min-w-[120px]">
                                        <p className="text-xs text-gray-400">Total Volume</p>
                                        <p className="text-lg font-bold text-emerald-400">{post.workout.total_volume} lbs</p>
                                    </div>
                                    <div className="flex-1 min-w-[120px]">
                                        <p className="text-xs text-gray-400">Duration</p>
                                        <p className="text-lg font-bold text-white">{Math.floor(post.workout.duration / 60)}m</p>
                                    </div>
                                    <div className="flex-1 min-w-[120px]">
                                        <p className="text-xs text-gray-400">Exercises</p>
                                        <p className="text-lg font-bold text-white">{post.workout.exercises.length}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1 border border-white/10">
                                        <button
                                            onClick={() => handleVote(post.post_id, 1)}
                                            className={`transition-colors p-1 rounded-full ${post.user_vote === 1 ? "text-emerald-500 bg-emerald-500/10" : "text-gray-400 hover:text-emerald-400 hover:bg-white/10"}`}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                            </svg>
                                        </button>
                                        <span className={`font-bold text-xs ${post.user_vote === 1 ? "text-emerald-500" : post.user_vote === -1 ? "text-red-500" : "text-white"}`}>{post.score}</span>
                                        <button
                                            onClick={() => handleVote(post.post_id, -1)}
                                            className={`transition-colors p-1 rounded-full ${post.user_vote === -1 ? "text-red-500 bg-red-500/10" : "text-gray-400 hover:text-red-400 hover:bg-white/10"}`}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
