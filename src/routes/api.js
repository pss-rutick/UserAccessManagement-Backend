  const express = require('express');
  const router = express.Router();
  const { db } = require('../config/firebase-config');

  // API endpoint for stats
  router.get('/stats', async (req, res) => {
    try {
      const statsRef = db.collection('stats').doc('overview');
      const doc = await statsRef.get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Stats not found' });
      }
      res.json(doc.data());
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // API endpoint for mobile users
  router.get('/mobile-users', async (req, res) => {
    try {
      const usersSnapshot = await db.collection('mobile-users').get();
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // API endpoint for activities
  router.get('/activities', async (req, res) => {
    try {
      const activitiesSnapshot = await db.collection('activities').get();
      const activities = activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  module.exports = router;
