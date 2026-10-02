import { pool } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

export const createSession = asyncHandler(async (req, res) => {
  const { name, workoutId, exercises } = req.body;
  const { user_id: userId, role } = req.user;

  if (typeof name !== "string" || !name.trim()) {
    throw new ApiError(400, "Session name is required");
  }
  if (!Array.isArray(exercises) || exercises.length === 0) {
    throw new ApiError(400, "At least one exercise is required");
  }

  const completedExercises = exercises.map((exercise, exerciseIndex) => {
    if (typeof exercise.exerciseId !== "string" || !exercise.exerciseId.trim()) {
      throw new ApiError(400, `exercises[${exerciseIndex}].exerciseId is required`);
    }
    if (!Array.isArray(exercise.sets) || exercise.sets.length === 0) {
      throw new ApiError(400, `exercises[${exerciseIndex}].sets must not be empty`);
    }

    const sets = exercise.sets.filter((set) => set.completed).map((set, setIndex) => {
      const reps = Number(set.reps);
      const weight = set.weight === "" || set.weight == null ? null : Number(set.weight);
      if (!isPositiveInteger(reps)) {
        throw new ApiError(400, `exercises[${exerciseIndex}].sets[${setIndex}].reps must be a positive integer`);
      }
      if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
        throw new ApiError(400, `exercises[${exerciseIndex}].sets[${setIndex}].weight must be >= 0`);
      }
      return { reps, weight };
    });

    return { exerciseId: exercise.exerciseId.trim(), sets };
  }).filter((exercise) => exercise.sets.length);

  if (!completedExercises.length) {
    throw new ApiError(400, "Complete at least one set before saving");
  }

  const ids = [...new Set(exercises.map((exercise) => exercise.exerciseId.trim()))];
  const { rows: foundExercises } = await pool.query(
    "SELECT exercise_id FROM exercises WHERE exercise_id = ANY($1)",
    [ids],
  );
  const foundIds = new Set(foundExercises.map((exercise) => exercise.exercise_id));
  const missingId = ids.find((id) => !foundIds.has(id));
  if (missingId) throw new ApiError(404, `Unknown exerciseId: ${missingId}`);

  if (workoutId != null) {
    const { rows: [workout] } = await pool.query(
      "SELECT created_by FROM workouts WHERE workout_id = $1",
      [workoutId],
    );
    if (!workout) throw new ApiError(404, "Workout not found");
    if (role !== "admin" && String(workout.created_by) !== userId) {
      const { rows } = await pool.query(
        "SELECT 1 FROM workout_assignments WHERE workout_id = $1 AND client_id = $2",
        [workoutId, userId],
      );
      if (!rows.length) throw new ApiError(403, "Forbidden");
    }
  }

  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    const { rows: [session] } = await db.query(
      `INSERT INTO sessions (user_id, workout_id, name, ended_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING session_id, user_id, workout_id, name, started_at, ended_at`,
      [userId, workoutId ?? null, name.trim()],
    );

    for (const [exerciseIndex, exercise] of completedExercises.entries()) {
      const { rows: [sessionExercise] } = await db.query(
        `INSERT INTO session_exercises (session_id, exercise_id, exercise_order)
         VALUES ($1, $2, $3) RETURNING session_exercise_id`,
        [session.session_id, exercise.exerciseId, exerciseIndex + 1],
      );
      for (const [setIndex, set] of exercise.sets.entries()) {
        await db.query(
          `INSERT INTO sets (session_exercise_id, set_number, reps, weight)
           VALUES ($1, $2, $3, $4)`,
          [sessionExercise.session_exercise_id, setIndex + 1, set.reps, set.weight],
        );
      }
    }

    await db.query("COMMIT");
    return res.status(201).json(new ApiResponse(201, session, "Session saved"));
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    db.release();
  }
});
