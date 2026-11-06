import cors from "cors";
import express from "express";
import { healthRouter } from "./routes/health.routes.js";

export const app = express();

const allowedOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.get("/", (_request, response) => {
  response.json({
    name: "FairDrop API",
    phase: "world-first",
    status: "running",
  });
});

app.use("/api/health", healthRouter);
