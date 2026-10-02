import { Router } from "express";
import { searchExercises } from "../controllers/exercise.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

export const exerciseRouter = Router();

exerciseRouter.get("/", verifyJWT, searchExercises);
