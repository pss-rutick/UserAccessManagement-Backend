import { Router } from "express";
import { authenticate, requireAdmin, AuthedRequest } from "../middleware/auth";
import { getFirebaseDb } from "../middleware/firebase";
import { admin as firebaseAdmin } from "../firebaseAdmin";

const router = Router();

// Get current admin profile
router.get("/me", authenticate, requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const db = getFirebaseDb();
    const snap = await db.collection("adminProfiles").doc(req.firebaseUser!.uid).get();
    const profile = snap.exists ? snap.data() : null;
    res.json({ ok: true, uid: req.firebaseUser!.uid, email: req.firebaseUser!.email || null, profile });
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to fetch profile" });
  }
});

// Create or update an admin (by uid or email), set role and profile
router.post("/", authenticate, requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { uid, email, profile } = req.body as { uid?: string; email?: string; profile?: any };
    if (!uid && !email) return res.status(400).json({ message: "Provide uid or email" });

    let targetUid = uid as string;
    if (!targetUid && email) {
      const userRec = await firebaseAdmin.auth().getUserByEmail(email);
      targetUid = userRec.uid;
    }

    // Set custom claim
    await firebaseAdmin.auth().setCustomUserClaims(targetUid, { admin: true });

    const db = getFirebaseDb();

    // Persist role document
    await db.collection("userRoles").doc(targetUid).set({
      role: "admin",
      updatedAt: new Date(),
      updatedBy: req.firebaseUser!.uid,
    }, { merge: true });

    // Save admin profile
    if (profile && typeof profile === "object") {
      await db.collection("adminProfiles").doc(targetUid).set({
        ...profile,
        uid: targetUid,
        email: email || req.body.profile?.email || null,
        updatedAt: new Date(),
        updatedBy: req.firebaseUser!.uid,
      }, { merge: true });
    }

    res.status(201).json({ ok: true, uid: targetUid });
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to add admin" });
  }
});

// List admins
router.get("/", authenticate, requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const db = getFirebaseDb();
    const rolesSnap = await db.collection("userRoles").where("role", "==", "admin").get();
    const adminUids = rolesSnap.docs.map((d) => d.id);
    const profilesSnap = await db.getAll(
      ...adminUids.map((uid) => db.collection("adminProfiles").doc(uid))
    );
    const profiles = profilesSnap.map((snap) => ({ id: snap.id, ...(snap.data() || {}) }));
    res.json({ ok: true, count: profiles.length, admins: profiles });
  } catch (e: any) {
    res.status(500).json({ message: e?.message || "Failed to list admins" });
  }
});

export default router;
