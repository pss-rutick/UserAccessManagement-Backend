// C:\PSS\UAM-backend\src\routes\dashboardRoutes.ts
import express, { Request, Response } from "express";
import admin from "firebase-admin";

const router = express.Router();

// Helper function to determine user status based on last sign-in time
function getStatus(lastSignInTime?: string | number): 'Active' | 'Inactive' | 'Pending' {
    if (!lastSignInTime) {
        return 'Pending';
    }
    const last = new Date(lastSignInTime);
    const now = new Date();
    const diffInDays = (now.getTime() - last.getTime()) / (1000 * 3600 * 24);
    if (diffInDays < 7) {
        return 'Active';
    }
    return 'Inactive';
}

router.get("/dashboard-stats", async (req: Request, res: Response) => {
  try {
    const firestore = admin.firestore();

    const [
      usersSnapshot,
      userActivitySnapshot,
      authUsersResult
    ] = await Promise.all([
      firestore.collection("users").get(),
      firestore.collection("userActivity").get(),
      admin.auth().listUsers()
    ]);

    const usersMap: Record<string, any> = {};
    usersSnapshot.forEach((doc) => {
      usersMap[doc.id] = doc.data();
    });

    const userActivityMap: Record<string, any> = {};
    userActivitySnapshot.forEach((doc) => {
      userActivityMap[doc.id] = doc.data();
    });

    const authUsersMap: Record<string, any> = {};
    authUsersResult.users.forEach((user) => {
        authUsersMap[user.uid] = user;
    });
    
    let totalUsers = 0;
    let totalActiveUsers = 0;
    let totalPendingUsers = 0;
    let totalInactiveUsers = 0;
    let totalMoodScore = 0;
    let totalMoodEntries = 0;
    let totalOverallProgress = 0;
    let totalProgressEntries = 0;
    let totalStreakLength = 0;
    let totalStreakEntries = 0;
    let chaptersUnlockedToday = 0;
    let incompleteSessions = 0;
    let journalsSubmitted = 0;
    let streakBreaks = 0;
    let milestones = 0;
    let meditationVideoUsers = new Set<string>();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const oneWeekAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);

    for (const userId in usersMap) {
        const firestoreUser = usersMap[userId];

        // Skip admin users
        if (firestoreUser.role === 'admin') {
            continue;
        }

        totalUsers++;
        
        // Get lastSignInTime from Firebase Auth data
        const authUser = authUsersMap[userId];
        const lastSignInTime = authUser?.metadata?.lastSignInTime;

        // Use the new getStatus function logic
        const status = getStatus(lastSignInTime);
        if (status === 'Active') {
            totalActiveUsers++;
        } else if (status === 'Inactive') {
            totalInactiveUsers++;
        } else {
            totalPendingUsers++;
        }

        const firestoreActivity = userActivityMap[userId];

        if (firestoreActivity && firestoreActivity.progress) {
          const progressEntries = Object.values(firestoreActivity.progress);
          
          let userMoodScore = 0;
          let userMoodEntries = 0;
          let userCompletedDays = 0;
          
          progressEntries.forEach((entry: any) => {
            if (entry.rating2) {
              const ratingNumber = parseInt(entry.rating2.split('/')[0]);
              if (!isNaN(ratingNumber)) {
                userMoodScore += ratingNumber;
                userMoodEntries++;
              }
            }
            if (entry.status?.toLowerCase() === 'completed') {
              userCompletedDays++;
            }
          });

          if (userMoodEntries > 0) {
            totalMoodScore += userMoodScore / userMoodEntries;
            totalMoodEntries++;
          }
          
          if (progressEntries.length > 0) {
            totalOverallProgress += (userCompletedDays / progressEntries.length) * 100;
            totalProgressEntries++;
          }

          if (firestoreActivity.streak) {
            totalStreakLength += firestoreActivity.streak;
            totalStreakEntries++;
          }
          if (firestoreActivity.streakBreakDate && new Date(firestoreActivity.streakBreakDate).getTime() > oneWeekAgo) {
            streakBreaks++;
          }
          
          if (firestoreActivity.completed28Days) {
            milestones++;
          }
          
          const todayProgress = progressEntries.find((entry: any) => 
            new Date(entry.createdAt).getTime() >= startOfToday
          ) as { status?: string, journalSubmitted?: boolean };
          
          if (todayProgress) {
            if (todayProgress.status?.toLowerCase() === 'inprogress') {
              incompleteSessions++;
            }
            if (todayProgress.journalSubmitted) {
              journalsSubmitted++;
            }
          }

          const completedMeditations = progressEntries.filter((entry: any) => 
            entry.meditationCompleted && entry.status?.toLowerCase() === 'completed'
          );
          if (completedMeditations.length > 0) {
            meditationVideoUsers.add(userId);
          }
        }
    }
    
    const averageStreakLength = totalStreakEntries > 0 ? totalStreakLength / totalStreakEntries : 0;
    const averageMoodScore = totalMoodEntries > 0 ? totalMoodScore / totalMoodEntries : 0;
    const overallProgress = totalProgressEntries > 0 ? totalOverallProgress / totalProgressEntries : 0;
    
    const stats = {
      totalUsers,
      totalActiveUsers,
      averageStreakLength: `${averageStreakLength.toFixed(1)} Days`,
      averageMoodScore: `${averageMoodScore.toFixed(1)}/5`,
      chaptersUnlockedToday,
      overallProgress,
      inactiveForDays: totalInactiveUsers,
      streakBreaks,
      milestones,
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