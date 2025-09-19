// C:\PSS\UAM-backend\src\routes\PersonalDetailsContent.ts
// import express, { Request, Response } from "express";
// import admin from "firebase-admin";

// const router = express.Router();

// // This route fetches all user profile data from the userActivity collection.
// router.get("/user-profile/:uid", async (req: Request, res: Response) => {
//   try {
//     const { uid } = req.params;

//     if (!uid) {
//       return res.status(400).json({ message: "User ID is required." });
//     }

//     const firestore = admin.firestore();
//     const userActivityDoc = await firestore.collection("userActivity").doc(uid).get();
    
//     if (!userActivityDoc.exists) {
//       return res.status(404).json({ message: "User profile not found.", uid });
//     }

//     const personalData = userActivityDoc.data();
//     const timestamp = new Date().toISOString();

//     return res.status(200).json({ ...personalData, uid, fetchedAt: timestamp });
//   } catch (error) {
//     console.error("Error fetching user profile data:", error);
//     return res.status(500).json({ message: "Failed to fetch user profile data.", error: error instanceof Error ? error.message : "Unknown error" });
//   }
// });


// // This route fetches user details from the users collection.
// router.get("/users/:uid", async (req: Request, res: Response) => {
//   try {
//     const { uid } = req.params;

//     if (!uid) {
//       return res.status(400).json({ message: "User ID is required." });
//     }

//     const firestore = admin.firestore();
//     const userDoc = await firestore.collection("users").doc(uid).get();
    
//     if (!userDoc.exists) {
//       return res.status(404).json({ message: "User not found.", uid });
//     }

//     const userData = userDoc.data();
//     const timestamp = new Date().toISOString();

//     return res.status(200).json({ 
//       fullName: userData?.fullName || 'N/A',
//       email: userData?.email || 'N/A',
//       phoneNumber: userData?.phoneNumber || 'N/A',
//       uid,
//       fetchedAt: timestamp 
//     });
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     return res.status(500).json({ message: "Failed to fetch user data.", error: error instanceof Error ? error.message : "Unknown error" });
//   }
// });

// // This route fetches medical history and lifestyle psychosocial factors from the userActivity collection.
// router.get("/medical-lifestyle/:uid", async (req: Request, res: Response) => {
//   try {
//     const { uid } = req.params;

//     if (!uid) {
//       return res.status(400).json({ message: "User ID is required." });
//     }

//     const firestore = admin.firestore();
//     const userActivityDoc = await firestore.collection("userActivity").doc(uid).get();
    
//     if (!userActivityDoc.exists) {
//       return res.status(404).json({ message: "User activity data not found.", uid });
//     }

//     const segment0Data = userActivityDoc.data()?.segment0;
//     if (!segment0Data) {
//       return res.status(404).json({ message: "Segment0 data not found for the user.", uid });
//     }

//     const medicalHistory = segment0Data.medicalHistory || {};
//     const lifestylePsychosocialFactors = segment0Data.LifestylePsychosocialFactors || {};
//     const timestamp = new Date().toISOString();

//     return res.status(200).json({
//       medicalHistory,
//       lifestylePsychosocialFactors,
//       uid,
//       fetchedAt: timestamp,
//     });
//   } catch (error) {
//     console.error("Error fetching medical and lifestyle data:", error);
//     return res.status(500).json({ message: "Failed to fetch medical and lifestyle data.", error: error instanceof Error ? error.message : "Unknown error" });
//   }
// });

// // This route fetches lifestyle psychosocial factors, section profile, and medical history from the userActivity collection.
// router.get("/lifestyle-medical-profile/:uid", async (req: Request, res: Response) => {
//   try {
//     const { uid } = req.params;

//     if (!uid) {
//       return res.status(400).json({ message: "User ID is required." });
//     }

//     const firestore = admin.firestore();
//     const userActivityDoc = await firestore.collection("userActivity").doc(uid).get();
    
//     if (!userActivityDoc.exists) {
//       return res.status(404).json({ message: "User activity data not found.", uid });
//     }

//     const segment0Data = userActivityDoc.data()?.segment0;
//     if (!segment0Data) {
//       return res.status(404).json({ message: "Segment0 data not found for the user.", uid });
//     }

//     const lifestylePsychosocialFactors = segment0Data.LifestylePsychosocialFactors || {};
//     const sectionProfile = segment0Data.sectionProfile || {};
//     const medicalHistory = segment0Data.medicalHistory || {};
//     const timestamp = new Date().toISOString();

//     return res.status(200).json({
//       lifestylePsychosocialFactors,
//       sectionProfile,
//       medicalHistory,
//       uid,
//       fetchedAt: timestamp,
//     });
//   } catch (error) {
//     console.error("Error fetching lifestyle, profile, and medical data:", error);
//     return res.status(500).json({ message: "Failed to fetch lifestyle, profile, and medical data.", error: error instanceof Error ? error.message : "Unknown error" });
//   }
// });

// export default router;

import express, { Request, Response } from "express";
import admin from "firebase-admin";

const router = express.Router();

// This route fetches comprehensive user profile data including personal details, section profile, medical history, and lifestyle psychosocial factors.
router.get("/user-profile/:uid", async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const firestore = admin.firestore();

    // Fetch user details from users collection
    const userDoc = await firestore.collection("users").doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    // Fetch user activity data from userActivity collection
    const userActivityDoc = await firestore.collection("userActivity").doc(uid).get();
    if (!userActivityDoc.exists) {
      return res.status(404).json({ message: "User activity data not found.", uid });
    }

    const segment0Data = userActivityDoc.data()?.segment0 || {};
    const sectionProfile = segment0Data.sectionProfile || {};
    const medicalHistory = segment0Data.medicalHistory || {};
    const lifestylePsychosocialFactors = segment0Data.LifestylePsychosocialFactors || {};

    const timestamp = new Date().toISOString(); // 07:05 PM IST, September 19, 2025

    return res.status(200).json({
      sectionProfile: {
        fullName: userData?.fullName || 'N/A',
        email: userData?.email || 'N/A',
        phoneNumber: userData?.phoneNumber || 'N/A',
        participantId: sectionProfile.participantId || 'N/A',
        dateOfBirth: sectionProfile.dateOfBirth || 'N/A',
        dateOfJoining: sectionProfile.dateOfJoining || 'N/A',
        age: sectionProfile.age || 'N/A',
        education: sectionProfile.education || 'N/A',
        maritalStatus: sectionProfile.maritalStatus || 'N/A',
        familyType: sectionProfile.familyType || 'N/A',
        incomeRange: sectionProfile.incomeRange || 'N/A',
        designation: sectionProfile.designation || 'N/A',
      },
      medicalHistory,
      lifestylePsychosocialFactors,
      uid,
      fetchedAt: timestamp,
    });
  } catch (error) {
    console.error("Error fetching user profile data:", error);
    return res.status(500).json({ message: "Failed to fetch user profile data.", error: error instanceof Error ? error.message : "Unknown error" });
  }
});

export default router;