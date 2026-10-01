import express from "express";
import cors from "cors";
import { userRouter } from "./routes/user.routes.js";
export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/users", userRouter)

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "FitCoach API is running",
  });
});
