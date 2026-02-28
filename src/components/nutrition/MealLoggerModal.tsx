"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

export default function MealLoggerModal({ onClose, onLogged, date }: { onClose: () => void, onLogged: () => void, date: string }) {
    const [mealType, setMealType] = useState('breakfast');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // For manual entry
    const [manualEntry, setManualEntry] = useState({
        food_name: '',
        calories: '',
        protein_g: '',
        carbs_g: '',
        fat_g: ''
    });

    const [isManual, setIsManual] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Hardcoded Nutrition Database (Mock for now, could integrate a real API like Edamam)
    const mockDB = [
        { id: 1, name: "Oatmeal with Blueberries", calories: 350, protein: 10, carbs: 60, fat: 6, serving: "1 bowl" },
        { id: 2, name: "Grilled Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: "100g" },
        { id: 3, name: "Brown Rice", calories: 216, protein: 5, carbs: 45, fat: 1.8, serving: "1 cup" },
        { id: 4, name: "Salmon", calories: 208, protein: 20, carbs: 0, fat: 13, serving: "100g" },
        { id: 5, name: "Avocado Toast", calories: 320, protein: 8, carbs: 28, fat: 22, serving: "1 slice" },
        { id: 6, name: "Whey Protein Shake", calories: 120, protein: 24, carbs: 3, fat: 1, serving: "1 scoop" },
        { id: 7, name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.3, serving: "1 medium" },
    ];

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setSearchResults([]);

        try {
            const res = await fetch('/api/nutrition/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery })
            });

            if (res.ok) {
                const data = await res.json();
                // We wrap the single AI result in an array to match the UI map structure
                setSearchResults([{ ...data.item, id: 1 }]);
            } else {
                alert("Failed to find food data.");
            }
        } catch (err) {
            console.error(err);
            alert("Error communicating with AI.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectFood = async (food: any) => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/nutrition/meals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    meal_type: mealType,
                    food_name: food.name,
                    calories: food.calories,
                    protein_g: food.protein,
                    carbs_g: food.carbs,
                    fat_g: food.fat
                })
            });

            if (res.ok) {
                onLogged();
            } else {
                alert("Failed to log meal.");
            }
        } catch (e) {
            console.error(e);
            alert("Error logging meal.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/nutrition/meals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date,
                    meal_type: mealType,
                    food_name: manualEntry.food_name,
                    calories: parseInt(manualEntry.calories) || 0,
                    protein_g: parseInt(manualEntry.protein_g) || 0,
                    carbs_g: parseInt(manualEntry.carbs_g) || 0,
                    fat_g: parseInt(manualEntry.fat_g) || 0
                })
            });

            if (res.ok) {
                onLogged();
            } else {
                alert("Failed to log meal.");
            }
        } catch (e) {
            console.error(e);
            alert("Error logging meal.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="glass-panel p-6 md:p-8 rounded-3xl w-full max-w-lg border-white/10 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold text-white mb-6">Log Food</h2>

                {/* Meal Type Selection */}
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 mb-6">
                    {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                        <button
                            key={type}
                            onClick={() => setMealType(type)}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${mealType === type ? 'bg-emerald-500 text-gray-900 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Toggle Input Mode */}
                <div className="flex justify-center mb-4 gap-4">
                    <button onClick={() => setIsManual(false)} className={`text-sm font-bold pb-2 border-b-2 transition-colors ${!isManual ? 'text-emerald-400 border-emerald-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>Database Search</button>
                    <button onClick={() => setIsManual(true)} className={`text-sm font-bold pb-2 border-b-2 transition-colors ${isManual ? 'text-emerald-400 border-emerald-400' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>Manual Entry</button>
                </div>

                {!isManual ? (
                    <div>
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="relative mb-6">
                            <input
                                type="text"
                                placeholder="Search foods (e.g. Oatmeal)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                            />
                            <Search className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                            <button type="submit" className="absolute right-2 top-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                Search
                            </button>
                        </form>

                        {/* Search Results */}
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {isSearching ? (
                                <div className="text-center py-8 text-emerald-400 flex flex-col items-center">
                                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                                    <span>Searching Database...</span>
                                </div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map(food => (
                                    <button
                                        key={food.id}
                                        onClick={() => handleSelectFood(food)}
                                        disabled={isSaving}
                                        className="w-full bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 flex justify-between items-center text-left transition-colors group disabled:opacity-50"
                                    >
                                        <div>
                                            <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">{food.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{food.serving}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-orange-400">{food.calories} kcal</p>
                                            <p className="text-xs text-gray-400 gap-2 flex mt-1">
                                                <span className="text-emerald-400">{food.protein}P</span>
                                                <span className="text-blue-400">{food.carbs}C</span>
                                                <span className="text-yellow-400">{food.fat}F</span>
                                            </p>
                                        </div>
                                    </button>
                                ))
                            ) : searchQuery.trim() !== '' ? (
                                <div className="text-center py-8 text-gray-500">No results found for "{searchQuery}". Try manual entry.</div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">Search for a food to log it to your day.</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-1">Food Name*</label>
                            <input type="text" required value={manualEntry.food_name} onChange={(e) => setManualEntry({ ...manualEntry, food_name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none" placeholder="e.g. Grandma's Lasagna" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-1">Calories*</label>
                                <input type="number" required value={manualEntry.calories} onChange={(e) => setManualEntry({ ...manualEntry, calories: e.target.value })} className="w-full bg-white/5 border text-orange-400 border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500 focus:outline-none placeholder-gray-600" placeholder="kcal" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-1">Protein (g)</label>
                                <input type="number" value={manualEntry.protein_g} onChange={(e) => setManualEntry({ ...manualEntry, protein_g: e.target.value })} className="w-full bg-white/5 border text-emerald-400 border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500 focus:outline-none placeholder-gray-600" placeholder="g" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-1">Carbs (g)</label>
                                <input type="number" value={manualEntry.carbs_g} onChange={(e) => setManualEntry({ ...manualEntry, carbs_g: e.target.value })} className="w-full bg-white/5 border text-blue-400 border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500 focus:outline-none placeholder-gray-600" placeholder="g" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-1">Fat (g)</label>
                                <input type="number" value={manualEntry.fat_g} onChange={(e) => setManualEntry({ ...manualEntry, fat_g: e.target.value })} className="w-full bg-white/5 border text-yellow-400 border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500 focus:outline-none placeholder-gray-600" placeholder="g" />
                            </div>
                        </div>
                        <button type="submit" disabled={isSaving} className="w-full bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 mt-4 text-lg">
                            {isSaving ? 'Logging...' : 'Log Custom Food'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
