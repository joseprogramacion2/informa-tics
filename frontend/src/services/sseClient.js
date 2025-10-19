// Escucha el canal de repartidores (broadcast)
export function connectSSERepartidor(onEvent) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const es = new EventSource(`${base}/sse?topic=REPARTIDOR`, { withCredentials: true });

  es.addEventListener('NUEVO_PEDIDO_REPARTO', (ev) => {
    try { onEvent('NUEVO_PEDIDO_REPARTO', JSON.parse(ev.data)); } catch {}
  });

  es.onerror = () => { /* el retry lo maneja el servidor */ };
  return () => es.close();
}
