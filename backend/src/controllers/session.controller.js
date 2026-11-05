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

export const getRecentSessions = asyncHandler(async (req, res) => {
  const { user_id: authUserId, role } = req.user;
  const canInspectUsers = role === "admin" || role === "trainer";
  const targetUserId = canInspectUsers && req.query.userId ? req.query.userId : authUserId;
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 5, 1), 20);

  const queryText = `
    SELECT
      s.session_id,
      s.name,
      s.started_at,
      s.ended_at,
      GREATEST(0, EXTRACT(EPOCH FROM (COALESCE(s.ended_at, NOW()) - s.started_at)))::INT AS duration_seconds,
      u.name AS user_name,
      COALESCE(SUM(st.reps * COALESCE(st.weight, 0)), 0)::NUMERIC AS total_volume,
      COUNT(st.set_id)::INT AS total_sets,
      COALESCE((
        SELECT COUNT(*)::INT
        FROM personal_records pr
        WHERE pr.user_id = s.user_id
          AND pr.achieved_at >= s.started_at
          AND (s.ended_at IS NULL OR pr.achieved_at <= s.ended_at)
      ), 0) AS pr_count,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'exercise_id', e.exercise_id,
            'name', e.name,
            'gif_url', e.gif_url,
            'order', se.exercise_order,
            'sets_count', (
              SELECT COUNT(*)
              FROM sets exercise_sets
              WHERE exercise_sets.session_exercise_id = se.session_exercise_id
            ),
            'target_muscles', e.target_muscles,
            'body_parts', e.body_parts
          )
        ) FILTER (WHERE e.exercise_id IS NOT NULL),
        '[]'::json
      ) AS exercises
    FROM sessions s
    JOIN users u ON u.user_id = s.user_id
    LEFT JOIN session_exercises se ON se.session_id = s.session_id
    LEFT JOIN exercises e ON e.exercise_id = se.exercise_id
    LEFT JOIN sets st ON st.session_exercise_id = se.session_exercise_id
    WHERE s.user_id = $1
    GROUP BY s.session_id, u.name
    ORDER BY s.started_at DESC
    LIMIT $2;
  `;

  const { rows } = await pool.query(queryText, [targetUserId, limit]);
  return res.json(new ApiResponse(200, rows, "Recent sessions fetched"));
});
