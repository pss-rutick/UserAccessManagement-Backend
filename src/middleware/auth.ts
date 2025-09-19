import { Request, Response, NextFunction } from "express";
import { admin } from "../firebaseAdmin";
import { getFirebaseDb } from "./firebase";

export interface AuthedRequest extends Request {
  firebaseUser?: admin.auth.DecodedIdToken;
  isAdmin?: boolean;
}

const extractBearer = (header?: string | string[]): string | null => {
  if (!header) return null;
  const value = Array.isArray(header) ? header[0] : header;
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
};

export const authenticate = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractBearer(req.headers.authorization as any);
    if (!token) return res.status(401).json({ message: "Missing bearer token" });

    const decoded = await admin.auth().verifyIdToken(token, true);
    req.firebaseUser = decoded;
    next();
  } catch (e: any) {
    return res.status(401).json({ message: e?.message || "Invalid token" });
  }
};

export const requireAdmin = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.firebaseUser) return res.status(401).json({ message: "Unauthenticated" });

    const allowList = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const email = (req.firebaseUser.email || "").toLowerCase();
    let isAdmin = req.firebaseUser.admin === true || allowList.includes(email);

    if (!isAdmin) {
      const db = getFirebaseDb();
      const roleDoc = await db.collection("userRoles").doc(req.firebaseUser.uid).get();
      const role = roleDoc.exists ? (roleDoc.data()?.role as string) : null;
      isAdmin = role === "admin";
    }

    if (!isAdmin) return res.status(403).json({ message: "Not an admin" });
    req.isAdmin = true;
    next();
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "Failed to verify role" });
  }
};
