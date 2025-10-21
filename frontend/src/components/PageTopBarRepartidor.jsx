import React from "react";
import { useNavigate } from "react-router-dom";
import NotificationBellRepartidor from "./NotificationBellRepartidor";

const THEME = {
  dark: "#13354B",
  primary: "#0f766e",
  danger: "#e63946",
};

function safeUser() {
  try { return JSON.parse(localStorage.getItem("usuario") || "null"); }
  catch { return null; }
}

/**
 * TopBar exclusivo Repartidor:
 * - Título a la IZQUIERDA.
 * - A la DERECHA: campana, chip de rol y flecha verde “volver”.
 * - En desktop la flecha dice “Volver al panel”; en móvil solo ícono.
 * - Menú de campana alineado a la derecha y con posición fija (no se corta).
 * - El botón “Salir” está oculto por defecto (showLogout=false).
 */
export default function PageTopBarRepartidor({
  title = "Reparto",
  backTo = "/panel",
  showLogout = false, // <- por defecto oculto en Reparto
}) {
  const navigate = useNavigate();
  const usuario = safeUser();
  const rolNombre = (usuario?.rol?.nombre || "REPARTIDOR").toString();

  const handleBack = () => {
    navigate(backTo, { state: { refresh: Date.now() } });
  };
  const handleLogout = () => {
    try { localStorage.removeItem("usuario"); sessionStorage.clear(); }
    finally { window.location.replace("/login"); }
  };

  return (
    <header className="rp-topbar" aria-label="Barra superior repartidor">
      {/* IZQUIERDA: Título */}
      <div className="rp-left">
        <div className="rp-title" title={title}>
          <span className="emoji" role="img" aria-label="pin">📍</span>
          <span className="text">{title}</span>
        </div>
      </div>

      {/* DERECHA: campana, rol, volver, (salir opcional) */}
      <div className="rp-right">
        <div className="rp-bell">
          <NotificationBellRepartidor />
        </div>

        <span className="rp-role" title={rolNombre}>
          <span className="emoji" role="img" aria-label="user">👤</span>
          <span className="txt">{rolNombre}</span>
        </span>

        <button
          type="button"
          className="rp-back"
          onClick={handleBack}
          aria-label="Volver al panel"
          title="Volver al panel"
        >
          <span className="icon">←</span>
          <span className="label">Volver al panel</span>
        </button>

        {showLogout && (
          <button
            type="button"
            className="rp-logout"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            ⎋ <span className="label">Salir</span>
          </button>
        )}
      </div>

      <style>{`
        :root{ --rp-topbar-h:56px; }
        @media (min-width: 992px){ :root{ --rp-topbar-h:64px; } }

        .rp-topbar{
          position: sticky; top: 0; left: 0; z-index: 20;
          width: 100%;
          background: ${THEME.dark}; color: #fff;
          padding: max(10px, env(safe-area-inset-top)) 14px 10px;
          display:flex; align-items:center; justify-content:space-between;
          box-shadow: 0 2px 8px rgba(0,0,0,.15);
          min-height: var(--rp-topbar-h);
        }
        .rp-left{ min-width:0; }
        .rp-title{ display:flex; align-items:center; gap:8px; min-width:0; }
        .rp-title .text{
          font-weight:700; font-size:18px; white-space:nowrap;
          overflow:hidden; text-overflow:ellipsis; max-width:60vw;
        }

        .rp-right{ display:flex; align-items:center; gap:10px; }
        .rp-role{
          display:inline-flex; align-items:center; gap:6px;
          background: rgba(255,255,255,.16);
          padding: 6px 10px; border-radius: 999px; font-weight:700;
          max-width: 34vw; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
        }

        .rp-back, .rp-logout{
          border:none; border-radius:999px; color:#fff;
          font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:8px;
          padding:8px 12px; transition:transform .06s ease, opacity .2s;
        }
        .rp-back{ background:${THEME.primary}; }
        .rp-logout{ background:${THEME.danger}; }
        .rp-back:active, .rp-logout:active{ transform:scale(.98); }
        .rp-back .icon{ font-size:16px; line-height:1; }

        /* CAMPANA: menú fijo, alineado a la derecha, debajo del topbar */
        .rp-bell{ position:relative; z-index: 30; }
        .rp-topbar .dropdown-menu{
          /* baseline para otros estados */
        }
        .rp-topbar .dropdown-menu.show{
          position: fixed !important;
          right: 12px !important;
          top: calc(var(--rp-topbar-h) + 6px) !important;
          transform: none !important;
          z-index: 40 !important;
        }

        /* RESPONSIVE */
        @media (max-width: 480px){
          .rp-title .text{ max-width: 46vw; font-size:16px; }
          /* En móvil, el botón VERDE muestra solo ícono */
          .rp-back .label{ display:none; }
          .rp-back .icon{ display:inline; }
          /* Mantenemos visible el texto del rol */
          .rp-role .txt{ display:inline; }
        }
        @media (min-width: 992px){
          .rp-title .text{ max-width:none; }
          .rp-role{ max-width:none; }
        }
      `}</style>
    </header>
  );
}
