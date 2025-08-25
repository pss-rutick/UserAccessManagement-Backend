"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.auth = exports.db = void 0;
// src/firebase.ts
const admin = __importStar(require("firebase-admin"));
// Load service account key (JSON with project_id, private_key, client_email, etc.)
const serviceAccountKey_json_1 = __importDefault(require("../serviceAccountKey.json"));
// Initialize Firebase only once
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey_json_1.default),
        storageBucket: `${serviceAccountKey_json_1.default.project_id}.appspot.com`, // keep snake_case for JSON
    });
}
// Export Firebase services
exports.db = admin.firestore();
exports.auth = admin.auth();
exports.storage = admin.storage().bucket();
// const firebaseConfig = {
//   apiKey: "AIzaSyAHnY_DkFNlW-Tf5s3-7gm4CiRmTZFeOxc",
//   authDomain: "fertiwell-ba75e.firebaseapp.com",
//   projectId: "fertiwell-ba75e",
//   storageBucket: "fertiwell-ba75e.firebasestorage.app",
//   messagingSenderId: "246698056314",
//   appId: "1:246698056314:android:e8b8c8f8f8f8f8f8f8f8f8", // Replace with actual
//   measurementId: "G-1234567890",
// };
