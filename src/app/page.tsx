"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Activity, Flame, Bot, Users, Trophy, ShieldCheck, Dumbbell, BarChart3, MessageSquare, HeartPulse } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-emerald-500/30">

      {/* =========================================
          SECTION 1: HERO (Powerful First Impression) 
          ========================================= */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[150px] -z-10 pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold mb-8 backdrop-blur-md"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>The Future of Social Fitness is Here</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-6"
          >
            Where Fitness Meets <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500">
              Intelligence & Community
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            Track your workouts, build unstoppable streaks, analyze your progress with AI, join fitness communities, and compete on leaderboards — all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup">
              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-500 text-gray-950 font-bold text-lg hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="#features">
              <button className="w-full sm:w-auto px-8 py-4 rounded-full glass-panel border border-white/10 hover:border-white/20 transition-all font-bold text-lg flex items-center justify-center">
                Explore Features
              </button>
            </Link>
          </motion.div>

          {/* Hero Mockup Previews */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent z-10" />

            {/* Main Center UI */}
            <div className="glass-panel border-t border-x border-white/10 rounded-t-3xl p-4 md:p-8 relative overflow-hidden backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="text-sm font-mono text-gray-500">app.fitnessai.com/dashboard</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
                <div className="col-span-2 space-y-4">
                  <div className="h-40 bg-white/5 rounded-2xl border border-white/5 animate-pulse" />
                  <div className="h-64 bg-white/5 rounded-2xl border border-white/5 animate-pulse delay-75" />
                </div>
                <div className="space-y-4">
                  <div className="h-24 bg-white/5 rounded-2xl border border-white/5 animate-pulse delay-100" />
                  <div className="h-48 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 animate-pulse delay-150" />
                  <div className="h-28 bg-white/5 rounded-2xl border border-white/5 animate-pulse delay-200" />
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -left-10 top-20 glass-panel border border-amber-500/30 bg-amber-500/10 p-4 rounded-2xl shadow-xl z-20 hidden md:block backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <Flame className="w-8 h-8 text-amber-500" />
                <div>
                  <div className="text-2xl font-black text-white">45</div>
                  <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">Day Streak</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -right-6 top-40 glass-panel border border-emerald-500/30 bg-emerald-500/10 p-4 rounded-2xl shadow-xl z-20 hidden md:block backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <Dumbbell className="w-8 h-8 text-emerald-400" />
                <div>
                  <div className="text-2xl font-black text-white">PR!</div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Bench Press</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* =========================================
          SECTION 2: COMPLETE TRACKING 
          ========================================= */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Track Every Rep. <span className="text-emerald-400">Measure Every Gain.</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Log your workout sessions in real-time. We'll automatically calculate volume, progression, and personal records so you can focus on lifting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Activity className="w-8 h-8 text-blue-400" />}
              title="Real-Time Session Tracking"
              description="Log sets, reps, and weight live. Built-in rest timers keep you focused without leaving the app."
              delay={0.1}
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8 text-emerald-400" />}
              title="Volume & Progression"
              description="Visualize your weekly and monthly analytics. See your strength skyrocket with progressive overload charts."
              delay={0.2}
            />
            <FeatureCard
              icon={<Dumbbell className="w-8 h-8 text-purple-400" />}
              title="Personal Record Alerts"
              description="Never miss a milestone. The system automatically detects and celebrates your heaviest lifts."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      <Section3StreakEngine />
      <Section4AIIntelligence />
      <Section5SocialNetwork />
      <Section6Communities />
      <Section7Gamification />
      <Section8DashboardPreview />
      <Section9Privacy />
      <Section10FinalCTA />

    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248z" clipRule="evenodd" />
    </svg>
  )
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass-panel p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors group"
    >
      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}

