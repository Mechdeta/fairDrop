import cors from "cors";
import express from "express";
import { getClaimRepository } from "./db/repository.js";
import { arcRouter } from "./routes/arc.routes.js";
import { arkivRouter } from "./routes/arkiv.routes.js";
import { claimsRouter } from "./routes/claims.routes.js";
import { eventsRouter } from "./routes/events.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { worldRouter } from "./routes/world.routes.js";

export const app = express();

// Permissive CORS for local development, LAN devices (phones), and preview domains
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
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
    phase: "production-integrated",
    status: "running",
    partners: {
      worldId: "v4-verified",
      arkiv: "db-chain-indexed",
      arc: "usdc-settlement-ready",
    },
  });
});

app.use("/api/health", healthRouter);
app.use("/api/world", worldRouter);
app.use("/api/events", eventsRouter);
app.use("/api/claims", claimsRouter);
app.use("/api/arkiv", arkivRouter);
app.use("/api/arc", arcRouter);
