import { motion } from "framer-motion"
import { ArrowDown, Dumbbell, ClipboardList, LogOut, ShieldAlert, TrendingUp } from "lucide-react"

const TRUST_STATS = [
  { icon: ClipboardList, value: "Templates", label: "Reusable programs" },
  { icon: TrendingUp, value: "Auto PRs", label: "Tracked per exercise" },
  { icon: ShieldAlert, value: "Injury flags", label: "Unsafe lifts blocked" },
]

export default function HeroSection({ onOpenSignup, onOpenLogin, onLogout, onExploreClick, user }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden fitcoach-gradient-bg flex flex-col justify-between select-none">
      {/* Film Grain Texture Overlay */}
      <div className="absolute inset-0 noise-texture pointer-events-none z-10" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full px-6 md:px-12 py-5 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={onExploreClick}
          className="flex items-center gap-2 cursor-pointer group transition-transform active:scale-95"
        >
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-orange-500 transform group-hover:rotate-6 transition-transform">
              <path
                d="M4 14C4 8.47715 8.47715 4 14 4C19.5228 4 24 8.47715 24 14C24 19.5228 19.5228 24 14 24"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M8 14H20M14 8L20 14L14 20"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            FitCoach
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center gap-4 sm:gap-7 text-sm font-semibold text-slate-200">
          <button
            type="button"
            onClick={onExploreClick}
            className="hidden md:block hover:text-white transition-colors cursor-pointer"
          >
            For Trainers
          </button>

          <button
            type="button"
            onClick={onExploreClick}
            className="hidden sm:block hover:text-white transition-colors cursor-pointer"
          >
            How it works
          </button>

          {user ? (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 hover:text-white transition-colors cursor-pointer font-bold px-2 py-1"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenLogin}
                className="hover:text-white transition-colors cursor-pointer font-bold px-2 py-1"
              >
                Log in
              </button>

              <button
                type="button"
                onClick={onOpenSignup}
                className="cta-gradient-btn text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                Get started
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Main Hero Content */}
      <main className="relative z-20 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 md:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: headline + subtitle + CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start z-30">
            <motion.h1
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="hero-display-title text-white text-5xl sm:text-6xl md:text-7xl lg:text-[88px] leading-[0.95] drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] tracking-tighter"
            >
              COACH
              <br />
              EVERY
              <br />
              <span className="text-orange-500">REP</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-slate-300 font-medium text-base sm:text-lg max-w-md leading-relaxed"
            >
              The workout tracker built around the trainer-client relationship.
              Build programs, assign them, and watch real progress and injury risk — without chasing anyone on WhatsApp.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mt-8 flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto"
            >
              <button
                type="button"
                onClick={onOpenSignup}
                className="cta-gradient-btn text-white text-base font-semibold px-7 py-3.5 rounded-full active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Dumbbell className="w-4 h-4" />
                <span>I'm a trainer</span>
              </button>

              <button
                type="button"
                onClick={onOpenSignup}
                className="border border-slate-500/70 text-white text-base font-semibold px-7 py-3.5 rounded-full hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                Join as a member
              </button>
            </motion.div>

            {/* Capability proof points */}
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-10 flex flex-wrap gap-x-8 gap-y-4"
            >
              {TRUST_STATS.map(({ icon: Icon, value, label }) => (
                <li key={value} className="flex items-center gap-2.5">
                  <Icon className="w-5 h-5 text-orange-500 shrink-0" />
                  <span className="text-sm">
                    <span className="font-bold text-white">{value}</span>
                    <span className="text-slate-400"> · {label}</span>
                  </span>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Right Column: Session Logging Card */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end items-center mt-6 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[400px] rounded-[1.75rem] bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
                <div>
                  <p className="text-xs font-medium text-slate-400">Week 6 · Day 2</p>
                  <h3 className="text-sm font-bold text-white">Push Day A</h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                  On track
                </span>
              </div>

              {/* Logged sets */}
              <ul className="divide-y divide-slate-800">
                {[
                  { name: "Bench Press", sets: "4 × 8", load: "72.5 kg", done: true },
                  { name: "Incline DB Press", sets: "3 × 10", load: "26 kg", done: true },
                  { name: "Cable Fly", sets: "3 × 12", load: "15 kg", done: false },
                ].map((row) => (
                  <li key={row.name} className="flex items-center justify-between px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{row.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{row.sets} @ {row.load} · RPE 8</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg shrink-0 ml-3 ${
                      row.done
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}>
                      {row.done ? "Logged" : "Next"}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Injury warning */}
              <div className="mx-5 mb-5 mt-4 flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-3">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-100/90 leading-relaxed">
                  <span className="font-bold text-amber-300">Shoulder flagged.</span> Incline press modified to neutral grip.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer / Bottom UI elements */}
      <footer className="relative z-20 w-full px-6 md:px-12 py-6 flex items-center justify-between">
        {/* Animated Down Arrow */}
        <motion.button
          onClick={onExploreClick}
          aria-label="Scroll down to see features"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
        >
          <ArrowDown className="w-6 h-6 text-slate-300 stroke-[2.5]" />
        </motion.button>

        <motion.button
          onClick={onOpenSignup}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="cta-gradient-btn text-white rounded-full flex items-center justify-center px-5 py-3 text-sm font-semibold shadow-xl cursor-pointer"
        >
          Start coaching free
        </motion.button>
      </footer>
    </div>
  )
}
