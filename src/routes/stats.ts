import { Router } from "express";
import { requireFirebase, getFirebaseDb } from "../middleware/firebase";

const router = Router();

router.post("/", requireFirebase, async (req, res) => {
  try {
    const { message, userId } = req.body;
    const db = getFirebaseDb();

    const ref = await db.collection("activities").add({
      message,
      userId,
      createdAt: new Date(),
    });

    res.status(201).json({ id: ref.id });
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ error: "Failed to create activity" });
  }
});

export default router;
