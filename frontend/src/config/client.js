// frontend/src/config/client.js
import axios from "axios";

/**
 * Detecta la URL del backend desde varias fuentes:
 * - window.__API__  (opcional, si la inyectas)
 * - VITE_API / VITE_API_URL (Vite)
 * - REACT_APP_API (CRA)
 * - fallback: http://localhost:3001
 */
const API =
  (typeof window !== "undefined" && window.__API__) ||
  import.meta?.env?.VITE_API ||
  import.meta?.env?.VITE_API_URL ||
  process?.env?.REACT_APP_API ||
  "http://localhost:3001";

// Axios instance
export const http = axios.create({
  baseURL: API.replace(/\/$/, ""),
  withCredentials: true,        // envía cookies si las hubiera
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Interceptor: añade token y el ID del usuario en headers
http.interceptors.request.use((cfg) => {
  try {
    const rawUser = localStorage.getItem("usuario");
    const usuario = rawUser ? JSON.parse(rawUser) : null;

    // ID para que el backend nos identifique aunque no use cookies
    if (usuario?.id) {
      cfg.headers["X-Cajero-Id"] = String(usuario.id);
      cfg.headers["X-User-Id"] = String(usuario.id);
    }

    // Si manejas JWT (opcional)
    const token =
      localStorage.getItem("token") ||
      (usuario && usuario.token) ||
      null;
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return cfg;
});

// Interceptor de respuesta: si hay 401, redirige a /login
http.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        // Limpia sesión mínima
        localStorage.removeItem("token");
        // Redirige a login del frontend
        if (typeof window !== "undefined") {
          window.location.assign("/login");
        }
      } catch {}
    }
    return Promise.reject(err);
  }
);

// SSE con credenciales (cookies) si tu auth las usa
export function openSSE(path) {
  const url = `${API.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  // EventSource con cookies (para Railway si usas cookie-session)
  return new EventSource(url, { withCredentials: true });
}

export { API };
