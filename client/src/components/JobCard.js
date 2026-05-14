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

export default function JobCard({ job, onUpdate, onDelete }) {
  const { skills, user } = useAuth();
  const [tab, setTab]             = useState(null); // 'analysis' | 'cover' | 'interview' | 'edit'
  const [analysis, setAnalysis]   = useState(job.aiAnalysis ? JSON.parse(job.aiAnalysis) : null);
  const [coverLetter, setCoverLetter] = useState('');
  const [interviewQ, setInterviewQ]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [editForm, setEditForm]   = useState({ company: job.company, role: job.role, status: job.status, jobDescription: job.jobDescription || '', notes: job.notes || '', followUpDate: job.followUpDate ? job.followUpDate.split('T')[0] : '' });

  const userSkills = skills || 'Java, Spring Boot, React.js, Node.js, MongoDB, REST APIs';

  const handleStatusChange = async (newStatus) => {
    try {
      const { data } = await updateJob(job._id, { status: newStatus });
      onUpdate(data); setEditStatus(false);
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

  const handleEdit = async () => {
    try {
      const { data } = await updateJob(job._id, editForm);
      onUpdate(data); setTab(null);
      toast.success('Job updated!');
    } catch { toast.error('Update failed'); }
  };

  const handleAnalyze = async () => {
    if (!job.jobDescription) return toast.error('No job description to analyze');
    setLoading(true); setTab('analysis');
    try {
      const { data } = await analyzeJD({ jobDescription: job.jobDescription, userSkills });
      setAnalysis(data);
      await updateJob(job._id, { aiAnalysis: JSON.stringify(data) });
      toast.success('Analysis complete!');
    } catch { toast.error('Analysis failed'); }
    finally { setLoading(false); }
  };

  const handleCoverLetter = async () => {
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

  return (
    <div style={{ ...styles.card, borderColor: isOverdue ? '#ef4444' : '#334155' }}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.role}>{job.role}</h3>
          <p style={styles.company}>{job.company}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          {editStatus ? (
            <select style={styles.select} value={job.status} onChange={e => handleStatusChange(e.target.value)}>
              {['Applied','Interview','Offer','Rejected'].map(s => <option key={s}>{s}</option>)}
            </select>
          ) : (
            <span style={{ ...styles.badge, background: sc.bg, color: sc.text }} onClick={() => setEditStatus(true)}>
              {job.status}
            </span>
          )}
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
        <button style={styles.editBtn} onClick={() => setTab(tab === 'edit' ? null : 'edit')}>✏️</button>
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

      {/* Tab: Edit */}
      {tab === 'edit' && (
        <div style={styles.panel}>
          <p style={styles.panelTitle}>✏️ Edit Job</p>
          <input style={styles.input} placeholder="Company" value={editForm.company} onChange={e => setEditForm({...editForm, company: e.target.value})} />
          <input style={styles.input} placeholder="Role" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} />
          <select style={styles.input} value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
            {['Applied','Interview','Offer','Rejected'].map(s => <option key={s}>{s}</option>)}
          </select>
          <textarea style={{...styles.input, height: '80px'}} placeholder="Job Description" value={editForm.jobDescription} onChange={e => setEditForm({...editForm, jobDescription: e.target.value})} />
          <textarea style={{...styles.input, height: '60px'}} placeholder="Notes" value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} />
          <label style={styles.label}>🔔 Follow-up Date</label>
          <input style={styles.input} type="date" value={editForm.followUpDate} onChange={e => setEditForm({...editForm, followUpDate: e.target.value})} />
          <button style={styles.saveBtn} onClick={handleEdit}>💾 Save Changes</button>
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
  card: { background: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  role: { fontSize: '16px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px' },
  company: { fontSize: '14px', color: '#6366f1', fontWeight: '600' },
  badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  select: { background: '#0f172a', color: '#f1f5f9', border: '1px solid #6366f1', borderRadius: '6px', padding: '4px 8px', fontSize: '12px' },
  notes: { fontSize: '13px', color: '#94a3b8', marginBottom: '4px' },
  overdue: { fontSize: '12px', color: '#f87171', marginBottom: '4px', fontWeight: '600' },
  followup: { fontSize: '12px', color: '#fbbf24', marginBottom: '4px' },
  date: { fontSize: '12px', color: '#64748b', marginBottom: '12px' },
  actions: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' },
  aiBtn: { padding: '6px 12px', background: '#4f46e5', border: 'none', borderRadius: '7px', color: 'white', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  editBtn: { padding: '6px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '7px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' },
  deleteBtn: { padding: '6px 10px', background: '#450a0a', border: 'none', borderRadius: '7px', color: '#f87171', fontSize: '12px', cursor: 'pointer', marginLeft: 'auto' },
  loading: { fontSize: '13px', color: '#6366f1', marginTop: '8px', textAlign: 'center' },
  panel: { marginTop: '16px', background: '#0f172a', borderRadius: '10px', padding: '16px', border: '1px solid #1e3a5f' },
  panelTitle: { fontSize: '14px', fontWeight: '700', color: '#f1f5f9', marginBottom: '12px' },
  scoreRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' },
  scoreLabel: { fontSize: '13px', color: '#94a3b8', fontWeight: '600' },
  score: { fontSize: '20px', fontWeight: '800', color: '#6366f1' },
  scoreBar: { background: '#1e293b', borderRadius: '10px', height: '8px', marginBottom: '14px' },
  scoreBarFill: { background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '10px', height: '8px' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  greenTag: { padding: '3px 10px', background: '#064e3b', color: '#34d399', borderRadius: '20px', fontSize: '12px' },
  redTag: { padding: '3px 10px', background: '#450a0a', color: '#f87171', borderRadius: '20px', fontSize: '12px' },
  tip: { fontSize: '13px', color: '#94a3b8', marginBottom: '4px', lineHeight: '1.5' },
  summary: { fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', fontStyle: 'italic' },
  question: { fontSize: '13px', color: '#e2e8f0', marginBottom: '8px', lineHeight: '1.6', padding: '8px', background: '#1e293b', borderRadius: '6px' },
  coverText: { fontSize: '13px', color: '#cbd5e1', lineHeight: '1.8', whiteSpace: 'pre-wrap' },
  copyBtn: { padding: '5px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' },
  input: { width: '100%', padding: '9px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '7px', color: '#f1f5f9', fontSize: '13px', outline: 'none', marginBottom: '8px' },
  label: { fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' },
  saveBtn: { width: '100%', padding: '10px', background: '#6366f1', border: 'none', borderRadius: '7px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' },
};