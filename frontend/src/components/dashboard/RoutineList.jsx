import React, { useState } from "react";
import { Plus, FolderPlus, Compass, MoreHorizontal, Play, Loader2 } from "lucide-react";

const DEFAULT_TEMPLATES = [
  {
    id: "leg",
    name: "leg",
    exercises: "Squat (Smith Machine), Leg Press (Machine), Leg Extension (Machine), Lying Leg Curl (Machine), Standing Calf Raise",
    count: 5,
    sets: 18,
  },
  {
    id: "push",
    name: "Push",
    exercises: "Bench Press (Smith Machine), Incline Bench Press (Smith Machine), Cable Fly Crossovers, Lateral Raises (Dumbbell), Tricep Pushdown",
    count: 5,
    sets: 16,
  },
  {
    id: "pull",
    name: "Pull",
    exercises: "Lat Pulldown (Cable), Single Arm Cable Row, Seated Cable Row - V Grip (Cable), Face Pulls, Dumbbell Bicep Curl",
    count: 5,
    sets: 17,
  },
];

export default function RoutineList({
  workouts = [],
  loading = false,
  onStartRoutine,
  onStartEmpty,
  onCreateWorkout,
  onExplore,
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  const displayList = workouts.length > 0
    ? workouts.map((w) => ({
        id: w.workout_id,
        name: w.name,
        exercises: w.description || `${w.exercise_count || 4} exercises · ${w.total_sets || 12} total sets`,
        count: w.exercise_count || 4,
        sets: w.total_sets || 12,
        isCustom: true,
      }))
    : DEFAULT_TEMPLATES;

  const handleStart = (routineId, isCustom) => {
    if (onStartRoutine) {
      onStartRoutine(routineId, isCustom);
    }
  };

  return (
    <section className="space-y-4">
      {/* Header (Screenshot 3) */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
          Routines
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCreateWorkout}
            className="inline-flex items-center gap-1.5 rounded-sm border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            <FolderPlus className="h-3.5 w-3.5 text-orange-400" />
            <span>New Routine</span>
          </button>
          <button
            type="button"
            onClick={onExplore}
            className="inline-flex items-center gap-1.5 rounded-sm border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Compass className="h-3.5 w-3.5 text-neutral-400" />
            <span>Explore</span>
          </button>
        </div>
      </div>

      {/* "+ Start Empty Workout" Card (Screenshot 3) */}
      <button
        type="button"
        onClick={onStartEmpty}
        className="group flex w-full items-center justify-between rounded-sm border border-white/[0.08] bg-[#0c0e14] p-3.5 text-left transition hover:border-orange-500/40 hover:bg-[#10131b]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-white/10 text-white group-hover:bg-[#ff6723] group-hover:text-white transition">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Start Empty Workout</p>
            <p className="text-[11px] text-neutral-500">Log freeform session without template</p>
          </div>
        </div>
        <span className="text-xs text-neutral-500 group-hover:text-orange-400 transition font-medium">
          Quick start →
        </span>
      </button>

      {/* "My Routines (3)" (Screenshot 3) */}
      <div>
        <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-2.5">
          My Routines ({displayList.length})
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-xs text-neutral-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-orange-400" />
            Loading routines...
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayList.map((routine) => (
              <div
                key={routine.id}
                className="flex flex-col justify-between rounded-sm border border-white/[0.08] bg-[#0c0e14] p-4 transition hover:border-orange-500/30 hover:bg-[#10131b]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white capitalize">
                      {routine.name}
                    </h3>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuId(activeMenuId === routine.id ? null : routine.id)
                        }
                        className="rounded-sm p-1 text-neutral-500 hover:text-white"
                        aria-label="Routine menu"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {activeMenuId === routine.id && (
                        <div className="absolute right-0 mt-1 w-32 rounded-sm border border-white/10 bg-neutral-900 py-1 shadow-xl z-20 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleStart(routine.id, routine.isCustom);
                            }}
                            className="w-full px-3 py-1.5 text-left text-neutral-200 hover:bg-white/10"
                          >
                            Start workout
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onCreateWorkout && onCreateWorkout();
                            }}
                            className="w-full px-3 py-1.5 text-left text-neutral-200 hover:bg-white/10"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs text-neutral-400 leading-relaxed">
                    {routine.exercises}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => handleStart(routine.id, routine.isCustom)}
                    className="flex h-9 w-full items-center justify-center gap-1.5 rounded-sm bg-[#ff6723] hover:bg-[#f05a18] text-xs font-bold text-white transition active:scale-[0.99] shadow-[0_0_15px_rgba(255,103,35,0.2)]"
                  >
                    <Play className="h-3 w-3 fill-white" />
                    <span>Start Routine</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
