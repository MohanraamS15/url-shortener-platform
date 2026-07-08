// All API calls go through this module.
// Vite proxy forwards /auth and /shorten to localhost:5000.

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

const API_BASE = import.meta.env.VITE_API_URL || '';

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

// ── Auth ──────────────────────────────────────────────────────
export const apiLogin = (email, password) =>
  apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

export const apiRegister = (name, email, password) =>
  apiFetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

// ── URLs ──────────────────────────────────────────────────────
export const apiShortenUrl = (url, customCode = '') =>
  apiFetch('/shorten', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ url, customCode }),
  });

export const apiGetMyUrls = () =>
  apiFetch('/shorten/my-urls', { headers: authHeaders() });

export const apiDeleteUrl = (shortCode) =>
  apiFetch(`/shorten/${shortCode}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

// ── Admin ─────────────────────────────────────────────────────
export const apiAdminStats = () =>
  apiFetch('/shorten/admin/stats', { headers: authHeaders() });

export const apiAdminAllUrls = (page = 1, limit = 20) =>
  apiFetch(`/shorten/admin/urls?page=${page}&limit=${limit}`, {
    headers: authHeaders(),
  });

export const apiAdminAllUsers = () =>
  apiFetch('/shorten/admin/users', { headers: authHeaders() });
