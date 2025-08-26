// src/firebase.ts
import * as admin from "firebase-admin";

// Construct service account from environment variables
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
};

// Initialize Firebase only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

// Export Firebase services
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage().bucket();

export default admin;

