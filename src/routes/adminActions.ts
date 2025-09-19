// C:\PSS\UAM-backend\routes\adminActions.ts
import express, { Request, Response } from "express";
import admin from "firebase-admin";

const router = express.Router();

/**
 * Deactivate user
 * - We can disable login by setting `disabled: true`
 */
router.post("/deactivate-user", async (req: Request, res: Response) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: "Missing uid" });

  try {
    await admin.auth().updateUser(uid, { disabled: true });
    res.json({ success: true, message: `User ${uid} deactivated.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Delete user completely
 */
router.delete("/delete-user", async (req: Request, res: Response) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: "Missing uid" });

  try {
    await admin.auth().deleteUser(uid);
    res.json({ success: true, message: `User ${uid} deleted.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