function Section3StreakEngine() {
  return (
    <section className="py-24 relative bg-gray-950/50 border-y border-white/5 overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Consistency Builds <span className="text-amber-500">Champions.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            The Gym Streak Engine transforms discipline into a game. Visual heatmaps, longest streak tracking, and unlockable achievement badges keep you showing up, day after day.
          </p>

          <ul className="space-y-4">
            {['Track Current & Longest Streaks', 'GitHub-Style Monthly Heatmap', 'Weekly Consistency Percentage', 'Unlockable Gamification Badges'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">✓</div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Simulated Streak Card UI */}
          <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10 backdrop-blur-xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-6">
              <div>
                <div className="text-gray-400 text-sm font-bold uppercase">Current Streak</div>
                <div className="text-5xl font-black text-white flex items-center gap-2 mt-1">
                  12 <span className="text-xl text-gray-500 font-medium">Days</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <Flame className="w-8 h-8 text-amber-500" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-bold text-gray-400 uppercase">Activity Heatmap</div>
              <div className="grid grid-cols-7 gap-2">
                {[
                  "bg-amber-500/30", "bg-amber-500/50", "bg-amber-500/60", "bg-white/5", "bg-amber-500/60", "bg-amber-500/40", "bg-amber-500/20",
                  "bg-amber-500/60", "bg-amber-500/40", "bg-amber-500/20", "bg-amber-500/70", "bg-amber-500/50", "bg-white/5", "bg-amber-500/40",
                  "bg-amber-500/70", "bg-white/5", "bg-amber-500/20", "bg-amber-500/20", "bg-amber-500/40", "bg-amber-500/20", "bg-amber-500/50",
                  "bg-amber-500/90", "bg-amber-500/30", "bg-white/5", "bg-amber-500/90", "bg-amber-500/60", "bg-amber-500/80", "bg-amber-500/100"
                ].map((cls, i) => (
                  <div key={i} className={`h-8 rounded-md ${cls}`} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Section4AIIntelligence() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/3 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Train Smarter With <span className="text-purple-400">AI.</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Our intelligent engine analyzes your workout history to detect muscle imbalances, track strength curves, and provide personalized recovery suggestions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 md:order-1 glass-panel p-8 rounded-3xl border border-purple-500/30 relative shadow-[0_0_50px_rgba(168,85,247,0.1)] backdrop-blur-xl"
          >
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/50">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-white text-lg">AI Weekly Insight</h4>
                <p className="text-gray-300 leading-relaxed font-medium">
                  "You've trained your <span className="text-purple-400">Chest 3x</span> this week but <span className="text-purple-400">Legs only once</span>. Your pressing volume has increased by 12%. Consider shifting focus to lower body recovery and isolation exercises for your next session to prevent imbalances."
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-bold text-gray-400 mb-2 border border-white/5">Imbalance Warning</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-bold text-gray-400 mb-2 border border-white/5">+12% Strength</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="order-1 md:order-2 space-y-8 pl-0 md:pl-12">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Strength Curves</h3>
                <p className="text-gray-400">Automatically map your 1RM progression over time across compound lifts.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Recovery Suggestions</h3>
                <p className="text-gray-400">AI monitors your volume output and flags when you are entering an overtraining zone.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Section5SocialNetwork() {
  return (
    <section className="py-24 relative bg-gray-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative order-2 lg:order-1"
        >
          {/* Simulated Social Feed UI */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl relative z-10 backdrop-blur-xl">
            <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center">E</div>
                <div>
                  <p className="text-white font-bold leading-none">Ethan Hunt <span className="text-gray-500 font-normal text-sm ml-1">@ethan_lifts</span></p>
                  <p className="text-gray-500 text-xs mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="text-xs font-bold px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/10">Followers Only</div>
            </div>
            <p className="text-gray-300 font-medium mb-4">Finally hit the 100kg milestone on bench today! The AI insights definitely helped me fix that sticking point mid-rep. Let's go! 🚀</p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 mb-4">
              <div className="text-sm text-gray-400 mb-1">Workout Session</div>
              <div className="font-bold text-white text-lg">Heavy Pulls & Chest</div>
              <div className="flex gap-4 mt-2 text-sm text-emerald-400 font-medium">
                <span>⏱ 1h 15m</span>
                <span>🏋️‍♂️ 6,400 kg Total Vol</span>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/10 text-gray-400">
              <div className="flex items-center gap-2 hover:text-emerald-400 cursor-pointer transition-colors">
                <Flame className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-white">42</span>
              </div>
              <div className="flex items-center gap-2 hover:text-blue-400 cursor-pointer transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="font-bold">12</span>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-8 -right-8 glass-panel p-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 shadow-2xl z-20 hidden md:block backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-400" />
              <div className="text-white font-bold">New Follower!</div>
            </div>
          </div>
        </motion.div>

        <div className="order-1 lg:order-2">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Fitness Is <span className="text-blue-500">Better Together.</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Follow friends, share your PRs, and build a network of athletes. Your personalized feed keeps you motivated and accountable.
          </p>

          <ul className="space-y-4">
            {['Follow Top Athletes', 'Share Private or Public Workouts', 'Interact with Likes & Comments'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">✓</div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Section6Communities() {
  return (
    <section className="py-24 relative overflow-hidden bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Learn, Compete, and Grow in <span className="text-teal-400">Community.</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Join Reddit-style fitness hubs natively. Browse trending discussions, share form-check videos, and engage in deeply threaded comments with community-driven upvoting.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-panel p-6 rounded-3xl border border-teal-500/20 shadow-[0_0_60px_rgba(20,184,166,0.1)] backdrop-blur-xl relative"
        >
          {/* Mockup Community Post */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center cursor-pointer text-teal-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg></div>
              <span className="font-black text-white text-lg">342</span>
              <div className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center cursor-pointer text-gray-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7" /></svg></div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 text-sm">
                <span className="font-bold text-teal-400 hover:underline cursor-pointer">c/Powerlifting</span>
                <span className="text-gray-500">• Posted by u/HeavyPuller 4h ago</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Form Check: 405lb Deadlift</h3>
              <p className="text-gray-300 mb-4 line-clamp-2">Hey guys, looking for some advice on my lockout. I feel like my hips are shooting up too early off the floor. Attached video below.</p>

              <div className="flex gap-4 text-gray-400 text-sm font-bold">
                <div className="flex items-center gap-1.5 hover:bg-white/5 py-1 px-2 rounded cursor-pointer">
                  <MessageSquare className="w-4 h-4" /> 48 Comments
                </div>
                <div className="flex items-center gap-1.5 hover:bg-white/5 py-1 px-2 rounded cursor-pointer text-blue-400">
                  <ArrowRight className="w-4 h-4" /> Shared
                </div>
              </div>
            </div>
          </div>

          <div className="absolute right-4 top-4 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Activity className="w-3 h-3" /> Trending
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Section7Gamification() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Turn Progress Into <span className="text-amber-500">Rewards.</span>
        </h2>
        <p className="text-gray-400 text-lg mb-16 max-w-2xl mx-auto leading-relaxed">
          Level up your fitness journey with unlockable achievements, community badges, and global dynamic leaderboards that reset weekly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Achievement Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-2 glass-panel p-8 rounded-3xl border border-white/5 bg-white/5 relative overflow-hidden flex flex-col items-center justify-center text-center backdrop-blur-md"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/20 blur-3xl rounded-full" />
            <h3 className="text-2xl font-bold text-white mb-6 relative z-10 w-full text-left">Achievement Badges</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full relative z-10">
              {[
                { icon: <Flame className="w-8 h-8 text-amber-500" />, title: "7-Day Streak", color: "border-amber-500/30 bg-amber-500/10" },
                { icon: <Activity className="w-8 h-8 text-emerald-500" />, title: "10,000kg Club", color: "border-emerald-500/30 bg-emerald-500/10" },
                { icon: <Trophy className="w-8 h-8 text-purple-500" />, title: "First PR", color: "border-purple-500/30 bg-purple-500/10" },
                { icon: <Users className="w-8 h-8 text-blue-500" />, title: "Top Contributor", color: "border-blue-500/30 bg-blue-500/10" }
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${badge.color} backdrop-blur-md cursor-pointer`}
                >
                  <div className="mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{badge.icon}</div>
                  <span className="text-xs font-bold text-white text-center leading-tight">{badge.title}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Global Leaderboards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="col-span-1 glass-panel p-8 rounded-3xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)] mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Global Leaderboards</h3>
            <p className="text-gray-400 text-sm">See how you rank worldwide in Weekly Volume, Longest Streaks, and Total Active Days.</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Section8DashboardPreview() {
  return (
    <section className="py-32 relative bg-gray-950/80 border-t border-white/5 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-0 inset-x-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Your Fitness <span className="text-emerald-400">Command Center.</span>
        </h2>
        <p className="text-gray-400 text-lg mb-16 max-w-2xl mx-auto">
          A beautiful, analytical dashboard bringing together your streaks, lifetime volume, muscle group progressions, and social activity into one seamless view.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto glass-panel border border-white/10 rounded-t-3xl p-4 md:p-8 overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.15)] bg-[#0f172a]/80 backdrop-blur-3xl"
        >
          {/* Dashboard Mockup Header */}
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500"></div>
              <div className="text-left">
                <h3 className="text-white font-bold leading-none">Welcome back, Ethan 👋</h3>
                <p className="text-gray-400 text-xs mt-1">Ready to crush your 42 day streak?</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><Activity className="w-4 h-4 text-emerald-400" /></div>
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><Flame className="w-4 h-4 text-amber-500" /></div>
            </div>
          </div>

          {/* Dashboard Grid Mockup */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Top Stats */}
              <div className="glass-panel p-4 rounded-2xl border border-white/5 text-left">
                <div className="text-gray-400 text-xs font-bold uppercase mb-1">Lifetime Volume</div>
                <div className="text-2xl font-black text-white">45,200 kg</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5 text-left bg-gradient-to-br from-amber-500/10 to-transparent">
                <div className="text-amber-500 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Flame className="w-3 h-3" /> Active Streak</div>
                <div className="text-2xl font-black text-white">42 Days</div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5 text-left">
                <div className="text-gray-400 text-xs font-bold uppercase mb-1">Total Workouts</div>
                <div className="text-2xl font-black text-white">128</div>
              </div>

              {/* Chart Area */}
              <div className="col-span-1 sm:col-span-3 h-48 glass-panel border border-white/5 rounded-2xl flex items-end justify-between p-6 opacity-80">
                {[40, 60, 45, 80, 50, 90, 100].map((h, i) => (
                  <div key={i} className="w-[10%] bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>

            {/* Right Sidebar Mockup */}
            <div className="col-span-1 space-y-6">
              <div className="glass-panel p-4 rounded-2xl border border-white/5 h-full opacity-90 text-left">
                <h4 className="font-bold text-white text-sm mb-4">Muscle Breakdown</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-300">Chest</span><span className="text-emerald-400 font-bold">45%</span></div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-400 w-[45%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-300">Back</span><span className="text-emerald-400 font-bold">30%</span></div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-400 w-[30%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-300">Legs</span><span className="text-emerald-400 font-bold">25%</span></div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-400 w-[25%]"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fade Out Gradient at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f172a] to-transparent z-20"></div>
        </motion.div>
      </div>
    </section>
  )
}

function Section9Privacy() {
  return (
    <section className="py-20 bg-gray-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl">
        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="font-bold text-white text-lg">Secure Authentication</h4>
          <p className="text-gray-400 text-sm">Industry standard encryption keeps your login credentials and session tokens safe.</p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center">
            <HeartPulse className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="font-bold text-white text-lg">Total Data Isolation</h4>
          <p className="text-gray-400 text-sm">Your workout data is strictly bound to your profile and isolated from unauthorized access.</p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <h4 className="font-bold text-white text-lg">Granular Privacy Controls</h4>
          <p className="text-gray-400 text-sm">Control exactly who sees your workouts: Public, Followers Only, or completely Private.</p>
        </div>
      </div>
    </section>
  )
}

function Section10FinalCTA() {
  return (
    <section className="py-32 relative overflow-hidden text-center border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 via-blue-900/10 to-gray-950 pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/20 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-black tracking-tight mb-8"
        >
          Ready to Transform <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
            Your Training?
          </span>
        </motion.h2>

        <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto">
          Join athletes worldwide scaling their potential through AI analytics and community-driven motivation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <button className="w-full sm:w-auto px-10 py-5 rounded-full bg-emerald-500 text-gray-950 font-bold text-xl hover:bg-emerald-400 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2">
              Start Free <ArrowRight className="w-6 h-6" />
            </button>
          </Link>
          <Link href="/communities">
            <button className="w-full sm:w-auto px-10 py-5 rounded-full glass-panel border border-white/10 hover:border-white/20 transition-all font-bold text-xl flex items-center justify-center text-white backdrop-blur-md">
              Join the Community
            </button>
          </Link>
        </div>
      </div>

      {/* Footer Footer */}
      <div className="mt-32 pt-8 border-t border-white/10 max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 relative z-10">
        <div>© {new Date().getFullYear()} GymAI Social. All rights reserved.</div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link href="#" className="hover:text-emerald-400 transition-colors">Terms</Link>
          <Link href="#" className="hover:text-emerald-400 transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-emerald-400 transition-colors">Contact</Link>
        </div>
      </div>
    </section>
  )
}
