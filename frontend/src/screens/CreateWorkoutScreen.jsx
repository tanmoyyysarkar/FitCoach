import { useNavigate } from "react-router-dom";
import WorkoutBuilder from "../components/custom/WorkoutBuilder";
import { useAuth } from "../context/AuthContext";

export default function CreateWorkoutScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-[#070605] px-4 py-6 text-zinc-100 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-[#0c0a09] p-5 shadow-2xl shadow-black/40 sm:p-8">
        <WorkoutBuilder
          user={user}
          onCancel={() => navigate("/dashboard")}
          onSaved={() => navigate("/dashboard")}
        />
      </div>
    </main>
  );
}
