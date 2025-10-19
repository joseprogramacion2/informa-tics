// backend/src/routes/auth.google.cliente.routes.js
const express = require("express");
const router = express.Router();
const verifyFirebase = require("../middlewares/verifyFirebase");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

// Helpers
function normPermKey(s) {
  return String(s || "").trim().toUpperCase().replace(/\s+/g, "_");
}
function normalizePerms(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map(p => (typeof p === "string" ? p : (p?.nombre || p?.key || "")))
    .filter(Boolean)
    .map(normPermKey);
}

router.post("/google-cliente", verifyFirebase, async (req, res) => {
  try {
    const fUser = req.firebaseUser;
    const email = String(fUser?.email || "").toLowerCase();
    const nombreGoogle = fUser?.name || email.split("@")[0] || "Cliente";
    if (!email) return res.status(400).json({ error: "El token no trae email" });

    // 1) Asegurar rol Cliente
    let rolCliente = await prisma.rol.findFirst({ where: { nombre: "Cliente" } });
    if (!rolCliente) rolCliente = await prisma.rol.create({ data: { nombre: "Cliente" } });

    // 2) Buscar usuario por correo (case-insensitive)
    const existente = await prisma.usuario.findFirst({
      where: { correo: { equals: email, mode: "insensitive" } },
      include: { rol: true },
    });

    let usuario;

    if (existente) {
      const esCliente = existente.rol?.nombre?.toLowerCase() === "cliente";

      if (esCliente) {
        // Usuario ya es Cliente -> se puede sincronizar nombre/usuario si quieres
        usuario = await prisma.usuario.update({
          where: { id: existente.id },
          data: {
            nombre: nombreGoogle,
            usuario: existente.usuario || email, // si estaba vacío, usa el email
            estado: true,
            debeCambiarPassword: false,
          },
          include: { rol: true },
        });
      } else {
        // Staff (Bartender/Mesero/Admin/etc) -> NO tocar nombre ni usuario
        usuario = await prisma.usuario.update({
          where: { id: existente.id },
          data: {
            // nombre: existente.nombre,
            // usuario: existente.usuario,
            estado: true,
            debeCambiarPassword: false,
          },
          include: { rol: true },
        });
      }
    } else {
      // 3) No existe -> crear como Cliente
      usuario = await prisma.usuario.create({
        data: {
          nombre: nombreGoogle,
          usuario: email,       // para clientes nuevos sí usamos el email como user
          correo: email,
          contrasena: null,
          rolId: rolCliente.id,
          estado: true,
          debeCambiarPassword: false,
        },
        include: { rol: true },
      });
    }

    // 4) Permisos por rol
    const rolId = usuario.rolId || usuario.rol?.id;
    const links = await prisma.permisoPorRol.findMany({
      where: { rolId },
      select: { permiso: { select: { nombre: true } } },
    });
    const permisosStr = normalizePerms(links.map(l => l.permiso));

    const { contrasena, ...usuarioSinClave } = usuario;
    return res.json({
      mensaje: "Login Google Cliente OK",
      mustChange: false,
      usuario: { ...usuarioSinClave, permisos: permisosStr },
    });
  } catch (err) {
    console.error("google-cliente error:", err);
    res.status(500).json({ error: "Error autenticando cliente" });
  }
});

module.exports = router;
