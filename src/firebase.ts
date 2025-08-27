import * as admin from "firebase-admin";

// Initialize Firebase only once and only if credentials are properly configured
if (!admin.apps.length) {
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];

  const missingVars = requiredEnvVars.filter(varName => 
    !process.env[varName] || 
    process.env[varName]?.startsWith('replace-with-')
  );

  if (missingVars.length > 0) {
    console.warn('⚠️  Firebase Admin SDK not initialized - missing environment variables:', missingVars);
    console.warn('🔧 Please configure Firebase environment variables to enable Firebase functionality');
  } else {
    try {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "fertiwell-72814.firebasestorage.app",
        databaseURL: process.env.FIREBASE_DATABASE_URL || `https://fertiwell-72814-default-rtdb.firebaseio.com`,
      });

      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin SDK:', error);
      console.error('🔧 Please check your Firebase environment variables');
    }
  }
}

// Export Firebase services with null checks
export const db = admin.apps.length > 0 ? admin.firestore() : null;
export const auth = admin.apps.length > 0 ? admin.auth() : null;
export const storage = admin.apps.length > 0 ? admin.storage().bucket() : null;

export default admin;
