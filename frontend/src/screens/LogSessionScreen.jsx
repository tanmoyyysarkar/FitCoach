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
    if (!name.trim()) return setError("Give this session a name");
    if (!exercises.length) return setError("Add at least one exercise");
    if (exercises.some((exercise) => !exercise.sets.length)) return setError("Every exercise needs at least one set");
    if (exercises.some((exercise) => exercise.sets.some((set) => !Number.isInteger(Number(set.reps)) || Number(set.reps) < 1))) {
      return setError("Reps must be positive whole numbers");
    }
    if (exercises.some((exercise) => exercise.sets.some((set) => set.weight !== "" && Number(set.weight) < 0))) {
      return setError("Weight cannot be negative");
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
    <main className="min-h-screen bg-[#070605] px-4 py-6 text-zinc-100 sm:px-8 lg:px-12">
      <form onSubmit={handleSave} className="mx-auto max-w-5xl space-y-6 rounded-[2rem] border border-white/10 bg-[#0c0a09] p-5 shadow-2xl shadow-black/40 sm:p-8">
        <button type="button" onClick={() => navigate("/dashboard")} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-zinc-400 transition hover:bg-white/5 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>
        <div>
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-5 bg-[#f95716]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Session log</p>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Log a <span className="text-[#f95716]">session</span></h1>
          <p className="mt-2 text-sm text-zinc-400">Edit the plan as you train, then check each completed set.</p>
        </div>
        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
        {success && <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"><Check className="h-4 w-4" />{success}</div>}
        {loading ? <p className="text-sm text-zinc-500">Loading workout...</p> : <>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Session name
            <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 block h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-normal normal-case tracking-normal text-white placeholder:text-zinc-600 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20" placeholder="Today's training" />
          </label>
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Find exercises</h2>
              {loadingResults && <Loader2 className="h-4 w-4 animate-spin text-orange-500" />}
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20" placeholder="Search by name" />
            </div>
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
              {!loadingResults && !results.length && <p className="px-2 py-8 text-center text-sm text-zinc-500">No matching exercises.</p>}
              {results.map((exercise) => (
                <button type="button" key={exercise.exercise_id} onClick={() => addExercise(exercise)} className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-white/5 p-3 text-left transition hover:border-orange-500/40 hover:bg-white/[0.08]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-orange-500/15 text-orange-400">
                    {exercise.gif_url ? <img src={exercise.gif_url} alt="" className="h-full w-full object-cover" /> : <Plus className="h-4 w-4" />}
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-100">{formatName(exercise.name)}</span>
                  <Plus className="h-4 w-4 text-orange-500" />
                </button>
              ))}
            </div>
          </section>
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Exercises</h2>
              <span className="text-xs font-medium text-zinc-500">{exercises.length} added</span>
            </div>
            {!exercises.length && <div className="mt-3 rounded-2xl border border-dashed border-white/15 px-4 py-12 text-center text-sm text-zinc-500">Your exercises will appear here.</div>}
            <div className="mt-3 space-y-3">
              {exercises.map((exercise, exerciseIndex) => <article key={exercise.exerciseId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f95716]/15 text-xs font-semibold text-orange-400">{exerciseIndex + 1}</span>
                  <h3 className="min-w-0 flex-1 truncate font-medium text-white">{exercise.name}</h3>
                  <button type="button" onClick={() => setExercises((current) => current.filter((item) => item.exerciseId !== exercise.exerciseId))} aria-label={`Remove ${exercise.name}`} className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-3 space-y-2">
                  {exercise.sets.map((set, setIndex) => <div key={`${exercise.exerciseId}-${setIndex}`} className={`grid grid-cols-[auto_1fr_1fr_auto_auto] items-center gap-2 rounded-xl border p-3 ${set.completed ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}>
                    <span className="text-xs font-semibold text-zinc-500">Set {setIndex + 1}</span>
                    <div className="relative">
                      <input type="number" min="0" step="0.01" value={set.weight} onChange={(event) => updateSet(exercise.exerciseId, setIndex, "weight", event.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 pr-7 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20" placeholder="Weight" />
                      <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 flex-col">
                        <button type="button" onClick={() => nudgeSet(exercise.exerciseId, setIndex, "weight", 2.5)} aria-label="Increase weight" className="text-zinc-500 transition hover:text-orange-400"><ChevronUp className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => nudgeSet(exercise.exerciseId, setIndex, "weight", -2.5)} aria-label="Decrease weight" className="text-zinc-500 transition hover:text-orange-400"><ChevronDown className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    <div className="relative">
                      <input type="number" min="1" step="1" value={set.reps} onChange={(event) => updateSet(exercise.exerciseId, setIndex, "reps", event.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 pr-7 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20" placeholder="Reps" />
                      <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 flex-col">
                        <button type="button" onClick={() => nudgeSet(exercise.exerciseId, setIndex, "reps", 1)} aria-label="Increase reps" className="text-zinc-500 transition hover:text-orange-400"><ChevronUp className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => nudgeSet(exercise.exerciseId, setIndex, "reps", -1)} aria-label="Decrease reps" className="text-zinc-500 transition hover:text-orange-400"><ChevronDown className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
                      <input type="checkbox" checked={set.completed} onChange={(event) => updateSet(exercise.exerciseId, setIndex, "completed", event.target.checked)} className="peer sr-only" />
                      <span className="flex h-5 w-5 items-center justify-center rounded-md border border-white/20 bg-white/5 transition peer-checked:border-[#f95716] peer-checked:bg-[#f95716]">
                        {set.completed && <Check className="h-3.5 w-3.5 text-white" />}
                      </span>
                    </label>
                    <button type="button" onClick={() => removeSet(exercise.exerciseId, setIndex)} aria-label={`Remove set ${setIndex + 1}`} className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                  </div>)}
                </div>
                <button type="button" onClick={() => addSet(exercise.exerciseId)} className="mt-3 inline-flex items-center gap-2 rounded-full border border-dashed border-orange-500/40 px-4 py-2.5 text-sm font-semibold text-orange-400 transition hover:bg-orange-500/10"><Plus className="h-4 w-4" /> Add set</button>
              </article>)}
            </div>
          </section>
          <div className="flex justify-end border-t border-white/10 pt-5">
            <button type="submit" disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#f95716] px-6 text-sm font-semibold text-white shadow-[0_6px_22px_rgba(249,87,22,0.4)] transition hover:bg-[#ea4808] disabled:cursor-not-allowed disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save session"}
            </button>
          </div>
        </>}
      </form>
    </main>
  );
}
