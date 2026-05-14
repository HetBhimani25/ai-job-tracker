import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { getProfile, updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_SKILLS = [
  'React.js', 'Node.js', 'Express.js', 'MongoDB', 'PostgreSQL',
  'MySQL', 'Java', 'Spring Boot', 'Python', 'FastAPI',
  'JWT', 'REST APIs', 'GraphQL', 'Docker', 'AWS',
  'Git', 'TypeScript', 'Next.js', 'LangChain', 'Machine Learning'
];

export default function Profile() {
  const { user, updateSkills } = useAuth();
  const [skills, setSkills]   = useState('');
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    getProfile().then(({ data }) => setSkills(data.skills || ''));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ skills });
      updateSkills(skills);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const toggleSkill = (skill) => {
    const current = skills.split(',').map(s => s.trim()).filter(Boolean);
    const exists  = current.includes(skill);
    const updated = exists ? current.filter(s => s !== skill) : [...current, skill];
    setSkills(updated.join(', '));
  };

  const currentSkills = skills.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>⚙️ My Profile</h2>
          <p style={styles.subtitle}>Your skills are used for AI analysis, cover letter generation, and interview prep.</p>

          <div style={styles.userInfo}>
            <p style={styles.infoLabel}>Name</p>
            <p style={styles.infoValue}>{user?.name}</p>
            <p style={styles.infoLabel}>Email</p>
            <p style={styles.infoValue}>{user?.email}</p>
          </div>

          <div style={styles.section}>
            <p style={styles.sectionTitle}>Quick Add Skills</p>
            <div style={styles.tagCloud}>
              {SUGGESTED_SKILLS.map(skill => (
                <span
                  key={skill}
                  style={{ ...styles.tag, ...(currentSkills.includes(skill) ? styles.activeTag : {}) }}
                  onClick={() => toggleSkill(skill)}
                >
                  {currentSkills.includes(skill) ? '✓ ' : '+ '}{skill}
                </span>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <p style={styles.sectionTitle}>Your Skills (comma separated)</p>
            <textarea
              style={styles.textarea}
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="e.g. React.js, Node.js, MongoDB, Java, Spring Boot..."
              rows={4}
            />
            <p style={styles.hint}>💡 Be specific — the more detailed your skills, the better the AI analysis</p>
          </div>

          <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Profile'}
          </button>
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
  section: { marginBottom: '24px' },
  sectionTitle: { color: '#94a3b8', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' },
  tagCloud: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tag: { padding: '6px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '20px', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' },
  activeTag: { background: '#312e81', border: '1px solid #6366f1', color: '#a5b4fc' },
  textarea: { width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none', resize: 'vertical', lineHeight: '1.6' },
  hint: { color: '#475569', fontSize: '12px', marginTop: '8px' },
  saveBtn: { width: '100%', padding: '12px', background: '#6366f1', border: 'none', borderRadius: '8px', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
};