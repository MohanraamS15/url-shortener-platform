import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getUserName, clearAuth } from '../../utils/auth';
import ThemeToggle from '../../components/ThemeToggle';

export default function AdminLayout() {
  const navigate = useNavigate();
  const name     = getUserName();

  const handleLogout = () => { clearAuth(); navigate('/'); };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-icon">LS</div>
          <span className="logo-text">LinkSnip</span>
        </div>

        <NavLink to="/admin"     end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">📊</span> Overview
        </NavLink>
        <NavLink to="/admin/urls"    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">🔗</span> All URLs
        </NavLink>
        <NavLink to="/admin/users"   className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">👥</span> Users
        </NavLink>
        <NavLink to="/dashboard"     className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">⬅️</span> Back to App
        </NavLink>

        <div className="sidebar-bottom">
          <div className="user-profile">
            <div className="user-avatar">{name.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{name}</div>
              <div className="user-role">admin</div>
            </div>
          </div>
          <ThemeToggle wide />
          <button className="btn-logout" onClick={handleLogout}>
            <span>⎋</span> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
