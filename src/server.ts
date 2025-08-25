// src/server.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";

// Import Firebase to ensure initialization
import { db } from "./firebase";

// Routers
import statsRouter from "./routes/stats";
import usersRouter from "./routes/users";
import activitiesRouter from "./routes/activities";
import notificationsRouter from "./routes/notifications";
import dashboardRouter from "./routes/dashboard";

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get("/health", async (req: Request, res: Response) => {
  try {
    // Quick Firestore check
    await db.listCollections();
    res.status(200).json({ status: "ok", firebase: true });
  } catch (error) {
    res.status(500).json({ status: "error", firebase: false, error });
  }
});

// API Routes
app.use("/api/dashboard", dashboardRouter);
app.use("/api/stats", statsRouter);
app.use("/api/mobile-users", usersRouter);
app.use("/api/activities", activitiesRouter);
app.use("/api/notifications", notificationsRouter);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Boss Server running on http://localhost:${PORT}`);
});

export default app;
