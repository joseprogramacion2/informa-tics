// Valida ID tokens de Firebase. Requiere ./firebaseAdmin.js inicializado.
const admin = require('../firebaseAdmin');

/**
 * Opcional: desactivar verificación en desarrollo
 *   DISABLE_FIREBASE_AUTH=true
 * En ese caso, deja pasar y setea un usuario "fake".
 */
const DISABLE = String(process.env.DISABLE_FIREBASE_AUTH || '').toLowerCase() === 'true';

module.exports = async function verifyFirebase(req, res, next) {
  try {
    // Permitir bypass en dev si así lo decides
    if (DISABLE) {
      req.user = {
        uid: 'dev-user',
        email: 'dev@example.com',
        firebaseBypassed: true,
      };
      return next();
    }

    // Asegurar que Firebase Admin esté inicializado
    if (!admin || !admin.apps || !admin.apps.length) {
      return res.status(500).json({ error: 'Firebase no configurado en el servidor' });
    }

    // Leer token desde Authorization: Bearer <idToken>
    const auth = req.headers.authorization || '';
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Falta encabezado Authorization Bearer' });
    }
    const idToken = parts[1];

    // Verificar token
    const decoded = await admin.auth().verifyIdToken(idToken, true);
    // Puedes cargar claims personalizados aquí si los usas
    req.user = {
      uid: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || null,
      picture: decoded.picture || null,
      claims: decoded, // si necesitas todo el payload
    };

    return next();
  } catch (err) {
    // Errores típicos: token expirado, malformado, reloj del servidor, etc.
    const msg = err?.message || 'Token inválido';
    const code = /expired|auth\/id-token-expired/i.test(msg) ? 401 : 401;
    return res.status(code).json({ error: 'Token inválido', detail: msg });
  }
};
