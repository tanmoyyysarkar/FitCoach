import React, { useEffect, useState } from "react";
import {
  Trophy,
  Dumbbell,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Loader2,
  Calendar,
  Plus,
  PlayCircle,
  Share2,
} from "lucide-react";
import api from "../../api/axios";
import WorkoutShareModal from "./WorkoutShareModal";

// Format Title Case
const formatName = (name) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

// Format human friendly relative time (e.g. "Just now", "25m ago", "3h ago", "Yesterday")
const formatRelativeTime = (dateString) => {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Format duration in hours and minutes
const formatDuration = (totalSeconds) => {
  if (!totalSeconds || totalSeconds < 60) return "< 1 min";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }
  return `${minutes} min`;
};

export default function RecentWorkoutCard({ userName = "Athlete", onStartEmpty }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchRecentSession = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/sessions/recent", {
          params: { limit: 1 },
        });
        if (!cancelled) {
          const sessionsList = response.data?.data || [];
          if (sessionsList.length > 0) {
            setSession(sessionsList[0]);
          } else {
            setSession(null);
          }
        }
      } catch (err) {
        console.warn("Could not fetch recent session:", err?.message);
        if (!cancelled) {
          setError("Unable to load recent activity");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRecentSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const exercises = session?.exercises || [];
  const initialExercises = exercises.slice(0, 3);
  const extraExercises = exercises.slice(3);
  const displayedExercises = isExpanded ? exercises : initialExercises;

  const athleteName = session?.user_name || userName;
  const athleteInitials = (athleteName || "AT")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const totalVolume = Number(session?.total_volume) || 0;
  const recordsCount = Number(session?.pr_count) || 0;
  const durationText = formatDuration(session?.duration_seconds);
  const relativeTime = formatRelativeTime(session?.started_at);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
          Recent Activity
        </h2>
        {session && (
          <span className="text-[11px] font-mono text-neutral-500">
            Latest logged session
          </span>
        )}
      </div>

      {loading ? (
        /* Loading skeleton */
        <article className="rounded-sm border border-white/[0.08] bg-[#0c0e14] p-5 flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-orange-400 mr-2" />
          <span className="text-xs text-neutral-400">Loading recent workout data...</span>
        </article>
      ) : !session ? (
        /* Dynamic Empty State when user hasn't logged a session yet */
        <article className="rounded-sm border border-dashed border-white/10 bg-[#0c0e14] p-6 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-sm bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Dumbbell className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-white">No workouts recorded yet</h3>
          <p className="mt-1 text-xs text-neutral-400 max-w-sm mx-auto">
            Once you log a routine or complete an empty session, your workout metrics, volume lifted, and exercise details will appear here dynamically.
          </p>
          {onStartEmpty && (
            <button
              type="button"
              onClick={onStartEmpty}
              className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-[#ff6723] hover:bg-[#f05a18] px-3.5 py-1.5 text-xs font-bold text-white transition shadow-[0_0_12px_rgba(255,103,35,0.25)]"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              <span>Start your first workout</span>
            </button>
          )}
        </article>
      ) : (
        /* Dynamic Active Session Card */
        <article className="rounded-sm border border-white/[0.08] bg-[#0c0e14] p-5 transition hover:border-white/20">
          {/* User Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-neutral-900 border border-white/15 text-xs font-bold text-white">
                {athleteInitials}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{athleteName}</p>
                <p className="text-[11px] text-neutral-500 font-mono">{relativeTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-sm border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-400 hover:bg-orange-500/20 transition shadow-[0_0_10px_rgba(255,103,35,0.15)]"
                title="Generate Strava-style workout share image"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Card</span>
              </button>

              <button
                type="button"
                className="rounded-sm p-1 text-neutral-500 hover:text-white"
                aria-label="Options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Workout Title */}
          <div className="mt-3">
            <h3 className="text-base font-extrabold text-white">
              {session.name || "Workout Session"}
            </h3>
          </div>

          {/* Stats Row: Time | Volume | Records */}
          <div className="mt-2.5 flex items-center gap-6 border-b border-white/[0.08] pb-3 text-xs font-mono">
            <div>
              <span className="block text-[10px] uppercase text-neutral-500">
                Time
              </span>
              <span className="font-bold text-white text-xs sm:text-sm">
                {durationText}
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase text-neutral-500">
                Volume
              </span>
              <span className="font-bold text-white text-xs sm:text-sm">
                {totalVolume.toLocaleString()} kg
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase text-neutral-500">
                Records
              </span>
              <span className="flex items-center gap-1 font-bold text-orange-400 text-xs sm:text-sm">
                <Trophy className="h-3.5 w-3.5 text-orange-400" />
                <span>{recordsCount}</span>
              </span>
            </div>
          </div>

          {/* Dynamic Exercises Preview */}
          {displayedExercises.length > 0 ? (
            <div className="mt-3 space-y-2.5">
              {displayedExercises.map((exercise, index) => (
                <div key={exercise.exercise_id || index} className="flex items-center gap-3 py-1">
                  {/* Thumbnail / Icon */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-white/[0.04] overflow-hidden text-neutral-300">
                    {exercise.gif_url ? (
                      <img
                        src={exercise.gif_url}
                        alt={exercise.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Dumbbell className="h-3.5 w-3.5 text-orange-400/80" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-white">
                      <span className="text-neutral-400 font-mono mr-1.5">
                        {exercise.sets_count || 1} {exercise.sets_count === 1 ? "set" : "sets"}
                      </span>
                      {formatName(exercise.name)}
                    </p>
                    {exercise.details && (
                      <p className="truncate text-[10px] text-neutral-500 font-mono">
                        {exercise.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 py-2 text-xs text-neutral-500 italic">
              Session completed with {session.total_sets || 0} recorded sets.
            </div>
          )}

          {/* See more exercises toggle */}
          {extraExercises.length > 0 && (
            <div className="mt-3 text-center border-t border-white/[0.06] pt-2">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-white transition"
              >
                <span>
                  {isExpanded
                    ? "Hide exercises"
                    : `See ${extraExercises.length} more ${
                        extraExercises.length === 1 ? "exercise" : "exercises"
                      }`}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )}
        </article>
      )}

      {/* Strava-Style Workout Share Card Modal */}
      {session && (
        <WorkoutShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          session={session}
          userName={athleteName}
        />
      )}
    </section>
  );
}
