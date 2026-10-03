import { Router } from "express";
import { createSession, getRecentSessions } from "../controllers/session.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

export const sessionRouter = Router();

sessionRouter.post("/", verifyJWT, createSession);
sessionRouter.get("/recent", verifyJWT, getRecentSessions);
sessionRouter.get("/", verifyJWT, getRecentSessions);
