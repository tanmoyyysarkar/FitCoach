import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import {
  DashboardSidebar,
  DashboardHeader,
  MonthlyReportCard,
  RoutineList,
  RecentWorkoutCard,
  MonthlyReportModal,
  RoutineLogSessionView,
  LogSessionView,
  EmptyWorkoutView,
} from "../components/dashboard";
import WorkoutBuilder from "../components/custom/WorkoutBuilder";
import { Sparkles, Plus, Dumbbell, AlertCircle } from "lucide-react";

export default function DashboardScreen({ user, onLogout }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [workouts, setWorkouts] = useState([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [workoutError, setWorkoutError] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "dashboard");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(searchParams.get("workoutId") || null);

  const loadWorkouts = async () => {
    setLoadingWorkouts(true);
    setWorkoutError("");
    try {
      const response = await api.get("/workouts");
      setWorkouts(response.data?.data || []);
    } catch (requestError) {
      setWorkoutError(
        requestError.response?.data?.message || "Could not load workouts"
      );
    } finally {
      setLoadingWorkouts(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  // Sync tab and workoutId with URL search parameters
  useEffect(() => {
    const currentTab = searchParams.get("tab") || "dashboard";
    const currentWorkoutId = searchParams.get("workoutId") || null;
    setActiveTab(currentTab);
    setSelectedWorkoutId(currentWorkoutId);
  }, [searchParams]);

  const handleTabChange = (tabId, workoutId = null) => {
    setActiveTab(tabId);
    setSelectedWorkoutId(workoutId);
    if (tabId === "dashboard") {
      setSearchParams({});
    } else if (workoutId) {
      setSearchParams({ tab: tabId, workoutId });
    } else {
      setSearchParams({ tab: tabId });
    }
  };

  const handleStartRoutine = (routineId) => {
    handleTabChange("log-session", routineId);
  };

  const handleStartEmpty = () => {
    handleTabChange("empty-workout", null);
  };

  const handleCreateWorkout = () => {
    handleTabChange("create-workout", null);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30 selection:text-white">
      {/* Sleek Minimal Sidebar (Always visible on desktop, drawer on mobile) */}
      <DashboardSidebar
        user={user}
        onLogout={onLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={(tab) => handleTabChange(tab)}
      />

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div className="flex flex-col md:pl-56">
        {/* Minimal Top Header */}
        <DashboardHeader
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onStartEmpty={handleStartEmpty}
          onCreateWorkout={handleCreateWorkout}
        />

        <main className="relative flex-1 px-4 py-8 sm:px-8 max-w-5xl w-full mx-auto space-y-7 isolate">
          {/* Subtle Ambient Warm Glow */}
          <div className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-transparent blur-[120px] -z-10" />

          {/* TAB 1: LOG PRESCRIBED SESSION (Read-only targets, prominent GIFs, only checkboxes) */}
          {activeTab === "log-session" && (
            <RoutineLogSessionView
              workoutId={selectedWorkoutId}
              onDone={() => handleTabChange("dashboard")}
              onSaved={() => {
                loadWorkouts();
                handleTabChange("dashboard");
              }}
            />
          )}

          {/* TAB 2: START EMPTY WORKOUT (Add exercises, edit reps/weights, mark done checkboxes) */}
          {activeTab === "empty-workout" && (
            <EmptyWorkoutView
              onDone={() => handleTabChange("dashboard")}
              onSaved={() => {
                loadWorkouts();
                handleTabChange("dashboard");
              }}
            />
          )}

          {/* TAB 2: CREATE WORKOUT / WORKOUT BUILDER (Embedded with Sidebar) */}
          {activeTab === "create-workout" && (
            <div className="rounded-sm border border-white/[0.08] bg-[#0c0e14] p-5 sm:p-7">
              <WorkoutBuilder
                user={user}
                onCancel={() => handleTabChange("dashboard")}
                onSaved={() => {
                  loadWorkouts();
                  handleTabChange("dashboard");
                }}
              />
            </div>
          )}

          {/* TAB 3: ROUTINES ONLY VIEW */}
          {activeTab === "routines" && (
            <div className="space-y-6">
              <RoutineList
                workouts={workouts}
                loading={loadingWorkouts}
                onStartRoutine={handleStartRoutine}
                onStartEmpty={handleStartEmpty}
                onCreateWorkout={handleCreateWorkout}
                onExplore={() => navigate("/home")}
              />
            </div>
          )}

          {/* TAB 4: DASHBOARD MAIN OVERVIEW */}
          {activeTab === "dashboard" && (
            <>
              {/* API Error notice (if any) */}
              {workoutError && (
                <div className="flex items-center gap-2 rounded-sm border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs text-neutral-400">
                  <AlertCircle className="h-4 w-4 text-orange-400 shrink-0" />
                  <span>{workoutError}. Displaying recommended routines.</span>
                </div>
              )}

              {/* Non-boxy Minimal Page Greeting Header */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-5 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                    <span>Client Dashboard</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Welcome back, {user?.name || "Athlete"}.
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-400">
                    Keep your next session intentional. Build a workout around the way you want to train today.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCreateWorkout}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-[#ff6723] hover:bg-[#f05a18] px-4 py-2 text-xs font-bold text-white transition shadow-[0_0_15px_rgba(255,103,35,0.25)]"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Create a workout</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStartEmpty}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-neutral-300 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <Dumbbell className="h-3.5 w-3.5 text-orange-400" />
                    <span>Start empty session</span>
                  </button>
                </div>
              </div>

              {/* Monthly Report Banner (Screenshot 1) */}
              {!isBannerDismissed && (
                <MonthlyReportCard
                  onViewReport={() => setIsReportOpen(true)}
                  onDismiss={() => setIsBannerDismissed(true)}
                />
              )}

              {/* Routines Section (Screenshot 3) */}
              <RoutineList
                workouts={workouts}
                loading={loadingWorkouts}
                onStartRoutine={handleStartRoutine}
                onStartEmpty={handleStartEmpty}
                onCreateWorkout={handleCreateWorkout}
                onExplore={() => navigate("/home")}
              />

              {/* Recent Workout Activity Card (Screenshot 1) */}
              <RecentWorkoutCard
                userName={user?.name || "Athlete"}
                onStartEmpty={handleStartEmpty}
              />
            </>
          )}
        </main>
      </div>

      {/* Minimal Monthly Report Modal */}
      <MonthlyReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
