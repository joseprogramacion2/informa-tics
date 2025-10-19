// frontend/src/pages/PanelPorRol.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NotificationBellRepartidor from '../components/NotificationBellRepartidor';
import TipoCambioBadge from '../components/TipoCambioBadge';

function logout() {
  try {
    localStorage.removeItem('usuario');
    sessionStorage.clear();
    window.location.replace('/login');
  } catch {
    window.location.replace('/login');
  }
}

// Helpers
const toKey = (s) => String(s || '').trim().toUpperCase().replace(/\s+/g, '_');
function normRoleName(name) { return toKey(name); }
function normPermList(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map(p => (typeof p === 'string' ? p : (p?.clave || p?.nombre || p?.key || '')))
    .filter(Boolean)
    .map(toKey);
}
function getPermsFromUser(u) {
  const p1 = normPermList(u?.permisos || []);
  if (p1.length) return p1;
  const p2 = normPermList(u?.rol?.permisos || []);
  return p2;
}

const tile = {
  backgroundColor: '#f1f3f6',
  textDecoration: 'none',
  color: '#1e3d59',
  minWidth: 160,
  height: 120,
  borderRadius: 10,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  transition: 'transform .2s, box-shadow .2s',
};
const cont = {
  minHeight: '100vh',
  background: '#f9f9f9',
  fontFamily: 'Segoe UI, sans-serif',
};

// Catálogo
const CATALOGO = [
  // Admin
  { ruta: "/admin/usuarios",   texto: "Usuarios",          icono: "👥",  permiso: "CONFIGURAR_USUARIOS" },
  { ruta: "/admin/platillos",  texto: "Platillos",         icono: "🍽️", permiso: "CONFIGURAR_PLATILLOS" },
  { ruta: "/admin/historial",  texto: "Historial",         icono: "📜",  permiso: "VER_HISTORIAL" },
  { ruta: "/admin/menu",       texto: "Menú",              icono: "📋",  permiso: "VER_MENU" },
  { ruta: "/admin/categorias", texto: "Categorías",        icono: "📂",  permiso: "GESTIONAR_CATEGORIAS" },
  { ruta: "/admin/roles",      texto: "Roles",             icono: "🛠",  permiso: "GESTIONAR_ROLES" },
  { ruta: "/admin/mesas",      texto: "Mesas",             icono: "🪑",  permiso: "CONFIGURAR_MESAS" },
  { ruta: "/admin/reservacion",      texto: "Reservaciones",               icono: "📅",  permiso: "RESERVAR_MESAS" },
  { ruta: "/admin/egresos",         texto: "Autorizar egresos", icono: "✅",  permiso: "AUTORIZAR_EGRESO" },
  { ruta: "/admin/caja-turnos",     texto: "Turnos de caja",    icono: "💵",  permiso: "AUTORIZAR_APERTURA_CAJA" },
  { ruta: "/admin/reportes",        texto: "Reportería",        icono: "📊",  permiso: "REPORTES_VER" },

  // Mesero
  { ruta: "/mesero",           texto: "Generar Orden",     icono: "🛎️", permiso: "GENERAR_ORDEN" },
  { ruta: "/mesero/ordenes",   texto: "Historial Órdenes", icono: "📋",  permiso: "VER_ORDENES" },
  { ruta: "/mesero/historial",   texto: "Órdenes Terminadas", icono: "✅",  permiso: "ORDENES_TERMINADAS" },

  // Cocina
  { ruta: "/cocina",           texto: "Cocina",            icono: "👨‍🍳", permiso: "COCINA_VIEW" },

  // Barra
  { ruta: "/barra",            texto: "Barra",             icono: "🍹", permiso: "BARRA_VIEW" },

  // Reparto
  { ruta: "/reparto",          texto: "Reparto",           icono: "🏍️", permiso: "ACCESO_VISTA_REPARTO" },

  // Cajero
  { ruta: "/caja",             texto: "Caja",              icono: "💳", permiso: "CAJA" },
  { ruta: "/caja/ventas",      texto: "Ventas del día",    icono: "📈", permiso: "CAJA" },
  { ruta: "/caja/egresos",     texto: "Solicitar egresos", icono: "🏦", permiso: "CAJA" },
];

export default function PanelPorRol() {
  const [usuario, setUsuario] = useState(null);
  const [permisos, setPermisos] = useState([]);
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('usuario'));
    if (!u) {
      navigate('/login', { replace: true });
      return;
    }
    setUsuario(u);
    setPermisos(getPermsFromUser(u));
  }, [navigate]);

  const roleName = normRoleName(usuario?.rol?.nombre);
  const rolUpper = String(usuario?.rol?.nombre || '').toUpperCase();
  const esRepartidor = rolUpper === 'REPARTIDOR';
  const esCajero = rolUpper === 'CAJERO';

  const isAdmin = roleName === 'ADMINISTRADOR' || roleName === 'ADMIN';

  useEffect(() => {
    if (!usuario) return;
    if (isAdmin) {
      setRedirecting(true);
      navigate('/admin', { replace: true });
    }
  }, [usuario, isAdmin, navigate]);

  if (!usuario || redirecting) {
    return (
      <div style={cont}>
        <header style={{
          backgroundColor: '#1e3d59',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.1rem' }}>Cargando…</h1>
        </header>
        <main style={{
          maxWidth: 1000,
          margin: '2rem auto',
          padding: '2rem',
          backgroundColor: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <p>Preparando tu panel…</p>
        </main>
      </div>
    );
  }

  const setPerms = new Set(permisos);
  const accesos = CATALOGO.filter(item => !item.permiso || setPerms.has(item.permiso));
  const showDenied = location.state?.reason === 'forbidden';

  return (
    <div style={cont}>
      {/* Header del /panel */}
      <header style={{
        position: 'relative',            // necesario para centrar absoluto
        backgroundColor: '#1e3d59',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.1rem' }}>👤 Panel de {usuario?.nombre || 'Usuario'}</h1>

        {/* Centro absoluto: tipo de cambio SOLO CAJERO */}
        {esCajero && (
          <div style={{
            position: 'absolute',
            left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}>
            <div style={{ pointerEvents: 'auto' }}>
              <TipoCambioBadge variant="inline" />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {esRepartidor && <NotificationBellRepartidor />}
          <span>{roleName}</span>
          <button onClick={logout} style={{
            background: '#e63946',
            color: '#fff',
            border: 'none',
            padding: '.5rem 1rem',
            borderRadius: 6,
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main style={{
        maxWidth: 1000,
        margin: '2rem auto',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>
          Accesos según tus permisos
        </h2>

        {showDenied && (
          <div style={{
            background:'#fff8e1',
            border:'1px solid #ffe0a3',
            color:'#7a5b00',
            padding:'0.8rem 1rem',
            borderRadius:8,
            marginBottom:'1rem',
            textAlign:'center'
          }}>
            No tienes permisos para la vista solicitada.
          </div>
        )}

        {accesos.length === 0 ? (
          <div style={{
            background:'#fff8e1',
            border:'1px solid #ffe0a3',
            color:'#7a5b00',
            padding:'1rem',
            borderRadius:8,
            textAlign:'center'
          }}>
            No tienes accesos habilitados todavía. Contacta al administrador para asignarte permisos.
          </div>
        ) : (
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))',
            gap:'1.2rem',
            justifyItems:'center'
          }}>
            {accesos.map(({ ruta, texto, icono }) => (
              <Link key={ruta} to={ruta} style={tile}>
                <div style={{ fontSize: '2rem' }}>{icono}</div>
                <span style={{ marginTop: 8, fontWeight: 600 }}>{texto}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
