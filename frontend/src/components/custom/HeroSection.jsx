import { motion } from "framer-motion"
import { Dumbbell, ArrowRight, Layers, TrendingUp, ShieldAlert, ChevronDown } from "lucide-react"

export default function HeroSection({ onOpenSignup, onOpenLogin, onExploreClick }) {
  return (
    <div className="relative min-h-screen w-full bg-[#070605] overflow-hidden flex flex-col justify-between select-none">
      {/* 1. CBUM Background Layer with tuned opacity and cinematic gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Background photo of CBUM */}
        <img
          src="/hero.png"
          alt="FitCoach Hero Background"
          className="w-full h-full object-cover object-[78%_center] lg:object-[68%_center] xl:object-[64%_center] opacity-45 md:opacity-55 scale-100 transition-opacity duration-700"
        />

        {/* Cinematic dark gradients to guarantee text legibility and mood */}
        {/* Horizontal vignette: deep dark on the left covering the text column */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070605] via-[#070605]/85 md:via-[#070605]/75 to-transparent w-full md:w-[75%]" />

        {/* Subtle top-down fade for navbar integration */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#070605]/90 via-[#070605]/40 to-transparent" />

        {/* Bottom fade into subsequent content */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#070605] via-[#070605]/80 to-transparent" />

        {/* Atmospheric warm orange/amber rim glow behind right side */}
        <div className="absolute -right-24 bottom-10 w-[550px] h-[550px] bg-orange-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute -left-20 top-1/4 w-[420px] h-[420px] bg-orange-700/10 blur-[130px] rounded-full pointer-events-none" />


        {/* Film Grain Texture Overlay */}
        <div className="absolute inset-0 noise-texture pointer-events-none opacity-25" />
      </div>

      {/* 2. Top Navigation Bar */}
      <header className="relative z-20 w-full px-6 md:px-14 lg:px-20 py-6 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={onExploreClick}
          className="flex items-center gap-2.5 cursor-pointer group transition-transform active:scale-95"
        >
          <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-500 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(249,115,22,0.35)]">
            <Dumbbell className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white font-sans">
            FitCoach
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center gap-5 sm:gap-8 text-sm font-medium text-zinc-300">
          <button
            type="button"
            onClick={onExploreClick}
            className="hidden md:block hover:text-white transition-colors cursor-pointer text-sm"
          >
            For Trainers
          </button>

          <button
            type="button"
            onClick={onExploreClick}
            className="hidden sm:block hover:text-white transition-colors cursor-pointer text-sm"
          >
            How it works
          </button>

          <button
            type="button"
            onClick={onOpenLogin}
            className="hover:text-white transition-colors cursor-pointer font-medium text-sm px-1 py-1"
          >
            Log in
          </button>

          <button
            type="button"
            onClick={onOpenSignup}
            className="bg-[#f95716] hover:bg-[#ea4808] active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-[0_4px_16px_rgba(249,87,22,0.35)] hover:shadow-[0_6px_22px_rgba(249,87,22,0.5)] cursor-pointer"
          >
            Get started
          </button>
        </nav>
      </header>

      {/* 3. Main Hero Content (Left-aligned, spacious & minimal) */}
      <main className="relative z-20 flex-1 flex flex-col justify-center w-full px-6 md:px-14 lg:px-20 py-8 lg:py-12">
        <div className="max-w-xl lg:max-w-2xl flex flex-col items-start">
          {/* Eyebrow badge: Dash + Uppercase tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-3 mb-5"
          >
            <span className="w-5 h-[2px] bg-[#f95716]" />
            <span className="text-[11px] sm:text-xs tracking-[0.22em] font-semibold text-zinc-400 uppercase">
              Train smarter. Coach better.
            </span>
          </motion.div>

          {/* Headline: Huge bold typography */}
          <motion.h1
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="hero-display-title text-white text-5xl sm:text-7xl lg:text-[84px] xl:text-[94px] leading-[0.92] drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] tracking-tight font-black"
          >
            COACH
            <br />
            EVERY
            <br />
            <span className="text-[#f95716]">REP</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-zinc-300/90 font-normal text-sm sm:text-base md:text-[17px] max-w-lg leading-relaxed"
          >
            The workout tracker built around the trainer-client relationship.
            Build programs, assign them, and watch real progress and injury risk — without chasing anyone on WhatsApp.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-8 flex flex-row items-center gap-4 w-full sm:w-auto"
          >
            {/* Primary Trainer CTA */}
            <button
              type="button"
              onClick={onOpenSignup}
              className="bg-[#f95716] hover:bg-[#ea4808] text-white text-sm sm:text-base font-semibold px-6 sm:px-7 py-3.5 rounded-full shadow-[0_6px_22px_rgba(249,87,22,0.4)] hover:shadow-[0_8px_30px_rgba(249,87,22,0.6)] active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <Dumbbell className="w-4 h-4 text-white" />
              <span>I'm a trainer</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Secondary Member CTA */}
            <button
              type="button"
              onClick={onOpenSignup}
              className="bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-700/70 hover:border-zinc-500 text-white text-sm sm:text-base font-semibold px-6 sm:px-7 py-3.5 rounded-full backdrop-blur-sm active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              Join as a member
            </button>
          </motion.div>

          {/* Trust stats & proof points */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-12 flex flex-col sm:flex-row sm:flex-wrap items-start gap-x-8 gap-y-3.5 text-xs sm:text-sm"
          >
            {/* Templates */}
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-orange-500/15 border border-orange-500/25 text-orange-500">
                <Layers className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="text-white font-semibold">Templates</strong>{" "}
                <span className="text-zinc-400">· Reusable programs</span>
              </span>
            </div>

            {/* Auto PRs */}
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-orange-500/15 border border-orange-500/25 text-orange-500">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="text-white font-semibold">Auto PRs</strong>{" "}
                <span className="text-zinc-400">· Tracked per exercise</span>
              </span>
            </div>

            {/* Injury flags */}
            <div className="flex items-center gap-2 sm:basis-full">
              <span className="p-1.5 rounded-md bg-orange-500/15 border border-orange-500/25 text-orange-500">
                <ShieldAlert className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong className="text-white font-semibold">Injury flags</strong>{" "}
                <span className="text-zinc-400">· Unsafe lifts blocked</span>
              </span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* 4. Minimal Bottom Scroll Indicator */}
      <div className="relative z-20 w-full px-6 md:px-14 lg:px-20 py-4 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={onExploreClick}
          aria-label="Scroll down to explore features"
          className="pointer-events-auto p-1.5 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-white/5 active:scale-90 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium"
        >
          <ChevronDown className="w-4 h-4 animate-bounce" />
          <span className="hidden sm:inline text-zinc-500">Explore FitCoach</span>
        </button>
      </div>
    </div>
  )
}
