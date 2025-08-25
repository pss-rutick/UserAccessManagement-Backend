"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// C:\PSS\UAM-backend\src\routes\users.ts
const express_1 = require("express");
const userService_1 = require("../services/userService");
const firebase_1 = require("../firebase");
const router = (0, express_1.Router)();
// Get all users
router.get("/", async (req, res) => {
    try {
        const search = req.query.search;
        const users = await (0, userService_1.getAllUsers)(search);
        res.json({
            success: true,
            count: users.length,
            users: users
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});
// Get user by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userDoc = await firebase_1.db.collection("users").doc(id).get();
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
    }
    catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});
// Create user
router.post("/", async (req, res) => {
    try {
        const { name, email, status, accessLevel } = req.body;
        if (!name || !email) {
            return res.status(400).json({ error: "Name and Email are required" });
        }
        const userData = { name, email, status, accessLevel };
        const newUser = await (0, userService_1.createUserInFirebase)(userData);
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Failed to create user" });
    }
});
// Update user
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await firebase_1.db.collection("users").doc(id).update(req.body);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update user" });
    }
});
// Delete user
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await firebase_1.db.collection("users").doc(id).delete();
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete user" });
    }
});
exports.default = router;
