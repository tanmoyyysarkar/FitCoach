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
    setDraftSets(selected?.sets || [])
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
      setSuccess("Workout saved")
      window.setTimeout(onSaved, 500)
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save workout")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-zinc-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-[2px] w-5 bg-[#f95716]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400">Workout builder</p>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Build your next <span className="text-[#f95716]">session</span></h2>
          <p className="mt-2 text-sm text-zinc-400">Choose exercises, then set your target volume.</p>
        </div>
        <button type="button" onClick={onCancel} aria-label="Close workout builder" className="rounded-full border border-white/10 p-2 text-zinc-400 transition hover:border-white/20 hover:bg-white/5 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
      {success && <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"><Check className="h-4 w-4" />{success}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:col-span-2">
          Workout name
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Upper body strength" className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm normal-case tracking-normal text-white placeholder:text-zinc-600 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20" />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:col-span-2">
          Description <span className="font-normal normal-case tracking-normal text-zinc-600">(optional)</span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A focused session for today" rows="3" className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm normal-case tracking-normal text-white placeholder:text-zinc-600 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20" />
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Find exercises</h3>
            {loadingExercises && <Loader2 className="h-4 w-4 animate-spin text-orange-500" />}
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or muscle" className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20" />
          </div>
          <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
            {!loadingExercises && !exercises.length && <p className="px-2 py-8 text-center text-sm text-zinc-500">No matching exercises.</p>}
            {exercises.map((exercise) => {
              const selected = selectedExercises.find((item) => item.exercise_id === exercise.exercise_id)
              return (
                <button type="button" key={exercise.exercise_id} onClick={() => openExercise(exercise)} className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-white/5 p-3 text-left transition hover:border-orange-500/40 hover:bg-white/[0.08]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-orange-500/15 text-orange-400">
                    {exercise.gif_url ? <img src={exercise.gif_url} alt="" className="h-full w-full object-cover" /> : <Plus className="h-4 w-4" />}
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-100">{exercise.name}</span>
                  {selected ? <span className="text-xs font-medium text-emerald-400">{selected.sets.length} sets</span> : <Plus className="h-4 w-4 text-orange-500" />}
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Selected exercises</h3>
            <span className="text-xs font-medium text-zinc-500">{selectedExercises.length} added</span>
          </div>
          <div className="mt-3 space-y-3">
            {!selectedExercises.length && <div className="rounded-2xl border border-dashed border-white/15 px-4 py-12 text-center text-sm text-zinc-500">Your exercises will appear here.</div>}
            {selectedExercises.map((exercise, index) => (
              <div key={exercise.exercise_id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f95716]/15 text-xs font-semibold text-orange-400">{index + 1}</span>
                  <button type="button" onClick={() => openExercise(exercise)} className="min-w-0 flex-1 text-left">
                    <p className="truncate font-medium text-white">{exercise.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{exercise.sets.length} {exercise.sets.length === 1 ? "set" : "sets"} · {exercise.target_muscles?.join(", ") || "Full body"}</p>
                  </button>
                  <button type="button" onClick={() => removeExercise(exercise.exercise_id)} aria-label={`Remove ${exercise.name}`} className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {exercise.sets.map((set, setIndex) => <span key={`${exercise.exercise_id}-${setIndex}`} className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-medium text-zinc-300">Set {setIndex + 1}: {set.weight || "No weight"} · {set.reps} reps</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="h-11 rounded-full border border-white/10 px-6 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white">Cancel</button>
        <button type="submit" disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#f95716] px-6 text-sm font-semibold text-white shadow-[0_6px_22px_rgba(249,87,22,0.4)] transition hover:bg-[#ea4808] disabled:cursor-not-allowed disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save workout
        </button>
      </div>

      <Dialog open={Boolean(activeExercise)} onOpenChange={(open) => !open && closeExercise()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-[#0c0a09] text-zinc-100 ring-white/10 sm:max-w-2xl">
          {activeExercise && <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-white">{activeExercise.name}</DialogTitle>
              <DialogDescription className="text-zinc-400">{activeExercise.target_muscles?.join(", ") || "Full body"}</DialogDescription>
            </DialogHeader>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {activeExercise.gif_url ? <img src={activeExercise.gif_url} alt={`${activeExercise.name} demonstration`} className="mx-auto aspect-video max-h-80 w-full object-contain" /> : <div className="flex aspect-video items-center justify-center text-sm text-zinc-500">No demonstration available</div>}
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">How to do it</h3>
              {activeExercise.instructions?.length ? <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-zinc-400">{activeExercise.instructions.map((instruction, index) => <li key={`${activeExercise.exercise_id}-instruction-${index}`}>{instruction}</li>)}</ol> : <p className="mt-2 text-sm text-zinc-500">Follow the demonstration with controlled movement.</p>}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Sets</h3>
                <span className="text-xs text-zinc-500">Weight is optional</span>
              </div>
              <div className="mt-3 space-y-2">
                {draftSets.map((set, index) => <div key={`draft-set-${index}`} className="grid grid-cols-[auto_1fr_1fr_auto] items-end gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="pb-2 text-xs font-semibold text-zinc-500">{index + 1}</span>
                  <label className="text-xs font-medium text-zinc-500">Weight
                    <div className="relative mt-1">
                      <input type="number" min="0" step="0.01" value={set.weight} onChange={(event) => updateSet(index, "weight", event.target.value)} placeholder="kg" className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 pr-7 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20" />
                      <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 flex-col">
                        <button type="button" onClick={() => nudgeDraftSet(index, "weight", 2.5)} aria-label="Increase weight" className="text-zinc-500 transition hover:text-orange-400"><ChevronUp className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => nudgeDraftSet(index, "weight", -2.5)} aria-label="Decrease weight" className="text-zinc-500 transition hover:text-orange-400"><ChevronDown className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </label>
                  <label className="text-xs font-medium text-zinc-500">Reps
                    <div className="relative mt-1">
                      <input type="number" min="1" step="1" value={set.reps} onChange={(event) => updateSet(index, "reps", event.target.value)} placeholder="reps" className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 pr-7 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20" />
                      <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 flex-col">
                        <button type="button" onClick={() => nudgeDraftSet(index, "reps", 1)} aria-label="Increase reps" className="text-zinc-500 transition hover:text-orange-400"><ChevronUp className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => nudgeDraftSet(index, "reps", -1)} aria-label="Decrease reps" className="text-zinc-500 transition hover:text-orange-400"><ChevronDown className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </label>
                  <button type="button" onClick={() => removeSet(index)} aria-label={`Remove set ${index + 1}`} className="mb-1 rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                </div>)}
              </div>
              <button type="button" onClick={addSet} className="mt-3 inline-flex items-center gap-2 rounded-full border border-dashed border-orange-500/40 px-4 py-2.5 text-sm font-semibold text-orange-400 transition hover:bg-orange-500/10"><Plus className="h-4 w-4" /> Add set</button>
            </div>
            <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
              <button type="button" onClick={closeExercise} className="rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-400 transition hover:bg-white/5 hover:text-white">Cancel</button>
              <button type="button" onClick={saveExercise} className="rounded-full bg-[#f95716] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ea4808]">{selectedExercises.some((item) => item.exercise_id === activeExercise.exercise_id) ? "Update exercise" : "Add exercise"}</button>
            </div>
          </>}
        </DialogContent>
      </Dialog>
    </form>
  )
}
