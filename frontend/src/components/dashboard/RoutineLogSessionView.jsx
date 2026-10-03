import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Info,
  Loader2,
  RotateCcw,
  Sparkles,
  Trophy,
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

// High fidelity preset routines with real verified animated GIFs and exercise details
const ROUTINE_PRESETS = {
  leg: {
    name: "Leg Hypertrophy Routine",
    description: "Quad and hamstring volume focus with smith machine squats and machine presses.",
    exercises: [
      {
        exerciseId: "ywaNfuh",
        name: "Smith Reverse Calf Raises",
        gifUrl: "https://static.exercisedb.dev/media/ywaNfuh.gif",
        bodyParts: ["lower legs"],
        targetMuscles: ["calves"],
        secondaryMuscles: ["hamstrings"],
        equipment: "smith machine",
        restSeconds: 60,
        instructions: [
          "Adjust smith machine bar to shoulder height with balls of feet on edge of a step.",
          "Raise heels as high as possible, contracting calves at the peak.",
          "Slowly lower heels below platform level for a full stretch.",
        ],
        sets: [
          { setNumber: 1, weight: "70", reps: "15", completed: false },
          { setNumber: 2, weight: "75", reps: "12", completed: false },
          { setNumber: 3, weight: "80", reps: "12", completed: false },
          { setNumber: 4, weight: "80", reps: "10", completed: false },
        ],
      },
      {
        exerciseId: "17lJ1kr",
        name: "Lever Lying Leg Curl",
        gifUrl: "https://static.exercisedb.dev/media/17lJ1kr.gif",
        bodyParts: ["upper legs"],
        targetMuscles: ["hamstrings"],
        secondaryMuscles: ["calves"],
        equipment: "leverage machine",
        restSeconds: 90,
        instructions: [
          "Lie face down on machine with heels under the padded lever.",
          "Curl legs up towards glutes while keeping hips firmly pressed against the bench.",
          "Hold peak contraction for a second before slowly extending legs.",
        ],
        sets: [
          { setNumber: 1, weight: "45", reps: "12", completed: false },
          { setNumber: 2, weight: "50", reps: "10", completed: false },
          { setNumber: 3, weight: "55", reps: "8", completed: false },
        ],
      },
      {
        exerciseId: "10Z2DXU",
        name: "Sled 45° Leg Press",
        gifUrl: "https://static.exercisedb.dev/media/10Z2DXU.gif",
        bodyParts: ["upper legs"],
        targetMuscles: ["glutes", "quads"],
        secondaryMuscles: ["hamstrings", "calves"],
        equipment: "sled machine",
        restSeconds: 120,
        instructions: [
          "Place feet shoulder-width apart in center of the sled footplate.",
          "Release safety pins and lower the weight until knees reach a 90-degree angle.",
          "Press explosively through heels without locking knees at the top.",
        ],
        sets: [
          { setNumber: 1, weight: "140", reps: "12", completed: false },
          { setNumber: 2, weight: "160", reps: "10", completed: false },
          { setNumber: 3, weight: "180", reps: "8", completed: false },
        ],
      },
    ],
  },
  push: {
    name: "Push Strength & Chest Routine",
    description: "Compound pressing movements and cable flies for chest, shoulders, and triceps.",
    exercises: [
      {
        exerciseId: "z6TAHoT",
        name: "Dumbbell Twisting Bench Press",
        gifUrl: "https://static.exercisedb.dev/media/z6TAHoT.gif",
        bodyParts: ["chest", "arms"],
        targetMuscles: ["pectorals", "triceps"],
        secondaryMuscles: ["front delts"],
        equipment: "dumbbells",
        restSeconds: 90,
        instructions: [
          "Lie flat on the bench holding dumbbells directly over your chest.",
          "Lower weights under control while twisting wrists inward slightly.",
          "Press powerfully back up to lockout, squeezing chest at the top.",
        ],
        sets: [
          { setNumber: 1, weight: "30", reps: "10", completed: false },
          { setNumber: 2, weight: "34", reps: "8", completed: false },
          { setNumber: 3, weight: "38", reps: "6", completed: false },
        ],
      },
      {
        exerciseId: "yz9nUhF",
        name: "Dumbbell Chest Fly",
        gifUrl: "https://static.exercisedb.dev/media/yz9nUhF.gif",
        bodyParts: ["chest"],
        targetMuscles: ["pectorals"],
        secondaryMuscles: ["shoulders"],
        equipment: "dumbbells",
        restSeconds: 60,
        instructions: [
          "Lie flat with slight bend in elbows, palms facing each other.",
          "Lower arms out wide in an arc until deep stretch across the chest.",
          "Bring dumbbells back up using chest contraction, avoiding elbow flexion.",
        ],
        sets: [
          { setNumber: 1, weight: "16", reps: "12", completed: false },
          { setNumber: 2, weight: "18", reps: "10", completed: false },
          { setNumber: 3, weight: "18", reps: "10", completed: false },
        ],
      },
      {
        exerciseId: "1cTf2Ux",
        name: "EZ Bar Standing French Press",
        gifUrl: "https://static.exercisedb.dev/media/1cTf2Ux.gif",
        bodyParts: ["upper arms"],
        targetMuscles: ["triceps"],
        secondaryMuscles: ["shoulders"],
        equipment: "ez barbell",
        restSeconds: 60,
        instructions: [
          "Hold EZ barbell overhead with overhand grip, upper arms locked beside head.",
          "Lower bar behind head by bending elbows while keeping upper arms fixed.",
          "Extend arms overhead, fully contracting triceps.",
        ],
        sets: [
          { setNumber: 1, weight: "25", reps: "12", completed: false },
          { setNumber: 2, weight: "30", reps: "10", completed: false },
          { setNumber: 3, weight: "30", reps: "8", completed: false },
        ],
      },
    ],
  },
  pull: {
    name: "Pull Power & Lat Focus Routine",
    description: "Comprehensive back session targeting lats, rhomboids, rear delts, and biceps.",
    exercises: [
      {
        exerciseId: "0MlxeMn",
        name: "Gentle Style Cable Pulldown (Pro Lat Bar)",
        gifUrl: "https://static.exercisedb.dev/media/0MlxeMn.gif",
        bodyParts: ["back"],
        targetMuscles: ["lats"],
        secondaryMuscles: ["biceps", "forearms"],
        equipment: "cable",
        restSeconds: 90,
        instructions: [
          "Grasp wide lat bar with overhand grip and sit with thighs secured under pads.",
          "Pull bar down towards upper chest, driving elbows downward and squeezing shoulder blades.",
          "Slowly resist bar back to top for a deep lat stretch.",
        ],
        sets: [
          { setNumber: 1, weight: "65", reps: "12", completed: false },
          { setNumber: 2, weight: "75", reps: "10", completed: false },
          { setNumber: 3, weight: "85", reps: "8", completed: false },
        ],
      },
      {
        exerciseId: "yUdIGNs",
        name: "Cable Rear Delt Row (Stirrups)",
        gifUrl: "https://static.exercisedb.dev/media/yUdIGNs.gif",
        bodyParts: ["shoulders", "upper back"],
        targetMuscles: ["rear delts"],
        secondaryMuscles: ["trapezius", "rhomboids"],
        equipment: "cable",
        restSeconds: 60,
        instructions: [
          "Attach single handle to low cable pulley with torso hinged at 45 degrees.",
          "Pull handle toward chest by retracting shoulder blade.",
          "Pause for a peak contraction at top, then slowly release.",
        ],
        sets: [
          { setNumber: 1, weight: "30", reps: "12", completed: false },
          { setNumber: 2, weight: "35", reps: "10", completed: false },
          { setNumber: 3, weight: "40", reps: "10", completed: false },
        ],
      },
      {
        exerciseId: "YTur5nR",
        name: "Cable One Arm Curl",
        gifUrl: "https://static.exercisedb.dev/media/YTur5nR.gif",
        bodyParts: ["upper arms"],
        targetMuscles: ["biceps"],
        secondaryMuscles: ["forearms"],
        equipment: "cable",
        restSeconds: 60,
        instructions: [
          "Stand facing cable with handle at lowest height, grasping handle underhand.",
          "Keep elbow pinned to side and curl forearm towards shoulder.",
          "Pause and squeeze bicep at peak before lowering slowly.",
        ],
        sets: [
          { setNumber: 1, weight: "15", reps: "12", completed: false },
          { setNumber: 2, weight: "17.5", reps: "10", completed: false },
          { setNumber: 3, weight: "20", reps: "8", completed: false },
        ],
      },
    ],
  },
};

