// Script to create test users in Firestore
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function createTestUsers() {
  console.log('Creating test users in Firestore...');
  
  const testUsers = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      accessLevel: 'standard',
      currentStage: 2,
      score: 75,
      created: new Date(),
      lastActive: new Date(),
      joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'active',
      accessLevel: 'premium',
      currentStage: 3,
      score: 90,
      created: new Date(),
      lastActive: new Date(),
      joinedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
    },
    {
      name: 'Admin User',
      email: 'admin@fertiwell.com',
      status: 'active',
      accessLevel: 'admin',
      currentStage: 5,
      score: 100,
      created: new Date(),
      lastActive: new Date(),
      joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    },
    {
      name: 'Test User',
      email: 'test@example.com',
      status: 'inactive',
      accessLevel: 'standard',
      currentStage: 1,
      score: 25,
      created: new Date(),
      lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    }
  ];

  try {
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      const docRef = await db.collection('users').add(user);
      console.log(`✅ Created user: ${user.name} (ID: ${docRef.id})`);
    }
    
    console.log('\n🎉 Test users created successfully!');
    console.log('You can now view your users at:');
    console.log('http://localhost:5001/api/mobile-users');
    
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
  }
}

createTestUsers();
