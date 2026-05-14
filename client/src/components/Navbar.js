import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out!');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>🎯 AI Job Tracker</div>
      <div style={styles.right}>
        <Link to="/dashboard" style={styles.navLink}>Dashboard</Link>
        <Link to="/profile"   style={styles.navLink}>⚙️ Profile</Link>
        <span style={styles.username}>👤 {user?.name}</span>
        <button style={styles.btn} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: '#1e293b', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', position: 'sticky', top: 0, zIndex: 100 },
  brand: { fontSize: '20px', fontWeight: '700', color: '#f1f5f9' },
  right: { display: 'flex', alignItems: 'center', gap: '16px' },
  navLink: { color: '#94a3b8', fontSize: '14px', textDecoration: 'none', padding: '6px 10px', borderRadius: '6px' },
  username: { color: '#94a3b8', fontSize: '14px' },
  btn: { padding: '8px 16px', background: 'transparent', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
};