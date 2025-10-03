// C:\PSS\UAM-backend\src\server.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import "dotenv/config";

// Import Firebase to ensure initialization
import { db } from "./firebase";

// Routers
import statsRouter from './routes/stats';
import usersRouter from './routes/users';
import activitiesRouter from './routes/activities';
import notificationsRouter from './routes/notifications';
import dashboardRouter from './routes/dashboard';
import authRouter from './routes/auth';
import adminsRouter from './routes/admins';
import listUsersRouter from './routes/listUsers';
import adminActionsRoute from './routes/adminActions';
import profileRoutes from './routes/user-profile/PersonalDetailsContent';
import dashboardRoutes from './routes/dashboardRoutes';
import userProfileRouter from './routes/user-profile/userProfile';
import day0Router from './routes/user-profile/Day0';
import day13Router from './routes/user-profile/Day13';
import day28Router from './routes/user-profile/Day28';

const app = express();

// ---------------------- Middlewares ----------------------
const defaultOrigins = ["http://localhost:5173"];
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const origins = allowedOrigins.length ? allowedOrigins : defaultOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origins.includes(origin)) return callback(null, true);
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/.test(origin);
      if (isLocalhost) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: false,
  })
);
app.use(bodyParser.json());

// ---------------------- Health Check ----------------------
app.get("/health", async (req: Request, res: Response) => {
  try {
    let firebaseStatus = false;
    if (db) {
      await db.listCollections();
      firebaseStatus = true;
    }
    
    res.status(200).json({
      status: "ok",
      firebase: firebaseStatus,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "error",
      firebase: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

// ---------------------- API Routes ----------------------
app.use("/api", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/stats", statsRouter);
app.use("/api/mobile-users", usersRouter);
app.use("/api/activities", activitiesRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/admins", adminsRouter);
app.use("/api", listUsersRouter);
app.use('/api', profileRoutes);
app.use("/api", adminActionsRoute);
app.use('/api', dashboardRoutes);
app.use('/api', userProfileRouter); 
app.use('/api/user-profile', day0Router);
app.use('/api/user-profile', day13Router);
app.use('/api/user-profile', day28Router);

// ---------------------- Global Error Handler ----------------------
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    timestamp: new Date().toISOString(),
  });
});

// ---------------------- Server Startup ----------------------
const BASE_PORT: number = Number(process.env.PORT) || 5000;

/**
 * Try to start the server on a given port.
 * If the port is busy, it will try the next one.
 */
const startServer = (port: number) => {
  let server = app.listen(port, () => {
    console.log(`🚀 Boss Server running on http://localhost:${port}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(
      `🔥 Firebase Project: ${
        process.env.FIREBASE_PROJECT_ID || "Not configured"
      }`
    );
    console.log(`🌐 CORS Origins: ${origins.join(", ")}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.log(`❌ Port ${port} is already in use`);
      const nextPort = port + 1;
      console.log(`🔄 Trying port ${nextPort}...`);
      startServer(nextPort);
    } else {
      throw err;
    }
  });
};

startServer(BASE_PORT);

export default app;
