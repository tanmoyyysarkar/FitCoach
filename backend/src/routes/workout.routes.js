import { Router } from "express";
import { createWorkout, getWorkout, listWorkouts, updateWorkout } from "../controllers/workout.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

export const workoutRouter = Router();

workoutRouter.get("/", verifyJWT, listWorkouts);
workoutRouter.post("/", verifyJWT, createWorkout);
workoutRouter.get("/:workoutId", verifyJWT, getWorkout);
workoutRouter.put("/:workoutId", verifyJWT, updateWorkout);
