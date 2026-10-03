import React from "react";
import { Menu, Plus, PlayCircle } from "lucide-react";

export default function DashboardHeader({
  onOpenMobileSidebar,
  onStartEmpty,
  onCreateWorkout,
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-black/85 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="rounded-sm p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-neutral-500 uppercase tracking-widest">
              Training Center
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onStartEmpty}
            className="inline-flex items-center gap-1.5 rounded-sm border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            <PlayCircle className="h-3.5 w-3.5 text-orange-400" />
            <span className="hidden sm:inline">Start Empty Session</span>
          </button>

          <button
            type="button"
            onClick={onCreateWorkout}
            className="inline-flex items-center gap-1.5 rounded-sm bg-[#ff6723] hover:bg-[#f05a18] px-3.5 py-1.5 text-xs font-bold text-white transition shadow-[0_0_15px_rgba(255,103,35,0.25)]"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>New Routine</span>
          </button>
        </div>
      </div>
    </header>
  );
}
