"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
require("dotenv/config");
// Import Firebase to ensure initialization
const firebase_1 = require("./firebase");
// Routers
const stats_1 = __importDefault(require("./routes/stats"));
const users_1 = __importDefault(require("./routes/users"));
const activities_1 = __importDefault(require("./routes/activities"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
// ---------------------- Middlewares ----------------------
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173"],
    credentials: false,
}));
app.use(body_parser_1.default.json());
// ---------------------- Health Check ----------------------
app.get("/health", async (req, res) => {
    try {
        let firebaseStatus = false;
        if (firebase_1.db) {
            await firebase_1.db.listCollections();
            firebaseStatus = true;
        }
        res.status(200).json({
            status: "ok",
            firebase: firebaseStatus,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
        });
    }
    catch (error) {
        console.error("Health check failed:", error);
        res.status(500).json({
            status: "error",
            firebase: false,
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
        });
    }
});
// ---------------------- API Routes ----------------------
app.use("/api", auth_1.default);
app.use("/api/dashboard", dashboard_1.default);
app.use("/api/stats", stats_1.default);
app.use("/api/mobile-users", users_1.default);
app.use("/api/activities", activities_1.default);
app.use("/api/notifications", notifications_1.default);
// ---------------------- Global Error Handler ----------------------
app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.message);
    res.status(500).json({
        error: process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message,
        timestamp: new Date().toISOString(),
    });
});
// ---------------------- Server Startup ----------------------
const BASE_PORT = Number(process.env.PORT) || 5000;
/**
 * Try to start the server on a given port.
 * If the port is busy, it will try the next one.
 */
const startServer = (port) => {
    let server = app.listen(port, () => {
        console.log(`🚀 Boss Server running on http://localhost:${port}`);
        console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`🔥 Firebase Project: ${process.env.FIREBASE_PROJECT_ID || "Not configured"}`);
        console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || "*"}`);
    });
    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.log(`❌ Port ${port} is already in use`);
            const nextPort = port + 1;
            console.log(`🔄 Trying port ${nextPort}...`);
            startServer(nextPort);
        }
        else {
            throw err;
        }
    });
};
startServer(BASE_PORT);
exports.default = app;
