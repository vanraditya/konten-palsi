const express = require('express');
const firebaseAdmin = require('firebase-admin');
const path = require('path');
const bodyParser = require('body-parser');

// Initialize Express
const app = express();
const port = 3001;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); // to support JSON-encoded bodies

// Firebase Admin SDK setup
const serviceAccount = require('./serviceAccountKey.json');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount)
});

const db = firebaseAdmin.firestore();

// Array of collection names
const collections = ['informasi', 'konten']; // Add all your collection names here

// Endpoint to get data from Firestore
app.get('/data', async (req, res) => {
  try {
    const data = {};
    for (const collection of collections) {
      const snapshot = await db.collection(collection).get();
      data[collection] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
    res.json(data);
  } catch (error) {
    res.status(500).send("The read failed: " + error.message);
  }
});

// Endpoint to update a document
app.put('/data/konten/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    await db.collection('konten').doc(id).update(data);
    res.send("Document successfully updated");
  } catch (error) {
    res.status(500).send("Error updating document: " + error.message);
  }
});

// Endpoint to delete a document
app.delete('/data/konten/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.collection('konten').doc(id).delete();
    res.send("Document successfully deleted");
  } catch (error) {
    res.status(500).send("Error deleting document: " + error.message);
  }
});

// Endpoint to create a document
app.post('/data/konten', async (req, res) => {
  try {
    const data = req.body;
    await db.collection('konten').add(data);
    res.send("Document successfully created");
  } catch (error) {
    res.status(500).send("Error creating document: " + error.message);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
