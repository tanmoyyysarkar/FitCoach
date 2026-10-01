import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new ApiError(401, "Unauthorized request");

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { userId: String(decoded.userId), role: decoded.role };
    next();
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }
});

export const requireRole = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(new ApiError(403, "Forbidden"));
  }
  next();
};