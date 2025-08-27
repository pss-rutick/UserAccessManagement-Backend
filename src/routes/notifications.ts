import { Router } from "express";
import { requireFirebase, getFirebaseDb } from "../middleware/firebase";

const router = Router();

// POST /api/notifications
router.post("/", requireFirebase, async (req, res) => {
  try {
    const data = req.body;

    if (!data || !data.message || !data.userId) {
      return res.status(400).json({ error: "message and userId are required" });
    }

    const db = getFirebaseDb();
    const ref = await db.collection("notifications").add({
      ...data,
      createdAt: new Date(),
    });

    res.status(201).json({ id: ref.id, ...data });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

export default router;
