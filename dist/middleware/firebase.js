"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirebaseDb = exports.requireFirebase = void 0;
const firebase_1 = require("../firebase");
const requireFirebase = (req, res, next) => {
    if (!firebase_1.db) {
        return res.status(503).json({
            error: "Firebase is not configured. Please set up Firebase environment variables.",
            code: "FIREBASE_NOT_CONFIGURED"
        });
    }
    next();
};
exports.requireFirebase = requireFirebase;
// Helper function to get db with null check
const getFirebaseDb = () => {
    if (!firebase_1.db) {
        throw new Error("Firebase is not configured");
    }
    return firebase_1.db;
};
exports.getFirebaseDb = getFirebaseDb;
