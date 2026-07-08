import { NavLink, useNavigate } from 'react-router-dom';
import { getUserName, getUserRole, clearAuth, isAdmin } from '../utils/auth';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const navigate  = useNavigate();
  const name      = getUserName();
  const role      = getUserRole();
  const initial   = name.charAt(0).toUpperCase() || '?';

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-icon">LS</div>
        <span className="logo-text">LinkSnip</span>
      </div>

      <NavLink
        to="/dashboard"
        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      >
        <span className="nav-icon">🔗</span> Dashboard
      </NavLink>

      <NavLink
        to="/my-links"
        className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      >
        <span className="nav-icon">📋</span> My Links
      </NavLink>

      {isAdmin() && (
        <NavLink
          to="/admin"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">⚙️</span> Admin Panel
        </NavLink>
      )}

      <div className="sidebar-bottom">
        <div className="user-profile">
          <div className="user-avatar">{initial}</div>
          <div className="user-info">
            <div className="user-name">{name}</div>
            <div className="user-role">{role}</div>
          </div>
        </div>
        <ThemeToggle wide />
        <button className="btn-logout" onClick={handleLogout}>
          <span>⎋</span> Logout
        </button>
      </div>
    </aside>
  );
}
