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
  const targetUserId = role === "admin" && req.query.userId ? req.query.userId : authUserId;
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 5, 1), 20);

  const queryText = `
    WITH user_sessions AS (
      SELECT s.session_id, s.user_id, s.name, s.started_at, s.ended_at
      FROM sessions s
      WHERE s.user_id = $1
      ORDER BY s.started_at DESC
      LIMIT $2
    ),
    exercise_data AS (
      SELECT 
        se.session_id,
        se.session_exercise_id,
        se.exercise_order,
        e.exercise_id,
        e.name,
        e.gif_url,
        e.target_muscles,
        e.body_parts,
        (
          SELECT COALESCE(json_agg(json_build_object('muscle_name', em.muscle_name, 'role', em.role)), '[]'::json)
          FROM exercise_muscles em
          WHERE em.exercise_id = e.exercise_id
        ) AS muscles,
        COUNT(st.set_id)::INT AS sets_count,
        COALESCE(SUM(st.reps * COALESCE(st.weight, 0)), 0) AS exercise_volume,
        STRING_AGG(
          CASE 
            WHEN st.weight IS NOT NULL AND st.weight > 0 
              THEN (CASE WHEN st.weight = ROUND(st.weight) THEN ROUND(st.weight)::TEXT ELSE ROUND(st.weight, 1)::TEXT END) || ' kg × ' || st.reps::TEXT
            ELSE st.reps::TEXT || ' reps'
          END,
          ', '
          ORDER BY st.set_number
        ) AS details,
        STRING_AGG(
          CASE 
            WHEN st.weight IS NOT NULL AND st.weight > 0 
              THEN (CASE WHEN st.weight = ROUND(st.weight) THEN ROUND(st.weight)::TEXT ELSE ROUND(st.weight, 1)::TEXT END)
            ELSE 'BW'
          END,
          ' '
          ORDER BY st.set_number
        ) AS weights_summary
      FROM session_exercises se
      JOIN exercises e ON e.exercise_id = se.exercise_id
      LEFT JOIN sets st ON st.session_exercise_id = se.session_exercise_id
      WHERE se.session_id IN (SELECT session_id FROM user_sessions)
      GROUP BY se.session_id, se.session_exercise_id, se.exercise_order, e.exercise_id, e.name, e.gif_url, e.target_muscles, e.body_parts
    )
    SELECT 
      us.session_id,
      us.name,
      us.started_at,
      us.ended_at,
      GREATEST(0, EXTRACT(EPOCH FROM (COALESCE(us.ended_at, NOW()) - us.started_at)))::INT AS duration_seconds,
      u.name AS user_name,
      COALESCE(SUM(ed.exercise_volume), 0)::NUMERIC AS total_volume,
      COALESCE(SUM(ed.sets_count), 0)::INT AS total_sets,
      (
        SELECT COUNT(*)::INT 
        FROM personal_records pr 
        WHERE pr.user_id = us.user_id 
          AND pr.achieved_at >= us.started_at 
          AND (us.ended_at IS NULL OR pr.achieved_at <= us.ended_at)
      ) AS pr_count,
      COALESCE(
        json_agg(
          json_build_object(
            'exercise_id', ed.exercise_id,
            'name', ed.name,
            'gif_url', ed.gif_url,
            'order', ed.exercise_order,
            'sets_count', ed.sets_count,
            'details', ed.details,
            'weights_summary', ed.weights_summary,
            'muscles', ed.muscles,
            'target_muscles', ed.target_muscles,
            'body_parts', ed.body_parts
          )
          ORDER BY ed.exercise_order
        ) FILTER (WHERE ed.session_exercise_id IS NOT NULL),
        '[]'::json
      ) AS exercises
    FROM user_sessions us
    JOIN users u ON u.user_id = us.user_id
    LEFT JOIN exercise_data ed ON ed.session_id = us.session_id
    GROUP BY us.session_id, us.name, us.started_at, us.ended_at, us.user_id, u.name
    ORDER BY us.started_at DESC;
  `;

  const { rows } = await pool.query(queryText, [targetUserId, limit]);
  return res.json(new ApiResponse(200, rows, "Recent sessions fetched"));
});

