import express from "express";
import cors from "cors";
export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "FitCoach API is running",
  });
});
