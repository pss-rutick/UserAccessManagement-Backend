  // // src/config/firebase-config.js
  // const { initializeApp, cert } = require('firebase-admin/app');
  // const { getFirestore } = require('firebase-admin/firestore');

  // const serviceAccount = require('../../serviceAccountKey.json');

  // initializeApp({
  //   credential: cert(serviceAccount)
  // });

  // const db = getFirestore();

  // module.exports = { db };

  const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = require('../../serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

module.exports = { db, FieldValue };