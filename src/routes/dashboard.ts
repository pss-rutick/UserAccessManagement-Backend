// Dashboard statistics routes
import { Router } from "express";
import { db } from "../firebase";

const router = Router();

// Get dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const [usersSnapshot, sessionsSnapshot] = await Promise.all([
      db.collection("users").get(),
      db.collection("sessions").get() // We'll create this collection for session tracking
    ]);

    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data };
    });
    const sessions = sessionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data };
    });

    // Calculate stats
    const totalUsers = users.length;
    const activeUsers = users.filter((user: any) => user.status === "active").length;
    const inactiveUsers = users.filter((user: any) => user.status === "inactive").length;

    // Calculate users by access level
    const standardUsers = users.filter((user: any) => user.accessLevel === "standard").length;
    const premiumUsers = users.filter((user: any) => user.accessLevel === "premium").length;
    const adminUsers = users.filter((user: any) => user.accessLevel === "admin").length;

    // Calculate average score
    const totalScore = users.reduce((sum: number, user: any) => sum + (user.score || 0), 0);
    const avgScore = totalUsers > 0 ? Math.round(totalScore / totalUsers) : 0;

    // Daily sessions (sessions from last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailySessions = sessions.filter((session: any) => {
      const sessionDate = session.created?.toDate() || new Date(session.created);
      return sessionDate >= yesterday;
    }).length;

    // Recent activity (users active in last 24 hours)
    const recentActiveUsers = users.filter((user: any) => {
      const lastActive = user.lastActive?.toDate() || new Date(user.lastActive);
      return lastActive >= yesterday;
    }).length;

    // Growth stats (comparing to previous month - mock for now)
    const totalUsersGrowth = "+12% from last month";
    const activeUsersGrowth = "+8% from last month";
    const dailySessionsGrowth = "+24% from yesterday";
    const avgScoreGrowth = "+3 from last week";

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        dailySessions,
        avgScore,
        recentActiveUsers,
        usersByLevel: {
          standard: standardUsers,
          premium: premiumUsers,
          admin: adminUsers
        },
        growth: {
          totalUsers: totalUsersGrowth,
          activeUsers: activeUsersGrowth,
          dailySessions: dailySessionsGrowth,
          avgScore: avgScoreGrowth
        }
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch dashboard statistics" 
    });
  }
});

// Get recent users (last 10 users)
router.get("/recent-users", async (req, res) => {
  try {
    const snapshot = await db.collection("users")
      .orderBy("created", "desc")
      .limit(10)
      .get();

    const recentUsers = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        status: data.status,
        accessLevel: data.accessLevel,
        created: data.created,
        lastActive: data.lastActive
      };
    });

    res.json({
      success: true,
      users: recentUsers
    });
  } catch (error) {
    console.error("Error fetching recent users:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch recent users" 
    });
  }
});

// Get activity feed
router.get("/activity", async (req, res) => {
  try {
    // For now, we'll create mock activity data
    // In a real app, you'd have an activities collection
    const activities = [
      {
        id: "1",
        type: "user_signup",
        description: "New user Jane Smith joined",
        timestamp: new Date(),
        icon: "person_add"
      },
      {
        id: "2", 
        type: "user_upgrade",
        description: "John Doe upgraded to Premium",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: "upgrade"
      },
      {
        id: "3",
        type: "session_complete",
        description: "Admin User completed Stage 5",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        icon: "task_alt"
      },
      {
        id: "4",
        type: "user_inactive",
        description: "Test User marked as inactive",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        icon: "person_off"
      }
    ];

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch activity feed" 
    });
  }
});

export default router;
