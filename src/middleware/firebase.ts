import { Request, Response, NextFunction } from "express";
import { db } from "../firebase";

export const requireFirebase = (req: Request, res: Response, next: NextFunction) => {
  if (!db) {
    return res.status(503).json({
      error: "Firebase is not configured. Please set up Firebase environment variables.",
      code: "FIREBASE_NOT_CONFIGURED"
    });
  }
  next();
};

// Helper function to get db with null check
export const getFirebaseDb = () => {
  if (!db) {
    throw new Error("Firebase is not configured");
  }
  return db;
};
