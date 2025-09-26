// C:\PSS\UAM-backend\src\routes\user-profile\userProfile.ts
import express, { Request, Response } from "express";
import admin from "firebase-admin";
import { db } from '../../firebase';

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

router.get("/user-profile/:uid", async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    const userRecord = await admin.auth().getUser(uid);
    const firestore = admin.firestore();
    const userDoc = await firestore.collection("users").doc(uid).get();

    let fullName = null;
    let profileData = { age: null, participantId: null };
    let progress = 0;

    if (userDoc.exists) {
      const data = userDoc.data();
      fullName = data?.fullName || data?.userName || null;
      profileData = {
        age: data?.age || null,
        participantId: data?.participantId || null,
      };
      progress = data?.progress || 0;
    }

    return res.json({
      uid,
      email: userRecord.email ?? null,
      createdAt: userRecord.metadata.creationTime,
      lastSignIn: userRecord.metadata.lastSignInTime,
      fullName,
      profile: profileData,
      chapterNo: 1,
      progress,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Failed to fetch user profile." });
  }
});


// // Optional: Keep the existing /user-profile/:uid route if needed
// router.get("/user-profile/:uid", async (req: Request, res: Response) => {
//   try {
//     const { uid } = req.params;
//     const firestore = admin.firestore();

//     const userActivityDoc = await firestore.collection("userActivity").doc(uid).get();
    
//     if (!userActivityDoc.exists) {
//       return res.status(404).json({ message: "User profile not found." });
//     }

//     const personalData = userActivityDoc.data();

//     return res.status(200).json(personalData);
//   } catch (error) {
//     console.error("Error fetching user profile data:", error);
//     return res.status(500).json({ message: "Failed to fetch user profile data." });
//   }
// });

router.delete("/user-profile/:uid", async (req: Request, res: Response) => {
  const { uid } = req.params;
  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  try {
    // Delete from Firebase Authentication
    await admin.auth().deleteUser(uid);

    // Delete from Firestore (users collection)
    await admin.firestore().collection("users").doc(uid).delete();

    // Optionally, delete from other collections if needed

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: error.message || "Failed to delete user." });
  }
});



router.get("/user-activity/:uid", async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ message: "Missing UID in request parameters." });
    }

    // Explicitly check if db is null or undefined
    if (!db) {
      console.error("Firebase db is not initialized.");
      return res.status(500).json({ message: "Server database not available." });
    }
    
    const userActivityDoc = await db.collection("UserActivity").doc(uid).get();

    if (!userActivityDoc.exists) {
      return res.status(404).json({ message: "User activity not found.", segment1: { sectionA: [], sectionB: [] } });
    }

    const activityData = userActivityDoc.data();
    return res.status(200).json(activityData);
  } catch (error) {
    console.error("Error fetching user activity data:", error);
    return res.status(500).json({ message: "Failed to fetch user activity data." });
  }
});

router.get("/user-activity/:uid", async (req: Request, res: Response) => {
  const { uid } = req.params;

  if (!uid) {
    return res.status(400).json({ error: "Missing UID in request parameters." });
  }

  try {
    const firestore = admin.firestore();
    const docRef = firestore.collection("UserActivity").doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      // The document for this user does not exist.
      return res.status(404).json({ message: "User activity not found." });
    }

    // Safely retrieve the data from the document.
    const activityData = docSnap.data();

    // Check if the retrieved data is not null or undefined, and then return it.
    if (activityData) {
      return res.status(200).json(activityData);
    } else {
      // This case is unlikely given the docSnap.exists check, but provides extra safety.
      return res.status(500).json({ message: "Failed to retrieve user data." });
    }
  } catch (error) {
    console.error("Error fetching user activity data:", error);
    return res.status(500).json({ message: "Failed to fetch user activity data." });
  }
});


// router.get('/users/:uid', async (req, res) => {
//   const { uid } = req.params;

//   if (!uid) {
//     return res.status(400).json({ error: 'User ID (uid) is required' });
//   }

//   try {
//     if (!db) {
//       throw new Error("Firebase db is not initialized.");
//     }
//     const userDocRef = db.collection('users').doc(uid);
//     const userDoc = await userDocRef.get();

//     if (!userDoc.exists) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const userData = userDoc.data();
    
//     if (userData && userData.fullName) {
//       res.status(200).json({ fullName: userData.fullName });
//     } else {
//       res.status(200).json(userData);
//     }

//   } catch (error) {
//     console.error('Error fetching user profile:', error);
//     res.status(500).json({ error: 'Failed to fetch user profile' });
//   }
// });




export default router;