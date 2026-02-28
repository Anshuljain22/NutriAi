import { Info, Target, ShieldCheck } from "lucide-react";

export const metadata = {
    title: "About | NutriAI",
    description: "Learn more about NutriAI, your personal food information assistant.",
};

export default function AboutPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-20 px-6 relative">
            <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <div className="max-w-3xl mx-auto w-full space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">About NutriAI</h1>
                    <p className="text-lg text-gray-400">Your intelligent companion for healthier eating choices.</p>
                </div>

                <div className="glass-panel p-8 md:p-10 rounded-3xl space-y-8 relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full" />

                    <section className="space-y-4">
                        <div className="flex items-center gap-3 text-emerald-400 mb-4">
                            <Info className="w-6 h-6" />
                            <h2 className="text-2xl font-semibold text-white">Our Mission</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            At NutriAI, we believe that understanding your food is the first step towards a healthier, more vibrant life.
                            Our mission is to simplify nutritional information using advanced AI, making it accessible, personalized, and actionable for everyone.
                        </p>
                    </section>

                    <section className="space-y-4 pt-6 border-t border-white/10">
                        <div className="flex items-center gap-3 text-blue-400 mb-4">
                            <Target className="w-6 h-6" />
                            <h2 className="text-2xl font-semibold text-white">How It Works</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            We leverage advanced language models specialized in dietary and nutritional sciences. By simply asking a question,
                            our assistant instantly cross-references extensive nutritional databases to provide you with accurate calorie counts,
                            macro breakdowns, and hidden health benefits.
                        </p>
                    </section>

                    <section className="space-y-4 pt-6 border-t border-white/10">
                        <div className="flex items-center gap-3 text-purple-400 mb-4">
                            <ShieldCheck className="w-6 h-6" />
                            <h2 className="text-2xl font-semibold text-white">Privacy First</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            Your conversations are private. We store session data locally on your device to string together natural conversations,
                            ensuring your dietary inquiries remain entirely yours.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
