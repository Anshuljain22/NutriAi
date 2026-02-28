"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { Users, Plus, ShieldCheck } from "lucide-react";

export default function CommunitiesPage() {
    const { user } = useAuth();
    const [communities, setCommunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newCommName, setNewCommName] = useState("");
    const [newCommDesc, setNewCommDesc] = useState("");

    const fetchCommunities = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/communities");
            if (res.ok) {
                const data = await res.json();
                setCommunities(data.communities || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunities();
    }, [user]);

    const handleCreate = async () => {
        if (!newCommName.trim()) return alert("Name required");
        try {
            const res = await fetch("/api/communities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCommName, description: newCommDesc, privacy: "public" })
            });
            if (res.ok) {
                setShowCreate(false);
                setNewCommName("");
                setNewCommDesc("");
                fetchCommunities();
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (e) {
            alert("Error creating community");
        }
    };

    const joinCommunity = async (id: string) => {
        if (!user) return alert("Please log in.");
        try {
            const res = await fetch(`/api/communities/${id}/join`, { method: "POST" });
            if (res.ok) fetchCommunities(); // refresh list to show "Joined" state
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Communities</h1>
                    <p className="text-gray-400">Join hubs to discuss training, nutrition, and form.</p>
                </div>
                {user && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Hub
                    </button>
                )}
            </div>

            {showCreate && (
                <div className="glass-panel p-6 rounded-2xl border-emerald-500/30">
                    <h3 className="text-xl font-bold text-white mb-4">Create New Community</h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Community Name (e.g. Powerlifting Elite)"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-emerald-500"
                            value={newCommName} onChange={(e) => setNewCommName(e.target.value)}
                        />
                        <textarea
                            placeholder="What is this hub about?"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-emerald-500 resize-none h-24"
                            value={newCommDesc} onChange={(e) => setNewCommDesc(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowCreate(false)} className="px-5 py-2 text-gray-400 hover:text-white">Cancel</button>
                            <button onClick={handleCreate} className="px-6 py-2 bg-emerald-500 text-gray-900 font-bold rounded-xl">Create</button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20 text-emerald-500 animate-pulse">Loading Hubs...</div>
            ) : communities.length === 0 ? (
                <div className="text-center py-20 text-gray-400 glass-panel rounded-3xl border-dashed border-2 border-white/10">No communities exist yet. Be the first to create one!</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {communities.map(comm => (
                        <div key={comm.id} className="glass-panel p-6 rounded-3xl flex flex-col justify-between hover:border-emerald-500/20 transition-all border border-white/5 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <Link href={`/communities/${comm.id}`} className="text-xl font-bold text-white hover:text-emerald-400 transition-colors flex items-center gap-2">
                                        {comm.name}
                                    </Link>
                                    {comm.privacy === 'private' && <ShieldCheck className="w-5 h-5 text-teal-500" />}
                                </div>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{comm.description}</p>
                            </div>

                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
                                    <Users className="w-4 h-4" />
                                    {comm.member_count} Member{comm.member_count !== 1 ? 's' : ''}
                                </div>

                                {comm.is_member === 1 ? (
                                    <Link href={`/communities/${comm.id}`} className="px-4 py-1.5 bg-white/10 text-white font-medium rounded-lg text-sm hover:bg-white/20 transition-colors">
                                        Enter Hub
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => joinCommunity(comm.id)}
                                        className="px-4 py-1.5 bg-emerald-500 text-gray-900 font-bold rounded-lg text-sm hover:bg-emerald-400 transition-colors shadow-md"
                                    >
                                        Join
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
