import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { userRouter } from "./routes/user.routes.js";
import { exerciseRouter } from "./routes/exercise.routes.js";
import { workoutRouter } from "./routes/workout.routes.js";
export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/users", userRouter)
app.use("/api/exercises", exerciseRouter)
app.use("/api/workouts", workoutRouter)

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "FitCoach API is running",
  });
});
