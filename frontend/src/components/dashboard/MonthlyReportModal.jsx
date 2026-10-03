import React from "react";
import { X, Trophy } from "lucide-react";

export default function MonthlyReportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-sm border border-white/10 bg-neutral-950 p-6 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm p-1 text-neutral-400 hover:text-white transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-orange-500/15 text-orange-400 border border-orange-500/30">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Monthly Report</h2>
            <p className="text-xs text-neutral-400">Workout summary & milestones</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-5 grid grid-cols-3 gap-2.5 text-center">
          <div className="rounded-sm border border-white/10 bg-white/[0.02] p-3">
            <p className="text-[10px] font-mono uppercase text-neutral-500">Volume</p>
            <p className="mt-1 text-lg font-bold text-white">148.2k</p>
            <p className="text-[10px] text-orange-400 font-medium">kg moved</p>
          </div>
          <div className="rounded-sm border border-white/10 bg-white/[0.02] p-3">
            <p className="text-[10px] font-mono uppercase text-neutral-500">Workouts</p>
            <p className="mt-1 text-lg font-bold text-white">18</p>
            <p className="text-[10px] text-neutral-400 font-medium">Sessions</p>
          </div>
          <div className="rounded-sm border border-white/10 bg-white/[0.02] p-3">
            <p className="text-[10px] font-mono uppercase text-neutral-500">PRs Broken</p>
            <p className="mt-1 text-lg font-bold text-orange-400">12</p>
            <p className="text-[10px] text-orange-400/80 font-medium">New bests</p>
          </div>
        </div>

        {/* PR Breakdown */}
        <div className="mt-5 space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
            Top Milestones
          </p>
          <div className="flex items-center justify-between rounded-sm border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs">
            <span className="font-semibold text-white">Deadlift</span>
            <span className="font-bold text-orange-400">180 kg × 5 (+10 kg)</span>
          </div>
          <div className="flex items-center justify-between rounded-sm border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs">
            <span className="font-semibold text-white">Bench Press</span>
            <span className="font-bold text-orange-400">100 kg × 5 (+5 kg)</span>
          </div>
          <div className="flex items-center justify-between rounded-sm border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs">
            <span className="font-semibold text-white">Lat Pulldown</span>
            <span className="font-bold text-orange-400">90 kg × 8 (+5 kg)</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-sm bg-[#ff6723] hover:bg-[#f05a18] px-5 py-1.5 text-xs font-bold text-white transition shadow-[0_0_15px_rgba(255,103,35,0.25)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
