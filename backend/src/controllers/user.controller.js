import bcrypt from "bcrypt";
import { pool } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshTokens = async (user_id) => {
  try {
    const {
      rows: [user],
    } = await pool.query("SELECT user_id,email,role FROM users WHERE user_id = $1", [
      user_id,
    ]);
    if (!user) {
      throw new Error("User not found");
    }

    const accessToken = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      },
    );
    const refreshToken = jwt.sign(
      {
        user_id: user.user_id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      },
    );

    await pool.query(
      `UPDATE users
       SET refresh_token = $1
       WHERE user_id = $2`,
      [refreshToken, user_id],
    );

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error(error);
    throw new Error(
      "Something went wrong while generating access and refresh tokens",
    );
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, date_of_birth, gender, height } =
    req.body;

  if (
    [fullName, email, password, role].some(
      (field) => typeof field !== "string" || !field.trim(),
    )
  ) {
    throw new ApiError(
      400,
      "Full name, email, role, and password are required",
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = role.trim().toLowerCase();

  if (!["trainer", "client", "admin"].includes(normalizedRole)) {
    throw new ApiError(400, "Role must be trainer, client, or admin");
  }

  const {
    rows: [existingUser],
  } = await pool.query("SELECT user_id FROM users WHERE email = $1", [
    normalizedEmail,
  ]);

  if (existingUser) {
    throw new ApiError(409, "User with email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, date_of_birth, gender, height)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING user_id, name, email, role, date_of_birth, gender, height, created_at`,
    [
      fullName.trim(),
      normalizedEmail,
      passwordHash,
      normalizedRole,
      date_of_birth || null,
      typeof gender === "string" && gender.trim() ? gender.trim() : null,
      height ?? null,
    ],
  );

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new ApiError(400, "username or email is required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const {
    rows: [user],
  } = await pool.query(
    "SELECT user_id,password_hash,name,email,role,date_of_birth,gender,height,created_at FROM users WHERE email = $1",
    [normalizedEmail],
  );

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user.user_id,
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
            date_of_birth: user.date_of_birth,
            gender: user.gender,
            height: user.height,
            created_at: user.created_at,
          },
          accessToken,
          refreshToken,
        },
        "Logged in sucessfully.",
      ),
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  const user_id = req.user.user_id;
  await pool.query(
    `
    UPDATE users
    SET refresh_token = NULL
    WHERE user_id = $1
    `,
    [user_id],
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  return res
    .status(200)
    .clearCookie("accessToken", { ...options, httpOnly: true })
    .clearCookie("refreshToken", { ...options })
    // Also remove legacy copies an older server may have scoped to /api/users
    .clearCookie("accessToken", { ...options, path: "/api/users" })
    .clearCookie("refreshToken", { ...options, path: "/api/users" })
    .json(new ApiResponse(200, {}, "User logged Out"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const {
      rows: [user],
    } = await pool.query(
      "SELECT user_id,refresh_token FROM users WHERE user_id = $1",
      [decodedToken.user_id],
    );

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refresh_token) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user.user_id,
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      // Remove stale copies an older server may have scoped to /api/users
      .clearCookie("accessToken", { ...options, path: "/api/users" })
      .clearCookie("refreshToken", { ...options, path: "/api/users" })
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: refreshToken },
          "Access token refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export const getUser = asyncHandler(async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const {
      rows: [user],
    } = await pool.query("SELECT user_id,email,name,role,date_of_birth,gender,height FROM users WHERE user_id = $1", [
      user_id,
    ]);
    return res.status(200).json( new ApiResponse(200,user))
  } catch (error) {
    console.error(error);
    throw new Error(
      "Something went wrong while generating access and refresh tokens",
    );
  }
});

export const listClients = asyncHandler(async (req, res) => {
  const { user_id: userId, role } = req.user;
  const { rows } = await pool.query(`
    SELECT
      u.user_id,
      u.name,
      u.email,
      u.date_of_birth,
      u.gender,
      u.height,
      u.created_at,
      COUNT(s.session_id)::INT AS session_count,
      MAX(s.started_at) AS last_session_at,
      COALESCE(relationship.status, 'available') AS relationship_status
    FROM users u
    LEFT JOIN sessions s ON s.user_id = u.user_id
    LEFT JOIN LATERAL (
      SELECT cc.status
      FROM coach_clients cc
      WHERE cc.client_id = u.user_id
        AND ($1 = 'admin' OR cc.trainer_id = $2)
      ORDER BY cc.coach_client_id DESC
      LIMIT 1
    ) relationship ON true
    WHERE u.role = 'client'
    GROUP BY u.user_id, relationship.status
    ORDER BY u.name ASC
  `, [role, userId]);

  return res.status(200).json(new ApiResponse(200, rows, "Clients fetched"));
});

export const activateClient = asyncHandler(async (req, res) => {
  const { user_id: trainerId, role } = req.user;
  const { clientId } = req.params;

  if (role !== "trainer") throw new ApiError(403, "Only trainers can activate clients");
  if (!/^\d+$/.test(String(clientId))) throw new ApiError(400, "Invalid client id");

  const { rows: [client] } = await pool.query(
    "SELECT user_id FROM users WHERE user_id = $1 AND role = 'client'",
    [clientId],
  );
  if (!client) throw new ApiError(404, "Client not found");

  const { rows: [relationship] } = await pool.query(
    `INSERT INTO coach_clients (trainer_id, client_id, status, start_date, end_date)
     VALUES ($1, $2, 'active', CURRENT_DATE, NULL)
     ON CONFLICT (trainer_id, client_id) DO UPDATE
     SET status = 'active', start_date = COALESCE(coach_clients.start_date, CURRENT_DATE), end_date = NULL
     RETURNING coach_client_id, trainer_id, client_id, status, start_date, end_date`,
    [trainerId, clientId],
  );

  return res.status(200).json(new ApiResponse(200, relationship, "Client activated"));
});
