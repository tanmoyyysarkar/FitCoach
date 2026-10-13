import { useEffect, useState } from "react";
import { Activity, ArrowLeft, CalendarDays, Dumbbell, Loader2, LogOut, MessageCircle, Plus, Sparkles, UserPlus, Users, AlertCircle } from "lucide-react";
import api from "../api/axios";
import WorkoutBuilder from "../components/custom/WorkoutBuilder";
import ChatModal from "../components/custom/ChatModal";

const formatDate = (value) => {
  if (!value) return "No sessions yet";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function TrainerDashboardScreen({ user, onLogout }) {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [activatingClient, setActivatingClient] = useState(false);
  const [assignmentNotice, setAssignmentNotice] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [error, setError] = useState("");

  const selectedClient = clients.find(
    (client) => String(client.user_id) === String(selectedClientId),
  );

  const trainerName = user?.name || "Trainer";
  const isSelectedClientActive = selectedClient?.relationship_status === "active";

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await api.get("/users/clients");
        const nextClients = response.data?.data || [];
        setClients(nextClients);
        setSelectedClientId(nextClients[0]?.user_id || null);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Could not load clients");
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  useEffect(() => {
    if (!selectedClientId) {
      return;
    }

    const loadSessions = async () => {
      setLoadingSessions(true);
      setError("");
      try {
        const response = await api.get("/sessions/recent", {
          params: { userId: selectedClientId, limit: 20 },
        });
        setSessions(response.data?.data || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Could not load sessions");
      } finally {
        setLoadingSessions(false);
      }
    };

    loadSessions();
  }, [selectedClientId]);

  const activateSelectedClient = async () => {
    if (!selectedClient) return;
    setActivatingClient(true);
    setError("");
    try {
      await api.post(`/users/clients/${selectedClient.user_id}/activate`);
      setClients((current) => current.map((client) => (
        client.user_id === selectedClient.user_id
          ? { ...client, relationship_status: "active" }
          : client
      )));
      setAssignmentNotice(`${selectedClient.name} is now an active client`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not activate client");
    } finally {
      setActivatingClient(false);
    }
  };

  if (isBuilderOpen && selectedClient) {
    return (
      <div className="min-h-screen bg-black px-4 py-6 text-white font-sans sm:px-8">
        <main className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => setIsBuilderOpen(false)}
            className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-neutral-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {selectedClient.name}
          </button>
          <div className="rounded-sm border border-white/[0.08] bg-[#0c0e14] p-5 sm:p-7">
            <WorkoutBuilder
              user={user}
              targetUser={selectedClient}
              onCancel={() => setIsBuilderOpen(false)}
              onSaved={() => {
                setIsBuilderOpen(false);
                setAssignmentNotice(`Workout assigned to ${selectedClient.name}`);
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30 selection:text-white">
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-black/85 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-orange-500/15 border border-orange-500/30 text-orange-400">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-mono font-medium text-neutral-500 uppercase tracking-widest">
                Trainer workspace
              </p>
              <p className="text-sm font-bold tracking-tight text-white">FitCoach</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-sm border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-white/[0.08] hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-8 space-y-7">
        <div className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-transparent blur-[120px] -z-10" />

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" />
              <span>Trainer Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Client overview
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400">
              Monitor {trainerName !== "Trainer" ? `${trainerName}'s ` : ""}clients and review their recent session activity.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-white/[0.08] bg-[#0c0e14] px-3 py-1.5 text-xs text-neutral-300">
              <Users className="h-3.5 w-3.5 text-orange-400" />
              {clients.length} clients
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-sm border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs text-neutral-400">
            <AlertCircle className="h-4 w-4 text-orange-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {assignmentNotice && (
          <div className="flex items-center gap-2 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-300">
            <Dumbbell className="h-4 w-4 shrink-0" />
            <span>{assignmentNotice}</span>
            <button
              type="button"
              onClick={() => setAssignmentNotice("")}
              className="ml-auto text-emerald-200 transition hover:text-white"
              aria-label="Dismiss assignment notice"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-white">All clients</h2>
              <span className="text-xs font-mono text-neutral-500">{clients.length}</span>
            </div>
            <div className="overflow-hidden rounded-sm border border-white/[0.08] bg-[#0c0e14]">
              {loadingClients && (
                <p className="p-4 text-xs text-neutral-500">Loading clients...</p>
              )}
              {!loadingClients && clients.length === 0 && (
                <p className="p-4 text-xs text-neutral-500">No client accounts found.</p>
              )}
              {clients.map((client) => {
                const isSelected = String(client.user_id) === String(selectedClientId);
                return (
                  <button
                    key={client.user_id}
                    type="button"
                    onClick={() => setSelectedClientId(client.user_id)}
                    className={`w-full px-4 py-3 text-left transition border-l-2 ${
                      isSelected
                        ? "border-orange-500 bg-orange-500/15"
                        : "border-transparent hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-sm text-xs font-bold ${
                          isSelected
                            ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                            : "bg-white/[0.05] text-neutral-300 border border-white/[0.08]"
                        }`}
                      >
                        {client.name?.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {client.name}
                        </p>
                        <p className="truncate text-[11px] text-neutral-500">
                          {client.email}
                        </p>
                        <p className={`text-[10px] uppercase tracking-wider ${
                          client.relationship_status === "active"
                            ? "text-emerald-400"
                            : "text-neutral-600"
                        }`}>
                          {client.relationship_status === "active" ? "Active client" : "Available"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="min-w-0">
            {selectedClient ? (
              <>
                <div className="border-b border-white/[0.08] pb-5">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
                        Selected client
                      </p>
                      <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">
                        {selectedClient.name}
                      </h2>
                      <p className="mt-1 text-sm text-neutral-400">
                        {selectedClient.email}
                      </p>
                    </div>
                    <div className="flex gap-5 text-xs text-neutral-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-orange-400" />
                        {selectedClient.session_count} sessions
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-orange-400" />
                        {formatDate(selectedClient.last_session_at)}
                      </span>
                    </div>
                  </div>
                  {isSelectedClientActive ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setIsBuilderOpen(true)}
                        className="inline-flex items-center gap-2 rounded-sm bg-[#ff6723] px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(255,103,35,0.2)] transition hover:bg-[#f05a18]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Assign workout
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsChatOpen(true)}
                        className="inline-flex items-center gap-2 rounded-sm border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-neutral-300 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        <MessageCircle className="h-3.5 w-3.5 text-orange-400" />
                        Open chat
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={activateSelectedClient}
                      disabled={activatingClient}
                      className="mt-5 inline-flex items-center gap-2 rounded-sm border border-orange-500/40 bg-orange-500/10 px-4 py-2 text-xs font-bold text-orange-300 transition hover:bg-orange-500/20 disabled:cursor-wait disabled:opacity-60"
                    >
                      {activatingClient ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                      {activatingClient ? "Activating..." : "Add client"}
                    </button>
                  )}
                </div>

                <div className="mt-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-orange-400" />
                    <h3 className="text-sm font-semibold tracking-tight text-white">
                      Recent sessions
                    </h3>
                    {loadingSessions && (
                      <span className="text-xs font-mono text-neutral-500">Loading…</span>
                    )}
                  </div>
                  {!loadingSessions && sessions.length === 0 && (
                    <p className="rounded-sm border border-white/[0.08] bg-[#0c0e14] p-5 text-sm text-neutral-500">
                      No sessions recorded for this client.
                    </p>
                  )}
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <article
                        key={session.session_id}
                        className="rounded-sm border border-white/[0.08] bg-[#0c0e14] p-4 transition hover:border-orange-500/30 hover:bg-[#10131b]"
                      >
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                          <div>
                            <h4 className="text-sm font-bold text-white">
                              {session.name}
                            </h4>
                            <p className="mt-1 text-xs text-neutral-400">
                              {formatDate(session.started_at)} · {session.total_sets} sets · {session.total_volume} volume
                            </p>
                          </div>
                          <span className="text-xs font-mono text-neutral-500">
                            {session.duration_seconds
                              ? `${Math.round(session.duration_seconds / 60)} min`
                              : ""}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {session.exercises?.map((exercise) => (
                            <span
                              key={`${session.session_id}-${exercise.exercise_id}`}
                              className="rounded-sm border border-white/[0.06] bg-white/[0.05] px-2 py-1 text-[11px] text-neutral-300"
                            >
                              {exercise.name}: {exercise.details || "completed"}
                            </span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-sm border border-dashed border-white/10 bg-white/[0.02] text-center text-neutral-500">
                <Users className="mb-3 h-6 w-6 text-neutral-600" />
                <p className="text-sm">Select a client to inspect their activity.</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={user}
        contact={selectedClient}
      />
    </div>
  );
}
