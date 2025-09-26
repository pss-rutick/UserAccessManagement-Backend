import express, { Request, Response } from "express";
import admin from "firebase-admin";

const router = express.Router();

// Debug log to confirm router is loaded
console.log("✅ listUsersRouter loaded");

router.get("/list-users", async (req: Request, res: Response) => {
  try {
    const firestore = admin.firestore();

    // Users
    const usersSnapshot = await firestore.collection("users").get();
    const usersData: any[] = [];
    usersSnapshot.forEach((doc) => {
      usersData.push({ uid: doc.id, ...doc.data() });
    });

    // userActivity
    const userActivitySnapshot = await firestore.collection("userActivity").get();
    const userActivityMap: Record<string, any> = {};
    userActivitySnapshot.forEach((doc) => {
      userActivityMap[doc.id] = doc.data();
    });

    // Auth users
    const listUsersResult = await admin.auth().listUsers(1000);
    const authUsersMap: Record<string, any> = {};
    listUsersResult.users.forEach((user) => {
      authUsersMap[user.uid] = {
        email: user.email ?? null,
        createdAt: user.metadata.creationTime,
        lastSignIn: user.metadata.lastSignInTime,
      };
    });

    // Combine data
    const combined = usersData.map((user) => {
      const activity = userActivityMap[user.uid] || {};
      const seg0 = activity.segment0 || {};
      const seg1 = activity.segment1 || {};
      const profile = activity.sectionProfile || {};
      const authUser = authUsersMap[user.uid] || {};

      return {
        ...user,
        ...authUser,
        profile,
        streak: user.streak || 0,
        chapterNo: user.chapterNo || 1,
        progress: user.progress || 0,
        IsSeg0Approved:
          typeof seg0.IsSeg0Approved === "boolean"
            ? seg0.IsSeg0Approved
            : user.IsSeg0Approved ?? false,
        IsSeg1Approved:
          typeof seg1.IsSeg1Approved === "boolean"
            ? seg1.IsSeg1Approved
            : user.IsSeg1Approved ?? false,
        IsSeg2Approved: user.IsSeg2Approved ?? false,
        IsSeg3Approved: user.IsSeg3Approved ?? false,
        fullName: user.fullName || authUser.email || "Unknown",
      };
    });

    res.json(combined);
  } catch (error: any) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: error.message || "Unknown error" });
  }
});

router.get("/get-user/:uid", async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const firestore = admin.firestore();

    const [userDoc, userActivityDoc] = await Promise.all([
      firestore.collection("users").doc(uid).get(),
      firestore.collection("userActivity").doc(uid).get(),
    ]);

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found." });
    }

    const userData = userDoc.data() || {};
    const userActivityData = userActivityDoc.exists ? userActivityDoc.data() || {} : {};
    const seg0 = (userActivityData as any).segment0 || {};
    const seg1 = (userActivityData as any).segment1 || {};
    const profile = (userActivityData as any).sectionProfile || {};

    const userWithAccess = {
      uid: userDoc.id,
      ...userData,
      profile,
      IsSeg0Approved:
        typeof seg0.IsSeg0Approved === "boolean"
          ? seg0.IsSeg0Approved
          : userData.IsSeg0Approved ?? false,
      IsSeg1Approved:
        typeof seg1.IsSeg1Approved === "boolean"
          ? seg1.IsSeg1Approved
          : userData.IsSeg1Approved ?? false,
      IsSeg2Approved: userData.IsSeg2Approved ?? false,
      IsSeg3Approved: userData.IsSeg3Approved ?? false,
    };

    return res.status(200).json(userWithAccess);
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
    return res.status(500).json({ message: "Failed to fetch user data." });
  }
});

export default router;

