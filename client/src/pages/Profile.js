import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>👤 My Profile</h2>
          <p style={styles.subtitle}>Your profile details.</p>

          <div style={styles.userInfo}>
            <p style={styles.infoLabel}>Name</p>
            <p style={styles.infoValue}>{user?.name}</p>
            <p style={styles.infoLabel}>Email</p>
            <p style={styles.infoValue}>{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '700px', margin: '0 auto', padding: '40px 24px' },
  card: { background: '#1e293b', borderRadius: '16px', padding: '32px', border: '1px solid #334155' },
  title: { fontSize: '24px', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' },
  subtitle: { color: '#64748b', fontSize: '14px', marginBottom: '28px', lineHeight: '1.6' },
  userInfo: { background: '#0f172a', borderRadius: '10px', padding: '16px', marginBottom: '24px', display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'center' },
  infoLabel: { color: '#64748b', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' },
  infoValue: { color: '#f1f5f9', fontSize: '14px' },
};