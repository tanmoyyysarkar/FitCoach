import React, { useMemo } from "react";
import { FRONT_MUSCLES, BACK_MUSCLES } from "body-muscles";

// Comprehensive mapping from exercise-muscles database names to body-muscles SVG IDs
export const MUSCLE_NAME_TO_BODY_IDS = {
  // Calves
  calves: [
    "calves-gastroc-medial-left",
    "calves-gastroc-lateral-left",
    "calves-soleus-left",
    "calves-gastroc-medial-right",
    "calves-gastroc-lateral-right",
    "calves-soleus-right",
    "tibialis-anterior-left",
    "tibialis-anterior-right",
  ],
  calf: [
    "calves-gastroc-medial-left",
    "calves-gastroc-lateral-left",
    "calves-soleus-left",
    "calves-gastroc-medial-right",
    "calves-gastroc-lateral-right",
    "calves-soleus-right",
  ],
  "lower legs": [
    "calves-gastroc-medial-left",
    "calves-gastroc-lateral-left",
    "calves-soleus-left",
    "calves-gastroc-medial-right",
    "calves-gastroc-lateral-right",
    "calves-soleus-right",
    "tibialis-anterior-left",
    "tibialis-anterior-right",
  ],
  soleus: ["calves-soleus-left", "calves-soleus-right"],
  gastrocnemius: [
    "calves-gastroc-medial-left",
    "calves-gastroc-lateral-left",
    "calves-gastroc-medial-right",
    "calves-gastroc-lateral-right",
  ],

  // Hamstrings
  hamstrings: [
    "hamstrings-medial-left",
    "hamstrings-lateral-left",
    "hamstrings-medial-right",
    "hamstrings-lateral-right",
  ],
  hamstring: [
    "hamstrings-medial-left",
    "hamstrings-lateral-left",
    "hamstrings-medial-right",
    "hamstrings-lateral-right",
  ],

  // Glutes
  glutes: [
    "gluteus-medius-left",
    "gluteus-maximus-left",
    "gluteus-medius-right",
    "gluteus-maximus-right",
  ],
  glute: [
    "gluteus-medius-left",
    "gluteus-maximus-left",
    "gluteus-medius-right",
    "gluteus-maximus-right",
  ],
  "gluteus maximus": ["gluteus-maximus-left", "gluteus-maximus-right"],
  "gluteus medius": ["gluteus-medius-left", "gluteus-medius-right"],

  // Quads / Quadriceps
  quads: ["quads-left", "quads-right", "adductors-left", "adductors-right"],
  quadriceps: ["quads-left", "quads-right", "adductors-left", "adductors-right"],
  "upper legs": [
    "quads-left",
    "quads-right",
    "adductors-left",
    "adductors-right",
    "hamstrings-medial-left",
    "hamstrings-lateral-left",
    "hamstrings-medial-right",
    "hamstrings-lateral-right",
  ],
  adductors: ["adductors-left", "adductors-right"],

  // Chest / Pectorals
  chest: [
    "chest-upper-left",
    "chest-upper-right",
    "chest-lower-left",
    "chest-lower-right",
    "serratus-anterior-left",
    "serratus-anterior-right",
  ],
  pectorals: [
    "chest-upper-left",
    "chest-upper-right",
    "chest-lower-left",
    "chest-lower-right",
  ],
  "upper chest": ["chest-upper-left", "chest-upper-right"],
  "lower chest": ["chest-lower-left", "chest-lower-right"],

  // Lats / Back
  lats: [
    "lats-upper-left",
    "lats-mid-left",
    "lats-lower-left",
    "lats-upper-right",
    "lats-mid-right",
    "lats-lower-right",
  ],
  "latissimus dorsi": [
    "lats-upper-left",
    "lats-mid-left",
    "lats-lower-left",
    "lats-upper-right",
    "lats-mid-right",
    "lats-lower-right",
  ],
  back: [
    "lats-upper-left",
    "lats-mid-left",
    "lats-lower-left",
    "lats-upper-right",
    "lats-mid-right",
    "lats-lower-right",
    "lower-back-erectors-left",
    "lower-back-erectors-right",
    "traps-mid-left",
    "traps-mid-right",
    "traps-lower-left",
    "traps-lower-right",
  ],
  "upper back": [
    "traps-mid-left",
    "traps-mid-right",
    "traps-lower-left",
    "traps-lower-right",
    "lats-upper-left",
    "lats-upper-right",
  ],
  "lower back": [
    "lower-back-erectors-left",
    "lower-back-erectors-right",
    "lower-back-ql-left",
    "lower-back-ql-right",
    "spine",
  ],
  rhomboids: ["traps-mid-left", "traps-mid-right"],

  // Shoulders / Delts
  delts: [
    "shoulder-front-left",
    "shoulder-front-right",
    "shoulder-side-left",
    "shoulder-side-right",
    "deltoid-rear-left",
    "deltoid-rear-right",
  ],
  shoulders: [
    "shoulder-front-left",
    "shoulder-front-right",
    "shoulder-side-left",
    "shoulder-side-right",
    "deltoid-rear-left",
    "deltoid-rear-right",
  ],
  deltoids: [
    "shoulder-front-left",
    "shoulder-front-right",
    "shoulder-side-left",
    "shoulder-side-right",
    "deltoid-rear-left",
    "deltoid-rear-right",
  ],
  "front delts": ["shoulder-front-left", "shoulder-front-right"],
  "rear delts": ["deltoid-rear-left", "deltoid-rear-right"],
  "lateral delts": ["shoulder-side-left", "shoulder-side-right"],
  traps: [
    "traps-upper-left",
    "traps-upper-right",
    "traps-mid-left",
    "traps-mid-right",
    "traps-lower-left",
    "traps-lower-right",
  ],
  trapezius: [
    "traps-upper-left",
    "traps-upper-right",
    "traps-mid-left",
    "traps-mid-right",
    "traps-lower-left",
    "traps-lower-right",
  ],

  // Arms: Biceps, Triceps, Forearms
  biceps: ["biceps-left", "biceps-right"],
  triceps: [
    "triceps-long-left",
    "triceps-lateral-left",
    "triceps-long-right",
    "triceps-lateral-right",
  ],
  forearms: [
    "forearm-left",
    "forearm-right",
    "forearm-flexors-left",
    "forearm-flexors-right",
    "forearm-extensors-left",
    "forearm-extensors-right",
  ],
  arms: [
    "biceps-left",
    "biceps-right",
    "triceps-long-left",
    "triceps-lateral-left",
    "triceps-long-right",
    "triceps-lateral-right",
    "forearm-left",
    "forearm-right",
  ],
  "upper arms": [
    "biceps-left",
    "biceps-right",
    "triceps-long-left",
    "triceps-lateral-left",
    "triceps-long-right",
    "triceps-lateral-right",
  ],

  // Abs / Core
  abs: [
    "abs-upper-left",
    "abs-upper-right",
    "abs-lower-left",
    "abs-lower-right",
    "obliques-left",
    "obliques-right",
    "serratus-anterior-left",
    "serratus-anterior-right",
  ],
  core: [
    "abs-upper-left",
    "abs-upper-right",
    "abs-lower-left",
    "abs-lower-right",
    "obliques-left",
    "obliques-right",
  ],
  obliques: ["obliques-left", "obliques-right"],
  abdominals: [
    "abs-upper-left",
    "abs-upper-right",
    "abs-lower-left",
    "abs-lower-right",
  ],
};

