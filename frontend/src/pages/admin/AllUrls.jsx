import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiAdminAllUrls, apiDeleteUrl } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { fmtDate, fmtTime, truncate } from '../../utils/auth';
import Spinner from '../../components/Spinner';

const SHORT_BASE = window.location.origin;

export default function AllUrls() {
  const { showToast } = useToast();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [copied, setCopied] = useState(null);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { res, data } = await apiAdminAllUrls(p, 20);
      if (res.ok) {
        setUrls(data.data || []);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else {
        showToast(data.msg || 'Failed to load URLs.', 'error');
      }
    } catch {
      showToast('Server error.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(1); }, [load]);

  const handleDelete = async (shortCode) => {
    if (!confirm(`Permanently delete "${shortCode}"?`)) return;
    try {
      const { res, data } = await apiDeleteUrl(shortCode);
      if (res.ok) {
        setUrls(prev => prev.filter(u => u.shortCode !== shortCode));
        showToast('URL deleted.', 'success');
      } else {
        showToast(data.msg || 'Delete failed.', 'error');
      }
    } catch {
      showToast('Server error.', 'error');
    }
  };

  const handleCopy = async (shortCode) => {
    const url = `${SHORT_BASE}/shorten/${shortCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(shortCode);
      setTimeout(() => setCopied(null), 2000);
    } catch { showToast('Copy failed.', 'error'); }
  };

  const filteredUrls = useMemo(() => {
    if (!search) return urls;
    const q = search.toLowerCase();
    return urls.filter(u => u.url.toLowerCase().includes(q) || u.shortCode.toLowerCase().includes(q));
  }, [urls, search]);

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>All URLs</h1>
          <p>Every short URL created on the platform.</p>
        </div>
      </div>

      <div className="page-body">
        <div className="section-header">
          <span className="section-title">All shortened URLs</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="text"
              className="search-input"
              placeholder="Search URL or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="btn btn-ghost" onClick={() => load(page)} style={{ padding: '7px 14px', fontSize: 13 }}>
              ⟳ Refresh
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-cell"><Spinner dark size={28} /><p style={{marginTop:12}}>Loading...</p></div>
          ) : urls.length === 0 ? (
            <div className="empty-state"><h3>No URLs found</h3></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Original URL</th>
                  <th>Short Code</th>
                  <th>Clicks</th>
                  <th>Last Visited</th>
                  <th>Created</th>
                  <th>User</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUrls.map(u => (
                  <tr key={u.shortCode}>
                    <td className="url-cell">
                      <a href={u.url} target="_blank" rel="noreferrer" title={u.url}>{truncate(u.url, 45)}</a>
                    </td>
                    <td><span className="short-code">{u.shortCode}</span></td>
                    <td><span className="click-count">{u.accessCount ?? 0}</span></td>
                    <td>{fmtTime(u.lastAccessedAt)}</td>
                    <td>{fmtDate(u.createdAt)}</td>
                    <td>{u.createdBy ? <span title={u.createdBy.email}>{u.createdBy.name || u.createdBy.email}</span> : '—'}</td>
                    <td className="actions-cell">
                      <button className={`btn btn-copy${copied === u.shortCode ? ' copied' : ''}`} onClick={() => handleCopy(u.shortCode)}>📋</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(u.shortCode)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <span>Page {page} of {totalPages} &nbsp;·&nbsp; {total} total</span>
            {page > 1 && (
              <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => load(page - 1)}>← Prev</button>
            )}
            {page < totalPages && (
              <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => load(page + 1)}>Next →</button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
