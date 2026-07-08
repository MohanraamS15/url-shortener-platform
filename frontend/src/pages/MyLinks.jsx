import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { apiGetMyUrls, apiDeleteUrl } from '../utils/api';
import { fmtDate, fmtTime, truncate } from '../utils/auth';

const SHORT_BASE = window.location.origin;

export default function MyLinks() {
  const { showToast } = useToast();
  const [urls,    setUrls]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(null); // shortCode of copied item

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { res, data } = await apiGetMyUrls();
      if (res.ok) setUrls(data.data || []);
      else showToast(data.msg || 'Failed to load links.', 'error');
    } catch {
      showToast('Server error — is the backend running?', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleCopy = async (shortCode) => {
    const url = `${SHORT_BASE}/shorten/${shortCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(shortCode);
      setTimeout(() => setCopied(null), 2000);
    } catch { showToast('Copy failed.', 'error'); }
  };

  const handleDelete = async (shortCode) => {
    if (!confirm(`Delete short link "${shortCode}"? This cannot be undone.`)) return;
    try {
      const { res, data } = await apiDeleteUrl(shortCode);
      if (res.ok) {
        setUrls(prev => prev.filter(u => u.shortCode !== shortCode));
        showToast('Link deleted.', 'success');
      } else {
        showToast(data.msg || 'Delete failed.', 'error');
      }
    } catch { showToast('Server error.', 'error'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-header-text">
            <h1>My Links</h1>
            <p>All your shortened URLs — click counts, last visited, and more.</p>
          </div>
        </div>

        <div className="page-body">
          <div className="section-header">
            <span className="section-title">Your shortened URLs</span>
            <button className="btn btn-ghost" onClick={load} style={{ padding: '7px 14px', fontSize: 13 }}>
              ⟳ Refresh
            </button>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div className="loading-cell">
                <Spinner dark size={28} />
                <p style={{ marginTop: 12, color: 'var(--muted)' }}>Loading your links…</p>
              </div>
            ) : urls.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔗</div>
                <h3>No links yet</h3>
                <p>Go to Dashboard and shorten your first URL!</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Original URL</th>
                    <th>Short Code</th>
                    <th>Clicks</th>
                    <th>Last Visited</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map(u => {
                    const sUrl = `${SHORT_BASE}/shorten/${u.shortCode}`;
                    return (
                      <tr key={u.shortCode}>
                        <td className="url-cell">
                          <a href={u.url} target="_blank" rel="noreferrer" title={u.url}>
                            {truncate(u.url)}
                          </a>
                        </td>
                        <td><span className="short-code">{u.shortCode}</span></td>
                        <td><span className="click-count">{u.accessCount ?? 0}</span></td>
                        <td>{fmtTime(u.lastAccessedAt)}</td>
                        <td>{fmtDate(u.createdAt)}</td>
                        <td className="actions-cell">
                          <button
                            className={`btn btn-copy${copied === u.shortCode ? ' copied' : ''}`}
                            onClick={() => handleCopy(u.shortCode)}
                          >
                            {copied === u.shortCode ? '✅' : '📋'} Copy
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(u.shortCode)}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
