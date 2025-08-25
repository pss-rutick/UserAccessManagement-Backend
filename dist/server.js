"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
// Import Firebase to ensure initialization
const firebase_1 = require("./firebase");
// Routers
const stats_1 = __importDefault(require("./routes/stats"));
const users_1 = __importDefault(require("./routes/users"));
const activities_1 = __importDefault(require("./routes/activities"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Health check endpoint
app.get("/health", async (req, res) => {
    try {
        // Quick Firestore check
        await firebase_1.db.listCollections();
        res.status(200).json({ status: "ok", firebase: true });
    }
    catch (error) {
        res.status(500).json({ status: "error", firebase: false, error });
    }
});
// API Routes
app.use("/api/stats", stats_1.default);
app.use("/api/mobile-users", users_1.default);
app.use("/api/activities", activities_1.default);
app.use("/api/notifications", notifications_1.default);
// Global error handler
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.message);
    res.status(500).json({ error: err.message });
});
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Boss Server running on http://localhost:${PORT}`);
});
exports.default = app;
