import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiLogin } from '../utils/api';
import { saveAuth } from '../utils/auth';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [msg,      setMsg]      = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const { res, data } = await apiLogin(email, password);
      if (res.ok) {
        saveAuth(data);
        navigate(data.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setMsg(data.msg || 'Invalid email or password.');
      }
    } catch {
      setMsg('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="brand">
            <div className="logo-icon">LS</div>
            <span className="logo-text">LinkSnip</span>
          </div>
          <ThemeToggle />
        </div>

        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to manage your short links.</p>

        {msg && <div className="form-msg error">{msg}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
