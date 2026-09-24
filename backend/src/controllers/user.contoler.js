import bcrypt from "bcrypt";
import { pool } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
const generateAccessAndRefreshTokens = async (user_id) => {
  try {
    const {
      rows: [user],
    } = await pool.query("SELECT user_id,email FROM users WHERE user_id = $1", [
      user_id,
    ]);
    if (!user) {
      throw new Error("User not found");
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      },
    );
    const refreshToken = jwt.sign(
      {
        userId: user.id,
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
  } = await pool.query("SELECT user_id,password_hash FROM users WHERE email = $1", [
    normalizedEmail,
  ]);

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
    secure: true,
  };

  return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(new ApiResponse(200,
    {
      user : user.user_id, accessToken, refreshToken
    },
    "Logged in sucessfully."
  ))
});
