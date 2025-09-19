"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebase_1 = require("../middleware/firebase");
const router = (0, express_1.Router)();
router.post("/", firebase_1.requireFirebase, async (req, res) => {
    try {
        const { message, userId } = req.body;
        const db = (0, firebase_1.getFirebaseDb)();
        const ref = await db.collection("activities").add({
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
