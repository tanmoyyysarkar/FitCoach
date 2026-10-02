import { pool } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const isPosInt = (n) => Number.isInteger(n) && n > 0;

export const listWorkouts = asyncHandler(async (req, res) => {
  const { user_id: userId } = req.user;

  const { rows } = await pool.query(
    `SELECT w.workout_id, w.name, w.description, w.created_at,
            COUNT(we.workout_exercise_id)::int AS exercise_count,
            COALESCE(SUM(we.target_sets), 0)::int AS total_sets
     FROM workouts w
     LEFT JOIN workout_assignments wa
       ON wa.workout_id = w.workout_id AND wa.client_id = $1
     LEFT JOIN workout_exercises we ON we.workout_id = w.workout_id
     WHERE w.created_by = $1 OR wa.client_id IS NOT NULL
     GROUP BY w.workout_id, w.name, w.description, w.created_at
     ORDER BY w.created_at DESC`,
    [userId],
  );

  return res.json(new ApiResponse(200, rows, "Workouts fetched"));
});

export const createWorkout = asyncHandler(async (req, res) => {
  const { name, description, clientId, exercises } = req.body;
  const { user_id: userId, role } = req.user;

  if (typeof name !== "string" || !name.trim()) {
    throw new ApiError(400, "Workout name is required");
  }
  if (!Array.isArray(exercises) || exercises.length === 0) {
    throw new ApiError(400, "At least one exercise is required");
  }

  exercises.forEach((e, i) => {
    if (typeof e.exerciseId !== "string" || !e.exerciseId.trim())
      throw new ApiError(400, `exercises[${i}].exerciseId is required`);
    if (Array.isArray(e.sets)) {
      if (e.sets.length === 0)
        throw new ApiError(400, `exercises[${i}].sets must not be empty`);
      e.sets.forEach((set, setIndex) => {
        if (!isPosInt(Number(set.reps)))
          throw new ApiError(400, `exercises[${i}].sets[${setIndex}].reps must be a positive integer`);
        if (set.weight != null && !(Number(set.weight) >= 0))
          throw new ApiError(400, `exercises[${i}].sets[${setIndex}].weight must be >= 0`);
      });
    } else {
      if (!isPosInt(e.sets))
        throw new ApiError(400, `exercises[${i}].sets must be a positive integer`);
      if (!isPosInt(e.reps))
        throw new ApiError(400, `exercises[${i}].reps must be a positive integer`);
      if (e.weight != null && !(Number(e.weight) >= 0))
        throw new ApiError(400, `exercises[${i}].weight must be >= 0`);
    }
    if (e.restSeconds != null && !(Number.isInteger(e.restSeconds) && e.restSeconds >= 0))
      throw new ApiError(400, `exercises[${i}].restSeconds must be an integer >= 0`);
  });

  // exercises must exist
  const ids = [...new Set(exercises.map((e) => e.exerciseId))];
  const { rows: found } = await pool.query(
    "SELECT exercise_id FROM exercises WHERE exercise_id = ANY($1)",
    [ids],
  );
  const foundIds = new Set(found.map((r) => r.exercise_id));
  const missing = ids.filter((id) => !foundIds.has(id));
  if (missing.length) {
    throw new ApiError(404, `Unknown exerciseId(s): ${missing.join(", ")}`);
  }

  // assignment rules
  let assignTo = null;
  if (clientId != null) {
    assignTo = String(clientId);
    if (role === "client" && assignTo !== userId) {
      throw new ApiError(403, "Clients can only assign workouts to themselves");
    }
    if (role === "trainer") {
      const { rows } = await pool.query(
        `SELECT 1 FROM coach_clients
         WHERE trainer_id = $1 AND client_id = $2 AND status = 'active'`,
        [userId, assignTo],
      );
      if (!rows.length) throw new ApiError(403, "Client is not actively assigned to you");
    }
    if (role === "admin") {
      const { rows } = await pool.query("SELECT 1 FROM users WHERE user_id = $1", [assignTo]);
      if (!rows.length) throw new ApiError(404, "Client not found");
    }
  }

  const db = await pool.connect();
  try {
    await db.query("BEGIN");

    const { rows: [workout] } = await db.query(
      `INSERT INTO workouts (created_by, name, description)
       VALUES ($1, $2, $3)
       RETURNING workout_id, created_by, name, description, created_at`,
      [userId, name.trim(), description ?? null],
    );

    const savedExercises = [];
    for (const [i, e] of exercises.entries()) {
      const setDetails = Array.isArray(e.sets)
        ? e.sets
        : Array.from({ length: e.sets }, () => ({ reps: e.reps, weight: e.weight }));
      const { rows: [row] } = await db.query(
        `INSERT INTO workout_exercises
           (workout_id, exercise_id, exercise_order, target_sets, target_reps, target_weight, rest_seconds)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING workout_exercise_id, exercise_id, exercise_order,
                   target_sets, target_reps, target_weight, rest_seconds`,
        [workout.workout_id, e.exerciseId, i + 1, setDetails.length, setDetails[0].reps, setDetails[0].weight ?? null, e.restSeconds ?? null],
      );
      for (const [setIndex, set] of setDetails.entries()) {
        await db.query(
          `INSERT INTO workout_exercise_sets (workout_exercise_id, set_number, reps, weight)
           VALUES ($1, $2, $3, $4)`,
          [row.workout_exercise_id, setIndex + 1, set.reps, set.weight ?? null],
        );
      }
      savedExercises.push({ ...row, sets: setDetails });
    }

    let assignment = null;
    if (assignTo) {
      const { rows: [a] } = await db.query(
        `INSERT INTO workout_assignments (workout_id, client_id, assigned_by)
         VALUES ($1, $2, $3)
         RETURNING assignment_id, client_id, assigned_by, assigned_date, status`,
        [workout.workout_id, assignTo, userId],
      );
      assignment = a;
    }

    await db.query("COMMIT");

    return res
      .status(201)
      .json(new ApiResponse(201, { ...workout, exercises: savedExercises, assignment }, "Workout created"));
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  } finally {
    db.release();
  }
});

export const getWorkout = asyncHandler(async (req, res) => {
  const { workoutId } = req.params;
  const { user_id: userId, role } = req.user;

  const { rows: [workout] } = await pool.query(
    "SELECT * FROM workouts WHERE workout_id = $1",
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

  const { rows: exercises } = await pool.query(
    `SELECT we.exercise_order, we.exercise_id, e.name, e.gif_url,
            we.target_sets, we.target_reps, we.target_weight, we.rest_seconds,
            COALESCE(
              json_agg(
                json_build_object('setNumber', wes.set_number, 'reps', wes.reps, 'weight', wes.weight)
                ORDER BY wes.set_number
              ) FILTER (WHERE wes.workout_exercise_set_id IS NOT NULL),
              '[]'::json
            ) AS sets
     FROM workout_exercises we
     JOIN exercises e ON e.exercise_id = we.exercise_id
     LEFT JOIN workout_exercise_sets wes ON wes.workout_exercise_id = we.workout_exercise_id
     WHERE we.workout_id = $1
     GROUP BY we.workout_exercise_id, we.exercise_order, we.exercise_id, e.name, e.gif_url,
              we.target_sets, we.target_reps, we.target_weight, we.rest_seconds
     ORDER BY we.exercise_order`,
    [workoutId],
  );

  return res.json(new ApiResponse(200, { ...workout, exercises }, "Workout fetched"));
});
