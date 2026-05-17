import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import { getJobs, createJob, updateJob  } from '../services/api';

const STATUSES = ['All', 'Applied', 'Interview', 'Offer', 'Rejected'];

export default function Dashboard() {
  const [jobs,     setJobs]     = useState([]);
  const [filter,   setFilter]   = useState('All');
  const [search,   setSearch]   = useState('');
  const [sortBy,   setSortBy]   = useState('newest');
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [activeAICard, setActiveAICard] = useState(null);
  const [aiTab, setActiveAITab] = useState(null); // 'analysis' | 'cover' | 'interview'
  const [aiState, setAiState] = useState('maximized'); // 'minimized' | 'maximized'
  const [loading,  setLoading]  = useState(true);
  const [form, setForm] = useState({ company: '', role: '', status: 'Applied', jobDescription: '', notes: '', followUpDate: '' });
  const [files, setFiles] = useState({ jdFile: null, resumeFile: null });

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await getJobs();
      setJobs(data);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!editingJob && !files.resumeFile) {
      toast.error('Please upload your resume to add a new job.');
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (files.jdFile) formData.append('jdFile', files.jdFile);
    if (files.resumeFile) formData.append('resumeFile', files.resumeFile);

    try {
      if (editingJob) {
        await updateJob(editingJob._id, formData);
        toast.success('Job updated successfully');
        setEditingJob(null);
      } else {
        await createJob(formData);
        toast.success('Job added successfully');
      }
      setForm({ company: '', role: '', status: 'Applied', jobDescription: '', notes: '', followUpDate: '' });
      setFiles({ jdFile: null, resumeFile: null });
      setShowForm(false);
      fetchJobs();
    } catch { toast.error(editingJob ? 'Failed to update job' : 'Failed to add job'); }
  };

  const startEdit = (job) => {
    setEditingJob(job);
    setForm({
      company: job.company,
      role: job.role,
      status: job.status,
      jobDescription: job.jobDescription || '',
      notes: job.notes || '',
      followUpDate: job.followUpDate ? new Date(job.followUpDate).toISOString().split('T')[0] : ''
    });
    setFiles({ jdFile: null, resumeFile: null });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingJob(null);
    setForm({ company: '', role: '', status: 'Applied', jobDescription: '', notes: '', followUpDate: '' });
    setFiles({ jdFile: null, resumeFile: null });
    setShowForm(false);
  };

  const handleTextareaInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 300) + 'px';
  };

  let filteredJobs = filter === 'All' ? jobs : jobs.filter(j => j.status === filter);
  if (search) filteredJobs = filteredJobs.filter(j =>
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.role.toLowerCase().includes(search.toLowerCase())
  );
  filteredJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'newest')    return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest')    return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'company')   return a.company.localeCompare(b.company);
    return 0;
  });

  const counts = {
    Applied:   jobs.filter(j => j.status === 'Applied').length,
    Interview: jobs.filter(j => j.status === 'Interview').length,
    Offer:     jobs.filter(j => j.status === 'Offer').length,
    Rejected:  jobs.filter(j => j.status === 'Rejected').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Navbar />
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        .job-card { animation: fadeIn 0.6s ease-out backwards; }
        .job-card:hover { transform: translateY(-8px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6) !important; }
        button:active { transform: scale(0.95); }
        select:hover, input:hover { border-color: #6366f1 !important; }
      `}</style>
      <div style={styles.container}>

        <div style={styles.stats}>
          {[
            { label: 'Applied',   count: counts.Applied,   color: '#60a5fa' },
            { label: 'Interview', count: counts.Interview, color: '#fbbf24' },
            { label: 'Offers',    count: counts.Offer,     color: '#34d399' },
            { label: 'Rejected',  count: counts.Rejected,  color: '#f87171' },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <p style={{ ...styles.statCount, color: s.color }}>{s.count}</p>
              <p style={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={styles.headerRow}>
          <h2 style={styles.heading}>Job Tracker</h2>
          {!showForm && (
            <button style={styles.addBtn} onClick={() => { setEditingJob(null); setShowForm(true); }}>
              + Add New Job
            </button>
          )}
        </div>

        {showForm && (
          <form style={styles.form} onSubmit={handleCreate}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ ...styles.heading, fontSize: '20px' }}>
                {editingJob ? '📝 Edit Job' : '🚀 Add New Job'}
              </h3>
              <button type="button" onClick={cancelEdit} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={styles.formRow}>
              <input style={styles.input} placeholder="Company Name" value={form.company} onChange={e => setForm({...form, company: e.target.value})} required />
              <input style={styles.input} placeholder="Role / Position" value={form.role} onChange={e => setForm({...form, role: e.target.value})} required />
              <div style={styles.selectWrapper}>
                <select style={styles.select} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="Applied" style={styles.option}>Applied</option>
                  <option value="Interview" style={styles.option}>Interview</option>
                  <option value="Offer" style={styles.option}>Offer</option>
                  <option value="Rejected" style={styles.option}>Rejected</option>
                </select>
              </div>
            </div>

            <div style={styles.textareaContainer}>
              <textarea 
                style={styles.textarea} 
                placeholder="Paste Job Description here..." 
                value={form.jobDescription} 
                onInput={handleTextareaInput}
                onChange={e => setForm({...form, jobDescription: e.target.value})} 
              />
              <div style={styles.fileRow}>
                <label style={styles.fileLabel}>
                  📄 {files.jdFile ? files.jdFile.name : (editingJob?.jdFileName ? editingJob.jdFileName : 'Upload JD (PDF/TXT)')}
                  <input type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={e => setFiles({...files, jdFile: e.target.files[0]})} />
                </label>
              </div>
            </div>

            <div style={styles.uploadSection}>
              <div style={styles.resumeUpload}>
                <label style={styles.label}>My Resume <span style={{color: '#f87171'}}>*</span></label>
                <label style={styles.fileLabelLarge}>
                  📁 {files.resumeFile ? files.resumeFile.name : (editingJob?.resumeFileName ? editingJob.resumeFileName : 'Click to upload your resume')}
                  <input type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={e => setFiles({...files, resumeFile: e.target.files[0]})} />
                </label>
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Notes (Optional)</label>
                <input style={{ ...styles.input, marginBottom: '16px' }} placeholder="Personal notes..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                <label style={styles.label}>Follow-up Date</label>
                <input type="date" style={styles.input} value={form.followUpDate} onChange={e => setForm({...form, followUpDate: e.target.value})} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" style={styles.submitBtn}>
                {editingJob ? '💾 Save Changes' : '➕ Add Job'}
              </button>
              {editingJob && (
                <button type="button" onClick={cancelEdit} style={{ ...styles.submitBtn, background: '#1e293b', border: '1px solid #334155', color: '#94a3b8' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div style={styles.searchRow}>
          <input style={styles.searchInput} placeholder="🔍 Search by company or role..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="company">Company A-Z</option>
          </select>
        </div>

        <div style={styles.filters}>
          {STATUSES.map(s => (
            <button key={s} style={{ ...styles.filterBtn, ...(filter === s ? styles.activeFilter : {}) }} onClick={() => setFilter(s)}>
              {s} {s !== 'All' && <span style={styles.filterCount}>{counts[s] || 0}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={styles.empty}>Loading...</p>
        ) : filteredJobs.length === 0 ? (
          <p style={styles.empty}>No jobs found. Add your first application!</p>
        ) : (
          <div style={styles.grid}>
            {filteredJobs.map(job => (
              <JobCard 
                key={job._id} 
                job={job} 
                onDelete={fetchJobs} 
                onUpdate={fetchJobs} 
                onEdit={() => startEdit(job)}
                onAIAction={(tab) => { setActiveAICard(job); setActiveAITab(tab); setAiState('maximized'); }}
                isBlurred={(editingJob && editingJob._id === job._id) || (activeAICard && activeAICard._id === job._id)}
                className="job-card"
              />
            ))}
          </div>
        )}

        {/* AI Bottom Drawer */}
        {activeAICard && aiTab && (
          <div style={{
            ...styles.aiDrawer,
            height: aiState === 'maximized' ? '70vh' : '60px',
            bottom: activeAICard ? '0' : '-100%'
          }}>
            <div style={styles.drawerHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>
                  {aiTab === 'analysis' ? '🤖' : aiTab === 'cover' ? '✉️' : '🎯'}
                </span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
                  {activeAICard.company} - {aiTab === 'analysis' ? 'AI Analysis' : aiTab === 'cover' ? 'Cover Letter' : 'Interview Prep'}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setAiState(aiState === 'maximized' ? 'minimized' : 'maximized')}
                  style={styles.drawerBtn}
                >
                  {aiState === 'maximized' ? '➖' : '🔳'}
                </button>
                <button 
                  onClick={() => { setActiveAICard(null); setActiveAITab(null); }}
                  style={{ ...styles.drawerBtn, color: '#f87171' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {aiState === 'maximized' && (
              <div style={styles.drawerContent}>
                <JobCard 
                  job={activeAICard} 
                  initialTab={aiTab} 
                  isStatic={true} // New prop for static view
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1400px', margin: '0 auto', padding: '40px 32px' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' },
  statCard: { background: '#1e293b', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  statCount: { fontSize: '42px', fontWeight: '800', marginBottom: '4px' },
  statLabel: { fontSize: '14px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  heading: { fontSize: '28px', fontWeight: '800', color: '#f1f5f9' },
  addBtn: { padding: '12px 24px', background: '#6366f1', border: 'none', borderRadius: '10px', color: 'white', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' },
  exportBtn: { padding: '12px 24px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#94a3b8', fontSize: '15px', cursor: 'pointer' },
  form: { background: '#1e293b', padding: '32px', borderRadius: '16px', marginBottom: '32px', border: '1px solid #334155' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' },
  input: { width: '100%', padding: '12px 16px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '15px', outline: 'none', marginBottom: '16px' },
  selectWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  select: { 
    width: '100%', 
    padding: '12px 16px', 
    background: '#0f172a', 
    border: '1px solid #334155', 
    borderRadius: '10px', 
    color: '#f1f5f9', 
    fontSize: '15px', 
    outline: 'none', 
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    backgroundSize: '18px',
    cursor: 'pointer',
    marginBottom: '16px'
  },
  option: { background: '#1e293b', color: '#f1f5f9' },
  uploadSection: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
  textareaContainer: { background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', overflow: 'hidden' },
  textarea: { 
    width: '100%', 
    minHeight: '120px', 
    maxHeight: '400px',
    padding: '16px', 
    background: 'transparent', 
    border: 'none', 
    color: '#f1f5f9', 
    fontSize: '15px', 
    outline: 'none', 
    resize: 'none',
    display: 'block'
  },
  fileRow: { padding: '8px 12px', background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  fileLabel: { fontSize: '14px', color: '#6366f1', cursor: 'pointer', fontWeight: '700' },
  fileLabelLarge: { 
    display: 'block', 
    padding: '32px', 
    background: '#0f172a', 
    border: '2px dashed #334155', 
    borderRadius: '10px', 
    textAlign: 'center', 
    color: '#94a3b8', 
    fontSize: '15px', 
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  fileName: { fontSize: '14px', color: '#34d399', fontWeight: '600' },
  resumeUpload: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  label: { fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '6px' },
  submitBtn: { width: '100%', padding: '14px', background: '#6366f1', border: 'none', borderRadius: '10px', color: 'white', fontSize: '16px', fontWeight: '800', cursor: 'pointer', marginTop: '12px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  searchRow: { display: 'flex', gap: '16px', marginBottom: '24px' },
  searchInput: { flex: 1, padding: '12px 20px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9', fontSize: '15px', outline: 'none', transition: 'all 0.3s ease' },
  sortSelect: { 
    padding: '12px 36px 12px 20px', 
    background: '#1e293b url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23f1f5f9\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E") no-repeat right 16px center',
    backgroundSize: '14px',
    border: '1px solid #334155', 
    borderRadius: '10px', 
    color: '#f1f5f9', 
    fontSize: '15px', 
    outline: 'none', 
    transition: 'all 0.3s ease',
    appearance: 'none',
    cursor: 'pointer'
  },
  filters: { display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' },
  filterBtn: { padding: '10px 20px', background: '#1e293b', border: '1px solid #334155', borderRadius: '24px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  activeFilter: { background: '#6366f1', borderColor: '#6366f1', color: 'white' },
  filterCount: { background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '2px 8px', fontSize: '12px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '24px', alignItems: 'start' },
  empty: { textAlign: 'center', color: '#64748b', padding: '80px', fontSize: '18px' },
  aiDrawer: {
    position: 'fixed',
    left: '0',
    right: '0',
    background: '#0f172a',
    borderTop: '2px solid #334155',
    boxShadow: '0 -20px 50px rgba(0,0,0,0.6)',
    zIndex: '1000',
    transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    display: 'flex',
    flexDirection: 'column'
  },
  drawerHeader: {
    padding: '16px 24px',
    background: '#1e293b',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'default',
    borderBottom: '1px solid #334155'
  },
  drawerBtn: {
    background: '#0f172a',
    border: '1px solid #334155',
    color: '#94a3b8',
    padding: '4px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  drawerContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%'
  }
};