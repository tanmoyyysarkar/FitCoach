import { useEffect, useState } from "react"
import { Check, ChevronDown, ChevronUp, Loader2, Plus, Search, Trash2, X } from "lucide-react"
import api from "@/api/axios"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const emptySet = () => ({ weight: "", reps: "" })

export default function WorkoutBuilder({ user, onCancel, onSaved }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [search, setSearch] = useState("")
  const [exercises, setExercises] = useState([])
  const [selectedExercises, setSelectedExercises] = useState([])
  const [activeExercise, setActiveExercise] = useState(null)
  const [draftSets, setDraftSets] = useState([])
  const [loadingExercises, setLoadingExercises] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(async () => {
      setLoadingExercises(true)
      setError("")
      try {
        const response = await api.get("/exercises", {
          params: { q: search.trim(), limit: 30 },
        })
        if (!cancelled) setExercises(response.data?.data || [])
      } catch (requestError) {
        if (!cancelled) setError(requestError.response?.data?.message || "Could not load exercises")
      } finally {
        if (!cancelled) setLoadingExercises(false)
      }
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [search])

  const openExercise = (exercise) => {
    const selected = selectedExercises.find((item) => item.exercise_id === exercise.exercise_id)
    setActiveExercise(exercise)
    setDraftSets(selected?.sets || [emptySet()])
    setError("")
  }

  const closeExercise = () => {
    setActiveExercise(null)
    setDraftSets([])
  }

  const addSet = () => setDraftSets((current) => [...current, emptySet()])

  const updateSet = (setIndex, field, value) => {
    setDraftSets((current) => current.map((set, index) => (
      index === setIndex ? { ...set, [field]: value } : set
    )))
  }

  const removeSet = (setIndex) => {
    setDraftSets((current) => current.filter((_, index) => index !== setIndex))
  }

  const nudgeDraftSet = (setIndex, field, delta) => {
    setDraftSets((current) => current.map((set, index) => {
      if (index !== setIndex) return set
      const base = set[field] === "" ? 0 : Number(set[field])
      const min = field === "reps" ? 1 : 0
      const next = Math.max(min, Math.round((base + delta) * 100) / 100)
      return { ...set, [field]: String(next) }
    }))
  }

  const saveExercise = () => {
    if (!draftSets.length) {
      setError("Add at least one set")
      return
    }
    if (draftSets.some((set) => !Number.isInteger(Number(set.reps)) || Number(set.reps) < 1)) {
      setError("Reps must be a positive whole number")
      return
    }
    if (draftSets.some((set) => set.weight !== "" && Number(set.weight) < 0)) {
      setError("Weight cannot be negative")
      return
    }

    setSelectedExercises((current) => {
      const withoutExercise = current.filter((item) => item.exercise_id !== activeExercise.exercise_id)
      return [...withoutExercise, { ...activeExercise, sets: draftSets }]
    })
    closeExercise()
  }

  const removeExercise = (exerciseId) => {
    setSelectedExercises((current) => current.filter((item) => item.exercise_id !== exerciseId))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    if (!name.trim()) {
      setError("Give your workout a name")
      return
    }
    if (!selectedExercises.length) {
      setError("Add at least one exercise")
      return
    }
    if (selectedExercises.some((exercise) => !exercise.sets?.length)) {
      setError("Add at least one set to every exercise")
      return
    }

    setSaving(true)
    try {
      await api.post("/workouts", {
        name: name.trim(),
        description: description.trim() || null,
        clientId: user.user_id,
        exercises: selectedExercises.map((exercise) => ({
          exerciseId: exercise.exercise_id,
          sets: exercise.sets.map((set) => ({
            reps: Number(set.reps),
            weight: set.weight === "" ? null : Number(set.weight),
          })),
        })),
      })
      setSuccess("Workout saved successfully")
      window.setTimeout(onSaved, 500)
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save workout")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-neutral-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-[2px] w-4 bg-[#ff6723]" />
            <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-orange-400">
              Workout Builder
            </p>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Build your next routine
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            Define target exercises, sets, reps, and baseline weight.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="rounded-sm border border-white/10 p-2 text-neutral-400 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-300">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Routine Metadata */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 sm:col-span-2">
          Routine Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Push Hypertrophy, Upper Body Power"
            className="mt-1.5 h-10 w-full rounded-sm border border-white/10 bg-[#0c0e14] px-3.5 text-xs normal-case text-white placeholder:text-neutral-600 outline-none transition focus:border-orange-500/60"
          />
        </label>
        <label className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 sm:col-span-2">
          Description <span className="font-normal text-neutral-500">(optional)</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Focus on chest, lateral delts, and triceps..."
            rows="2"
            className="mt-1.5 w-full resize-none rounded-sm border border-white/10 bg-[#0c0e14] px-3.5 py-2.5 text-xs normal-case text-white placeholder:text-neutral-600 outline-none transition focus:border-orange-500/60"
          />
        </label>
      </div>

      {/* Two Column Grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left: Find Exercises */}
        <section className="rounded-sm border border-white/[0.08] bg-[#0c0e14] p-4">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
              Exercise Library
            </h3>
            {loadingExercises && <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-400" />}
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search exercise by name or muscle..."
              className="h-9 w-full rounded-sm border border-white/10 bg-black pl-8 pr-3 text-xs text-white placeholder:text-neutral-600 outline-none transition focus:border-orange-500/60"
            />
          </div>
          <div className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {!loadingExercises && !exercises.length && (
              <p className="py-8 text-center text-xs text-neutral-500">
                No matching exercises found.
              </p>
            )}
            {exercises.map((exercise) => {
              const selected = selectedExercises.find(
                (item) => item.exercise_id === exercise.exercise_id
              )
              return (
                <button
                  type="button"
                  key={exercise.exercise_id}
                  onClick={() => openExercise(exercise)}
                  className="flex w-full items-center gap-3 rounded-sm border border-white/[0.04] bg-white/[0.02] p-2.5 text-left transition hover:border-orange-500/40 hover:bg-white/[0.04]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-neutral-900 border border-white/10 text-neutral-400">
                    {exercise.gif_url ? (
                      <img src={exercise.gif_url} alt="" className="h-full w-full object-cover rounded-sm" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 text-orange-400" />
                    )}
                  </div>
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-white">
                    {exercise.name}
                  </span>
                  {selected ? (
                    <span className="text-[11px] font-semibold text-orange-400">
                      {selected.sets.length} sets added
                    </span>
                  ) : (
                    <Plus className="h-3.5 w-3.5 text-neutral-500" />
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* Right: Selected Exercises */}
        <section className="rounded-sm border border-white/[0.08] bg-[#0c0e14] p-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
              Selected Exercises
            </h3>
            <span className="text-[11px] text-neutral-500 font-mono">
              {selectedExercises.length} added
            </span>
          </div>

          <div className="mt-3 max-h-72 space-y-2.5 overflow-y-auto pr-1">
            {!selectedExercises.length && (
              <div className="rounded-sm border border-dashed border-white/10 px-4 py-12 text-center text-xs text-neutral-500">
                Click any exercise on the left to add sets and configure.
              </div>
            )}
            {selectedExercises.map((exercise, index) => (
              <div
                key={exercise.exercise_id}
                className="rounded-sm border border-white/[0.06] bg-black p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-orange-500/15 text-[10px] font-bold text-orange-400">
                      {index + 1}
                    </span>
                    <div>
                      <button
                        type="button"
                        onClick={() => openExercise(exercise)}
                        className="text-left font-semibold text-xs text-white hover:text-orange-400 transition"
                      >
                        {exercise.name}
                      </button>
                      <p className="text-[10px] text-neutral-500">
                        {exercise.sets.length} {exercise.sets.length === 1 ? "set" : "sets"} · {exercise.target_muscles?.join(", ") || "General"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeExercise(exercise.exercise_id)}
                    className="p-1 text-neutral-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {exercise.sets.map((set, setIndex) => (
                    <span
                      key={`${exercise.exercise_id}-${setIndex}`}
                      className="rounded-sm bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 text-[10px] font-mono text-neutral-300"
                    >
                      S{setIndex + 1}: {set.weight ? `${set.weight}kg` : "BW"} × {set.reps}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-white/[0.08] pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-sm border border-white/10 px-4 py-2 text-xs font-semibold text-neutral-400 transition hover:bg-white/[0.05] hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#ff6723] hover:bg-[#f05a18] px-5 py-2 text-xs font-bold text-white transition disabled:opacity-60 shadow-[0_0_15px_rgba(255,103,35,0.25)]"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          <span>Save Routine</span>
        </button>
      </div>

      {/* Exercise Sets Config Dialog */}
      <Dialog open={Boolean(activeExercise)} onOpenChange={(open) => !open && closeExercise()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-sm border border-white/10 bg-[#0d0f17] text-white ring-0 sm:max-w-xl">
          {activeExercise && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-white">
                  {activeExercise.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-400">
                  {activeExercise.target_muscles?.join(", ") || "Target: General"}
                </DialogDescription>
              </DialogHeader>

              {activeExercise.gif_url && (
                <div className="overflow-hidden rounded-sm border border-white/10 bg-black">
                  <img
                    src={activeExercise.gif_url}
                    alt={activeExercise.name}
                    className="mx-auto aspect-video max-h-56 w-full object-contain"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-xs font-mono font-semibold uppercase text-neutral-300">
                    Sets Configuration
                  </span>
                  <button
                    type="button"
                    onClick={addSet}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Set</span>
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {draftSets.map((set, index) => (
                    <div
                      key={`draft-set-${index}`}
                      className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 rounded-sm border border-white/[0.08] bg-black p-2.5 text-xs"
                    >
                      <span className="font-mono text-neutral-500 font-semibold px-1">
                        #{index + 1}
                      </span>
                      <div>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={set.weight}
                          onChange={(e) => updateSet(index, "weight", e.target.value)}
                          placeholder="Weight (kg)"
                          className="h-8 w-full rounded-sm border border-white/10 bg-[#0c0e14] px-2.5 text-xs text-white placeholder:text-neutral-600 outline-none focus:border-orange-500/60"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={set.reps}
                          onChange={(e) => updateSet(index, "reps", e.target.value)}
                          placeholder="Target reps"
                          className="h-8 w-full rounded-sm border border-white/10 bg-[#0c0e14] px-2.5 text-xs text-white placeholder:text-neutral-600 outline-none focus:border-orange-500/60"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSet(index)}
                        className="p-1.5 text-neutral-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-white/[0.08] pt-3">
                <button
                  type="button"
                  onClick={closeExercise}
                  className="rounded-sm border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveExercise}
                  className="rounded-sm bg-[#ff6723] hover:bg-[#f05a18] px-4 py-1.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(255,103,35,0.25)]"
                >
                  Confirm Sets
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </form>
  )
}
