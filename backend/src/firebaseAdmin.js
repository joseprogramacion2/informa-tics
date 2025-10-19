// backend/src/firebaseAdmin.js
const admin = require('firebase-admin');

function parseSvcFromEnv() {
  // Opción A: JSON entero en una variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (svc.private_key && svc.private_key.includes('\\n')) {
        svc.private_key = svc.private_key.replace(/\\n/g, '\n');
      }
      return svc;
    } catch (e) {
      console.error('[Firebase] FIREBASE_SERVICE_ACCOUNT inválido:', e.message);
    }
  }

  // Opción B: 3 variables sueltas
  const pid = process.env.FIREBASE_PROJECT_ID;
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  let pk = process.env.FIREBASE_PRIVATE_KEY;
  if (pid && email && pk) {
    if (pk.includes('\\n')) pk = pk.replace(/\\n/g, '\n');
    return { project_id: pid, client_email: email, private_key: pk };
  }

  return null;
}

let inited = false;

try {
  const svc = parseSvcFromEnv();
  if (svc) {
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(svc) });
      inited = true;
      console.log('[Firebase] Admin inicializado con variables de entorno.');
    }
  } else {
    console.warn('[Firebase] Sin credenciales en env. Admin NO inicializado (dev local sin Firebase).');
  }
} catch (e) {
  console.error('[Firebase] Falló la inicialización:', e);
}

module.exports = admin;
module.exports.__inited = inited;
