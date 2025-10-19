// src/pages/Home.jsx
import React from "react";

export default function Home() {
  const card = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
  };
  const pill = {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
  };
  const btnPrimary = { ...pill, background: "#0f766e", color: "#fff" };
  const btnLight = { ...pill, background: "#e5e7eb", color: "#0f172a" };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Hero */}
      <header style={{ ...card, background: "#0ea5e9", color: "white" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>🍽️ Restaurante Morales</h1>
        <p style={{ margin: "6px 0 14px", opacity: 0.95 }}>
          Cocina casera con sabor caribeño, hecha al momento.
        </p>
        
      </header>

      {/* Información rápida */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>📍 Ubicación</h3>
          <p style={{ margin: 0 }}>
            4a Calle 3-45, Zona 1<br />
            <b>Morales, Izabal</b>, Guatemala
          </p>
          <p style={{ margin: "10px 0 0" }}>
            <a
              href="https://www.google.com/maps?q=Morales%20Izabal%2C%20Guatemala"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#0ea5e9", textDecoration: "none", fontWeight: 700 }}
            >
              Ver en Google Maps ↗
            </a>
          </p>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>⏰ Horario</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Lunes a Domingo: 7:00 – 22:00</li>
          </ul>
          <p style={{ marginTop: 10, color: "#64748b" }}>
            Último pedido 30 min antes del cierre.
          </p>
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>☎️ Contacto</h3>
          <p style={{ margin: 0 }}>
            Tel/WhatsApp:{" "}
            <a href="tel:+50212345678" style={{ color: "#0ea5e9", textDecoration: "none", fontWeight: 700 }}>
              +502 1234-5678
            </a>
          </p>
          <p style={{ margin: "6px 0 0" }}>
            Email:{" "}
            <a
              href="mailto:mirestaurantegt502@gmail.com"
              style={{ color: "#0ea5e9", textDecoration: "none", fontWeight: 700 }}
            >
              mirestaurantegt502@gmail.com
            </a>
          </p>
          <p style={{ margin: "10px 0 0", color: "#64748b" }}>
            Respuesta habitual: 10-20 min.
          </p>
        </div>
      </section>

      {/* Servicios / ventajas */}
      <section style={card}>
        <h3 style={{ marginTop: 0 }}>✨ Servicios</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10,
          }}
        >
          <div>🏠 Consumo en el local</div>
          <div>🚗 A domicilio (Morales y alrededores)</div>
          <div>🧾 Pedido en línea</div>
          <div>💳 Pago en efectivo o tarjeta</div>
          <div>🅿️ Estacionamiento cercano</div>
          <div>📶 Wi-Fi para clientes</div>
        </div>
      </section>

      {/* Mapa */}
      <section style={card}>
        <h3 style={{ marginTop: 0 }}>🗺️ Cómo llegar</h3>
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
          <iframe
            title="Mapa Morales Izabal"
            src="https://www.google.com/maps?q=Morales%20Izabal%2C%20Guatemala&output=embed"
            width="100%"
            height="300"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      {/* CTA final */}
      <section style={{ ...card, textAlign: "center" }}>
        <h3 style={{ marginTop: 0 }}>¿Listo para ordenar?</h3>
        <p style={{ margin: "6px 0 16px", color: "#475569" }}>
          Pide ahora y te avisamos cuando esté <b>en preparación</b> o <b>listo para recoger</b>.
        </p>
        <a href="/cliente/pedido" style={btnPrimary}>Empezar pedido</a>
      </section>
    </div>
  );
}
