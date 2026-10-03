import React from "react";
import { useNavigate } from "react-router-dom";
import WorkoutBuilder from "../components/custom/WorkoutBuilder";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft } from "lucide-react";

export default function CreateWorkoutScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-neutral-100 sm:px-8 selection:bg-orange-500/30 selection:text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 rounded-sm border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Clean, Non-boxy Workout Builder Container */}
        <div className="rounded-sm border border-white/[0.08] bg-[#0c0e14] p-6 sm:p-8">
          <WorkoutBuilder
            user={user}
            onCancel={() => navigate("/dashboard")}
            onSaved={() => navigate("/dashboard")}
          />
        </div>
      </div>
    </main>
  );
}
