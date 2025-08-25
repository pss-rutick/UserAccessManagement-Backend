// src/routes/mobileUsers.ts
import { Router } from "express";
import { createUserInFirebase, getAllUsers, MobileUser } from "../services/userService";

const router = Router();

// Create new user
router.post("/", async (req, res) => {
  try {
    const userData: MobileUser = req.body;
    const newUser = await createUserInFirebase(userData);
    res.status(201).json(newUser);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to create user" });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const search = req.query.search as string | undefined;
    const users = await getAllUsers(search);
    res.json({ users }); // Return in { users: [...] } format
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to fetch users" });
  }
});

export default router;