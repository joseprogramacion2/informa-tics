// frontend/src/pages/HistorialOrdenesMesero.jsx
import React, { useEffect, useMemo, useState } from "react";
import PageTopBar from "../components/PageTopBar";
import ToastMessage from "../components/ToastMessage";
import { getHistorialOrdenesMesero } from "../api/ordenesMesero";

const fmtQ = (n) => `Q${Number(n || 0).toFixed(2)}`;
const toLocal = (iso) => new Date(iso).toLocaleString("es-GT", { hour12: false });

function getDefaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const pad = (v) => String(v).padStart(2, "0");
  const toInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return { desde: toInput(start), hasta: toInput(end) };
}

export default function HistorialOrdenesMesero() {
  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("usuario") || "null"); } catch { return null; }
  }, []);
  const meseroId = usuario?.id || usuario?.userId || null;

  const def = getDefaultRange();
  const [desde, setDesde] = useState(def.desde); // YYYY-MM-DD
  const [hasta, setHasta] = useState(def.hasta); // YYYY-MM-DD

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [openRowId, setOpenRowId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));

  const showToast = (message, type = "success") => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2600);
  };

  async function load() {
    if (!meseroId) {
      showToast("No se encontró el usuario/mesero activo", "danger");
      return;
    }
    setLoading(true);
    try {
      // Enviamos YYYY-MM-DD directo (el backend ya lo acepta así)
      const resp = await getHistorialOrdenesMesero({
        meseroId,
        desde,
        hasta,
        page,
        pageSize,
      });
      setRows(Array.isArray(resp?.data) ? resp.data : []);
      setTotal(Number.isFinite(resp?.total) ? Number(resp.total) : (resp?.data?.length || 0));
    } catch (e) {
      console.error(e);
      showToast("No se pudo cargar el historial", "danger");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [meseroId, desde, hasta, page, pageSize]);

  const onFiltrar = () => { setPage(1); load(); };
  const onLimpiar = () => {
    const r = getDefaultRange();
    setDesde(r.desde);
    setHasta(r.hasta);
    setPage(1);
  };

  // === estilos (mismo estilo base que OrdenesMesero.jsx) ===
  const th = { padding: '0.9rem', textAlign: 'left', borderBottom: '2px solid #ccc' };
  const td = { padding: '0.9rem', borderBottom: '1px solid #ddd', verticalAlign: 'top' };
  const card = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:12, marginTop:12 };
  const lbl  = { display:'block', fontSize:12, color:'#475569', marginBottom:4 };
  const inp  = { width:'100%', padding:'8px 10px', border:'1px solid #cbd5e1', borderRadius:8, outline:'none' };
  const btn  = { padding:'8px 12px', borderRadius:8, border:'1px solid #cbd5e1', background:'#f8fafc', cursor:'pointer' };
  const btnPrimary = { ...btn, background:'#2563eb', borderColor:'#2563eb', color:'#fff' };

  return (
    <div style={{ height:'100vh', width:'100vw', display:'flex', flexDirection:'column', overflow:'hidden', fontFamily:'Segoe UI, sans-serif' }}>
      <PageTopBar title="Órdenes terminadas" backTo="/panel" />

      <div style={{ flex:1, overflowY:'auto', padding:'2rem', boxSizing:'border-box' }}>
        <h2 style={{ marginTop: 0 }}>✅ Historial de órdenes terminadas</h2>

        {/* Filtros */}
        <div style={card}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:10 }}>
            <div>
              <label style={lbl}>Desde</label>
              <input type="date" value={desde} onChange={(e)=>setDesde(e.target.value)} style={inp}/>
            </div>
            <div>
              <label style={lbl}>Hasta</label>
              <input type="date" value={hasta} onChange={(e)=>setHasta(e.target.value)} style={inp}/>
            </div>
            <div />
            <div />
            <div style={{ display:'flex', gap:8, alignItems:'end', justifyContent:'flex-end' }}>
              <button onClick={onLimpiar} style={btn}>Limpiar</button>
              <button onClick={onFiltrar} style={btnPrimary} disabled={loading}>
                {loading ? 'Cargando…' : 'Filtrar'}
              </button>
            </div>
          </div>
        </div>

        {/* Resumen y paginación superior */}
        <div style={{ marginTop:12, display:'flex', gap:12, alignItems:'center', justifyContent:'space-between', flexWrap:'wrap' }}>
          <div style={{ color:'#64748b' }}>
            Total: <b>{total}</b> registros
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ fontSize:13, color:'#475569' }}>Tamaño página:</span>
            <select
              value={pageSize}
              onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }}
              style={{ ...inp, width:100, padding:'6px 8px' }}
            >
              {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            <button style={btn} onClick={()=>setPage(p => Math.max(1, p-1))} disabled={page<=1 || loading}>◀</button>
            <span style={{ fontSize:13, color:'#475569' }}>
              Página <b>{page}</b> / {Math.max(1, Math.ceil((total || 0)/pageSize))}
            </span>
            <button style={btn} onClick={()=>setPage(p => Math.min(Math.max(1, Math.ceil((total || 0)/pageSize)), p+1))} disabled={page>=Math.max(1, Math.ceil((total || 0)/pageSize)) || loading}>▶</button>
          </div>
        </div>

        {/* Tabla */}
        <div style={{ ...card, marginTop:12 }}>
          {loading ? (
            <div style={{ color:'#64748b' }}>Cargando…</div>
          ) : rows.length === 0 ? (
            <div style={{ color:'#64748b' }}>No hay resultados en el rango seleccionado.</div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', marginTop:'0.25rem', tableLayout:'fixed', fontSize:14 }}>
                <thead>
                  <tr style={{ background:'#006666', color:'#fff' }}>
                    <th style={{ ...th, width:'8rem' }}>Código</th>
                    <th style={{ ...th, width:'6rem' }}>Mesa</th>
                    <th style={{ ...th, width:'12rem' }}>Inicio</th>
                    <th style={{ ...th, width:'12rem' }}>Terminado</th>
                    <th style={{ ...th, width:'8rem' }}>Duración</th>
                    <th style={{ ...th, width:'10rem' }}>Estado</th>
                    <th style={{ ...th, width:'10rem', textAlign:'right' }}>Total</th>
                    <th style={{ ...th, width:'10rem', textAlign:'center' }}>Items</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((o, i) => {
                    const dur = Number(o?.durationSec || 0);
                    const hh = Math.floor(dur / 3600);
                    const mm = Math.floor((dur % 3600) / 60);
                    const ss = dur % 60;
                    const durTxt = `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
                    const abierto = openRowId === o.id;

                    return (
                      <React.Fragment key={o.id}>
                        <tr style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                          {/* 👇 Mostrar código de la orden (fallback a #id) */}
                          <td style={td}>{o.codigo || `#${o.id}`}</td>
                          <td style={td}>Mesa {o.mesa ?? '-'}</td>
                          <td style={td}>{o.fecha ? toLocal(o.fecha) : (o.createdAt ? toLocal(o.createdAt) : '-')}</td>
                          <td style={td}>{o.finishedAt ? toLocal(o.finishedAt) : '-'}</td>
                          <td style={td}>{durTxt}</td>
                          <td style={td}>{o.estado || '—'}</td>
                          <td style={{ ...td, textAlign:'right' }}>{fmtQ(o.total ?? o.totalItems ?? 0)}</td>
                          <td style={{ ...td, textAlign:'center' }}>
                            <button
                              onClick={() => setOpenRowId(abierto ? null : o.id)}
                              style={{ padding:'.4rem .8rem', border:'1px solid #cbd5e1', borderRadius:8, background:'#f8fafc', cursor:'pointer', fontWeight:700 }}
                            >
                              {abierto ? 'Ocultar' : 'Ver'}
                            </button>
                          </td>
                        </tr>

                        {abierto && (
                          <tr>
                            <td colSpan={8} style={{ padding:0, background:'#f6f7fb' }}>
                              <div style={{ padding:'12px 12px 16px' }}>
                                <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:16 }}>
                                  {/* Items */}
                                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden' }}>
                                    <div style={{ padding:'10px 12px', borderBottom:'1px solid #e5e7eb', fontWeight:700 }}>Items</div>
                                    <div style={{ overflowX:'auto' }}>
                                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                                        <thead>
                                          <tr style={{ background:'#eef2f7' }}>
                                            <th style={{ ...th, padding:'8px 10px' }}>Nombre</th>
                                            <th style={{ ...th, padding:'8px 10px' }}>Tipo</th>
                                            <th style={{ ...th, padding:'8px 10px' }}>Estado</th>
                                            <th style={{ ...th, padding:'8px 10px', textAlign:'right' }}>Precio</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(o.items || []).map((it, idx) => (
  <tr key={it.id || idx} style={{ borderTop:'1px solid #f1f5f9' }}>
    <td style={{ ...td, padding:'8px 10px' }}>
      {it.nombre}
      {it.nota ? (
        <span style={{ marginLeft: 8, color:'#374151', background:'#f3f4f6', border:'1px solid #e5e7eb', borderRadius:6, padding:'2px 6px', fontStyle:'italic' }}>
          📝 {it.nota}
        </span>
      ) : null}
    </td>
    <td style={{ ...td, padding:'8px 10px' }}>{it.tipo}</td>
    <td style={{ ...td, padding:'8px 10px' }}>{it.estado}</td>
    <td style={{ ...td, padding:'8px 10px', textAlign:'right' }}>{fmtQ(it.precio)}</td>
  </tr>
))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                  {/* Resumen */}
                                  <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, padding:12 }}>
                                    <div style={{ fontWeight:700, marginBottom:6 }}>Resumen</div>
                                    <div style={{ display:'grid', rowGap:6 }}>
                                      {/* 👇 También aquí mostramos el código */}
                                      <RowKV k="Orden" v={o.codigo || `#${o.id}`} />
                                      <RowKV k="Mesa" v={o.mesa ?? '-'} />
                                      <RowKV k="Inició" v={o.fecha ? toLocal(o.fecha) : (o.createdAt ? toLocal(o.createdAt) : '-')} />
                                      <RowKV k="Terminó" v={o.finishedAt ? toLocal(o.finishedAt) : '-'} />
                                      <RowKV k="Duración" v={durTxt} />
                                      <RowKV k="Total" v={fmtQ(o.total ?? o.totalItems ?? 0)} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación inferior */}
        <div style={{ marginTop:12, display:'flex', gap:8, alignItems:'center', justifyContent:'flex-end', flexWrap:'wrap' }}>
          <button style={btn} onClick={()=>setPage(p => Math.max(1, p-1))} disabled={page<=1 || loading}>◀</button>
          <span style={{ fontSize:13, color:'#475569' }}>
            Página <b>{page}</b> / {Math.max(1, Math.ceil((total || 0)/pageSize))}
          </span>
          <button style={btn} onClick={()=>setPage(p => Math.min(Math.max(1, Math.ceil((total || 0)/pageSize)), p+1))} disabled={page>=Math.max(1, Math.ceil((total || 0)/pageSize)) || loading}>▶</button>
        </div>
      </div>

      <ToastMessage
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast((t) => ({ ...t, show:false }))}
      />
    </div>
  );
}

function RowKV({ k, v }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
      <span style={{ color:'#475569' }}>{k}:</span>
      <b style={{ color:'#0f172a' }}>{v}</b>
    </div>
  );
}