/**
 * Extract matching body-muscles IDs from workout exercises
 */
export function extractActiveMuscleIds(exercises = []) {
  const activeIds = new Set();

  for (const ex of exercises) {
    const candidateNames = [];

    // From exercise_muscles relation
    if (Array.isArray(ex.muscles)) {
      for (const m of ex.muscles) {
        if (typeof m === "string") candidateNames.push(m);
        else if (m?.muscle_name) candidateNames.push(m.muscle_name);
      }
    }

    // From target_muscles
    if (Array.isArray(ex.target_muscles)) {
      candidateNames.push(...ex.target_muscles);
    }

    // From body_parts
    if (Array.isArray(ex.body_parts)) {
      candidateNames.push(...ex.body_parts);
    }

    // From exercise name keywords if needed
    if (ex.name) {
      const nameLower = ex.name.toLowerCase();
      if (nameLower.includes("calf") || nameLower.includes("calves")) candidateNames.push("calves");
      if (nameLower.includes("curl") && nameLower.includes("leg")) candidateNames.push("hamstrings");
      if (nameLower.includes("squat")) candidateNames.push("quads", "glutes");
      if (nameLower.includes("bench press") || nameLower.includes("chest fly")) candidateNames.push("chest");
      if (nameLower.includes("lat pulldown") || nameLower.includes("row")) candidateNames.push("lats");
      if (nameLower.includes("french press") || nameLower.includes("triceps")) candidateNames.push("triceps");
      if (nameLower.includes("biceps") || nameLower.includes("incline curl")) candidateNames.push("biceps");
      if (nameLower.includes("face pull") || nameLower.includes("deltoid")) candidateNames.push("delts");
    }

    // Match candidate names to IDs
    for (const rawName of candidateNames) {
      const cleanName = (rawName || "").toLowerCase().trim();
      if (MUSCLE_NAME_TO_BODY_IDS[cleanName]) {
        for (const id of MUSCLE_NAME_TO_BODY_IDS[cleanName]) {
          activeIds.add(id);
        }
      } else {
        // Partial search
        for (const [key, ids] of Object.entries(MUSCLE_NAME_TO_BODY_IDS)) {
          if (cleanName.includes(key) || key.includes(cleanName)) {
            for (const id of ids) {
              activeIds.add(id);
            }
          }
        }
      }
    }
  }

  // If no muscles resolved, default to leg preset (matching calves/hamstrings)
  if (activeIds.size === 0) {
    for (const id of MUSCLE_NAME_TO_BODY_IDS.calves) activeIds.add(id);
    for (const id of MUSCLE_NAME_TO_BODY_IDS.hamstrings) activeIds.add(id);
  }

  return activeIds;
}

