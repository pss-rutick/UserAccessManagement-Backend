// C:\PSS\UAM-backend\src\routes\PersonalDetailsContext.ts
import express, { Request, Response } from "express";
import admin from "firebase-admin";

const router = express.Router();

// This route fetches all user profile data from the userActivity collection.
router.get("/user-profile/:uid", async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const firestore = admin.firestore();

    const userActivityDoc = await firestore.collection("userActivity").doc(uid).get();
    
    if (!userActivityDoc.exists) {
      return res.status(404).json({ message: "User profile not found." });
    }

    const personalData = userActivityDoc.data();

    return res.status(200).json(personalData);
  } catch (error) {
    console.error("Error fetching user profile data:", error);
    return res.status(500).json({ message: "Failed to fetch user profile data." });
  }
});

export default router;