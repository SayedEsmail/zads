const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Credential sources, in order:
// 1. FIREBASE_SERVICE_ACCOUNT_JSON — the service-account JSON itself (use this on Vercel / any host without a filesystem).
// 2. GOOGLE_APPLICATION_CREDENTIALS — path to a service-account JSON file.
// 3. ./serviceAccountKey.json next to the API (local development only; git-ignored).
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../../serviceAccountKey.json');

function loadServiceAccount() {
    const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (inlineJson && inlineJson.trim()) {
        return JSON.parse(inlineJson);
    }
    if (fs.existsSync(serviceAccountPath)) {
        return JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    }
    return null;
}

let firebaseApp = null;

try {
    const serviceAccount = loadServiceAccount();
    if (serviceAccount) {
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('🔥 Firebase Admin initialized successfully');
    } else {
        console.warn('⚠️ No Firebase service account configured (FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS). Push delivery is disabled.');
    }
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
}

module.exports = admin;
