export const DEMO_ROUTINES = [
  {
    id: "demo-leg",
    key: "leg",
    name: "Leg Workout",
    description: "Lower-body strength and volume with calves and core work.",
    exercises: [
      { exerciseId: "jFtipLl", name: "Smith Squat", sets: [{ weight: 40, reps: 6 }, { weight: 40, reps: 12 }, { weight: 45, reps: 12 }] },
      { exerciseId: "7zdxRTl", name: "Smith Leg Press", sets: [{ weight: 65, reps: 10 }, { weight: 65, reps: 10 }] },
      { exerciseId: "my33uHU", name: "Lever Leg Extension", sets: [{ weight: 40, reps: 12 }, { weight: 40, reps: 12 }] },
      { exerciseId: "17lJ1kr", name: "Lever Lying Leg Curl", sets: [{ weight: 20, reps: 12 }, { weight: 20, reps: 9 }] },
      { exerciseId: "6MaEjVA", name: "Smith Standing Leg Calf Raise", sets: [{ weight: 65, reps: 20 }, { weight: 65, reps: 20 }] },
      { exerciseId: "IeDEXTe", name: "Lever Seated Squat Calf Raise", sets: [{ weight: 30, reps: 15 }, { weight: 30, reps: 20 }] },
      { exerciseId: "8gQo5Ss", name: "Single Style Cable Standing Crunch", sets: [{ weight: 35, reps: 15 }, { weight: 35, reps: 20 }] },
    ],
  },
  {
    id: "demo-push",
    key: "push",
    name: "Push Workout",
    description: "Chest, shoulders, arms, and triceps with pressing and cable work.",
    exercises: [
      { exerciseId: "I4hDWkc", name: "Push-up", sets: [{ weight: null, reps: 14 }, { weight: null, reps: 11 }] },
      { exerciseId: "5v7KYld", name: "Smith Incline Bench Press", sets: [{ weight: 45, reps: 2 }, { weight: 40, reps: 3 }, { weight: 40, reps: 6 }] },
      { exerciseId: "0CXGHya", name: "Cable Cross-over Variation", sets: [{ weight: 10, reps: 20 }, { weight: 15, reps: 8 }] },
      { exerciseId: "FVmZVhk", name: "Cable Low Fly", sets: [{ weight: 10, reps: 8 }, { weight: 5, reps: 14 }, { weight: 10, reps: 20 }] },
      { exerciseId: "DOoWcnA", name: "Lever Chest Press", sets: [{ weight: 30, reps: 8 }, { weight: 30, reps: 7 }] },
      { exerciseId: "qOgPVf6", name: "Barbell Preacher Curl", sets: [{ weight: 15, reps: 8 }, { weight: 10, reps: 8 }, { weight: 5, reps: 10 }, { weight: 15, reps: 6 }, { weight: 10, reps: 8 }, { weight: 5, reps: 15 }] },
      { exerciseId: "slDvUAU", name: "Dumbbell Hammer Curl", sets: [{ weight: 7.5, reps: 11 }, { weight: 7.5, reps: 10 }] },
      { exerciseId: "gAwDzB3", name: "Cable Triceps Pushdown", sets: [{ weight: 25, reps: 11 }, { weight: 25, reps: 11 }] },
      { exerciseId: "2IxROQ1", name: "Cable Overhead Triceps Extension", sets: [{ weight: 30, reps: 15 }, { weight: 35, reps: 7 }] },
    ],
  },
  {
    id: "demo-pull",
    key: "pull",
    name: "Pull Workout",
    description: "Back, shoulders, traps, forearms, and lower-back accessory work.",
    exercises: [
      { exerciseId: "LEprlgG", name: "Cable Lat Pulldown", sets: [{ weight: 30, reps: 10 }, { weight: 30, reps: 10 }, { weight: 30, reps: 10 }] },
      { exerciseId: "EIsE3u8", name: "Cable One Arm Bent Over Row", sets: [{ weight: 30, reps: 12 }, { weight: 30, reps: 10 }] },
      { exerciseId: "fUBheHs", name: "Cable Seated Row", sets: [{ weight: 30, reps: 12 }, { weight: 30, reps: 8 }, { weight: 25, reps: 10 }] },
      { exerciseId: "903mzG8", name: "Smith Shoulder Press", sets: [{ weight: 40, reps: 10 }, { weight: 40, reps: 9 }] },
      { exerciseId: "goJ6ezq", name: "Cable Lateral Raise", sets: [{ weight: 10, reps: 12 }, { weight: 10, reps: 10 }] },
      { exerciseId: "MzNnwx9", name: "Smith Back Shrug", sets: [{ weight: 50, reps: 20 }, { weight: 50, reps: 20 }] },
      { exerciseId: "myfUsKf", name: "Lever Seated Reverse Fly", sets: [{ weight: 30, reps: 12 }, { weight: 30, reps: 10 }] },
      { exerciseId: "B6dAO1t", name: "Smith Seated Wrist Curl", sets: [{ weight: 15, reps: 20 }, { weight: 15, reps: 20 }] },
      { exerciseId: "rUXfn3R", name: "Lever Back Extension", sets: [{ weight: 15, reps: 10 }, { weight: 15, reps: 15 }] },
    ],
  },
];

export const getDemoRoutine = (key) => DEMO_ROUTINES.find((routine) => routine.key === key);
