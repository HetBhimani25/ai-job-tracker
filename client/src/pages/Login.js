import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🎯</div>
        <h1 style={styles.title}>AI Job Tracker</h1>
        <p style={styles.subtitle}>Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email" placeholder="Email"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            required
          />
          <input
            style={styles.input}
            type="password" placeholder="Password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            required
          />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={styles.link}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.linkA}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' },
  card: { background: '#1e293b', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' },
  logo: { fontSize: '48px', textAlign: 'center', marginBottom: '8px' },
  title: { textAlign: 'center', fontSize: '24px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' },
  subtitle: { textAlign: 'center', color: '#94a3b8', marginBottom: '24px', fontSize: '14px' },
  input: { width: '100%', padding: '12px 16px', marginBottom: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' },
  btn: { width: '100%', padding: '12px', background: '#6366f1', border: 'none', borderRadius: '8px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' },
  link: { textAlign: 'center', marginTop: '20px', color: '#94a3b8', fontSize: '14px' },
  linkA: { color: '#6366f1', textDecoration: 'none', fontWeight: '600' },
};