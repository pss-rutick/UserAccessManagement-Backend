"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.createUserInFirebase = void 0;
//C:\PSS\UAM-backend\src\services\userService.ts
const firebase_1 = require("../middleware/firebase");
// Create a new user
const createUserInFirebase = async (user) => {
    try {
        const db = (0, firebase_1.getFirebaseDb)();
        const newUser = {
            ...user,
            currentStage: user.currentStage || 1,
            score: user.score || 0,
            created: new Date(),
            lastActive: new Date(),
            joinedAt: new Date(),
        };
        const docRef = await db.collection("users").add(newUser);
        return { id: docRef.id, ...newUser };
    }
    catch (err) {
        console.error("Error creating user:", err);
        throw new Error(err.message || "Failed to create user");
    }
};
exports.createUserInFirebase = createUserInFirebase;
// Get all users
const getAllUsers = async (search) => {
    try {
        const db = (0, firebase_1.getFirebaseDb)();
        const snapshot = await db.collection("users").get();
        let users = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || "",
                email: data.email || "",
                status: data.status || "active",
                accessLevel: data.accessLevel || "standard",
                currentStage: data.currentStage || 1,
                score: data.score || 0,
                uid: data.uid,
                created: data.created,
                lastActive: data.lastActive,
                joinedAt: data.joinedAt || data.created, // fallback to created if joinedAt doesn't exist
            };
        });
        if (search) {
            users = users.filter((user) => user.email.toLowerCase().includes(search.toLowerCase()) ||
                user.name.toLowerCase().includes(search.toLowerCase()));
        }
        return users;
    }
    catch (err) {
        console.error("Error fetching users:", err);
        throw new Error(err.message || "Failed to fetch users");
    }
};
exports.getAllUsers = getAllUsers;
