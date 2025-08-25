"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.createUserInFirebase = void 0;
//C:\PSS\UAM-backend\src\services\userService.ts
const firebase_1 = require("../firebase");
// Create a new user
const createUserInFirebase = async (user) => {
    try {
        const newUser = {
            ...user,
            created: new Date(),
            lastActive: new Date(),
        };
        const docRef = await firebase_1.db.collection("users").add(newUser);
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
        const snapshot = await firebase_1.db.collection("users").get();
        let users = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || "",
                email: data.email || "",
                status: data.status || "active",
                accessLevel: data.accessLevel || "standard",
                uid: data.uid,
                created: data.created,
                lastActive: data.lastActive,
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
