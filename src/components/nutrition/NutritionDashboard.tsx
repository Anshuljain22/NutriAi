"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Plus, Flame, Droplets, Target, Activity } from "lucide-react";
import MealLoggerModal from "./MealLoggerModal";

export default function NutritionDashboard() {
    const { user } = useAuth();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [summary, setSummary] = useState<any>(null);
    const [meals, setMeals] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showLogger, setShowLogger] = useState(false);

    const fetchNutritionData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch User Profile for Targets
            const profileRes = await fetch(`/api/users/${user.id}/profile`);
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfile(profileData.profile);
            }

            // Fetch Daily Meals & Summary
            const mealRes = await fetch(`/api/nutrition/meals?date=${date}`);
            if (mealRes.ok) {
                const mealData = await mealRes.json();
                setSummary(mealData.summary);
                setMeals(mealData.meals);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNutritionData();
    }, [date, user]);

    // Derived States
    const targetCalories = profile?.daily_calorie_target || 2000;
    const consumedCalories = summary?.total_calories || 0;
    const remainingCalories = targetCalories - consumedCalories;
    const calorieProgress = Math.min((consumedCalories / targetCalories) * 100, 100);

    const targetProtein = profile?.daily_protein_target || 150;
    const consumedProtein = summary?.total_protein_g || 0;
    const proteinProgress = Math.min((consumedProtein / targetProtein) * 100, 100);

    const targetCarbs = profile?.daily_carb_target || 250;
    const consumedCarbs = summary?.total_carbs_g || 0;
    const carbProgress = Math.min((consumedCarbs / targetCarbs) * 100, 100);

    const targetFat = profile?.daily_fat_target || 70;
    const consumedFat = summary?.total_fat_g || 0;
    const fatProgress = Math.min((consumedFat / targetFat) * 100, 100);

    const targetWater = (profile?.daily_water_goal || 3000) / 1000; // in L
    const consumedWater = (summary?.total_water_ml || 0) / 1000;
    const waterProgress = Math.min((consumedWater / targetWater) * 100, 100);

    const addWater = async (amount: number) => {
        try {
            const res = await fetch('/api/nutrition/water', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount_ml: amount, date })
            });
            if (res.ok) fetchNutritionData();
        } catch (e) { console.error(e); }
    }

    if (loading && !profile) {
        return <div className="animate-pulse h-64 bg-white/5 rounded-3xl mt-8"></div>;
    }

    return (
        <div className="w-full space-y-6">

            {/* Header / Date Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Flame className="w-6 h-6 text-orange-500" /> Daily Nutrition
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Track your fuel and hit your goals.</p>
                </div>

                <div className="flex bg-[#1A1A1A] rounded-xl p-1 border border-white/10 shrink-0">
                    <button
                        onClick={() => {
                            const d = new Date(date);
                            d.setDate(d.getDate() - 1);
                            setDate(d.toISOString().split('T')[0]);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                    >
                        &larr;
                    </button>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent text-white px-2 py-1 focus:outline-none font-bold text-center w-36"
                        max={new Date().toISOString().split('T')[0]}
                    />
                    <button
                        onClick={() => {
                            const d = new Date(date);
                            d.setDate(d.getDate() + 1);
                            const today = new Date().toISOString().split('T')[0];
                            if (d.toISOString().split('T')[0] <= today) {
                                setDate(d.toISOString().split('T')[0]);
                            }
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white disabled:opacity-30"
                        disabled={date === new Date().toISOString().split('T')[0]}
                    >
                        &rarr;
                    </button>
                </div>
            </div>

            {/* Target Alert */}
            {!profile?.daily_calorie_target && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-2xl flex items-start gap-3">
                    <Target className="w-5 h-5 mt-0.5 shrink-0" />
                    <p className="text-sm">You haven't set your body metrics yet. <strong>Update your Profile</strong> to calculate your personalized daily calorie and macro targets.</p>
                </div>
            )}

            {/* Main Summary Rings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Calories Component */}
                <div className="glass-panel p-6 rounded-3xl border-orange-500/20 shadow-lg lg:col-span-1 flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                    <h3 className="text-gray-400 font-bold mb-6 w-full text-left">Calories</h3>

                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                                className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)] transition-all duration-1000 ease-in-out"
                                strokeDasharray="440"
                                strokeDashoffset={440 - (440 * calorieProgress) / 100}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-black text-white">{remainingCalories > 0 ? remainingCalories : 0}</span>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Remaining</span>
                        </div>
                    </div>

                    <div className="flex justify-between w-full mt-8 px-4 text-center">
                        <div>
                            <p className="text-xs text-gray-400">Target</p>
                            <p className="font-bold text-white text-lg">{targetCalories}</p>
                        </div>
                        <div>
                            <p className="text-xs text-orange-400">Eaten</p>
                            <p className="font-bold text-orange-400 text-lg">{consumedCalories}</p>
                        </div>
                    </div>
                </div>

                {/* Macros & Water Component */}
                <div className="glass-panel p-6 rounded-3xl border-white/10 shadow-lg lg:col-span-2 grid grid-cols-2 gap-6">

                    <h3 className="col-span-2 text-gray-400 font-bold">Macros Tracker</h3>

                    {/* Protein */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-emerald-400">Protein</span>
                            <span className="text-gray-400">{consumedProtein} / {targetProtein}g</span>
                        </div>
                        <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${proteinProgress}%` }}></div>
                        </div>
                    </div>

                    {/* Carbs */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-blue-400">Carbs</span>
                            <span className="text-gray-400">{consumedCarbs} / {targetCarbs}g</span>
                        </div>
                        <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${carbProgress}%` }}></div>
                        </div>
                    </div>

                    {/* Fat */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-yellow-400">Fat</span>
                            <span className="text-gray-400">{consumedFat} / {targetFat}g</span>
                        </div>
                        <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                            <div className="bg-yellow-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(234,179,8,0.5)]" style={{ width: `${fatProgress}%` }}></div>
                        </div>
                    </div>

                    {/* Water */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-cyan-400 flex items-center gap-1"><Droplets className="w-4 h-4" /> Water</span>
                            <span className="text-gray-400">{consumedWater.toFixed(1)} / {targetWater.toFixed(1)}L</span>
                        </div>
                        <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden flex">
                            <div className="bg-cyan-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${waterProgress}%` }}></div>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => addWater(250)} className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs py-1.5 rounded-lg border border-cyan-500/20 transition-colors">+250ml</button>
                            <button onClick={() => addWater(500)} className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs py-1.5 rounded-lg border border-cyan-500/20 transition-colors">+500ml</button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Meals List */}
            <div className="glass-panel p-6 rounded-3xl border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Today's Log</h3>
                    <button
                        onClick={() => setShowLogger(true)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-gray-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] text-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Food
                    </button>
                </div>

                {meals.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-2xl text-gray-400 flex flex-col items-center">
                        <Activity className="w-8 h-8 opacity-20 mb-2" />
                        <p>No meals logged today.</p>
                        <button onClick={() => setShowLogger(true)} className="text-emerald-400 mt-2 hover:underline text-sm font-bold">Start Tracking</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {['breakfast', 'lunch', 'dinner', 'snack'].map(type => {
                            const typeMeals = meals.filter(m => m.meal_type === type);
                            if (typeMeals.length === 0) return null;

                            return (
                                <div key={type} className="space-y-2">
                                    <h4 className="text-sm font-bold text-gray-400 capitalize flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-white/30"></div>
                                        {type}
                                    </h4>
                                    <div className="space-y-2">
                                        {typeMeals.map(meal => (
                                            <div key={meal.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center group hover:border-emerald-500/30 transition-colors">
                                                <div>
                                                    <p className="text-white font-bold">{meal.food_name}</p>
                                                    <div className="flex gap-3 text-xs text-gray-400 mt-1">
                                                        <span className="text-emerald-400">{meal.protein_g}g P</span>
                                                        <span className="text-blue-400">{meal.carbs_g}g C</span>
                                                        <span className="text-yellow-400">{meal.fat_g}g F</span>
                                                    </div>
                                                </div>
                                                <div className="text-orange-400 font-bold text-lg">
                                                    {meal.calories}
                                                    <span className="text-xs text-gray-500 ml-1">kcal</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {showLogger && (
                <MealLoggerModal
                    onClose={() => setShowLogger(false)}
                    onLogged={() => {
                        setShowLogger(false);
                        fetchNutritionData();
                    }}
                    date={date}
                />
            )}

        </div>
    );
}
