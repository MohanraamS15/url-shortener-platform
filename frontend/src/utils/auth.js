export const getToken    = () => localStorage.getItem('token');
export const getUserName = () => localStorage.getItem('userName') || '';
export const getUserRole = () => localStorage.getItem('userRole') || 'user';

export const saveAuth = ({ token, name, role }) => {
  localStorage.setItem('token',    token);
  localStorage.setItem('userName', name);
  localStorage.setItem('userRole', role || 'user');
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
};

export const isLoggedIn = () => Boolean(getToken());
export const isAdmin    = () => getUserRole() === 'admin';

// Format helpers
export const fmtDate = (d) => {
  if (!d) return 'Never';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const fmtTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const truncate = (str = '', n = 45) =>
  str.length > n ? str.slice(0, n) + '…' : str;
