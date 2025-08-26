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
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));
app.use(bodyParser.json());

// Health check endpoint
app.get("/health", async (req: Request, res: Response) => {
  try {
    await db.listCollections();
    res.status(200).json({ 
      status: "ok", 
      firebase: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ 
      status: "error", 
      firebase: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
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
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Boss Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔥 Firebase Project: ${process.env.FIREBASE_PROJECT_ID || 'Not configured'}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
});

export default app;

