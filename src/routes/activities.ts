import { Router } from "express";
import { requireFirebase, getFirebaseDb } from "../middleware/firebase";

const router = Router();

router.get("/", requireFirebase, async (req, res) => {
  try {
    const db = getFirebaseDb();
    const snapshot = await db
      .collection("activities")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    const activities = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

export default router;
