import { Router, Request, Response } from "express";
import { admin } from "../firebaseAdmin";
import { getFirebaseDb } from "../middleware/firebase";

const router = Router();

const extractBearer = (header?: string | string[]): string | null => {
  if (!header) return null;
  const value = Array.isArray(header) ? header[0] : header;
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
};

const getIdTokenFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization as string | undefined;
  const bearer = extractBearer(authHeader);
  if (bearer) return bearer;
  const xHeader = (req.headers["x-firebase-token"] as string | undefined) || (req.headers["x-id-token"] as string | undefined);
  if (xHeader) return xHeader;
  const bodyToken = (req.body && (req.body.idToken || req.body.token)) as string | undefined;
  if (bodyToken && typeof bodyToken === "string") return bodyToken;
  return null;
};

router.post("/auth/admin-login", async (req: Request, res: Response) => {
  try {
    const token = getIdTokenFromRequest(req);
    if (!token) return res.status(401).json({ message: "Missing ID token" });

    const decoded = await admin.auth().verifyIdToken(token, true);

    const allowList = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const email = (decoded.email || "").toLowerCase();
    let isAdmin = decoded.admin === true || allowList.includes(email);

    if (!isAdmin) {
      const db = getFirebaseDb();
      const roleDoc = await db.collection("userRoles").doc(decoded.uid).get();
      const role = roleDoc.exists ? (roleDoc.data()?.role as string) : null;
      isAdmin = role === "admin";
    }

    if (!isAdmin) return res.status(403).json({ message: "Not an admin" });

    const db = getFirebaseDb();
    const profileSnap = await db.collection("adminProfiles").doc(decoded.uid).get();

    return res.json({ ok: true, uid: decoded.uid, email: decoded.email || null, admin: true, profile: profileSnap.exists ? profileSnap.data() : null });
  } catch (e: any) {
    return res.status(401).json({ message: e?.message || "Invalid token" });
  }
});

router.get("/auth/me", async (req: Request, res: Response) => {
  try {
    const token = getIdTokenFromRequest(req);
    if (!token) return res.status(401).json({ message: "Missing ID token" });

    const decoded = await admin.auth().verifyIdToken(token, true);

    const db = getFirebaseDb();
    const roleDoc = await db.collection("userRoles").doc(decoded.uid).get();
    const role = roleDoc.exists ? (roleDoc.data()?.role as string) : null;
    const profileSnap = await db.collection("adminProfiles").doc(decoded.uid).get();

    return res.json({ ok: true, uid: decoded.uid, email: decoded.email || null, role: role || (decoded.admin ? "admin" : "user"), profile: profileSnap.exists ? profileSnap.data() : null });
  } catch (e: any) {
    return res.status(401).json({ message: e?.message || "Invalid token" });
  }
});

export default router;
