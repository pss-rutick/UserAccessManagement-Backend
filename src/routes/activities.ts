import { Router } from "express";
import { db } from "../firebase";

const router = Router();

router.get("/", async (req, res) => {
  try {
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
