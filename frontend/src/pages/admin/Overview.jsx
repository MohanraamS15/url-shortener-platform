import { useState, useEffect, useCallback } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, BarController, LineController } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { apiAdminStats } from '../../utils/api';
import { fmtTime, truncate } from '../../utils/auth';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, BarController, LineController);

export default function Overview() {
  const { showToast } = useToast();
  const { theme }     = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { res, data: resData } = await apiAdminStats();
      if (res.ok) setData(resData);
      else showToast(resData.msg || 'Failed to load stats.', 'error');
    } catch {
      showToast('Server error.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="page-body">
        <div className="loading-cell"><Spinner dark size={28} /><p style={{marginTop:12}}>Loading Overview...</p></div>
      </div>
    );
  }

  if (!data) return null;

  const { overview, urlsPerDay, topUrls } = data;

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#7880a8' : '#717499';

  const chartData = {
    labels: urlsPerDay.map(d => d._id),
    datasets: [
      {
        type: 'bar',
        label: 'URLs Created',
        data: urlsPerDay.map(d => d.count),
        backgroundColor: 'rgba(91,69,246,0.7)',
        borderColor: '#5b45f6',
        borderWidth: 1,
        borderRadius: 6,
        order: 1
      },
      {
        type: 'line',
        label: 'Clicks',
        data: urlsPerDay.map(d => d.clicks),
        borderColor: '#ff6b9d',
        backgroundColor: 'rgba(255,107,157,0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#ff6b9d',
        order: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: textColor, font: { family: 'Inter', size: 12 } } } },
    scales: {
      x: { ticks: { color: textColor, font: { size: 11 } }, grid: { color: gridColor } },
      y: { ticks: { color: textColor, font: { size: 11 } }, grid: { color: gridColor }, beginAtZero: true }
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Admin Overview</h1>
          <p>Platform-wide analytics and performance metrics.</p>
        </div>
      </div>

      <div className="page-body">
        <div className="stats-grid">
          <StatCard icon="🔗" value={overview.totalUrls} label="Total URLs" />
          <StatCard icon="👥" value={overview.totalUsers} label="Total Users" />
          <StatCard icon="✅" value={overview.activeUrls} label="Active URLs" />
          <StatCard icon="🗑️" value={overview.inactiveUrls} label="Inactive URLs" />
          <StatCard icon="👆" value={overview.totalClicks} label="Total Clicks" />
          <StatCard icon="📅" value={overview.urlsCreatedToday} label="Created Today" />
        </div>

        <div className="two-col">
          <div className="card full-col" style={{ gridColumn: '1/-1' }}>
            <div className="card-title">📈 URLs Created per Day <span className="badge badge-info" style={{ fontSize: 10, marginLeft: 8 }}>Last 30 days</span></div>
            <div className="chart-container">
              <Chart type="bar" data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="full-col">
          <div className="section-header">
            <span className="section-title">🏆 Top 5 Most Clicked URLs</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Original URL</th>
                  <th>Short Code</th>
                  <th>Clicks</th>
                  <th>Last Visited</th>
                  <th>Created By</th>
                </tr>
              </thead>
              <tbody>
                {!topUrls?.length ? (
                  <tr><td colSpan="6" style={{ textAlign:'center', padding:28, color:'var(--muted)' }}>No data yet.</td></tr>
                ) : (
                  topUrls.map((u, i) => (
                    <tr key={u.shortCode}>
                      <td>{i + 1}</td>
                      <td className="url-cell">
                        <a href={u.url} target="_blank" rel="noreferrer" title={u.url}>{truncate(u.url, 45)}</a>
                      </td>
                      <td><span className="short-code">{u.shortCode}</span></td>
                      <td><span className="click-count">{u.accessCount}</span></td>
                      <td>{fmtTime(u.lastAccessedAt)}</td>
                      <td>{u.createdBy ? <>{u.createdBy.name}<br/><small style={{color:'var(--muted)'}}>{u.createdBy.email}</small></> : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
