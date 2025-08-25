// src/firebase.ts
import * as admin from "firebase-admin";

// Load service account key (JSON with project_id, private_key, client_email, etc.)
import serviceAccount from "../serviceAccountKey.json";

// Initialize Firebase only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: `${(serviceAccount as any).project_id}.appspot.com`, // keep snake_case for JSON
  });
}

// Export Firebase services
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage().bucket();

// const firebaseConfig = {
//   apiKey: "AIzaSyAHnY_DkFNlW-Tf5s3-7gm4CiRmTZFeOxc",
//   authDomain: "fertiwell-ba75e.firebaseapp.com",
//   projectId: "fertiwell-ba75e",
//   storageBucket: "fertiwell-ba75e.firebasestorage.app",
//   messagingSenderId: "246698056314",
//   appId: "1:246698056314:android:e8b8c8f8f8f8f8f8f8f8f8", // Replace with actual
//   measurementId: "G-1234567890",
// };