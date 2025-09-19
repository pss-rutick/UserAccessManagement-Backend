// C:\PSS\UAM-backend\src\routes\dashboardRoutes.ts
import express, { Request, Response } from "express";
import admin from "firebase-admin";

const router = express.Router();

router.get("/dashboard-stats", async (req: Request, res: Response) => {
  try {
    const firestore = admin.firestore();

    // 1. Fetch data from all relevant collections concurrently
    const [
      usersSnapshot,
      userActivitySnapshot,
      authUsersResult
    ] = await Promise.all([
      firestore.collection("users").get(),
      firestore.collection("userActivity").get(),
      admin.auth().listUsers()
    ]);

    // 2. Map data for easier access
    const usersMap: Record<string, any> = {};
    usersSnapshot.forEach((doc) => {
      usersMap[doc.id] = doc.data();
    });

    const userActivityMap: Record<string, any> = {};
    userActivitySnapshot.forEach((doc) => {
      userActivityMap[doc.id] = doc.data();
    });
    
    // 3. Initialize all counters and accumulators
    let totalParticipants = 0;
    let totalActiveUsers = 0;
    let totalPendingUsers = 0;
    let totalInactiveUsers = 0;
    let totalStreaks = 0;
    let totalMoodScore = 0;
    let chaptersUnlockedToday = 0;
    let totalOverallProgress = 0;
    let meditationVideoUsers = new Set<string>();
    let incompleteSessions = 0;
    let journalsSubmitted = 0;
    let streakBreaksThisWeek = 0;
    let completed28DaysMilestone = 0;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();

    // 4. Iterate over Firebase Auth users for core metrics
    for (const userRecord of authUsersResult.users) {
      const { uid, metadata } = userRecord;
      const firestoreUser = usersMap[uid];
      const firestoreActivity = userActivityMap[uid];

      if (!firestoreUser) {
        // User exists in Auth but not in Firestore, treat as Pending
        totalPendingUsers++;
        continue;
      }
      totalParticipants++;

      // a. Active, Inactive, and Pending status
      const lastSignInTime = metadata.lastSignInTime ? new Date(metadata.lastSignInTime).getTime() : 0;
      if (lastSignInTime) {
        const diffInDays = (now.getTime() - lastSignInTime) / (1000 * 3600 * 24);
        if (diffInDays < 7) {
          totalActiveUsers++;
        } else {
          totalInactiveUsers++;
        }
      } else {
        totalPendingUsers++;
      }

      // b. Accumulate other metrics from userActivity data
      if (firestoreActivity) {
        totalStreaks += firestoreActivity.streak || 0;
        totalOverallProgress += firestoreActivity.progress || 0;
        
        // c. Check for 28-day milestone
        if (firestoreActivity.completed28Days === true) {
          completed28DaysMilestone++;
        }

        // d. Check for streak breaks this week
        if (firestoreActivity.streakBreakDate) {
          const breakDate = new Date(firestoreActivity.streakBreakDate).getTime();
          if (breakDate >= oneWeekAgo && breakDate <= now.getTime()) {
            streakBreaksThisWeek++;
          }
        }
        
        // e. Daily digest and progress
        if (firestoreActivity.activities) {
          firestoreActivity.activities.forEach((activity: any) => {
            // Unlocked chapters today
            const activityDate = new Date(activity.date).getTime(); // Assuming a 'date' field exists
            if (activity.activityType === "ChapterUnlocked" && activityDate >= startOfToday) {
              chaptersUnlockedToday++;
            }
            // Count meditation videos and journals
            if (activity.activityType === "MeditationVideo" && activity.isCompleted) {
              meditationVideoUsers.add(uid); // Use a Set to count unique users
            }
            if (activity.activityType === "JournalSubmitted") {
              journalsSubmitted++;
            }
          });
        }
        
        // f. Mood score and incomplete sessions
        if (firestoreActivity.moodScores) {
          const scores = Object.values(firestoreActivity.moodScores);
          const sum = scores.reduce((acc: number, val: any) => acc + (val.score || 0), 0);
          totalMoodScore += sum;
        }

        // Assuming a specific way to track incomplete sessions
        if (firestoreActivity.incompleteSessions) {
          incompleteSessions += firestoreActivity.incompleteSessions.length;
        }
      }
    }

    const stats = {
      totalActiveUsers,
      totalInactiveUsers,
      totalPendingUsers,
      totalParticipants: totalActiveUsers + totalInactiveUsers + totalPendingUsers,
      averageStreakLength: totalParticipants > 0 ? (totalStreaks / totalParticipants).toFixed(2) : "0",
      averageMoodScore: totalParticipants > 0 ? (totalMoodScore / totalParticipants).toFixed(2) : "0",
      chaptersUnlockedToday,
      overallProgress: totalParticipants > 0 ? (totalOverallProgress / totalParticipants).toFixed(2) : "0",
      inactiveForDays: totalInactiveUsers, // Same as totalInactiveUsers
      streakBreaks: streakBreaksThisWeek,
      milestones: completed28DaysMilestone,
      meditationVideoUsers: meditationVideoUsers.size,
      incompleteSessions,
      journalsSubmitted,
    };

    res.json(stats);
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: error.message || "Unknown error" });
  }
});

export default router;