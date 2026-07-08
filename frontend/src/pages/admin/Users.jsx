import { useState, useEffect, useCallback } from 'react';
import { apiAdminAllUsers } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Spinner';

export default function Users() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { res, data } = await apiAdminAllUsers();
      if (res.ok) {
        setUsers(data.data || []);
      } else {
        showToast(data.msg || 'Failed to load users.', 'error');
      }
    } catch {
      showToast('Server error.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Users</h1>
          <p>All registered accounts on the platform.</p>
        </div>
      </div>

      <div className="page-body">
        <div className="section-header">
          <span className="section-title">Registered users</span>
          <button className="btn btn-ghost" onClick={load} style={{ padding: '7px 14px', fontSize: 13 }}>
            ⟳ Refresh
          </button>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-cell"><Spinner dark size={28} /><p style={{marginTop:12}}>Loading...</p></div>
          ) : users.length === 0 ? (
            <div className="empty-state"><h3>No users found</h3></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>URLs Created</th>
                  <th>Total Clicks</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id || u.email}>
                    <td><strong>{u.name}</strong></td>
                    <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                    <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                    <td><span className="click-count">{u.urlCount || 0}</span></td>
                    <td><span className="click-count">{(u.totalClicks || 0).toLocaleString()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
