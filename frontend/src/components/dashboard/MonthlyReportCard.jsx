import React from "react";
import { TrendingUp, X } from "lucide-react";

export default function MonthlyReportCard({ onViewReport, onDismiss }) {
  return (
    <section className="relative overflow-hidden rounded-sm border border-white/[0.08] bg-[#0c0e14] p-5 sm:p-6 text-white transition-all">
      {/* Subtle warm ambient blur */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-orange-500/10 blur-[80px]" />

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute right-3 top-3 rounded-sm p-1 text-neutral-500 transition hover:bg-white/10 hover:text-white"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left sm:justify-between">
        {/* Visual Graphic (Directly inspired by Screenshot 1) */}
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
          {/* Back calendar card */}
          <div className="absolute h-18 w-14 translate-x-3 -rotate-12 rounded-sm border border-white/10 bg-neutral-900 p-1 opacity-60">
            <div className="grid grid-cols-4 gap-1 pt-2.5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-none ${
                    i % 2 === 0 ? "bg-orange-400/80" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Front Center Card (Folder / Graph with green growth arrow) */}
          <div className="relative z-10 flex h-18 w-22 flex-col justify-between rounded-sm border border-white/15 bg-neutral-900/90 p-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-mono font-bold text-neutral-400">REPORT</span>
              <TrendingUp className="h-3 w-3 text-emerald-400" />
            </div>

            <div className="flex items-end justify-between gap-1 px-0.5 h-7">
              <div className="w-1.5 h-2.5 bg-orange-500/40" />
              <div className="w-1.5 h-4 bg-orange-500/60" />
              <div className="w-1.5 h-6 bg-orange-500" />
              <div className="w-1.5 h-5 bg-emerald-400" />
            </div>

            <div className="text-center pt-0.5 border-t border-white/10 text-[7px] font-bold text-neutral-400 tracking-wider">
              FITCOACH
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="flex-1">
          <h2 className="text-base font-bold tracking-tight text-white sm:text-lg">
            Your Monthly Report is ready!
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-neutral-400">
            Get an overview of your workout data, milestones, and improvements from last month.
          </p>
        </div>

        {/* Action Buttons (from Screenshot 1) */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center shrink-0">
          <button
            type="button"
            onClick={onViewReport}
            className="inline-flex h-9 items-center justify-center rounded-sm bg-[#ff6723] hover:bg-[#f05a18] px-4 text-xs font-bold text-white transition active:scale-[0.98] shadow-[0_0_15px_rgba(255,103,35,0.2)]"
          >
            View Report
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex h-9 items-center justify-center rounded-sm border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] px-3.5 text-xs font-semibold text-neutral-300 transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </section>
  );
}
