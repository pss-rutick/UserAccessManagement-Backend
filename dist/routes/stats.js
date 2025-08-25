"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebase_1 = require("../firebase");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    try {
        const { message, userId } = req.body;
        const ref = await firebase_1.db.collection("activities").add({
            message,
            userId,
            createdAt: new Date(),
        });
        res.status(201).json({ id: ref.id });
    }
    catch (error) {
        console.error("Error creating activity:", error);
        res.status(500).json({ error: "Failed to create activity" });
    }
});
exports.default = router;
