import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Loader2, Plus, Search, Trash2 } from "lucide-react";
import api from "../api/axios";

const emptySet = () => ({ weight: "", reps: "", completed: false });

const formatName = (name) => (name || "")
  .split(" ")
  .filter(Boolean)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

const mapWorkoutExercise = (exercise) => ({
  exerciseId: exercise.exercise_id,
  name: formatName(exercise.name),
  sets: (exercise.sets || []).map((set) => ({
    weight: set.weight == null ? "" : String(set.weight),
    reps: set.reps == null ? "" : String(set.reps),
    completed: false,
  })),
});

export default function LogSessionScreen() {
  const navigate = useNavigate();
  const { workoutId } = useParams();
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState([]);
  const [originalExerciseIds, setOriginalExerciseIds] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(Boolean(workoutId));
  const [loadingResults, setLoadingResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!workoutId) return undefined;
    let cancelled = false;
    const loadWorkout = async () => {
      try {
        const response = await api.get(`/workouts/${workoutId}`);
        if (!cancelled) {
          const workout = response.data?.data;
          setName(workout?.name || "");
          const loadedExercises = (workout?.exercises || []).map(mapWorkoutExercise);
          setExercises(loadedExercises);
          setOriginalExerciseIds(loadedExercises.map((exercise) => exercise.exerciseId));
        }
      } catch (requestError) {
        if (!cancelled) setError(requestError.response?.data?.message || "Could not load workout");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadWorkout();
    return () => { cancelled = true; };
  }, [workoutId]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoadingResults(true);
      try {
        const response = await api.get("/exercises", { params: { q: search.trim(), limit: 8 } });
        if (!cancelled) setResults(response.data?.data || []);
      } catch (requestError) {
        if (!cancelled) setError(requestError.response?.data?.message || "Could not load exercises");
      } finally {
        if (!cancelled) setLoadingResults(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search]);

  const updateSet = (exerciseId, setIndex, field, value) => {
    setExercises((current) => current.map((exercise) => (
      exercise.exerciseId !== exerciseId
        ? exercise
        : { ...exercise, sets: exercise.sets.map((set, index) => index === setIndex ? { ...set, [field]: value } : set) }
    )));
  };

  const addExercise = (exercise) => {
    if (exercises.some((item) => item.exerciseId === exercise.exercise_id)) return;
    setExercises((current) => [...current, {
      exerciseId: exercise.exercise_id,
      name: formatName(exercise.name),
      sets: [emptySet()],
    }]);
  };

  const addSet = (exerciseId) => {
    setExercises((current) => current.map((exercise) => (
      exercise.exerciseId === exerciseId ? { ...exercise, sets: [...exercise.sets, emptySet()] } : exercise
    )));
  };

  const removeSet = (exerciseId, setIndex) => {
    setExercises((current) => current.map((exercise) => (
      exercise.exerciseId === exerciseId
        ? { ...exercise, sets: exercise.sets.filter((_, index) => index !== setIndex) }
        : exercise
    )));
  };

  const nudgeSet = (exerciseId, setIndex, field, delta) => {
    setExercises((current) => current.map((exercise) => (
      exercise.exerciseId === exerciseId
        ? {
            ...exercise,
            sets: exercise.sets.map((set, index) => {
              if (index !== setIndex) return set;
              const base = set[field] === "" ? 0 : Number(set[field]);
              const min = field === "reps" ? 1 : 0;
              const next = Math.max(min, Math.round((base + delta) * 100) / 100);
              return { ...set, [field]: String(next) };
            }),
          }
        : exercise
    )));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!name.trim()) return setError("Session name is required");
    if (!exercises.length) return setError("Add at least one exercise");
    for (const [exerciseIndex, exercise] of exercises.entries()) {
      for (const [setIndex, set] of exercise.sets.entries()) {
        const reps = Number(set.reps);
        const weight = set.weight === "" ? null : Number(set.weight);
        if (set.completed && (!Number.isInteger(reps) || reps < 1)) {
          return setError(`Exercise ${exerciseIndex + 1}, set ${setIndex + 1}: reps must be at least 1`);
        }
        if (set.completed && weight !== null && (!Number.isFinite(weight) || weight < 0)) {
          return setError(`Exercise ${exerciseIndex + 1}, set ${setIndex + 1}: weight cannot be negative`);
        }
      }
    }
    if (!exercises.some((exercise) => exercise.sets.some((set) => set.completed))) {
      return setError("Complete at least one set before saving");
    }

    setSaving(true);
    try {
      let sessionWorkoutId = workoutId || null;
      let routineCreated = false;
      if (!workoutId && window.confirm("Save this session as a workout routine too?")) {
        const workoutResponse = await api.post("/workouts", {
          name: name.trim(),
          exercises: exercises.map((exercise) => ({
            exerciseId: exercise.exerciseId,
            sets: exercise.sets.map((set) => ({
              reps: Number(set.reps),
              weight: set.weight === "" ? null : Number(set.weight),
            })),
          })),
        });
        sessionWorkoutId = workoutResponse.data?.data?.workout_id;
        routineCreated = Boolean(sessionWorkoutId);
        if (!sessionWorkoutId) throw new Error("Could not identify the new workout routine");
      }

      await api.post("/sessions", {
        name: name.trim(),
        workoutId: sessionWorkoutId,
        exercises: exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          sets: exercise.sets.map((set) => ({
            reps: Number(set.reps),
            weight: set.weight === "" ? null : Number(set.weight),
            completed: set.completed,
          })),
        })),
      });
      const currentExerciseIds = exercises.map((exercise) => exercise.exerciseId);
      const routineChanged = workoutId && (
        currentExerciseIds.length !== originalExerciseIds.length
        || currentExerciseIds.some((id, index) => id !== originalExerciseIds[index])
      );
      let routineUpdateFailed = false;
      if (routineChanged && window.confirm("The exercise list changed. Update the original workout routine too?")) {
        try {
          await api.put(`/workouts/${workoutId}`, {
            name: name.trim(),
            exercises: exercises.map((exercise) => ({
              exerciseId: exercise.exerciseId,
              sets: exercise.sets.map((set) => ({ reps: Number(set.reps), weight: set.weight === "" ? null : Number(set.weight) })),
            })),
          });
        } catch {
          routineUpdateFailed = true;
        }
      }
      setSuccess(
        routineUpdateFailed
          ? "Session saved, but the workout routine was not updated"
          : routineCreated
            ? "Session saved and workout routine created"
            : "Session saved",
      );
      window.setTimeout(() => navigate("/dashboard"), 500);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save session");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-neutral-100 sm:px-8 selection:bg-orange-500/30 selection:text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 rounded-sm border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Clean, Non-boxy Form Container */}
        <form onSubmit={handleSave} className="rounded-sm border border-white/[0.08] bg-[#0c0e14] p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="border-b border-white/[0.08] pb-5">
            <div className="flex items-center gap-2">
              <span className="h-[2px] w-4 bg-[#ff6723]" />
              <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-orange-400">
                Session Log
              </p>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Log a training session
            </h1>
            <p className="mt-1 text-xs text-neutral-400">
              Edit sets and weight in real time, then check each completed set.
            </p>
          </div>

          {error && (
            <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-300">
              <Check className="h-4 w-4" />
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 text-xs text-neutral-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-orange-400" />
              <span>Loading workout details...</span>
            </div>
          ) : (
            <>
              {/* Session Name */}
              <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Session Title
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1.5 block h-10 w-full rounded-sm border border-white/10 bg-black px-3.5 text-xs font-normal normal-case text-white placeholder:text-neutral-600 outline-none transition focus:border-orange-500/60"
                  placeholder="e.g. Pull Power & High Volume Rows"
                />
              </label>

              {/* Find Exercises */}
              <section className="rounded-sm border border-white/[0.08] bg-black p-4">
                <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-2.5">
                  <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
                    Add Exercises
                  </h2>
                  {loadingResults && <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-400" />}
                </div>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-9 w-full rounded-sm border border-white/10 bg-[#0c0e14] pl-8 pr-3 text-xs text-white placeholder:text-neutral-600 outline-none transition focus:border-orange-500/60"
                    placeholder="Search by exercise name..."
                  />
                </div>
                <div className="mt-3 max-h-60 space-y-1.5 overflow-y-auto pr-1">
                  {!loadingResults && !results.length && (
                    <p className="py-6 text-center text-xs text-neutral-500">
                      No matching exercises found.
                    </p>
                  )}
                  {results.map((exercise) => (
                    <button
                      type="button"
                      key={exercise.exercise_id}
                      onClick={() => addExercise(exercise)}
                      className="flex w-full items-center gap-3 rounded-sm border border-white/[0.04] bg-white/[0.02] p-2 text-left transition hover:border-orange-500/40 hover:bg-white/[0.04]"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-neutral-900 border border-white/10 text-neutral-400">
                        {exercise.gif_url ? (
                          <img src={exercise.gif_url} alt="" className="h-full w-full object-cover rounded-sm" />
                        ) : (
                          <Plus className="h-3.5 w-3.5 text-orange-400" />
                        )}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-white">
                        {formatName(exercise.name)}
                      </span>
                      <Plus className="h-3.5 w-3.5 text-orange-400" />
                    </button>
                  ))}
                </div>
              </section>

              {/* Exercises List */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
                    Logged Exercises
                  </h2>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {exercises.length} added
                  </span>
                </div>

                {!exercises.length && (
                  <div className="rounded-sm border border-dashed border-white/10 px-4 py-12 text-center text-xs text-neutral-500">
                    Search and select exercises above to log your session.
                  </div>
                )}

                <div className="space-y-3">
                  {exercises.map((exercise, exerciseIndex) => (
                    <article
                      key={exercise.exerciseId}
                      className="rounded-sm border border-white/[0.08] bg-black p-4"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-orange-500/15 text-[10px] font-bold text-orange-400">
                            {exerciseIndex + 1}
                          </span>
                          <h3 className="font-semibold text-xs text-white">
                            {exercise.name}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExercises((current) =>
                              current.filter((item) => item.exerciseId !== exercise.exerciseId)
                            )
                          }
                          aria-label={`Remove ${exercise.name}`}
                          className="p-1 text-neutral-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Sets Table */}
                      <div className="mt-3 space-y-2">
                        {exercise.sets.map((set, setIndex) => (
                          <div
                            key={`${exercise.exerciseId}-${setIndex}`}
                            className={`grid grid-cols-[auto_1fr_1fr_auto_auto] items-center gap-2 rounded-sm border p-2 text-xs transition ${
                              set.completed
                                ? "border-emerald-500/40 bg-emerald-500/[0.06]"
                                : "border-white/[0.06] bg-[#0c0e14]"
                            }`}
                          >
                            <span className="font-mono text-neutral-500 font-semibold px-1">
                              Set {setIndex + 1}
                            </span>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={set.weight}
                                onChange={(event) =>
                                  updateSet(exercise.exerciseId, setIndex, "weight", event.target.value)
                                }
                                className="h-8 w-full rounded-sm border border-white/10 bg-black px-2.5 pr-6 text-xs text-white placeholder:text-neutral-600 outline-none focus:border-orange-500/60"
                                placeholder="Weight (kg)"
                              />
                              <div className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col">
                                <button
                                  type="button"
                                  onClick={() => nudgeSet(exercise.exerciseId, setIndex, "weight", 2.5)}
                                  className="text-neutral-500 hover:text-orange-400"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => nudgeSet(exercise.exerciseId, setIndex, "weight", -2.5)}
                                  className="text-neutral-500 hover:text-orange-400"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={set.reps}
                                onChange={(event) =>
                                  updateSet(exercise.exerciseId, setIndex, "reps", event.target.value)
                                }
                                className="h-8 w-full rounded-sm border border-white/10 bg-black px-2.5 pr-6 text-xs text-white placeholder:text-neutral-600 outline-none focus:border-orange-500/60"
                                placeholder="Reps"
                              />
                              <div className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col">
                                <button
                                  type="button"
                                  onClick={() => nudgeSet(exercise.exerciseId, setIndex, "reps", 1)}
                                  className="text-neutral-500 hover:text-orange-400"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => nudgeSet(exercise.exerciseId, setIndex, "reps", -1)}
                                  className="text-neutral-500 hover:text-orange-400"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            {/* Completed Checkbox */}
                            <label className="flex cursor-pointer items-center gap-1.5 px-1 text-xs text-neutral-400">
                              <input
                                type="checkbox"
                                checked={set.completed}
                                onChange={(event) =>
                                  updateSet(exercise.exerciseId, setIndex, "completed", event.target.checked)
                                }
                                className="peer sr-only"
                              />
                              <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-white/20 bg-white/[0.04] transition peer-checked:border-[#ff6723] peer-checked:bg-[#ff6723]">
                                {set.completed && <Check className="h-3.5 w-3.5 text-white" />}
                              </span>
                              <span className="text-[10px] hidden sm:inline">
                                {set.completed ? "Done" : "Complete"}
                              </span>
                            </label>

                            <button
                              type="button"
                              onClick={() => removeSet(exercise.exerciseId, setIndex)}
                              className="p-1 text-neutral-500 hover:text-red-400 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addSet(exercise.exerciseId)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-sm border border-dashed border-orange-500/30 px-3 py-1.5 text-xs font-semibold text-orange-400 transition hover:bg-orange-500/10"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add set</span>
                      </button>
                    </article>
                  ))}
                </div>
              </section>

              {/* Submit Action */}
              <div className="flex justify-end border-t border-white/[0.08] pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-[#ff6723] hover:bg-[#f05a18] px-6 text-xs font-bold text-white shadow-[0_0_15px_rgba(255,103,35,0.25)] transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{saving ? "Saving session..." : "Save Session"}</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </main>
  );
}
