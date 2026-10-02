import { Router } from "express";
import { createSession } from "../controllers/session.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

export const sessionRouter = Router();

sessionRouter.post("/", verifyJWT, createSession);
