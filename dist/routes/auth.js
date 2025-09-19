"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebaseAdmin_1 = require("../firebaseAdmin");
const router = (0, express_1.Router)();
const extractBearer = (header) => {
    if (!header)
        return null;
    const value = Array.isArray(header) ? header[0] : header;
    const match = value.match(/^Bearer\s+(.+)$/i);
    return match ? match[1] : null;
};
router.post("/auth/admin-login", async (req, res) => {
    try {
        const token = extractBearer(req.headers.authorization);
        if (!token)
            return res.status(401).json({ message: "Missing bearer token" });
        const decoded = await firebaseAdmin_1.admin.auth().verifyIdToken(token, true);
        const allowList = (process.env.ADMIN_EMAILS || "ruticknadsule@gmail.com")
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
        const email = (decoded.email || "").toLowerCase();
        const isAdmin = decoded.admin === true || allowList.includes(email);
        if (!isAdmin)
            return res.status(403).json({ message: "Not an admin" });
        return res.json({ ok: true, uid: decoded.uid, email: decoded.email || null });
    }
    catch (e) {
        return res.status(401).json({ message: e?.message || "Invalid token" });
    }
});
exports.default = router;
