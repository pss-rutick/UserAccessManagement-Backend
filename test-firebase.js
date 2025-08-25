const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Firebase setup
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Test Firebase connection
app.get('/test-connection', async (req, res) => {
  try {
    // Test if we can connect to Firestore
    const collections = await db.listCollections();
    res.json({ 
      success: true, 
      message: 'Firebase connected successfully!',
      projectId: serviceAccount.project_id,
      collections: collections.map(col => col.id)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get users from Firebase
app.get('/users', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = [];
    
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Create a test user
app.post('/users', async (req, res) => {
  try {
    const { name, email, status, accessLevel } = req.body;
    
    const newUser = {
      name: name || 'Test User',
      email: email || 'test@example.com',
      status: status || 'active',
      accessLevel: accessLevel || 'standard',
      created: new Date(),
      lastActive: new Date()
    };
    
    const docRef = await db.collection('users').add(newUser);
    
    res.json({
      success: true,
      message: 'User created successfully!',
      user: {
        id: docRef.id,
        ...newUser
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🔥 Firebase test server running on http://localhost:${PORT}`);
});
