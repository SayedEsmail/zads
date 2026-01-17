const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../../serviceAccountKey.json');

let firebaseApp = null;

try {
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('🔥 Firebase Admin initialized successfully');
    } else {
        console.warn('⚠️ Firebase serviceAccountKey.json not found. Push notifications will be mocked.');
    }
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
}

module.exports = admin;
