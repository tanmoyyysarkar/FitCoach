import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ClipboardList,
  Send,
  Dumbbell,
  Trophy,
  TrendingUp,
  ShieldAlert,
  Ruler,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from "lucide-react"

const TRAINER_FEATURES = [
  {
    num: "01",
    icon: ClipboardList,
    title: "Reusable program templates",
    description:
      "Draft structured programs once with target sets, reps, load, and rest. Seamlessly assign to any client without spreadsheets.",
  },
  {
    num: "02",
    icon: Send,
    title: "Direct client assignment",
    description:
      "Push programs to individuals or athlete cohorts. Clients see the exact prescribed routine on their phones instantly.",
  },
  {
    num: "03",
    icon: TrendingUp,
    title: "Volume & PR analytics",
    description:
      "Track planned vs completed workouts, weekly load progressions, and personal records automatically in real time.",
  },
  {
    num: "04",
    icon: ShieldAlert,
    title: "Injury-aware programming",
    description:
      "Log client injuries once and FitCoach proactively flags any exercise loading vulnerable muscles before you assign.",
  },
]

const CLIENT_FEATURES = [
  {
    num: "01",
    icon: Dumbbell,
    title: "Real-time set logging",
    description:
      "Record weight, reps, and RPE set-by-set during your workout with zero friction and instant coach feedback.",
  },
  {
    num: "02",
    icon: Trophy,
    title: "Automatic PR detection",
    description:
      "Celebrate all-time bests in 1RM, volume, and reps. Every milestone is captured and logged into your profile.",
  },
  {
    num: "03",
    icon: Ruler,
    title: "Measurements & body metrics",
    description:
      "Track tape measurements, weight, and progress photos over time to see true physical transformation.",
  },
  {
    num: "04",
    icon: MessageSquare,
    title: "Direct coach messaging",
    description:
      "Keep training context, video check-ins, and technique notes directly tied to your prescribed sessions.",
  },
]

const COMPARISON_ITEMS = [
  {
    feature: "Coaching Workflow",
    solo: "Solo tracking only, no coach assignment",
    fitcoach: "Trainer assigns, monitors, and adjusts in real time",
  },
  {
    feature: "Program Design",
    solo: "Manual spreadsheet logging & retyping",
    fitcoach: "Reusable dynamic templates across clients",
  },
  {
    feature: "Safety & Injury Flags",
    solo: "No safety or injury awareness",
    fitcoach: "Proactive injury alerts on exercise assignments",
  },
  {
    feature: "Progress & Adherence",
    solo: "Self-reported, easy to abandon",
    fitcoach: "Automatic PRs, volume trends & compliance tracking",
  },
]

export default function ExploreSection({ onOpenSignup, user }) {
  const [activeTab, setActiveTab] = useState("trainer") // "trainer" | "client"
  const currentFeatures = activeTab === "trainer" ? TRAINER_FEATURES : CLIENT_FEATURES

  return (
    <section className="relative w-full bg-black text-white py-28 md:py-36 px-6 md:px-12 select-none overflow-hidden isolate">
      {/* Background Moving Minimalist Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Ambient Top Orb (Warm Coral / Orange) */}
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -50, 40, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-32 -left-20 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-orange-500/20 via-pink-500/15 to-transparent blur-[130px]"
        />

        {/* Ambient Center-Right Orb (Neon Pink / Violet) */}
        <motion.div
          animate={{
            x: [0, -90, 50, 0],
            y: [0, 70, -40, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-pink-500/15 via-purple-600/15 to-transparent blur-[140px]"
        />

        {/* Ambient Bottom-Left Orb (Golden Sun Glow) */}
        <motion.div
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 60, 0],
            scale: [0.95, 1.1, 1, 0.95],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-24 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-500/15 via-rose-500/10 to-transparent blur-[120px]"
        />

        {/* Subtle Noise Texture Overlay */}
        <div className="absolute inset-0 noise-texture opacity-30 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto space-y-24 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-12">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold tracking-widest text-neutral-400 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>The FitCoach Platform</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              One system for the whole coaching floor.
            </h2>
            <p className="text-base text-neutral-400 leading-relaxed pt-1">
              Personal trackers only solve solo logging. FitCoach bridges the critical half they leave out: a coach assigning the work, monitoring execution, and progressing clients with precision.
            </p>
          </div>

          {/* Minimal Aesthetic Underline Tab Switcher (No Boxes) */}
          <div className="inline-flex items-center gap-8 border-b-2 border-white/10 pb-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("trainer")}
              className={`text-base font-bold pb-2 transition-all cursor-pointer relative ${
                activeTab === "trainer"
                  ? "text-white after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              For Trainers & Coaches
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("client")}
              className={`text-base font-bold pb-2 transition-all cursor-pointer relative ${
                activeTab === "client"
                  ? "text-white after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              For Members & Clients
            </button>
          </div>
        </div>

        {/* Minimalist Editorial Feature Grid (No Boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
          <AnimatePresence mode="wait">
            {currentFeatures.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                  className="flex flex-col space-y-4 group"
                >
                  {/* Minimal numeral + Subtle accent line */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-mono font-semibold text-neutral-500 group-hover:text-neutral-300 transition-colors">
                      {item.num}
                    </span>
                    <Icon className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-300/90 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Minimalist Comparison Section (Clean table layout with subtle dividers, No boxes) */}
        <div className="pt-16 border-t border-white/10">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-mono font-semibold tracking-widest text-neutral-400 uppercase">
              Why FitCoach
            </span>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
              Built specifically for coaching relationships.
            </h3>
          </div>

          <div className="divide-y divide-white/10">
            <div className="grid grid-cols-12 pb-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <div className="col-span-4 md:col-span-3">Capability</div>
              <div className="col-span-4 md:col-span-4 text-neutral-500">Solo Trackers (Hevy, Strong)</div>
              <div className="col-span-4 md:col-span-5 text-white font-bold">FitCoach</div>
            </div>

            {COMPARISON_ITEMS.map((row) => (
              <div
                key={row.feature}
                className="grid grid-cols-12 py-5 items-center text-sm gap-2"
              >
                <div className="col-span-4 md:col-span-3 font-semibold text-white">
                  {row.feature}
                </div>
                <div className="col-span-4 md:col-span-4 text-neutral-500 text-xs sm:text-sm line-through decoration-neutral-700">
                  {row.solo}
                </div>
                <div className="col-span-4 md:col-span-5 font-medium text-neutral-200 flex items-center gap-2 text-xs sm:text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span>{row.fitcoach}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Minimalist Action Callout (No clunky card boxes) */}
        <div className="pt-12 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h4 className="text-xl font-bold text-white">
              {user ? `Welcome, ${user.name}` : "Start coaching with FitCoach today."}
            </h4>
            <p className="text-sm text-neutral-400 mt-0.5">
              Set up your profile, invite clients, and assign workouts in minutes.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenSignup}
            className="inline-flex items-center gap-2.5 bg-white text-black px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer shadow-lg shrink-0"
          >
            <span>{user ? "Go to Dashboard" : "Get Started"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}