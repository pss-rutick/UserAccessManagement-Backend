// C:\PSS\UAM-backend\src\routes\users.ts
import { Router } from "express";
import { createUserInFirebase, getAllUsers, MobileUser } from "../services/userService";
import { requireFirebase, getFirebaseDb } from "../middleware/firebase";

const router = Router();

// Get all users
router.get("/", requireFirebase, async (req, res) => {
  try {
    const search = req.query.search as string;
    const users = await getAllUsers(search);
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user by ID
router.get("/:id", requireFirebase, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirebaseDb();
    const userDoc = await db.collection("users").doc(id).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    res.json({
      success: true,
      user: {
        id: userDoc.id,
        ...userData
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create user
router.post("/", requireFirebase, async (req, res) => {
  try {
    const { name, email, status, accessLevel } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and Email are required" });
    }
    const userData: MobileUser = { name, email, status, accessLevel };
    const newUser = await createUserInFirebase(userData);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user (Admin operation)
router.put("/:id", requireFirebase, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const db = getFirebaseDb();

    // Check if user exists first
    const userDoc = await db.collection("users").doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add update timestamp
    const updatedData = {
      ...updateData,
      lastModified: new Date(),
    };

    await db.collection("users").doc(id).update(updatedData);

    // Get updated user data
    const updatedDoc = await db.collection("users").doc(id).get();
    const userData = updatedDoc.data();

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: updatedDoc.id,
        ...userData
      }
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Toggle user status (Admin operation)
router.patch("/:id/status", requireFirebase, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Valid status (active/inactive) is required" });
    }

    const db = getFirebaseDb();
    // Check if user exists
    const userDoc = await db.collection("users").doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    await db.collection("users").doc(id).update({
      status,
      lastModified: new Date(),
      statusChangedAt: new Date()
    });

    const updatedDoc = await db.collection("users").doc(id).get();
    const userData = updatedDoc.data();

    res.json({
      success: true,
      message: `User ${status === "active" ? "activated" : "deactivated"} successfully`,
      user: {
        id: updatedDoc.id,
        ...userData
      }
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Delete user (Admin operation)
router.delete("/:id", requireFirebase, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirebaseDb();

    // Check if user exists first
    const userDoc = await db.collection("users").doc(id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();

    // Delete the user
    await db.collection("users").doc(id).delete();

    res.json({
      success: true,
      message: "User deleted successfully",
      deletedUser: {
        id,
        name: userData?.name,
        email: userData?.email
      }
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
