"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebase_1 = require("../middleware/firebase");
const router = (0, express_1.Router)();
router.get("/", firebase_1.requireFirebase, async (req, res) => {
    try {
        const db = (0, firebase_1.getFirebaseDb)();
        const snapshot = await db
            .collection("activities")
            .orderBy("createdAt", "desc")
            .limit(10)
            .get();
        const activities = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        res.json(activities);
    }
    catch (error) {
        console.error("Error fetching activities:", error);
        res.status(500).json({ error: "Failed to fetch activities" });
    }
});
exports.default = router;
