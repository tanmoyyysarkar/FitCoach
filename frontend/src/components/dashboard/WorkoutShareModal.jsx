import React, { useRef, useState } from "react";
import {
  Download,
  Copy,
  Check,
  X,
  Share2,
  Sparkles,
  Dumbbell,
  Loader2,
} from "lucide-react";
import { toPng, toBlob } from "html-to-image";
import BodyMuscleMap, { extractActiveMuscleIds } from "./BodyMuscleMap";

// Helper to format number with commas
const formatNumber = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString();
};

// Format duration
const formatDuration = (totalSeconds) => {
  if (!totalSeconds || totalSeconds < 60) return "< 1 min";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }
  return `${minutes} min`;
};

// Format weight sequence (e.g. "4 × 70 75 80 90")
const formatWeightsSequence = (exercise) => {
  if (exercise.weights_summary) {
    return `${exercise.sets_count || 1} × ${exercise.weights_summary}`;
  }
  if (exercise.details) {
    return exercise.details;
  }
  return `${exercise.sets_count || 3} sets completed`;
};

export default function WorkoutShareModal({
  isOpen,
  onClose,
  session,
  userName = "Athlete",
}) {
  const cardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  if (!isOpen || !session) return null;

  const exercises = session.exercises || [];
  const activeMuscleIds = extractActiveMuscleIds(exercises);

  const durationStr = formatDuration(session.duration_seconds);
  const totalVolume = Number(session.total_volume) || 0;
  const totalSets = Number(session.total_sets) || exercises.reduce((acc, e) => acc + (e.sets_count || 0), 0) || 10;
  const athleteName = session.user_name || userName || "Athlete";

  // Display top 3 exercises in the summary list for clean 9:16 layout
  const topExercises = exercises.slice(0, 3);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Download high-resolution PNG (2x pixel ratio for crystal clear 1080x1920 story quality)
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      // Small pause to ensure SVGs and fonts are rendered
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2.5,
        backgroundColor: "#000000",
        cacheBust: true,
      });

      const cleanTitle = (session.name || "workout")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");
      const filename = `fitcoach-${cleanTitle}-${Date.now()}.png`;

      const downloadLink = document.createElement("a");
      downloadLink.download = filename;
      downloadLink.href = dataUrl;
      downloadLink.click();

      showToast("High-resolution PNG saved to downloads! ✨");
    } catch (err) {
      console.error("Export PNG failed:", err);
      showToast("Could not generate image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));

      const blob = await toBlob(cardRef.current, {
        pixelRatio: 2.5,
        backgroundColor: "#000000",
        cacheBust: true,
      });

      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        showToast("Copied card image to clipboard! 📋");
        setTimeout(() => setCopied(false), 2500);
      } else {
        // Fallback to download
        handleDownloadImage();
      }
    } catch (err) {
      console.warn("Clipboard copy fallback to download:", err);
      handleDownloadImage();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-xl flex flex-col items-center animate-in fade-in zoom-in-95">
        {/* Modal Controls Header */}
        <div className="w-full flex items-center justify-between pb-3 text-white">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-orange-400" />
            <h3 className="text-sm font-bold tracking-tight">Share Workout</h3>
            <span className="rounded-sm bg-orange-500/15 border border-orange-500/30 px-1.5 py-0.5 text-[9px] font-mono uppercase text-orange-400">
              Strava Style
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyToClipboard}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 rounded-sm border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 rounded-sm bg-[#ff6723] hover:bg-[#f05a18] px-3.5 py-1.5 text-xs font-bold text-white transition shadow-[0_0_15px_rgba(255,103,35,0.3)] disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span>Export PNG</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-sm p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition ml-1"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mb-3 rounded-sm border border-orange-500/40 bg-orange-500/15 px-3 py-1.5 text-xs font-mono text-orange-300 animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* ======================================================== */}
        {/* 9:16 HIGH-RESOLUTION STORY/SHARE CARD (CAPTURED TO PNG) */}
        {/* ======================================================== */}
        <div className="w-full flex justify-center py-1">
          <div
            ref={cardRef}
            id="fitcoach-share-card"
            className="w-[360px] sm:w-[410px] min-h-[730px] sm:min-h-[820px] bg-black text-white p-7 sm:p-9 flex flex-col justify-between border border-white/[0.08] shadow-[0_0_50px_rgba(0,0,0,0.9)] select-none isolate relative overflow-hidden"
            style={{ backgroundColor: "#000000" }}
          >
            {/* Top Bar: FITCOACH Logo + Stylized Rotated Dumbbell Emblem */}
            <div className="flex items-center justify-between">
              {/* FITCOACH Logo with vibrant orange badge */}
              <div className="flex items-center gap-2.5">
                
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans uppercase">
                  FITCOACH
                </span>
              </div>

              {/* Minimalist Rotated Dumbbell Watermark Glyphs */}
              <div className="opacity-90">
                  <img src="logo.svg" className="h-7 w-7 text-white stroke-[2.2] rotate-45"/>
              </div>
            </div>

            {/* Middle Section: 2-Column Stats Breakdown (Matches Image Reference) */}
            <div className="mt-8 grid grid-cols-2 gap-6 items-start">
              {/* Left Column: Volume (KG) + Total Sets */}
              <div className="space-y-5">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {formatNumber(totalVolume)}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-neutral-400 font-mono">
                      KG
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {totalSets}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-neutral-400 font-mono">
                      SETS
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Duration + Exercises List */}
              <div className="space-y-4">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {durationStr}
                  </span>
                </div>

                {/* Exercises with Sets and Weights */}
                <div className="space-y-3 pt-1">
                  {topExercises.map((exercise, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                        {exercise.name}
                      </p>
                      <p className="text-[11px] sm:text-xs text-neutral-400 font-mono">
                        {formatWeightsSequence(exercise)}
                      </p>
                    </div>
                  ))}

                  {exercises.length > 3 && (
                    <p className="text-[10px] text-neutral-500 font-mono uppercase">
                      + {exercises.length - 3} more exercises
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Section: Anatomical Body Map with Targeted Muscles Glowing */}
            <div className="my-auto pt-6 pb-4 flex flex-col items-center justify-center">
              <BodyMuscleMap activeMuscleIds={activeMuscleIds} />
            </div>

            {/* Strava-Style Minimal Watermark Footer */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff6723]" />
                <span className="text-neutral-400 font-semibold">{athleteName}</span>
                <span>·</span>
                <span>{session.name || "Workout"}</span>
              </div>
              <span className="text-neutral-600">fitcoach.io</span>
            </div>
          </div>
        </div>

        {/* Tip below preview */}
        <p className="mt-3 text-[11px] text-neutral-500 font-mono text-center">
          Tap Export PNG to save a 1080×1920 story-ready image for Instagram, WhatsApp, or Strava.
        </p>
      </div>
    </div>
  );
}
