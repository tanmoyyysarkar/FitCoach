import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Dumbbell,
  PlayCircle,
  Plus,
  Compass,
  LogOut,
  X,
} from "lucide-react";

export default function DashboardSidebar({
  user,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  activeTab = "dashboard",
  setActiveTab,
}) {
  const navigate = useNavigate();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      onClick: () => {
        if (setActiveTab) setActiveTab("dashboard");
        if (onCloseMobile) onCloseMobile();
      },
    },
    {
      id: "routines",
      label: "Routines",
      icon: Dumbbell,
      onClick: () => {
        if (setActiveTab) setActiveTab("routines");
        if (onCloseMobile) onCloseMobile();
      },
    },
    {
      id: "empty-workout",
      label: "Start Empty Workout",
      icon: PlayCircle,
      onClick: () => {
        if (setActiveTab) setActiveTab("empty-workout");
        if (onCloseMobile) onCloseMobile();
      },
    },
    ...(activeTab === "log-session"
      ? [
        {
          id: "log-session",
          label: "Log Routine Session",
          icon: Dumbbell,
          onClick: () => {
            if (setActiveTab) setActiveTab("log-session");
            if (onCloseMobile) onCloseMobile();
          },
        },
      ]
      : []),
    {
      id: "create-workout",
      label: "New Routine",
      icon: Plus,
      onClick: () => {
        if (setActiveTab) setActiveTab("create-workout");
        if (onCloseMobile) onCloseMobile();
      },
    },
    {
      id: "explore",
      label: "Explore Workouts",
      icon: Compass,
      onClick: () => {
        navigate("/home");
        if (onCloseMobile) onCloseMobile();
      },
    },
  ];

  const userName = user?.name || "Athlete";
  const userInitials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AT";

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 md:z-30">
        <div className="flex h-full flex-col justify-between bg-black text-white px-3 py-5 border-r border-white/[0.08] select-none">
          {/* Brand Header */}
          <div>
            <div className="flex items-center justify-between px-3 pb-5 border-b border-white/[0.08]">
              <div
                onClick={() => {
                  if (setActiveTab) setActiveTab("dashboard");
                }}
                className="flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-90"
              >
                <img src="logo.svg" className="h-7 w-7 text-white stroke-[2.2] rotate-45"/>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight text-white">
                    FitCoach
                  </span>
                  <span className="rounded-sm bg-orange-500/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-orange-400 border border-orange-500/30">
                    PRO
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Section */}
            <div className="mt-5 space-y-1">
              <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-semibold">
                Navigation
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-medium transition ${isActive
                        ? "bg-orange-500/15 text-orange-400 font-semibold border-l-2 border-orange-500"
                        : "text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200"
                      }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-orange-400" : "text-neutral-500"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Footer */}
          <div className="border-t border-white/[0.08] pt-3">
            <div className="flex items-center justify-between rounded-sm bg-white/[0.02] border border-white/[0.06] p-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-neutral-900 border border-white/10 text-[11px] font-bold text-white">
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">{userName}</p>
                  <p className="truncate text-[10px] text-neutral-500">
                    {user?.email || "athlete@fitcoach.io"}
                  </p>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Log out"
                className="rounded-sm p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 transform bg-black transition-transform duration-200 md:hidden ${isOpenMobile ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col justify-between bg-black text-white px-3 py-5 border-r border-white/[0.08] select-none">
          <div>
            <div className="flex items-center justify-between px-3 pb-5 border-b border-white/[0.08]">
              <div
                onClick={() => {
                  if (setActiveTab) setActiveTab("dashboard");
                  if (onCloseMobile) onCloseMobile();
                }}
                className="flex cursor-pointer items-center gap-2.5"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-orange-500/15 border border-orange-500/30 text-orange-400">
                  <Dumbbell className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight text-white">
                    FitCoach
                  </span>
                  <span className="rounded-sm bg-orange-500/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-orange-400 border border-orange-500/30">
                    PRO
                  </span>
                </div>
              </div>
              <button
                onClick={onCloseMobile}
                className="rounded-sm p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white md:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-1">
              <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-semibold">
                Navigation
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-medium transition ${isActive
                        ? "bg-orange-500/15 text-orange-400 font-semibold border-l-2 border-orange-500"
                        : "text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200"
                      }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-orange-400" : "text-neutral-500"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-3">
            <div className="flex items-center justify-between rounded-sm bg-white/[0.02] border border-white/[0.06] p-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-neutral-900 border border-white/10 text-[11px] font-bold text-white">
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">{userName}</p>
                  <p className="truncate text-[10px] text-neutral-500">
                    {user?.email || "athlete@fitcoach.io"}
                  </p>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Log out"
                className="rounded-sm p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
