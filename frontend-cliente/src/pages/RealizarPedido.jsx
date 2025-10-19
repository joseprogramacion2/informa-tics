// src/pages/RealizarPedido.jsx
import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import CartPanel from "../components/CartPanel";
import { addItem } from "../utils/cart";

export default function RealizarPedido() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);

  // Modal “Agregar con nota”
  const [noteModal, setNoteModal] = useState({
    open: false,
    platillo: null,
    nota: "",
    tipo: null, // 'COMESTIBLE'|'BEBIBLE'
  });

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/categorias/visibles`);
      const list = Array.isArray(data) ? data : [];
      setCategorias(list);

      // ordenar alfabéticamente por nombre
      const first = [...list].sort((a, b) => a.nombre.localeCompare(b.nombre))[0];
      setSelectedCatId(first?.id ?? null);

      // mapa idPlatillo -> tipoCategoria (COMESTIBLE | BEBIBLE) para fallback
      const map = {};
      list.forEach((cat) => {
        (cat.platillos || []).forEach((p) => { map[p.id] = cat.tipo; });
      });
      localStorage.setItem("platilloTipos", JSON.stringify(map));
    } catch (e) {
      console.error(e);
      alert("No se pudo cargar el menú.");
    } finally {
      setLoading(false);
    }
  };

  const categoriasOrdenadas = useMemo(
    () => [...categorias].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [categorias]
  );

  const selectedCat = useMemo(
    () => categoriasOrdenadas.find((c) => c.id === selectedCatId) || null,
    [categoriasOrdenadas, selectedCatId]
  );

  const money = (v) => `Q${Number(v ?? 0).toFixed(2)}`;

  // Acciones modal
  const abrirModalNota = (p, tipoCat) =>
    setNoteModal({ open: true, platillo: p, nota: "", tipo: tipoCat });
  const cerrarModalNota = () =>
    setNoteModal({ open: false, platillo: null, nota: "", tipo: null });
  const confirmarNota = () => {
    if (!noteModal.platillo) return;
    addItem({
      id: noteModal.platillo.id,
      nombre: noteModal.platillo.nombre,
      precio: noteModal.platillo.precio,
      nota: (noteModal.nota || "").trim(),
      tipo: noteModal.tipo, // 'COMESTIBLE' | 'BEBIBLE'
    });
    cerrarModalNota();
  };

  return (
    <div style={pageGrid}>
      {/* IZQUIERDA: menú */}
      <section>
        {/* ===== CATEGORÍAS EN TIRA (scroll horizontal) ===== */}
        <div style={catBarWrap}>
          <div style={catBarInner}>
            {categoriasOrdenadas.map((cat) => {
              const active = cat.id === selectedCatId;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  aria-selected={active}
                  style={active ? catTabActive : catTab}
                >
                  {cat.nombre}
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== CONTENIDO ===== */}
        {loading && <div style={{ color: "#475569", marginTop: 10 }}>Cargando menú…</div>}

        {!loading && !selectedCat && (
          <div style={{ color: "#64748b", marginTop: 10 }}>No hay categorías disponibles.</div>
        )}

        {!loading && selectedCat && (
          <div style={{ marginTop: 14 }}>
            <div style={catHeader}>
              <h3 style={catTitle}>{selectedCat.nombre}</h3>
              <span style={catCount}>
                {Array.isArray(selectedCat.platillos) ? selectedCat.platillos.length : 0} productos
              </span>
            </div>

            <div style={grid}>
              {(selectedCat.platillos || []).map((p) => (
                <article key={p.id} style={card}>
                  <div style={imgBox}>
                    {p.imagenUrl ? (
                      <img
                        src={p.imagenUrl}
                        alt={p.nombre}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    ) : (
                      <div style={noImg}>Sin imagen</div>
                    )}
                  </div>

                  <div style={{ padding: "0.9rem 1rem 1rem", display: "grid", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <h4 style={{ margin: 0 }}>{p.nombre}</h4>
                      <span style={pill}>{money(p.precio)}</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <button
                        onClick={() =>
                          addItem({
                            id: p.id,
                            nombre: p.nombre,
                            precio: p.precio,
                            tipo: selectedCat.tipo, // 'COMESTIBLE' | 'BEBIBLE'
                          })
                        }
                        style={addBtn}
                      >
                        Agregar
                      </button>

                      <button
                        onClick={() => abrirModalNota(p, selectedCat.tipo)}
                        style={{ ...addBtn, background: "#0f766e" }}
                      >
                        Agregar con nota
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* DERECHA: carrito */}
      <CartPanel />

      {/* Modal Nota */}
      {noteModal.open && (
        <div style={backdrop}>
          <div style={modal}>
            <h3 style={{ marginTop: 0 }}>Agregar nota</h3>
            <textarea
              rows={4}
              placeholder="Ej: Sin cebolla, extra salsa…"
              value={noteModal.nota}
              onChange={(e) => setNoteModal((s) => ({ ...s, nota: e.target.value }))}
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 10, padding: 10 }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button onClick={cerrarModalNota} style={ghost}>Cancelar</button>
              <button onClick={confirmarNota} style={primary}>Añadir al carrito</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Styles ===== */
const pageGrid = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: 18,
};

// 👇 altura segura para que la barra sticky NO tape el header superior.
// Usa la variable --app-header-h si existe; si no, asume 64px y agrega 8px de espacio.
const STICKY_TOP = 'calc(var(--app-header-h, 64px) + 8px)';

const catBarWrap = {
  position: "sticky",
  top: STICKY_TOP, // se pega justo debajo del header
  background: "#fff",
  zIndex: 8,       // el header debería tener un z-index mayor (p. ej., 10 o 100)
  padding: "8px 0",
  borderBottom: "1px solid #e5e7eb",
  marginBottom: 10,
};

const catBarInner = {
  display: "flex",
  gap: 8,
  overflowX: "auto",
  paddingBottom: 6,
  whiteSpace: "nowrap",
};

const catTab = {
  display: "inline-block",
  background: "#eef2ff",
  color: "#1e3a8a",
  border: "1px solid #c7d2fe",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: 800,
  cursor: "pointer",
  flex: "0 0 auto",
};

const catTabActive = {
  ...catTab,
  background: "#1e40af",
  color: "#fff",
  borderColor: "#1e40af",
};

const catHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  marginBottom: 6,
};
const catTitle = { margin: 0, color: "#0f172a", borderLeft: "4px solid #006666", paddingLeft: 10 };
const catCount = { fontSize: 12, color: "#64748b" };

const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 };
const card = { background: "#fff", borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.08)", overflow: "hidden", border: "1px solid #eee", display: "flex", flexDirection: "column" };
const imgBox = { width: "100%", height: 150, background: "#f2f2f2" };
const noImg = { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontSize: 13 };
const pill = { background: "#0f766e", color: "#fff", borderRadius: 8, padding: "2px 8px", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" };
const addBtn = { border: "none", background: "#111827", color: "#fff", padding: "8px 12px", borderRadius: 10, cursor: "pointer" };

const backdrop = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 };
const modal = { background: "#fff", borderRadius: 14, padding: 16, width: "min(520px, 96vw)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" };

const ghost = { background: "#e2e8f0", border: "none", color: "#0f172a", padding: "6px 10px", borderRadius: 8, fontWeight: 700, cursor: "pointer" };
const primary = { border: "none", background: "#111827", color: "#fff", padding: "8px 12px", borderRadius: 10, cursor: "pointer" };
