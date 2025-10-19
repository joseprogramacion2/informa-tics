// src/components/ClienteLayout.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { getUser, logout } from "../utils/session";

const navItem = ({ isActive }) => ({
  display: "block",
  padding: "10px 14px",
  borderRadius: 10,
  textDecoration: "none",
  color: "white",
  background: isActive ? "rgba(255,255,255,0.18)" : "transparent",
});

export default function ClienteLayout({ children }) {
  const user = getUser();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gridTemplateRows: "64px 1fr", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ gridRow: "1 / span 2", background: "linear-gradient(180deg,#8B0000,#A61B1B)", color: "white", padding: 18 }}>
        <Link to="/cliente/home" style={{ color: "white", textDecoration: "none" }}>
          <h2 style={{ margin: 0, fontWeight: 800, letterSpacing: 0.3 }}>🍷 Restaurante</h2>
        </Link>
        <div style={{ marginTop: 24, display: "grid", gap: 8 }}>
          <NavLink to="/cliente/home" style={navItem}>🏠 Inicio</NavLink>
          <NavLink to="/cliente/pedido" style={navItem}>🍽️ Realizar pedido</NavLink>
          <NavLink to="/cliente/reservacion" style={navItem}>📅 Reservación</NavLink>
          <NavLink to="/cliente/historial" style={navItem}>🧾 Historial</NavLink>
          <NavLink to="/cliente/mis-reservas" style={navItem}>📜 Mis reservaciones</NavLink>
        </div>
      </aside>

      {/* Header */}
      <header style={{
        gridColumn: "2 / 3",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
        background: "#fff",
        borderBottom: "1px solid #eee",
        position: "sticky",
        top: 0,
        zIndex: 5
      }}>
        <div style={{ fontWeight: 700, color: "#333" }}>
          {user ? `👤 ${user.nombre || user.usuario || user.correo}` : "Cliente"}
        </div>
        <button onClick={logout} style={{
          border: "none", background: "#222", color: "white", padding: "8px 14px",
          borderRadius: 8, cursor: "pointer"
        }}>
          Cerrar sesión
        </button>
      </header>

      {/* Main */}
      <main style={{ background: "#faf7f3", padding: 24 }}>
        {children}
      </main>
    </div>
  );
}
