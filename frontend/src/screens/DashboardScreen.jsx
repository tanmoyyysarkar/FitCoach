import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Home, Loader2, LogOut, Plus, Sparkles } from "lucide-react";
import api from "../api/axios";

export default function DashboardScreen({ user, onLogout }) {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [workoutError, setWorkoutError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadWorkouts = async () => {
      setLoadingWorkouts(true);
      setWorkoutError("");
      try {
        const response = await api.get("/workouts");
        if (!cancelled) setWorkouts(response.data?.data || []);
      } catch (requestError) {
        if (!cancelled)
          setWorkoutError(
            requestError.response?.data?.message || "Could not load workouts",
          );
      } finally {
        if (!cancelled) setLoadingWorkouts(false);
      }
    };

    loadWorkouts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#070605] text-zinc-100">
      <header className="border-b border-white/10 bg-[#070605]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-500">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-tight text-white">
                FitCoach
              </p>
              <p className="text-xs text-zinc-500">Your training space</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <Home className="h-4 w-4" />{" "}
              <span className="hidden sm:inline">Home</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" />{" "}
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c0a09] px-6 py-10 text-white sm:px-10 lg:px-14">
          <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-orange-500/15 blur-3xl" />
          <div className="absolute inset-0 noise-texture opacity-20 pointer-events-none" />
          <div className="relative max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
              <Sparkles className="h-4 w-4" /> Client dashboard
            </p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Welcome back,{" "}
              <span className="text-[#f95716]">{user.name || "athlete"}</span>.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-zinc-400 sm:text-base">
              Keep your next session intentional. Build a workout around the way
              you want to train today.
            </p>
            <button
              type="button"
              onClick={() => navigate("/create-workout")}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#f95716] px-6 py-3 text-sm font-semibold text-white shadow-[0_6px_22px_rgba(249,87,22,0.4)] transition hover:bg-[#ea4808]"
            >
              <Plus className="h-4 w-4" /> Create a workout
            </button>
            <button
              type="button"
              onClick={() => navigate("/log-session")}
              className="ml-3 mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              <Dumbbell className="h-4 w-4" /> Start empty session
            </button>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/3 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Your library
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
                Workouts
              </h2>
            </div>
          </div>
          {workoutError && (
            <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {workoutError}
            </p>
          )}
          {loadingWorkouts && (
            <div className="mt-8 flex items-center justify-center py-12 text-sm text-zinc-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-orange-500" />
              Loading workouts
            </div>
          )}
          {!loadingWorkouts && !workoutError && !workouts.length && (
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
                <Dumbbell className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-white">
                Your workout library is ready
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                Create your first workout and choose the exercises that belong
                in your next session.
              </p>
              <button
                type="button"
                onClick={() => navigate("/create-workout")}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300"
              >
                <Plus className="h-4 w-4" /> Add your first workout
              </button>
            </div>
          )}
          {!loadingWorkouts && workouts.length > 0 && (
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {workouts.map((workout) => (
                <article
                  key={workout.workout_id}
                  className="rounded-2xl border border-white/10 bg-white/3 p-5 transition hover:border-orange-500/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white">
                        {workout.name}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        {new Date(workout.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Dumbbell className="h-4 w-4 shrink-0 text-orange-500" />
                  </div>
                  {workout.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-5 text-zinc-400">
                      {workout.description}
                    </p>
                  )}
                  <p className="mt-4 text-xs font-medium text-zinc-500">
                    {workout.exercise_count} exercises · {workout.total_sets}{" "}
                    sets
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/log-session/${workout.workout_id}`)}
                    className="mt-4 text-sm font-semibold text-orange-400 hover:text-orange-300"
                  >
                    Start workout
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
