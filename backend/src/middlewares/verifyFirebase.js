// backend/src/middlewares/verifyFirebase.js
const admin = require("../firebaseAdmin");

async function verifyFirebase(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Falta token de Firebase" });

    const decoded = await admin.auth().verifyIdToken(token); // { uid, email, name, picture, ... }
    req.firebaseUser = decoded;
    next();
  } catch (err) {
    console.error("verifyFirebase error:", err);
    res.status(401).json({ error: "Token inválido" });
  }
}

module.exports = verifyFirebase;
