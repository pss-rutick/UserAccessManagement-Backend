// C:\PSS\UAM-backend\routes\userProfile.ts
import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { db } from '../firebase';

const router = express.Router();

interface UserProfileResponse {
  uid: string;
  email: string | null;
  createdAt: string;
  lastSignIn: string;
  fullName: string | null; // Explicitly include fullName
  profile: {
    age: string | null;
    participantId: string | null;
  };
  streak: number;
  chapterNo: number;
  progress: number;
}

interface SectionProfile {
  age?: string;
  participantId?: string;
}

router.get("/user-profile", async (req: Request, res: Response) => {
  const uid = req.query.uid as string;
  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  try {
    const userRecord = await admin.auth().getUser(uid);
    const firestore = admin.firestore();
    const userDoc = await firestore.collection("users").doc(uid).get();
    
    let profileData: { age: string | null; participantId: string | null; } = { age: null, participantId: null };
    let fullName: string | null = null;
    let streak = 0;
    let progress = 0;

    if (userDoc.exists) {
      const data = userDoc.data();
      fullName = data?.fullName || data?.userName || null; // Prioritize fullName
      profileData = {
        age: data?.age || null,
        participantId: data?.participantId || null,
      };
      streak = data?.streak || 0;
      progress = data?.progress || 0;
    }

    const combinedUser: UserProfileResponse = {
      uid: userRecord.uid,
      email: userRecord.email ?? null,
      createdAt: userRecord.metadata.creationTime,
      lastSignIn: userRecord.metadata.lastSignInTime,
      fullName,
      profile: profileData,
      streak,
      chapterNo: 1,
      progress,
    };

    res.json(combinedUser);
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: error.message || "Unknown error" });
  }
});

// router.get("/user-profile", async (req: Request, res: Response) => {
//   const uid = req.query.uid as string;
//   if (!uid) {
//     return res.status(400).json({ error: "Missing uid" });
//   }

//   try {
//     // 1. Get Firebase Auth user
//     const userRecord = await admin.auth().getUser(uid);

//     const authUser = {
//       uid: userRecord.uid,
//       email: userRecord.email ?? null,
//       createdAt: userRecord.metadata.creationTime,
//       lastSignIn: userRecord.metadata.lastSignInTime,
//     };

//     // 2. Get Firestore profile from "users" collection
//     const firestore = admin.firestore();
//     const userDoc = await firestore.collection("users").doc(uid).get();

//     let profile: SectionProfile | null = null;
//     let userName: string | null = null;

//     if (userDoc.exists) {
//       userName = userDoc.data()?.userName || userDoc.data()?.fullName || null; // Use userName or fullName
//       profile = {
//         age: userDoc.data()?.age || null,
//         participantId: userDoc.data()?.participantId || null,
//       };
//     }

//     // 3. Build full user object
//     const combinedUser = {
//       ...authUser,
//       userName, // Add userName to the response
//       profile,
//       streak: 0,
//       chapterNo: 1,
//       progress: 0,
//     };

//     res.json(combinedUser);
//   } catch (error: any) {
//     console.error("Error fetching user profile:", error);
//     res.status(500).json({ error: error.message || "Unknown error" });
//   }
// });

// Optional: Keep the existing /user-profile/:uid route if needed
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

router.get('/user/:uid', async (req, res) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({ error: 'User ID (uid) is required' });
  }

  try {
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    // Ensure that the fullName field exists before sending
    if (userData && userData.fullName) {
      res.status(200).json({ fullName: userData.fullName });
    } else {
      // You can also send the full user data if needed
      res.status(200).json(userData);
    }

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;