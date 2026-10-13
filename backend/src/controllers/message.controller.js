import { pool } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getPartner = async (userId, partnerId) => {
  const { rows: [relationship] } = await pool.query(
    `SELECT 1
     FROM coach_clients
     WHERE status = 'active'
       AND ((trainer_id = $1 AND client_id = $2)
         OR (trainer_id = $2 AND client_id = $1))`,
    [userId, partnerId],
  );
  if (!relationship) throw new ApiError(403, "You can only message an active coach or client");
};

const validatePartnerId = (partnerId) => {
  if (!/^\d+$/.test(String(partnerId))) throw new ApiError(400, "Invalid conversation partner");
  return String(partnerId);
};

export const listMessageContacts = asyncHandler(async (req, res) => {
  const { user_id: userId, role } = req.user;
  const relationshipColumn = role === "trainer" ? "cc.client_id" : "cc.trainer_id";
  const { rows } = await pool.query(
    `SELECT u.user_id, u.name, u.email, u.role
     FROM coach_clients cc
     JOIN users u ON u.user_id = ${relationshipColumn}
     WHERE cc.status = 'active'
       AND ${role === "trainer" ? "cc.trainer_id" : "cc.client_id"} = $1
     ORDER BY u.name ASC`,
    [userId],
  );
  return res.json(new ApiResponse(200, rows, "Message contacts fetched"));
});

export const listMessages = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const partnerId = validatePartnerId(req.params.partnerId);
  await getPartner(userId, partnerId);

  const { rows } = await pool.query(
    `SELECT m.message_id, m.sender_id, m.recipient_id, m.body, m.sent_at,
            sender.name AS sender_name
     FROM messages m
     JOIN users sender ON sender.user_id = m.sender_id
     WHERE (m.sender_id = $1 AND m.recipient_id = $2)
        OR (m.sender_id = $2 AND m.recipient_id = $1)
     ORDER BY m.sent_at ASC, m.message_id ASC`,
    [userId, partnerId],
  );
  return res.json(new ApiResponse(200, rows, "Messages fetched"));
});

export const createMessage = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const partnerId = validatePartnerId(req.params.partnerId);
  const body = typeof req.body.body === "string" ? req.body.body.trim() : "";
  if (!body) throw new ApiError(400, "Message cannot be empty");
  if (body.length > 2000) throw new ApiError(400, "Message is too long");
  await getPartner(userId, partnerId);

  const { rows: [message] } = await pool.query(
    `INSERT INTO messages (sender_id, recipient_id, body)
     VALUES ($1, $2, $3)
     RETURNING message_id, sender_id, recipient_id, body, sent_at`,
    [userId, partnerId, body],
  );
  return res.status(201).json(new ApiResponse(201, message, "Message sent"));
});
