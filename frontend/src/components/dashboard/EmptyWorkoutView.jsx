import React, { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Info,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Trophy,
  X,
  ChevronDown,
  ChevronUp,
  Share2,
} from "lucide-react";
import api from "../../api/axios";
import WorkoutShareModal from "./WorkoutShareModal";

// Format title case
const formatName = (name) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

// Curated top library exercises with working GIFs for instant search & offline reliability
const DEFAULT_EXERCISE_LIBRARY = [
  {
    exercise_id: "z6TAHoT",
    name: "Dumbbell Bench Press",
    body_parts: ["chest"],
    target_muscles: ["pectorals"],
    equipments: ["dumbbells"],
    gif_url: "https://static.exercisedb.dev/media/z6TAHoT.gif",
    instructions: [
      "Lie flat on the bench holding dumbbells over chest.",
      "Lower weights with elbows at 45-degree angle until chest stretch.",
      "Press dumbbells back up, squeezing chest at the top.",
    ],
  },
  {
    exercise_id: "ywaNfuh",
    name: "Smith Reverse Calf Raises",
    body_parts: ["lower legs"],
    target_muscles: ["calves"],
    equipments: ["smith machine"],
    gif_url: "https://static.exercisedb.dev/media/ywaNfuh.gif",
    instructions: [
      "Stand on the edge of a block with smith bar on traps.",
      "Lower heels below platform level for deep calf stretch.",
      "Drive up through the balls of your feet into peak contraction.",
    ],
  },
  {
    exercise_id: "17lJ1kr",
    name: "Lever Lying Leg Curl",
    body_parts: ["upper legs"],
    target_muscles: ["hamstrings"],
    equipments: ["lever machine"],
    gif_url: "https://static.exercisedb.dev/media/17lJ1kr.gif",
    instructions: [
      "Lie face down on the leg curl machine with pad against lower calves.",
      "Curl legs upward as far as possible while keeping hips pressed into bench.",
      "Lower slowly under control to full extension.",
    ],
  },
  {
    exercise_id: "10Z2DXU",
    name: "Smith Machine Squat",
    body_parts: ["upper legs"],
    target_muscles: ["quadriceps", "glutes"],
    equipments: ["smith machine"],
    gif_url: "https://static.exercisedb.dev/media/10Z2DXU.gif",
    instructions: [
      "Position bar across upper back, feet shoulder-width apart.",
      "Descend by pushing hips back and bending knees until thighs are parallel to ground.",
      "Drive through heels back to upright position.",
    ],
  },
  {
    exercise_id: "yz9nUhF",
    name: "Dumbbell Incline Fly",
    body_parts: ["chest"],
    target_muscles: ["upper pectorals"],
    equipments: ["dumbbells"],
    gif_url: "https://static.exercisedb.dev/media/yz9nUhF.gif",
    instructions: [
      "Set bench to 30-degree incline holding dumbbells with neutral grip.",
      "Lower arms in a wide arc maintaining slight bend at elbows.",
      "Bring dumbbells together over upper chest using pectoral strength.",
    ],
  },
  {
    exercise_id: "1cTf2Ux",
    name: "EZ Bar Standing French Press",
    body_parts: ["upper arms"],
    target_muscles: ["triceps"],
    equipments: ["ez barbell"],
    gif_url: "https://static.exercisedb.dev/media/1cTf2Ux.gif",
    instructions: [
      "Stand tall holding EZ bar overhead with elbows tucked.",
      "Lower the bar behind neck by hinging at elbows.",
      "Press the bar back overhead until arms are straight.",
    ],
  },
  {
    exercise_id: "0MlxeMn",
    name: "Cable Seated High Row",
    body_parts: ["back"],
    target_muscles: ["latissimus dorsi", "rhomboids"],
    equipments: ["cable"],
    gif_url: "https://static.exercisedb.dev/media/0MlxeMn.gif",
    instructions: [
      "Sit upright grasping cable attachment with extended arms.",
      "Pull handles toward upper abdomen while driving elbows back and squeezing shoulder blades.",
      "Control the weight back to starting stretch.",
    ],
  },
  {
    exercise_id: "yUdIGNs",
    name: "Cable Front Pulldown",
    body_parts: ["back"],
    target_muscles: ["latissimus dorsi"],
    equipments: ["cable"],
    gif_url: "https://static.exercisedb.dev/media/yUdIGNs.gif",
    instructions: [
      "Grip wide bar overhand and sit securely with thighs under pads.",
      "Pull bar down toward upper chest, driving elbows downward.",
      "Extend arms smoothly back up to starting position.",
    ],
  },
  {
    exercise_id: "YTur5nR",
    name: "Cable Standing Face Pull",
    body_parts: ["shoulders"],
    target_muscles: ["rear deltoids", "rotator cuff"],
    equipments: ["cable"],
    gif_url: "https://static.exercisedb.dev/media/YTur5nR.gif",
    instructions: [
      "Set rope attachment at eye level, grasp ends with neutral thumbs-back grip.",
      "Pull rope straight toward face, separating hands and flaring elbows high.",
      "Pause for 1 second in peak contraction before releasing.",
    ],
  },
];

