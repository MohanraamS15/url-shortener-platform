import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';
import { useToast } from '../context/ToastContext';
import { apiShortenUrl, apiGetMyUrls } from '../utils/api';
import { fmtDate } from '../utils/auth';

const SHORT_BASE = window.location.origin;

export default function Dashboard() {
  const { showToast } = useToast();
  const [url,     setUrl]     = useState('');
  const [customCode, setCustomCode] = useState('');
  const [result,  setResult]  = useState(null);
  const [formMsg, setFormMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats,   setStats]   = useState({ total: '—', clicks: '—', active: '—' });
  const [copied,  setCopied]  = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const { res, data } = await apiGetMyUrls();
      if (!res.ok) return;
      const urls = data.data || [];
      const total   = urls.length;
      const clicks  = urls.reduce((s, u) => s + (u.accessCount || 0), 0);
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const active  = urls.filter(u => u.lastAccessedAt && new Date(u.lastAccessedAt) > weekAgo).length;
      setStats({ total, clicks, active });
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url.trim()) { setFormMsg('Please enter a URL.'); return; }
    if (customCode && !/^[a-zA-Z0-9-]+$/.test(customCode)) {
      setFormMsg('Custom alias can only contain letters, numbers, and hyphens.'); return;
    }
    setFormMsg('');
    setResult(null);
    setLoading(true);
    try {
      const { res, data } = await apiShortenUrl(url.trim(), customCode.trim());
      if (!res.ok) { setFormMsg(data.msg || 'Something went wrong.'); return; }
      setResult(data);
      setUrl('');
      setCustomCode('');
      loadStats();
    } catch {
      setFormMsg('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const shortUrl = result ? `${SHORT_BASE}/shorten/${result.shortCode}` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { showToast('Copy failed.', 'error'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-header-text">
            <h1>Shorten a URL</h1>
            <p>Paste a long link and get a clean short one instantly.</p>
          </div>
        </div>

        <div className="page-body">
          {/* Shorten form */}
          <div className="card" style={{ marginBottom: 20 }}>
            {formMsg && <div className="form-msg error" style={{ marginBottom: 16 }}>{formMsg}</div>}
            <form onSubmit={handleShorten} noValidate>
              <div className="url-input-row" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 2 }}>
                  <input
                    type="url"
                    placeholder="https://your-very-long-url.com/goes/right/here"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Custom Alias (Optional)"
                    value={customCode}
                    onChange={e => setCustomCode(e.target.value)}
                    title="Letters, numbers, and hyphens only"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 0 }}>
                  {loading ? <Spinner /> : '✂️ Shorten'}
                </button>
              </div>
            </form>
          </div>

          {/* Result card */}
          {result && (
            <div className="result-card">
              <h3>Short link ready <span className="badge badge-success">✓ Created</span></h3>
              <div className="result-row">
                <span className="label">Original</span>
                <span className="value" title={result.url}>{result.url}</span>
              </div>
              <div className="result-row">
                <span className="label">Short URL</span>
                <span className="value">
                  <a href={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a>
                </span>
              </div>
              <div className="result-row">
                <span className="label">Clicks</span>
                <span className="value">{result.accessCount ?? 0}</span>
              </div>
              <div className="result-row">
                <span className="label">Last visited</span>
                <span className="value">{fmtDate(result.lastAccessedAt)}</span>
              </div>
              <div className="result-actions">
                <button
                  className={`btn btn-copy${copied ? ' copied' : ''}`}
                  onClick={handleCopy}
                >
                  {copied ? '✅ Copied!' : '📋 Copy link'}
                </button>
                <a href={shortUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
                  Open ↗
                </a>
              </div>
              <p className="expiry-note">⏱ This link stays active for 7 days from the last visit.</p>
            </div>
          )}

          {/* Quick stats */}
          <div className="stats-grid" style={{ marginTop: 28 }}>
            <StatCard icon="🔗" value={stats.total}  label="Total links" />
            <StatCard icon="👆" value={stats.clicks} label="Total clicks" />
            <StatCard icon="✅" value={stats.active} label="Active this week" />
          </div>
        </div>
      </main>
    </div>
  );
}
