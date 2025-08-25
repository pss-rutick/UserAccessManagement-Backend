"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebase_1 = require("../firebase");
const router = (0, express_1.Router)();
// POST /api/notifications
router.post("/", async (req, res) => {
    try {
        const data = req.body;
        if (!data || !data.message || !data.userId) {
            return res.status(400).json({ error: "message and userId are required" });
        }
        const ref = await firebase_1.db.collection("notifications").add({
            ...data,
            createdAt: new Date(),
        });
        res.status(201).json({ id: ref.id, ...data });
    }
    catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ error: "Failed to create notification" });
    }
});
exports.default = router;