/**
 * BodyMuscleMap Component:
 * Renders both Anterior (Front) and Posterior (Back) views side by side,
 * with targeted workout muscles glowing in vibrant fiery orange/red (#ff3b14 -> #ff6723)
 * exactly as requested in the design reference.
 */
export default function BodyMuscleMap({ activeMuscleIds = new Set(), className = "" }) {
  const activeSet = useMemo(() => {
    if (activeMuscleIds instanceof Set) return activeMuscleIds;
    return new Set(activeMuscleIds || []);
  }, [activeMuscleIds]);

  return (
    <div className={`flex items-center justify-center gap-6 sm:gap-10 select-none ${className}`}>
      {/* Front View (Anterior) */}
      <div className="relative flex flex-col items-center">
        <svg
          viewBox="0 0 35 93"
          className="h-72 sm:h-84 md:h-96 w-auto overflow-visible drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
        >
          <defs>
            {/* Fiery neon gradient for active muscles */}
            <linearGradient id="muscleActiveGradFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff451a" />
              <stop offset="100%" stopColor="#ff7020" />
            </linearGradient>

            {/* Glowing neon halo filter */}
            <filter id="muscleGlowFront" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="blurSmall" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="blurLarge" />
              <feMerge>
                <feMergeNode in="blurLarge" />
                <feMergeNode in="blurSmall" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Neutral Background Muscle Paths */}
          <g className="inactive-muscles">
            {FRONT_MUSCLES.map((muscle) => {
              const isActive = activeSet.has(muscle.id);
              if (isActive) return null; // rendered in top active layer
              return (
                <path
                  key={muscle.id}
                  d={muscle.path}
                  fill="#1c2027"
                  stroke="#2d3340"
                  strokeWidth="0.14"
                  strokeLinejoin="round"
                />
              );
            })}
          </g>

          {/* Active Highlighted Muscles (Glowing Orange-Red) */}
          <g className="active-muscles">
            {FRONT_MUSCLES.map((muscle) => {
              const isActive = activeSet.has(muscle.id);
              if (!isActive) return null;
              return (
                <path
                  key={muscle.id}
                  d={muscle.path}
                  fill="url(#muscleActiveGradFront)"
                  stroke="#ffa07a"
                  strokeWidth="0.22"
                  filter="url(#muscleGlowFront)"
                  strokeLinejoin="round"
                />
              );
            })}
          </g>
        </svg>
      </div>

      {/* Back View (Posterior) */}
      <div className="relative flex flex-col items-center">
        <svg
          viewBox="37 0 35 93"
          className="h-72 sm:h-84 md:h-96 w-auto overflow-visible drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
        >
          <defs>
            {/* Fiery neon gradient for active muscles */}
            <linearGradient id="muscleActiveGradBack" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff451a" />
              <stop offset="100%" stopColor="#ff7020" />
            </linearGradient>

            {/* Glowing neon halo filter */}
            <filter id="muscleGlowBack" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="blurSmall" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="blurLarge" />
              <feMerge>
                <feMergeNode in="blurLarge" />
                <feMergeNode in="blurSmall" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Neutral Background Muscle Paths */}
          <g className="inactive-muscles">
            {BACK_MUSCLES.map((muscle) => {
              const isActive = activeSet.has(muscle.id);
              if (isActive) return null;
              return (
                <path
                  key={muscle.id}
                  d={muscle.path}
                  fill="#1c2027"
                  stroke="#2d3340"
                  strokeWidth="0.14"
                  strokeLinejoin="round"
                />
              );
            })}
          </g>

          {/* Active Highlighted Muscles (Glowing Orange-Red) */}
          <g className="active-muscles">
            {BACK_MUSCLES.map((muscle) => {
              const isActive = activeSet.has(muscle.id);
              if (!isActive) return null;
              return (
                <path
                  key={muscle.id}
                  d={muscle.path}
                  fill="url(#muscleActiveGradBack)"
                  stroke="#ffa07a"
                  strokeWidth="0.22"
                  filter="url(#muscleGlowBack)"
                  strokeLinejoin="round"
                />
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
