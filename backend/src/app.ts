import cors from "cors";
import express from "express";
import { getClaimRepository } from "./db/repository.js";
import { claimsRouter } from "./routes/claims.routes.js";
import { eventsRouter } from "./routes/events.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { worldRouter } from "./routes/world.routes.js";

export const app = express();

const allowedOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// Initialize database repository if needed
getClaimRepository()
  .init()
  .catch((err) => {
    console.error("Warning: Database repository initialization error:", err);
  });

app.get("/", (_request, response) => {
  response.json({
    name: "FairDrop API",
    phase: "world-first",
    status: "running",
  });
});

app.use("/api/health", healthRouter);
app.use("/api/world", worldRouter);
app.use("/api/events", eventsRouter);
app.use("/api/claims", claimsRouter);