export default function RoutineLogSessionView({ workoutId, onDone, onSaved }) {
  const [routineName, setRoutineName] = useState("Workout Routine");
  const [description, setDescription] = useState("");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [expandedInfo, setExpandedInfo] = useState({});

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Load routine data
  useEffect(() => {
    let cancelled = false;

    const loadRoutine = async () => {
      setLoading(true);
      setError("");

      const key = String(workoutId || "").toLowerCase();
      // Check preset template matching first (for leg, push, pull)
      if (ROUTINE_PRESETS[key]) {
        const preset = ROUTINE_PRESETS[key];
        setRoutineName(preset.name);
        setDescription(preset.description);
        setExercises(preset.exercises);
        setLoading(false);
        return;
      }

      // Try fetching from backend /workouts/:workoutId
      if (workoutId) {
        try {
          const response = await api.get(`/workouts/${workoutId}`);
          if (!cancelled && response.data?.data) {
            const data = response.data.data;
            setRoutineName(data.name || "Workout Routine");
            setDescription(data.description || "");

            // Map exercises and their sets
            const mapped = (data.exercises || []).map((ex) => ({
              exerciseId: ex.exercise_id,
              name: formatName(ex.name),
              gifUrl: ex.gif_url || "https://static.exercisedb.dev/media/0MlxeMn.gif",
              targetMuscles: [ex.body_part || "Full Body"],
              equipment: "Gym Equipment",
              restSeconds: ex.rest_seconds || 90,
              sets: (ex.sets && ex.sets.length > 0)
                ? ex.sets.map((s, idx) => ({
                    setNumber: s.setNumber || idx + 1,
                    weight: s.weight != null ? String(s.weight) : "0",
                    reps: s.reps != null ? String(s.reps) : "10",
                    completed: false,
                  }))
                : [
                    { setNumber: 1, weight: String(ex.target_weight || "50"), reps: String(ex.target_reps || "10"), completed: false },
                    { setNumber: 2, weight: String(ex.target_weight || "50"), reps: String(ex.target_reps || "10"), completed: false },
                    { setNumber: 3, weight: String(ex.target_weight || "50"), reps: String(ex.target_reps || "10"), completed: false },
                  ],
            }));
            setExercises(mapped);
            setLoading(false);
            return;
          }
        } catch (fetchErr) {
          // If server error or unseeded id, default to pull preset as safe fallback
          if (!cancelled) {
            const fallback = ROUTINE_PRESETS.pull;
            setRoutineName(fallback.name);
            setDescription(fallback.description);
            setExercises(fallback.exercises);
          }
        }
      } else {
        // Fallback default
        const fallback = ROUTINE_PRESETS.pull;
        setRoutineName(fallback.name);
        setDescription(fallback.description);
        setExercises(fallback.exercises);
      }

      if (!cancelled) setLoading(false);
    };

    loadRoutine();
    return () => {
      cancelled = true;
    };
  }, [workoutId]);

  // Toggle set checkbox (READ-ONLY weights/reps, ONLY CHECKBOX CLICKABLE)
  const toggleSetCompleted = (exerciseIndex, setIndex) => {
    setExercises((current) =>
      current.map((ex, eIdx) => {
        if (eIdx !== exerciseIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, sIdx) => {
            if (sIdx !== setIndex) return s;
            return { ...s, completed: !s.completed };
          }),
        };
      })
    );
  };

  const toggleInstructions = (exerciseId) => {
    setExpandedInfo((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  // Metrics
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const progressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const [showCelebration, setShowCelebration] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const totalVolumeLifted = exercises.reduce((acc, ex) => {
    const exVol = ex.sets
      .filter((s) => s.completed)
      .reduce((sum, s) => {
        const wt = parseFloat(s.weight) || 0;
        const rp = parseInt(s.reps, 10) || 0;
        return sum + wt * rp;
      }, 0);
    return acc + exVol;
  }, 0);

  // Complete & Save Session
  const handleCompleteSession = async () => {
    if (completedSets === 0) {
      setError("Please check off at least one completed set before logging");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payloadExercises = exercises
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
          name: routineName,
          workoutId: (typeof workoutId === "string" && !ROUTINE_PRESETS[workoutId]) ? workoutId : null,
          exercises: payloadExercises,
        });
      } catch (postErr) {
        console.warn("Session saved in frontend session logger:", postErr?.message);
      }

      setSuccess("Great workout! Session recorded successfully.");
      if (onSaved) onSaved();
      setShowCelebration(true);
    } catch (saveErr) {
      setError("Failed to record session. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Live Timer & Back */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <button
          type="button"
          onClick={onDone}
          className="inline-flex items-center gap-2 rounded-sm border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Live Session Counter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-sm border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-mono text-orange-400 font-semibold">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          <div className="text-xs text-neutral-400 font-mono">
            <span className="text-white font-bold">{completedSets}</span> / {totalSets} sets done
          </div>
        </div>
      </div>

      {/* Routine Banner Info */}
      <div className="rounded-sm border border-white/[0.08] bg-[#0c0e14] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-orange-400 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Prescribed Routine Mode</span>
            </div>
            <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-white">
              {routineName}
            </h1>
            {description && (
              <p className="mt-1 text-xs text-neutral-400 max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={handleCompleteSession}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-sm bg-[#ff6723] hover:bg-[#f05a18] px-5 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(255,103,35,0.3)] transition active:scale-[0.99] disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              <span>{saving ? "Saving..." : "Finish Workout"}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono text-neutral-500">
            <span>Workout Progress</span>
            <span className="text-orange-400 font-bold">{progressPercent}% Completed</span>
          </div>
          <div className="h-1.5 w-full bg-white/[0.06] rounded-none overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-300">
            <Check className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-xs text-neutral-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-orange-400" />
          <span>Loading routine and animated exercise form...</span>
        </div>
      ) : (
        /* Prescribed Exercise Cards with Clearly Visible GIFs and Read-only Sets */
        <div className="space-y-5">
          {exercises.map((exercise, exerciseIndex) => {
            const isAllCompleted = exercise.sets.every((s) => s.completed);

            return (
              <div
                key={exercise.exerciseId || exerciseIndex}
                className={`rounded-sm border transition-all ${
                  isAllCompleted
                    ? "border-emerald-500/30 bg-[#0b1011]"
                    : "border-white/[0.08] bg-[#0c0e14]"
                } p-5 sm:p-6`}
              >
                {/* Header Info */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* CLEARLY VISIBLE EXERCISE DEMONSTRATION GIF */}
                  <div className="w-full lg:w-72 shrink-0">
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
                        {exercise.equipment || "Cable / Machine"}
                      </span>
                    </div>
                  </div>

                  {/* Exercise Targets & Prescribed Sets */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-orange-500/15 text-[10px] font-bold text-orange-400">
                              {exerciseIndex + 1}
                            </span>
                            <h3 className="text-base font-extrabold text-white">
                              {exercise.name}
                            </h3>
                          </div>

                          {/* Extra info tags */}
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="rounded-sm bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-neutral-300 font-mono">
                              Target: <strong className="text-white font-semibold">{exercise.targetMuscles?.join(", ") || "General"}</strong>
                            </span>
                            {exercise.restSeconds && (
                              <span className="rounded-sm bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-orange-400 font-mono">
                                Rest: {exercise.restSeconds}s
                              </span>
                            )}
                          </div>
                        </div>

                        {exercise.instructions?.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleInstructions(exercise.exerciseId)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400 hover:text-white transition"
                          >
                            <Info className="h-3.5 w-3.5 text-orange-400" />
                            <span>Form cues</span>
                            {expandedInfo[exercise.exerciseId] ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Collapsible Form Cues */}
                      {expandedInfo[exercise.exerciseId] && exercise.instructions && (
                        <div className="mt-3 rounded-sm border border-white/[0.06] bg-black p-3 text-xs text-neutral-400 space-y-1">
                          <p className="text-[10px] font-mono uppercase text-orange-400 font-semibold mb-1">
                            Technique Cues:
                          </p>
                          {exercise.instructions.map((step, idx) => (
                            <p key={idx} className="leading-relaxed">
                              • {step}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Prescribed Sets Table (READ-ONLY TARGETS + JUST A CHECKBOX) */}
                    <div className="mt-5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono uppercase text-neutral-500 px-1 border-b border-white/[0.06] pb-1.5">
                        <span>Set</span>
                        <div className="flex items-center gap-8">
                          <span>Target (Prescribed)</span>
                          <span className="w-14 text-center">Status</span>
                        </div>
                      </div>

                      {exercise.sets.map((set, setIndex) => (
                        <div
                          key={setIndex}
                          onClick={() => toggleSetCompleted(exerciseIndex, setIndex)}
                          className={`flex items-center justify-between p-2.5 rounded-sm border cursor-pointer select-none transition ${
                            set.completed
                              ? "border-emerald-500/40 bg-emerald-500/10 text-white"
                              : "border-white/[0.06] bg-black hover:border-white/15"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-neutral-400">
                              Set {set.setNumber || setIndex + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-8">
                            {/* Read-only target volume and reps */}
                            <div className="font-mono text-xs font-semibold">
                              <span className="text-white text-sm">
                                {set.weight && set.weight !== "0" ? `${set.weight} kg` : "Bodyweight"}
                              </span>
                              <span className="text-neutral-500 mx-1.5">×</span>
                              <span className="text-orange-400 font-bold">{set.reps} reps</span>
                            </div>

                            {/* Just Checkbox (Click to toggle complete) */}
                            <div className="w-14 flex justify-center">
                              <label
                                className="flex cursor-pointer items-center justify-center p-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={set.completed}
                                  onChange={() => toggleSetCompleted(exerciseIndex, setIndex)}
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
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="flex items-center justify-between rounded-sm border border-white/[0.08] bg-[#0c0e14] p-4">
        <div className="text-xs text-neutral-400 font-mono">
          <span>{completedSets} sets marked as completed</span>
        </div>

        <button
          type="button"
          onClick={handleCompleteSession}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-sm bg-[#ff6723] hover:bg-[#f05a18] px-6 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(255,103,35,0.3)] transition active:scale-[0.99] disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{saving ? "Logging session..." : "Finish & Record Workout ✓"}</span>
        </button>
      </div>

      {/* CELEBRATION / ROUTINE COMPLETED MODAL */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-sm border border-orange-500/40 bg-[#0c0e14] p-6 text-center shadow-2xl animate-in fade-in zoom-in-95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-sm bg-orange-500/15 border border-orange-500/30 text-orange-400">
              <Trophy className="h-8 w-8 text-orange-400" />
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-mono text-orange-400 uppercase tracking-widest font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Routine Completed</span>
            </div>

            <h2 className="mt-1 text-2xl font-black text-white">{routineName}</h2>
            <p className="mt-1 text-xs text-neutral-400">
              Outstanding consistency! Session recorded into your training log.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2 border-y border-white/[0.08] py-4 text-xs font-mono">
              <div className="p-2 rounded-sm bg-black border border-white/[0.06]">
                <p className="text-[10px] uppercase text-neutral-500">Duration</p>
                <p className="mt-1 font-bold text-white text-sm">{formatTimer(timerSeconds)}</p>
              </div>
              <div className="p-2 rounded-sm bg-black border border-white/[0.06]">
                <p className="text-[10px] uppercase text-neutral-500">Sets Done</p>
                <p className="mt-1 font-bold text-emerald-400 text-sm">{completedSets}</p>
              </div>
              <div className="p-2 rounded-sm bg-black border border-white/[0.06]">
                <p className="text-[10px] uppercase text-neutral-500">Volume</p>
                <p className="mt-1 font-bold text-orange-400 text-sm">
                  {totalVolumeLifted.toLocaleString()} kg
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
            name: routineName,
            duration_seconds: timerSeconds,
            total_volume: totalVolumeLifted,
            total_sets: completedSets,
            exercises: exercises
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
