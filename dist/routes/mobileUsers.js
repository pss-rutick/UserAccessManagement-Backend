"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/mobileUsers.ts
const express_1 = require("express");
const userService_1 = require("../services/userService");
const router = (0, express_1.Router)();
// Create new user
router.post("/", async (req, res) => {
    try {
        const userData = req.body;
        const newUser = await (0, userService_1.createUserInFirebase)(userData);
        res.status(201).json(newUser);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Failed to create user" });
    }
});
// Get all users
router.get("/", async (req, res) => {
    try {
        const search = req.query.search;
        const users = await (0, userService_1.getAllUsers)(search);
        res.json({ users }); // Return in { users: [...] } format
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || "Failed to fetch users" });
    }
});
exports.default = router;
