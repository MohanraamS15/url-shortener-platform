import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRegister } from '../utils/api';
import { saveAuth } from '../utils/auth';
import ThemeToggle from '../components/ThemeToggle';

export default function Register() {
  const navigate = useNavigate();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [msg,      setMsg]      = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { setMsg('Please fill in all fields.'); return; }
    setMsg('');
    setLoading(true);
    try {
      const { res, data } = await apiRegister(name, email, password);
      if (res.ok) {
        saveAuth(data);
        navigate(data.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setMsg(data.msg || 'Registration failed.');
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

        <h1>Create account</h1>
        <p className="subtitle">Start shortening URLs in seconds.</p>

        {msg && <div className="form-msg error">{msg}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input id="name" type="text" placeholder="John Doe" autoComplete="name"
              value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" placeholder="you@example.com" autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="Min. 6 characters" autoComplete="new-password"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
