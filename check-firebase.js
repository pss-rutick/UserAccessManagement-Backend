// Simple test to check Firebase connection
console.log('Testing Firebase connection...');

try {
  // Load service account
  const serviceAccount = require('./serviceAccountKey.json');
  console.log('✅ Service account loaded');
  console.log('Project ID:', serviceAccount.project_id);
  
  // Initialize Firebase Admin
  const admin = require('firebase-admin');
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized');
  }
  
  // Test Firestore connection
  const db = admin.firestore();
  console.log('✅ Firestore instance created');
  
  // Try to list collections (this will test the connection)
  db.listCollections()
    .then(collections => {
      console.log('✅ Firebase connection successful!');
      console.log('Available collections:', collections.map(col => col.id));
      
      // Test getting users
      return db.collection('users').get();
    })
    .then(snapshot => {
      console.log(`✅ Users collection accessed. Found ${snapshot.size} users`);
      
      snapshot.forEach(doc => {
        console.log(`User ${doc.id}:`, doc.data());
      });
      
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Firebase error:', error.message);
      process.exit(1);
    });

} catch (error) {
  console.error('❌ Setup error:', error.message);
  process.exit(1);
}
