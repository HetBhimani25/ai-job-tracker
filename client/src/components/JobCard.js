import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateJob, deleteJob, analyzeJD, getCoverLetter, getInterviewPrep } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  Applied:   { bg: '#1e3a5f', text: '#60a5fa' },
  Interview: { bg: '#3b2f00', text: '#fbbf24' },
  Offer:     { bg: '#064e3b', text: '#34d399' },
  Rejected:  { bg: '#450a0a', text: '#f87171' },
};

export default function JobCard({ job, onUpdate, onDelete, onEdit, isBlurred, onAIAction, initialTab, isStatic, className }) {
  const { skills, user } = useAuth();
  const [tab, setTab]             = useState(initialTab || null); // 'analysis' | 'cover' | 'interview'
  const [analysis, setAnalysis]   = useState(job.aiAnalysis ? JSON.parse(job.aiAnalysis) : null);
  const [coverLetter, setCoverLetter] = useState('');
  const [interviewQ, setInterviewQ]   = useState(null);
  const [loading, setLoading]     = useState(false);

  const userSkills = skills || 'Java, Spring Boot, React.js, Node.js, MongoDB, REST APIs';

  const handleStatusChange = async (newStatus) => {
    try {
      const { data } = await updateJob(job._id, { status: newStatus });
      onUpdate(data);
      toast.success('Status updated!');
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await deleteJob(job._id);
      onDelete(job._id);
      toast.success('Job deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleAnalyze = async () => {
    if (onAIAction && !isStatic) { onAIAction('analysis'); return; }
    if (!job.jobDescription) return toast.error('No job description to analyze');
    setLoading(true); setTab('analysis');
    try {
      const { data } = await analyzeJD({ 
        jobDescription: job.jobDescription, 
        userSkills, 
        resumeText: job.resumeText || '' 
      });
      setAnalysis(data);
      await updateJob(job._id, { aiAnalysis: JSON.stringify(data) });
      toast.success('Analysis complete!');
    } catch { toast.error('Analysis failed'); }
    finally { setLoading(false); }
  };

  const handleCoverLetter = async () => {
    if (onAIAction && !isStatic) { onAIAction('cover'); return; }
    if (!job.jobDescription) return toast.error('No job description found');
    setLoading(true); setTab('cover');
    try {
      const { data } = await getCoverLetter({ jobDescription: job.jobDescription, userSkills, userName: user?.name, company: job.company, role: job.role });
      setCoverLetter(data.coverLetter);
      toast.success('Cover letter ready!');
    } catch { toast.error('Generation failed'); }
    finally { setLoading(false); }
  };

  const handleInterviewPrep = async () => {
    if (onAIAction && !isStatic) { onAIAction('interview'); return; }
    if (!job.jobDescription) return toast.error('No job description found');
    setLoading(true); setTab('interview');
    try {
      const { data } = await getInterviewPrep({ jobDescription: job.jobDescription, userSkills, role: job.role });
      setInterviewQ(data.questions);
      toast.success('Interview questions ready!');
    } catch { toast.error('Generation failed'); }
    finally { setLoading(false); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const isOverdue = job.followUpDate && new Date(job.followUpDate) < new Date() && job.status === 'Applied';
  const sc = STATUS_COLORS[job.status] || STATUS_COLORS.Applied;

  if (isStatic) {
    return (
      <div style={{ ...styles.panel, marginTop: 0, border: 'none', background: 'transparent' }}>
        {tab === 'analysis' && analysis && (
          <div>
            <div style={styles.scoreRow}>
              <span style={styles.scoreLabel}>Match Score</span>
              <span style={styles.score}>{analysis.matchScore}%</span>
            </div>
            <div style={styles.scoreBar}><div style={{ ...styles.scoreBarFill, width: `${analysis.matchScore}%` }} /></div>
            <Section title="✅ Strong Matches">
              <div style={styles.tags}>{analysis.strongMatches?.map(s => <span key={s} style={styles.greenTag}>{s}</span>)}</div>
            </Section>
            <Section title="⚠️ Skill Gaps">
              <div style={styles.tags}>{analysis.skillGaps?.map(s => <span key={s} style={styles.redTag}>{s}</span>)}</div>
            </Section>
            <Section title="💡 Resume Tips">
              {analysis.resumeTips?.map((t, i) => <p key={i} style={styles.tip}>• {t}</p>)}
            </Section>
            <Section title="📋 Summary">
              <p style={styles.summary}>{analysis.summary}</p>
            </Section>
          </div>
        )}
        {tab === 'cover' && coverLetter && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={styles.panelTitle}>✉️ Cover Letter</p>
              <button style={styles.copyBtn} onClick={() => copyToClipboard(coverLetter)}>📋 Copy</button>
            </div>
            <p style={styles.coverText}>{coverLetter}</p>
          </div>
        )}
        {tab === 'interview' && interviewQ && (
          <div>
            <Section title="💻 Technical Questions">
              {interviewQ.technical?.map((q, i) => <p key={i} style={styles.question}>Q{i+1}. {q}</p>)}
            </Section>
            <Section title="🤝 Behavioral Questions">
              {interviewQ.behavioral?.map((q, i) => <p key={i} style={styles.question}>Q{i+1}. {q}</p>)}
            </Section>
            <Section title="📌 Preparation Tips">
              {interviewQ.tips?.map((t, i) => <p key={i} style={styles.tip}>• {t}</p>)}
            </Section>
          </div>
        )}
        {loading && <p style={styles.loading}>⏳ AI is thinking...</p>}
        {tab === 'analysis' && !analysis && !loading && <button style={styles.saveBtn} onClick={handleAnalyze}>Generate Analysis</button>}
        {tab === 'cover' && !coverLetter && !loading && <button style={styles.saveBtn} onClick={handleCoverLetter}>Generate Cover Letter</button>}
        {tab === 'interview' && !interviewQ && !loading && <button style={styles.saveBtn} onClick={handleInterviewPrep}>Generate Interview Prep</button>}
      </div>
    );
  }

  return (
    <div className={className} style={{ 
      ...styles.card, 
      borderColor: isOverdue ? '#ef4444' : '#334155',
      filter: isBlurred ? 'blur(4px)' : 'none',
      opacity: isBlurred ? 0.7 : 1,
      pointerEvents: isBlurred ? 'none' : 'auto',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.role}>{job.company}</h3>
          <p style={styles.company}>{job.role}</p>
        </div>
        <div style={styles.statusContainer}>
          <select 
            style={{ 
              ...styles.select, 
              color: sc.text, 
              borderColor: sc.text,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${sc.text.replace('#', '%23')}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
            }} 
            value={job.status} 
            onChange={e => handleStatusChange(e.target.value)}
          >
            {['Applied','Interview','Offer','Rejected'].map(s => (
              <option key={s} style={{ background: '#1e293b', color: '#f1f5f9' }}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {job.notes        && <p style={styles.notes}>📝 {job.notes}</p>}
      {isOverdue        && <p style={styles.overdue}>⚠️ Follow-up overdue!</p>}
      {job.followUpDate && !isOverdue && <p style={styles.followup}>🔔 Follow-up: {new Date(job.followUpDate).toLocaleDateString()}</p>}
      <p style={styles.date}>📅 {new Date(job.appliedDate).toLocaleDateString()}</p>

      {/* Action Buttons */}
      <div style={styles.actions}>
        <button style={styles.aiBtn} onClick={handleAnalyze} disabled={loading}>🤖 Analyze</button>
        <button style={styles.aiBtn} onClick={handleCoverLetter} disabled={loading}>✉️ Cover Letter</button>
        <button style={styles.aiBtn} onClick={handleInterviewPrep} disabled={loading}>🎯 Interview Prep</button>
        <button style={styles.editBtn} onClick={onEdit}>✏️</button>
        <button style={styles.deleteBtn} onClick={handleDelete}>🗑️</button>
      </div>

      {loading && <p style={styles.loading}>⏳ AI is thinking...</p>}

      {/* Tab: Analysis */}
      {tab === 'analysis' && analysis && (
        <div style={styles.panel}>
          <div style={styles.scoreRow}>
            <span style={styles.scoreLabel}>Match Score</span>
            <span style={styles.score}>{analysis.matchScore}%</span>
          </div>
          <div style={styles.scoreBar}><div style={{ ...styles.scoreBarFill, width: `${analysis.matchScore}%` }} /></div>
          <Section title="✅ Strong Matches">
            <div style={styles.tags}>{analysis.strongMatches?.map(s => <span key={s} style={styles.greenTag}>{s}</span>)}</div>
          </Section>
          <Section title="⚠️ Skill Gaps">
            <div style={styles.tags}>{analysis.skillGaps?.map(s => <span key={s} style={styles.redTag}>{s}</span>)}</div>
          </Section>
          <Section title="💡 Resume Tips">
            {analysis.resumeTips?.map((t, i) => <p key={i} style={styles.tip}>• {t}</p>)}
          </Section>
          <Section title="📋 Summary">
            <p style={styles.summary}>{analysis.summary}</p>
          </Section>
        </div>
      )}

      {/* Tab: Cover Letter */}
      {tab === 'cover' && coverLetter && (
        <div style={styles.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={styles.panelTitle}>✉️ Cover Letter</p>
            <button style={styles.copyBtn} onClick={() => copyToClipboard(coverLetter)}>📋 Copy</button>
          </div>
          <p style={styles.coverText}>{coverLetter}</p>
        </div>
      )}

      {/* Tab: Interview Prep */}
      {tab === 'interview' && interviewQ && (
        <div style={styles.panel}>
          <Section title="💻 Technical Questions">
            {interviewQ.technical?.map((q, i) => <p key={i} style={styles.question}>Q{i+1}. {q}</p>)}
          </Section>
          <Section title="🤝 Behavioral Questions">
            {interviewQ.behavioral?.map((q, i) => <p key={i} style={styles.question}>Q{i+1}. {q}</p>)}
          </Section>
          <Section title="📌 Preparation Tips">
            {interviewQ.tips?.map((t, i) => <p key={i} style={styles.tip}>• {t}</p>)}
          </Section>
        </div>
      )}
    </div>
  );
}

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '12px' }}>
    <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{title}</p>
    {children}
  </div>
);

const styles = {
  card: { background: '#1e293b', borderRadius: '20px', padding: '36px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  role: { fontSize: '24px', fontWeight: '800', color: '#f1f5f9', marginBottom: '8px' },
  company: { fontSize: '19px', color: '#6366f1', fontWeight: '700' },
  badge: { padding: '8px 20px', borderRadius: '30px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' },
  statusContainer: { display: 'flex', alignItems: 'center' },
  select: { 
    background: '#0f172a', 
    color: '#f1f5f9', 
    border: '1px solid #334155', 
    borderRadius: '30px', 
    padding: '8px 42px 8px 18px', 
    fontSize: '15px', 
    fontWeight: '700',
    appearance: 'none',
    cursor: 'pointer',
    outline: 'none',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    backgroundSize: '16px',
  },
  notes: { fontSize: '15px', color: '#94a3b8', marginBottom: '8px', lineHeight: '1.5' },
  overdue: { fontSize: '14px', color: '#f87171', marginBottom: '6px', fontWeight: '700' },
  followup: { fontSize: '14px', color: '#fbbf24', marginBottom: '6px' },
  date: { fontSize: '14px', color: '#64748b', marginBottom: '16px' },
  actions: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' },
  aiBtn: { padding: '8px 16px', background: '#4f46e5', border: 'none', borderRadius: '10px', color: 'white', fontSize: '14px', cursor: 'pointer', fontWeight: '700', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  editBtn: { padding: '8px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  deleteBtn: { padding: '8px 14px', background: '#450a0a', border: 'none', borderRadius: '10px', color: '#f87171', fontSize: '14px', cursor: 'pointer', marginLeft: 'auto', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  loading: { fontSize: '15px', color: '#6366f1', marginTop: '10px', textAlign: 'center' },
  panel: { marginTop: '20px', background: '#0f172a', borderRadius: '14px', padding: '20px', border: '1px solid #1e3a5f' },
  panelTitle: { fontSize: '16px', fontWeight: '800', color: '#f1f5f9', marginBottom: '16px' },
  scoreRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  scoreLabel: { fontSize: '15px', color: '#94a3b8', fontWeight: '700' },
  score: { fontSize: '24px', fontWeight: '900', color: '#6366f1' },
  scoreBar: { background: '#1e293b', borderRadius: '12px', height: '10px', marginBottom: '18px' },
  scoreBarFill: { background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '12px', height: '10px' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  greenTag: { padding: '4px 14px', background: '#064e3b', color: '#34d399', borderRadius: '24px', fontSize: '14px' },
  redTag: { padding: '4px 14px', background: '#450a0a', color: '#f87171', borderRadius: '24px', fontSize: '14px' },
  tip: { fontSize: '15px', color: '#94a3b8', marginBottom: '6px', lineHeight: '1.6' },
  summary: { fontSize: '15px', color: '#cbd5e1', lineHeight: '1.7', fontStyle: 'italic' },
  question: { fontSize: '15px', color: '#e2e8f0', marginBottom: '10px', lineHeight: '1.7', padding: '12px', background: '#1e293b', borderRadius: '8px' },
  coverText: { fontSize: '15px', color: '#cbd5e1', lineHeight: '1.9', whiteSpace: 'pre-wrap' },
  copyBtn: { padding: '6px 16px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer' },
  input: { width: '100%', padding: '12px 16px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '15px', outline: 'none', marginBottom: '12px' },
  label: { fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '6px' },
  saveBtn: { width: '100%', padding: '14px', background: '#6366f1', border: 'none', borderRadius: '10px', color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' },
};