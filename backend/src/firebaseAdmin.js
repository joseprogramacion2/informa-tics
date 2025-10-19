// src/firebaseAdmin.js
const admin = require("firebase-admin");

let app;
if (!admin.apps.length) {
  let creds;

  // Opción A: variable única con todo el JSON
  const JSON_BLOB = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (JSON_BLOB) {
    creds = JSON.parse(JSON_BLOB);
  } else {
    // Opción B: campos por separado
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey && privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    creds = {
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey,
    };
  }

  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: creds.project_id,
      clientEmail: creds.client_email,
      privateKey: creds.private_key,
    }),
  });
} else {
  app = admin.app();
}

module.exports = admin;
