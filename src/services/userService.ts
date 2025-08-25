//C:\PSS\UAM-backend\src\services\userService.ts
import { db } from "../firebase";

export interface MobileUser {
  name: string;
  email: string;
  status: "active" | "inactive";
  accessLevel: "standard" | "premium" | "admin";
  currentStage?: number;
  score?: number;
  uid?: string;
  created?: FirebaseFirestore.Timestamp;
  lastActive?: FirebaseFirestore.Timestamp;
  joinedAt?: FirebaseFirestore.Timestamp;
  id?: string;
}

// Create a new user
export const createUserInFirebase = async (user: MobileUser) => {
  try {
    const newUser = {
      ...user,
      currentStage: user.currentStage || 1,
      score: user.score || 0,
      created: new Date(),
      lastActive: new Date(),
      joinedAt: new Date(),
    };

    const docRef = await db.collection("users").add(newUser);
    return { id: docRef.id, ...newUser };
  } catch (err: any) {
    console.error("Error creating user:", err);
    throw new Error(err.message || "Failed to create user");
  }
};

// Get all users
export const getAllUsers = async (search?: string): Promise<MobileUser[]> => {
  try {
    const snapshot = await db.collection("users").get();

    let users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        email: data.email || "",
        status: data.status || "active",
        accessLevel: data.accessLevel || "standard",
        currentStage: data.currentStage || 1,
        score: data.score || 0,
        uid: data.uid,
        created: data.created,
        lastActive: data.lastActive,
        joinedAt: data.joinedAt || data.created, // fallback to created if joinedAt doesn't exist
      } as MobileUser;
    });

    if (search) {
      users = users.filter((user: MobileUser) =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return users;
  } catch (err: any) {
    console.error("Error fetching users:", err);
    throw new Error(err.message || "Failed to fetch users");
  }
};
