"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = __importDefault(require("../firebase"));
async function setAdminRole(uid) {
    try {
        await firebase_1.default.auth().setCustomUserClaims(uid, { admin: true });
        console.log(`✅ Admin role set for user: ${uid}`);
    }
    catch (error) {
        console.error("❌ Error setting admin role:", error);
    }
}
// 👉 Replace with your Firebase User UIDs
const adminUIDs = [
    "P3iY3BnhU5eYRw0ASWbgY457NTL2"
];
adminUIDs.forEach((uid) => setAdminRole(uid));
