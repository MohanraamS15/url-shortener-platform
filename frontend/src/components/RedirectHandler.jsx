import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function RedirectHandler() {
  const { code } = useParams();

  useEffect(() => {
    // Instantly redirect the browser to the backend API endpoint
    // The backend will record the click and then send a 302 Redirect to the original URL
    window.location.href = `${API_BASE}/shorten/${code}`;
  }, [code]);

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: '#717499', fontFamily: 'Inter, sans-serif' }}>
      <h3>Redirecting...</h3>
    </div>
  );
}