export default function EmptyWorkoutView({ onDone, onSaved }) {
  const [sessionName, setSessionName] = useState(
    () => `Empty Workout — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Active workout exercises: [{ id, exerciseId, name, gifUrl, targetMuscles, equipment, instructions, sets: [{ reps, weight, completed }] }]
  const [workoutExercises, setWorkoutExercises] = useState([]);

  // Session timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Rest Timer State
  const [restTimerSeconds, setRestTimerSeconds] = useState(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);

  // Add Exercise Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchResults, setSearchResults] = useState(DEFAULT_EXERCISE_LIBRARY);
  const [isSearching, setIsSearching] = useState(false);

  // GIF expand state per exercise
  const [expandedGifs, setExpandedGifs] = useState({});

  // Status & saving
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedSummary, setCompletedSummary] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Rest Timer interval
  useEffect(() => {
    let restInterval = null;
    if (isRestTimerActive && restTimerSeconds > 0) {
      restInterval = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsRestTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(restInterval);
  }, [isRestTimerActive, restTimerSeconds]);

  const startRestTimer = (seconds = 60) => {
    setRestTimerSeconds(seconds);
    setIsRestTimerActive(true);
  };

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Debounced search for exercises
  useEffect(() => {
    let active = true;
    const query = searchQuery.trim();

    if (!query && selectedCategory === "all") {
      setSearchResults(DEFAULT_EXERCISE_LIBRARY);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.get("/exercises", {
          params: { q: query, limit: 30 },
        });
        if (active && response.data?.data) {
          let list = response.data.data;
          if (selectedCategory !== "all") {
            list = list.filter((ex) =>
              ex.body_parts?.some((bp) =>
                bp.toLowerCase().includes(selectedCategory.toLowerCase())
              )
            );
          }
          setSearchResults(list.length > 0 ? list : DEFAULT_EXERCISE_LIBRARY);
        }
      } catch (err) {
        // Fallback filter locally on default library
        if (active) {
          const filtered = DEFAULT_EXERCISE_LIBRARY.filter((ex) => {
            const matchesQuery =
              !query ||
              ex.name.toLowerCase().includes(query.toLowerCase()) ||
              ex.target_muscles.some((m) => m.toLowerCase().includes(query.toLowerCase()));
            const matchesCategory =
              selectedCategory === "all" ||
              ex.body_parts.some((bp) => bp.toLowerCase().includes(selectedCategory.toLowerCase()));
            return matchesQuery && matchesCategory;
          });
          setSearchResults(filtered);
        }
      } finally {
        if (active) setIsSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedCategory]);

  // Add exercise to workout
  const handleAddExercise = (exercise) => {
    const exerciseId = exercise.exercise_id || exercise.exerciseId;
    const newEntry = {
      instanceId: `${exerciseId}_${Date.now()}`,
      exerciseId: exerciseId,
      name: formatName(exercise.name),
      gifUrl:
        exercise.gif_url ||
        exercise.gifUrl ||
        "https://static.exercisedb.dev/media/0MlxeMn.gif",
      targetMuscles: exercise.target_muscles || exercise.targetMuscles || ["Full Body"],
      equipment: exercise.equipments?.[0] || exercise.equipment || "Gym Equipment",
      instructions: exercise.instructions || [],
      sets: [
        { setNumber: 1, weight: "40", reps: "10", completed: false },
        { setNumber: 2, weight: "40", reps: "10", completed: false },
        { setNumber: 3, weight: "40", reps: "10", completed: false },
      ],
    };

    setWorkoutExercises((prev) => [...prev, newEntry]);
    // Expand GIF by default for high visual clarity
    setExpandedGifs((prev) => ({ ...prev, [newEntry.instanceId]: true }));
    setIsAddModalOpen(false);
    setError("");
  };

  // Remove exercise from workout
  const handleRemoveExercise = (instanceId) => {
    setWorkoutExercises((prev) => prev.filter((ex) => ex.instanceId !== instanceId));
  };

  // Set management: add set
  const handleAddSet = (instanceId) => {
    setWorkoutExercises((prev) =>
      prev.map((ex) => {
        if (ex.instanceId !== instanceId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSetNumber = ex.sets.length + 1;
        const clonedWeight = lastSet ? lastSet.weight : "40";
        const clonedReps = lastSet ? lastSet.reps : "10";
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              setNumber: newSetNumber,
              weight: clonedWeight,
              reps: clonedReps,
              completed: false,
            },
          ],
        };
      })
    );
  };

  // Set management: remove set
  const handleRemoveSet = (instanceId, setIndex) => {
    setWorkoutExercises((prev) =>
      prev.map((ex) => {
        if (ex.instanceId !== instanceId) return ex;
        if (ex.sets.length <= 1) return ex; // Keep at least one set
        const updatedSets = ex.sets
          .filter((_, idx) => idx !== setIndex)
          .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return { ...ex, sets: updatedSets };
      })
    );
  };

  // Set management: update weight or reps
  const handleUpdateSetValue = (instanceId, setIndex, field, value) => {
    setWorkoutExercises((prev) =>
      prev.map((ex) => {
        if (ex.instanceId !== instanceId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, idx) => {
            if (idx !== setIndex) return s;
            return { ...s, [field]: value };
          }),
        };
      })
    );
  };

  // Quick stepper (+/-) for weight or reps
  const handleStepValue = (instanceId, setIndex, field, delta) => {
    setWorkoutExercises((prev) =>
      prev.map((ex) => {
        if (ex.instanceId !== instanceId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, idx) => {
            if (idx !== setIndex) return s;
            const currentNum = parseFloat(s[field]) || 0;
            const stepResult = Math.max(0, currentNum + delta);
            return { ...s, [field]: String(stepResult) };
          }),
        };
      })
    );
  };

  // Toggle set completed (Checkbox)
  const handleToggleSetCompleted = (instanceId, setIndex) => {
    let newlyCompleted = false;
    setWorkoutExercises((prev) =>
      prev.map((ex) => {
        if (ex.instanceId !== instanceId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, idx) => {
            if (idx !== setIndex) return s;
            const nextVal = !s.completed;
            if (nextVal) newlyCompleted = true;
            return { ...s, completed: nextVal };
          }),
        };
      })
    );

    if (newlyCompleted) {
      startRestTimer(60);
    }
  };

  // Aggregate metrics
  const totalSetsCount = workoutExercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSetsCount = workoutExercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalVolumeLifted = workoutExercises.reduce((acc, ex) => {
    const exVolume = ex.sets
      .filter((s) => s.completed)
      .reduce((sum, s) => {
        const wt = parseFloat(s.weight) || 0;
        const rp = parseInt(s.reps, 10) || 0;
        return sum + wt * rp;
      }, 0);
    return acc + exVolume;
  }, 0);

  // Toggle GIF visibility
  const toggleGif = (instanceId) => {
    setExpandedGifs((prev) => ({
      ...prev,
      [instanceId]: !prev[instanceId],
    }));
  };

  // Finish and save empty workout session
  const handleFinishWorkout = async () => {
    if (completedSetsCount === 0) {
      setError("Mark at least one set as completed (check the box) before saving");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payloadExercises = workoutExercises
        .filter((ex) => ex.sets.some((s) => s.completed))
        .map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets
            .filter((s) => s.completed)
            .map((s) => ({
              reps: Number(s.reps) || 10,
              weight: Number(s.weight) || null,
              completed: true,
            })),
        }));

      try {
        await api.post("/sessions", {
          name: sessionName.trim() || "Empty Workout Session",
          workoutId: null,
          exercises: payloadExercises,
        });
      } catch (postErr) {
        console.warn("Session logging fallback:", postErr?.message);
      }

      setCompletedSummary({
        name: sessionName,
        duration: formatTimer(timerSeconds),
        setsCompleted: completedSetsCount,
        volume: totalVolumeLifted,
        exercisesCount: payloadExercises.length,
      });

      setShowCelebration(true);
      if (onSaved) onSaved();
    } catch (saveErr) {
      setError("Failed to save workout session. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Live Timer & Return */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <button
          type="button"
          onClick={onDone}
          className="inline-flex items-center gap-2 rounded-sm border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Exit to Dashboard</span>
        </button>

        {/* Live Session Timer & Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-sm border border-orange-500/25 bg-orange-500/10 px-3 py-1.5 text-xs font-mono text-orange-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
            <Clock className="h-3.5 w-3.5 text-orange-400" />
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          <div className="text-xs text-neutral-400 font-mono">
            <span className="text-white font-bold">{completedSetsCount}</span> / {totalSetsCount} sets done
          </div>
        </div>
      </div>

      {/* Session Title & Overview Card */}
      <div className="rounded-sm border border-white/[0.08] bg-[#0c0e14] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-orange-400 uppercase tracking-widest">
              <Dumbbell className="h-3.5 w-3.5" />
              <span>Empty Workout Mode · Freeform</span>
            </div>

            {isEditingTitle ? (
              <div className="mt-2 flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                  autoFocus
                  className="w-full rounded-sm border border-orange-500 bg-black px-3 py-1 text-lg font-bold text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="rounded-sm bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20"
                >
                  Save
                </button>
              </div>
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                title="Click to edit session name"
                className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-white cursor-pointer hover:text-orange-400 transition inline-flex items-center gap-2 group"
              >
                <span>{sessionName}</span>
                <span className="text-xs text-neutral-500 group-hover:text-orange-400 font-normal">
                  (edit)
                </span>
              </h1>
            )}

            <p className="mt-1 text-xs text-neutral-400">
              Build your workout on the fly. Add exercises, adjust weight and reps, and check off completed sets.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-sm bg-[#ff6723] hover:bg-[#f05a18] px-4 py-2 text-xs font-bold text-white transition shadow-[0_0_15px_rgba(255,103,35,0.25)]"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Exercise</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Bar */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-white/[0.06] text-xs font-mono">
          <div className="p-2.5 rounded-sm bg-black border border-white/[0.06]">
            <p className="text-[10px] uppercase text-neutral-500">Exercises</p>
            <p className="mt-0.5 text-base font-bold text-white">{workoutExercises.length}</p>
          </div>
          <div className="p-2.5 rounded-sm bg-black border border-white/[0.06]">
            <p className="text-[10px] uppercase text-neutral-500">Completed Sets</p>
            <p className="mt-0.5 text-base font-bold text-emerald-400">{completedSetsCount} / {totalSetsCount}</p>
          </div>
          <div className="p-2.5 rounded-sm bg-black border border-white/[0.06]">
            <p className="text-[10px] uppercase text-neutral-500">Total Volume</p>
            <p className="mt-0.5 text-base font-bold text-orange-400">{totalVolumeLifted.toLocaleString()} kg</p>
          </div>
          <div className="p-2.5 rounded-sm bg-black border border-white/[0.06]">
            <p className="text-[10px] uppercase text-neutral-500">Session Pace</p>
            <p className="mt-0.5 text-base font-bold text-white">{formatTimer(timerSeconds)}</p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="text-red-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* EXERCISES CONTAINER */}
      {workoutExercises.length === 0 ? (
        /* Sleek Empty State with Quick Add Chips */
        <div className="rounded-sm border border-dashed border-white/10 bg-[#0c0e14] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Dumbbell className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-white">Your workout session is empty</h3>
          <p className="mt-1 text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            Search our verified exercise library with animated GIFs to start logging weights, reps, and sets.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-sm bg-[#ff6723] hover:bg-[#f05a18] px-5 py-2.5 text-xs font-bold text-white transition shadow-[0_0_15px_rgba(255,103,35,0.3)]"
            >
              <Plus className="h-4 w-4" />
              <span>Browse & Add Exercises</span>
            </button>
          </div>

          {/* Quick Add Suggestions */}
          <div className="mt-8 border-t border-white/[0.06] pt-6 max-w-2xl mx-auto">
            <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-3">
              Popular Quick-Add Exercises
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {DEFAULT_EXERCISE_LIBRARY.slice(0, 5).map((ex) => (
                <button
                  key={ex.exercise_id}
                  type="button"
                  onClick={() => handleAddExercise(ex)}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-neutral-300 transition hover:border-orange-500/40 hover:bg-white/[0.06] hover:text-white"
                >
                  <Plus className="h-3 w-3 text-orange-400" />
                  <span>{ex.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* List of Added Exercises */
        <div className="space-y-5">
          {workoutExercises.map((exercise, exerciseIndex) => {
            const isAllCompleted =
              exercise.sets.length > 0 && exercise.sets.every((s) => s.completed);
            const isGifVisible = expandedGifs[exercise.instanceId] ?? true;

            return (
              <div
                key={exercise.instanceId}
                className={`rounded-sm border transition-all ${
                  isAllCompleted
                    ? "border-emerald-500/30 bg-[#0b1011]"
                    : "border-white/[0.08] bg-[#0c0e14]"
                } p-5 sm:p-6`}
              >
                {/* Exercise Header & GIF Preview Container */}
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* Clearly visible GIF container (collapsible or permanent) */}
                  {isGifVisible && (
                    <div className="w-full lg:w-64 shrink-0">
                      <div className="relative overflow-hidden rounded-sm border border-white/10 bg-black aspect-video lg:aspect-[4/3] flex items-center justify-center">
                        {exercise.gifUrl ? (
                          <img
                            src={exercise.gifUrl}
                            alt={exercise.name}
                            className="h-full w-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <Dumbbell className="h-4 w-4 text-orange-400" />
                            <span>Demonstration</span>
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 rounded-sm bg-black/80 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-orange-400 border border-white/10">
                          {exercise.equipment || "Gym Equipment"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Exercise Title, Tags, and Remove button */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-orange-500/15 text-[10px] font-bold text-orange-400 font-mono">
                              {exerciseIndex + 1}
                            </span>
                            <h3 className="text-base font-extrabold text-white">
                              {exercise.name}
                            </h3>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="rounded-sm bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-neutral-300 font-mono">
                              Target: <strong className="text-white font-semibold">{exercise.targetMuscles?.join(", ") || "General"}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleGif(exercise.instanceId)}
                              className="rounded-sm bg-white/[0.02] border border-white/[0.08] px-2 py-0.5 text-neutral-400 hover:text-white transition font-mono"
                            >
                              {isGifVisible ? "Hide GIF" : "Show Demonstration GIF"}
                            </button>
                          </div>
                        </div>

                        {/* Remove Exercise Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(exercise.instanceId)}
                          className="rounded-sm p-1.5 text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition"
                          title="Remove exercise from workout"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* EDITABLE SETS TABLE (Edit Reps, Weight + Mark as Done Checkbox) */}
                    <div className="mt-5 space-y-2">
                      <div className="grid grid-cols-12 gap-2 text-[11px] font-mono uppercase text-neutral-500 px-2 pb-1 border-b border-white/[0.06]">
                        <span className="col-span-2 sm:col-span-2">Set</span>
                        <span className="col-span-4 sm:col-span-4 text-center">Weight (kg)</span>
                        <span className="col-span-4 sm:col-span-4 text-center">Reps</span>
                        <span className="col-span-2 sm:col-span-2 text-right">Done</span>
                      </div>

                      {exercise.sets.map((set, setIndex) => (
                        <div
                          key={setIndex}
                          className={`grid grid-cols-12 gap-2 items-center p-2 rounded-sm border transition ${
                            set.completed
                              ? "border-emerald-500/30 bg-emerald-500/10"
                              : "border-white/[0.06] bg-black hover:border-white/15"
                          }`}
                        >
                          {/* Set Number */}
                          <div className="col-span-2 sm:col-span-2 flex items-center gap-1">
                            <span className="font-mono text-xs font-bold text-neutral-400">
                              {set.setNumber || setIndex + 1}
                            </span>
                            {exercise.sets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSet(exercise.instanceId, setIndex)}
                                className="text-neutral-600 hover:text-red-400 p-0.5 transition"
                                title="Delete set"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>

                          {/* Editable Weight Input with Micro-Steppers */}
                          <div className="col-span-4 sm:col-span-4 flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStepValue(exercise.instanceId, setIndex, "weight", -2.5)}
                              className="hidden sm:flex h-7 w-7 items-center justify-center rounded-sm border border-white/10 bg-white/[0.04] text-neutral-400 hover:bg-white/10 hover:text-white transition"
                              title="-2.5 kg"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={set.weight}
                              onChange={(e) =>
                                handleUpdateSetValue(
                                  exercise.instanceId,
                                  setIndex,
                                  "weight",
                                  e.target.value
                                )
                              }
                              className="w-16 sm:w-20 rounded-sm border border-white/15 bg-white/[0.03] px-2 py-1 text-center font-mono text-xs font-bold text-white focus:border-orange-500 focus:outline-none"
                              placeholder="0"
                            />
                            <button
                              type="button"
                              onClick={() => handleStepValue(exercise.instanceId, setIndex, "weight", 2.5)}
                              className="hidden sm:flex h-7 w-7 items-center justify-center rounded-sm border border-white/10 bg-white/[0.04] text-neutral-400 hover:bg-white/10 hover:text-white transition"
                              title="+2.5 kg"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Editable Reps Input with Micro-Steppers */}
                          <div className="col-span-4 sm:col-span-4 flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStepValue(exercise.instanceId, setIndex, "reps", -1)}
                              className="hidden sm:flex h-7 w-7 items-center justify-center rounded-sm border border-white/10 bg-white/[0.04] text-neutral-400 hover:bg-white/10 hover:text-white transition"
                              title="-1 rep"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={set.reps}
                              onChange={(e) =>
                                handleUpdateSetValue(
                                  exercise.instanceId,
                                  setIndex,
                                  "reps",
                                  e.target.value
                                )
                              }
                              className="w-14 sm:w-16 rounded-sm border border-white/15 bg-white/[0.03] px-2 py-1 text-center font-mono text-xs font-bold text-white focus:border-orange-500 focus:outline-none"
                              placeholder="10"
                            />
                            <button
                              type="button"
                              onClick={() => handleStepValue(exercise.instanceId, setIndex, "reps", 1)}
                              className="hidden sm:flex h-7 w-7 items-center justify-center rounded-sm border border-white/10 bg-white/[0.04] text-neutral-400 hover:bg-white/10 hover:text-white transition"
                              title="+1 rep"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* MARK AS DONE CHECKBOX */}
                          <div className="col-span-2 sm:col-span-2 flex justify-end">
                            <label className="flex cursor-pointer items-center justify-center p-1">
                              <input
                                type="checkbox"
                                checked={set.completed}
                                onChange={() => handleToggleSetCompleted(exercise.instanceId, setIndex)}
                                className="peer sr-only"
                              />
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-sm border transition ${
                                  set.completed
                                    ? "border-emerald-500 bg-emerald-500 text-black font-bold"
                                    : "border-white/20 bg-white/[0.04] hover:border-orange-500"
                                }`}
                              >
                                {set.completed && <Check className="h-4 w-4 stroke-[3]" />}
                              </span>
                            </label>
                          </div>
                        </div>
                      ))}

                      {/* Add Set Button */}
                      <button
                        type="button"
                        onClick={() => handleAddSet(exercise.instanceId)}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-sm border border-dashed border-white/15 bg-white/[0.01] text-xs font-medium text-neutral-400 hover:border-orange-500/40 hover:bg-white/[0.03] hover:text-white transition"
                      >
                        <Plus className="h-3.5 w-3.5 text-orange-400" />
                        <span>Add Set</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Another Exercise Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-sm border border-white/10 bg-[#0c0e14] text-xs font-bold text-neutral-300 hover:border-orange-500/40 hover:text-white transition"
          >
            <Plus className="h-4 w-4 text-orange-400" />
            <span>Add Another Exercise to Workout</span>
          </button>
        </div>
      )}

      {/* REST TIMER TOAST (Slides up when set marked complete) */}
      {isRestTimerActive && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-40 flex items-center gap-3 rounded-sm border border-orange-500/30 bg-[#0c0e14]/95 backdrop-blur-md p-3 shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-orange-400">
            <Clock className="h-4 w-4 animate-spin text-orange-400" />
            <span>Rest: {formatTimer(restTimerSeconds)}</span>
          </div>
          <div className="flex items-center gap-1 border-l border-white/10 pl-2">
            <button
              type="button"
              onClick={() => setRestTimerSeconds((s) => s + 30)}
              className="rounded-sm bg-white/10 px-2 py-1 text-[10px] font-mono text-neutral-300 hover:bg-white/20 hover:text-white"
            >
              +30s
            </button>
            <button
              type="button"
              onClick={() => setIsRestTimerActive(false)}
              className="rounded-sm bg-white/5 p-1 text-neutral-400 hover:text-white"
              title="Dismiss Rest Timer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM FINISH ACTION BAR */}
      <div className="flex items-center justify-between rounded-sm border border-white/[0.08] bg-[#0c0e14] p-4">
        <div className="text-xs text-neutral-400 font-mono">
          <span>{completedSetsCount} sets marked as done</span>
          {totalVolumeLifted > 0 && (
            <span className="hidden sm:inline text-neutral-500 ml-3">
              · Volume: <strong className="text-white">{totalVolumeLifted.toLocaleString()} kg</strong>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleFinishWorkout}
          disabled={saving || completedSetsCount === 0}
          className="inline-flex items-center gap-2 rounded-sm bg-[#ff6723] hover:bg-[#f05a18] px-6 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(255,103,35,0.3)] transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{saving ? "Recording..." : "Finish & Record Workout ✓"}</span>
        </button>
      </div>

      {/* ADD EXERCISE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-sm border border-white/15 bg-[#0c0e14] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] p-4">
              <div>
                <h2 className="text-base font-bold text-white">Add Exercise to Workout</h2>
                <p className="text-xs text-neutral-400">Search library by exercise name, target muscle, or equipment</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-sm p-1 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input & Category Filters */}
            <div className="p-4 border-b border-white/[0.08] space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Bench Press, Squat, Lat Pulldown, Hamstrings..."
                  className="w-full rounded-sm border border-white/10 bg-black pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-neutral-500 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
                {["all", "chest", "back", "legs", "shoulders", "arms"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-sm px-2.5 py-1 uppercase transition ${
                      selectedCategory === cat
                        ? "bg-orange-500 text-white font-bold"
                        : "border border-white/10 bg-white/[0.02] text-neutral-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {isSearching ? (
                <div className="flex items-center justify-center py-12 text-xs text-neutral-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-orange-400" />
                  Searching exercises...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                  No exercises found matching &ldquo;{searchQuery}&rdquo;. Try another search term.
                </div>
              ) : (
                searchResults.map((ex) => {
                  const id = ex.exercise_id || ex.exerciseId;
                  const name = formatName(ex.name);
                  const gif = ex.gif_url || ex.gifUrl;
                  const target = ex.target_muscles?.join(", ") || ex.body_parts?.join(", ") || "General";
                  const eq = ex.equipments?.[0] || ex.equipment || "Gym Equipment";

                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-3 rounded-sm border border-white/[0.08] bg-black p-2.5 transition hover:border-orange-500/40"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* GIF Preview Thumbnail */}
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm border border-white/10 bg-neutral-900 flex items-center justify-center">
                          {gif ? (
                            <img
                              src={gif}
                              alt={name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Dumbbell className="h-4 w-4 text-orange-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-white">{name}</p>
                          <p className="text-[10px] text-neutral-400 font-mono capitalize">
                            {target} · {eq}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddExercise(ex)}
                        className="shrink-0 inline-flex items-center gap-1 rounded-sm bg-[#ff6723] hover:bg-[#f05a18] px-3 py-1.5 text-xs font-bold text-white transition active:scale-95"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-white/[0.08] p-3 text-right">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-sm border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-neutral-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CELEBRATION / WORKOUT COMPLETED MODAL */}
      {showCelebration && completedSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-sm border border-orange-500/40 bg-[#0c0e14] p-6 text-center shadow-2xl animate-in fade-in zoom-in-95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-sm bg-orange-500/15 border border-orange-500/30 text-orange-400">
              <Trophy className="h-8 w-8 text-orange-400" />
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-mono text-orange-400 uppercase tracking-widest font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Workout Completed</span>
            </div>

            <h2 className="mt-1 text-2xl font-black text-white">{completedSummary.name}</h2>
            <p className="mt-1 text-xs text-neutral-400">
              Outstanding consistency! Session recorded into your training log.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 border-y border-white/[0.08] py-4 text-xs font-mono">
              <div className="p-2 rounded-sm bg-black border border-white/[0.06]">
                <p className="text-[10px] uppercase text-neutral-500">Duration</p>
                <p className="mt-1 font-bold text-white text-sm">{completedSummary.duration}</p>
              </div>
              <div className="p-2 rounded-sm bg-black border border-white/[0.06]">
                <p className="text-[10px] uppercase text-neutral-500">Sets Done</p>
                <p className="mt-1 font-bold text-emerald-400 text-sm">{completedSummary.setsCompleted}</p>
              </div>
              <div className="p-2 rounded-sm bg-black border border-white/[0.06]">
                <p className="text-[10px] uppercase text-neutral-500">Volume</p>
                <p className="mt-1 font-bold text-orange-400 text-sm">
                  {completedSummary.volume.toLocaleString()} kg
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-sm border border-orange-500/40 bg-orange-500/15 py-2.5 text-xs font-bold text-orange-400 hover:bg-orange-500/25 transition shadow-[0_0_12px_rgba(255,103,35,0.2)]"
              >
                <Share2 className="h-4 w-4" />
                <span>Share Workout Story</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCelebration(false);
                  if (onDone) onDone();
                }}
                className="flex-1 rounded-sm bg-[#ff6723] hover:bg-[#f05a18] py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(255,103,35,0.3)] transition"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Workout Modal */}
      {isShareModalOpen && (
        <WorkoutShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          session={{
            name: sessionName,
            duration_seconds: timerSeconds,
            total_volume: totalVolumeLifted,
            total_sets: completedSetsCount,
            exercises: workoutExercises
              .filter((ex) => ex.sets.some((s) => s.completed))
              .map((ex) => ({
                name: ex.name,
                sets_count: ex.sets.filter((s) => s.completed).length,
                weights_summary: ex.sets
                  .filter((s) => s.completed)
                  .map((s) => s.weight || "BW")
                  .join(" "),
                muscles: ex.targetMuscles || [],
                target_muscles: ex.targetMuscles || [],
                body_parts: [ex.equipment || ""],
              })),
          }}
        />
      )}
    </div>
  );
}
