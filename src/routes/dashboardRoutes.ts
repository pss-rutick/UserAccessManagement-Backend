// // C:\PSS\UAM-backend\src\routes\dashboardRoutes.ts
// import express, { Request, Response } from "express";
// import admin from "firebase-admin";

// const router = express.Router();

// // Helper function to determine user status based on last sign-in time and explicit firestore status
// function getStatus(lastSignInTime?: string | number | null, firestoreStatus?: any): 'Active' | 'Inactive' | 'Pending' {
//   // If admin explicitly set status === false in Firestore, treat as Pending (manual deactivation)
//   if (firestoreStatus === false) return 'Pending';

//   // If no lastSignIn information at all, treat as Inactive (frontend expects this)
//   if (!lastSignInTime) return 'Inactive';

//   const last = new Date(lastSignInTime);
//   if (isNaN(last.getTime())) return 'Inactive';

//   const now = Date.now();
//   const diffInDays = (now - last.getTime()) / (1000 * 3600 * 24);
//   return diffInDays < 7 ? 'Active' : 'Inactive';
// }

// router.get("/dashboard-stats", async (req: Request, res: Response) => {
//   try {
//     const firestore = admin.firestore();

//     // NOTE: listUsers() is paginated; for moderate user counts this may be fine.
//     const [usersSnapshot, userActivitySnapshot, authUsersResult] = await Promise.all([
//       firestore.collection("users").get(),
//       firestore.collection("userActivity").get(),
//       admin.auth().listUsers()
//     ]);

//     const usersMap: Record<string, any> = {};
//     usersSnapshot.forEach((doc) => {
//       usersMap[doc.id] = doc.data();
//     });

//     const userActivityMap: Record<string, any> = {};
//     userActivitySnapshot.forEach((doc) => {
//       userActivityMap[doc.id] = doc.data();
//     });

//     const authUsersMap: Record<string, any> = {};
//     authUsersResult.users.forEach((user) => {
//       authUsersMap[user.uid] = user;
//     });

//     let totalUsers = 0;
//     let totalActiveUsers = 0;
//     let totalPendingUsers = 0;
//     let totalInactiveUsers = 0;
//     let totalMoodSum = 0;
//     let totalMoodCount = 0;
//     let totalOverallProgress = 0;
//     let totalProgressEntries = 0;
//     let incompleteSessions = 0;
//     let journalsSubmitted = 0;
//     let milestones = 0;
//     let meditationVideoUsers = new Set<string>();

//     const now = new Date();
//     const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
//     const oneWeekAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);

//     for (const userId in usersMap) {
//       const firestoreUser = usersMap[userId];

//       // Skip admin users
//       if (firestoreUser.role === 'admin') continue;

//       totalUsers++;

//       // Prefer auth metadata lastSignInTime, fallback to Firestore fields
//       const authUser = authUsersMap[userId];
//       let lastSignInTime: string | number | null = authUser?.metadata?.lastSignInTime ?? null;

//       if (!lastSignInTime) {
//         // Check common firestore fields
//         lastSignInTime =
//           firestoreUser.lastSignIn ??
//           firestoreUser.lastActive ??
//           firestoreUser.lastLogin ??
//           firestoreUser.lastSeen ??
//           null;
//       }

//       // Use explicit Firestore status (boolean false => pending)
//       const status = getStatus(lastSignInTime, firestoreUser.status);
//       if (status === 'Active') totalActiveUsers++;
//       else if (status === 'Inactive') totalInactiveUsers++;
//       else totalPendingUsers++;

//       const firestoreActivity = userActivityMap[userId];
//       if (firestoreActivity && firestoreActivity.progress) {
//         const progressEntries = Object.values(firestoreActivity.progress) as any[];

//         // Mood aggregation (global average across all entries)
//         let userCompletedDays = 0;

//         progressEntries.forEach((entry: any) => {
//           if (entry?.rating2) {
//             // rating2 might be textual; try numeric prefix first, else skip
//             const maybeNum = parseInt(String(entry.rating2).split('/')[0], 10);
//             if (!isNaN(maybeNum)) {
//               totalMoodSum += maybeNum;
//               totalMoodCount++;
//             }
//           }
//           if (String(entry?.status || '').toLowerCase() === 'completed') {
//             userCompletedDays++;
//           }
//         });

//         if (progressEntries.length > 0) {
//           totalOverallProgress += (userCompletedDays / progressEntries.length) * 100;
//           totalProgressEntries++;
//         }
        

//         // Milestones: users who completed 28+ days, with latest completion today
//         const completedEntries = progressEntries.filter((entry: any) =>
//           String(entry?.status || '').toLowerCase() === 'completed'
//         );
//         if (completedEntries.length >= 28) {
//           const completedTimestamps = completedEntries
//             .map((entry: any) => {
//               const ts = new Date(entry?.createdAt || 0).getTime();
//               return isNaN(ts) ? -Infinity : ts;
//             })
//             .filter((ts: number) => ts > 0);
//           if (completedTimestamps.length > 0) {
//             const latestCompletion = Math.max(...completedTimestamps);
//             if (latestCompletion >= startOfToday) {
//               milestones++;
//             }
//           }
//         }

//         const todayProgress = progressEntries.find((entry: any) => {
//           const createdAt = entry?.createdAt;
//           const createdAtTs = createdAt ? new Date(createdAt).getTime() : NaN;
//           return !isNaN(createdAtTs) && createdAtTs >= startOfToday;
//         });

//         if (todayProgress) {
//           if (String(todayProgress.status || '').toLowerCase() === 'inprogress') incompleteSessions++;
//           if (todayProgress.journalSubmitted) journalsSubmitted++;
//         }

//         // Meditation: users with at least one completed meditation today
//         const todayCompletedMeditations = progressEntries.filter((entry: any) =>
//           entry?.meditationCompleted &&
//           String(entry?.status || '').toLowerCase() === 'completed' &&
//           new Date(entry?.createdAt || 0).getTime() >= startOfToday
//         );
//         if (todayCompletedMeditations.length > 0) meditationVideoUsers.add(userId);
//       }
//     }

//     const averageMoodScore = totalMoodCount > 0 ? totalMoodSum / totalMoodCount : 0;
//     const overallProgress = totalProgressEntries > 0 ? totalOverallProgress / totalProgressEntries : 0;

//     const stats = {
//       totalUsers,
//       totalActiveUsers,
//       averageMoodScore: `${averageMoodScore.toFixed(1)}/5`,
//       overallProgress,
//       inactiveForDays: totalInactiveUsers,
//       milestones,
//       meditationVideoUsers: meditationVideoUsers.size,
//       incompleteSessions,
//       journalsSubmitted,
//     };

//     res.json(stats);
//   } catch (error: any) {
//     console.error("Error fetching dashboard stats:", error);
//     res.status(500).json({ error: error.message || "Unknown error" });
//   }
// });

// export default router;