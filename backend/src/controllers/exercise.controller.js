import { pool } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const searchExercises = asyncHandler(async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 50);
  const values = [limit];
  let where = "";

  if (query) {
    values.unshift(`%${query}%`);
    where = `WHERE name ILIKE $1
      OR EXISTS (SELECT 1 FROM unnest(body_parts) AS body_part WHERE body_part ILIKE $1)
      OR EXISTS (SELECT 1 FROM unnest(target_muscles) AS target_muscle WHERE target_muscle ILIKE $1)`;
  }

  const { rows } = await pool.query(
    `SELECT exercise_id, name, body_parts, equipments, target_muscles, gif_url, instructions
     FROM exercises
     ${where}
     ORDER BY name
     LIMIT $${values.length}`,
    values,
  );

  return res.json(new ApiResponse(200, rows, "Exercises fetched"));
});
