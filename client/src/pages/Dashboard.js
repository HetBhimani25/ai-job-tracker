import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import JobCard from '../components/JobCard';
import { getJobs, createJob } from '../services/api';

const STATUSES = ['All', 'Applied', 'Interview', 'Offer', 'Rejected'];

export default function Dashboard() {
  const [jobs,     setJobs]     = useState([]);
  const [filter,   setFilter]   = useState('All');
  const [search,   setSearch]   = useState('');
  const [sortBy,   setSortBy]   = useState('newest');
  const [showForm, setShowForm] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [form, setForm] = useState({ company: '', role: '', status: 'Applied', jobDescription: '', notes: '', followUpDate: '' });

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
    try {
      const { data } = await createJob(form);
      setJobs([data, ...jobs]);
      setForm({ company: '', role: '', status: 'Applied', jobDescription: '', notes: '', followUpDate: '' });
      setShowForm(false);
      toast.success('Job added!');
    } catch { toast.error('Failed to add job'); }
  };

  const handleExport = () => {
    const rows = [['Company','Role','Status','Applied Date','Notes']];
    jobs.forEach(j => rows.push([j.company, j.role, j.status, new Date(j.appliedDate).toLocaleDateString(), j.notes || '']));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'job-applications.csv'; a.click();
    toast.success('Exported to CSV!');
  };

  let filtered = filter === 'All' ? jobs : jobs.filter(j => j.status === filter);
  if (search) filtered = filtered.filter(j =>
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.role.toLowerCase().includes(search.toLowerCase())
  );
  filtered = [...filtered].sort((a, b) => {
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
      <div style={styles.container}>

        {/* Stats */}
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

        {/* Header Row */}
        <div style={styles.headerRow}>
          <h2 style={styles.heading}>My Applications</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button style={styles.exportBtn} onClick={handleExport}>📥 Export CSV</button>
            <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ Add Job'}
            </button>
          </div>
        </div>

        {/* Add Job Form */}
        {showForm && (
          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.formRow}>
              <input style={styles.input} placeholder="Company *" value={form.company} onChange={e => setForm({...form, company: e.target.value})} required />
              <input style={styles.input} placeholder="Role *" value={form.role} onChange={e => setForm({...form, role: e.target.value})} required />
              <select style={styles.input} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                {['Applied','Interview','Offer','Rejected'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <textarea style={{...styles.input, height: '80px', resize: 'vertical'}} placeholder="Job Description (paste JD here for AI analysis)" value={form.jobDescription} onChange={e => setForm({...form, jobDescription: e.target.value})} />
            <textarea style={{...styles.input, height: '60px', resize: 'vertical'}} placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            <div style={styles.formRow}>
              <div>
                <label style={styles.label}>🔔 Follow-up Date (optional)</label>
                <input style={styles.input} type="date" value={form.followUpDate} onChange={e => setForm({...form, followUpDate: e.target.value})} />
              </div>
            </div>
            <button style={styles.submitBtn} type="submit">Add Job</button>
          </form>
        )}

        {/* Search & Sort */}
        <div style={styles.searchRow}>
          <input style={styles.searchInput} placeholder="🔍 Search by company or role..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="company">Company A-Z</option>
          </select>
        </div>

        {/* Filter Tabs */}
        <div style={styles.filters}>
          {STATUSES.map(s => (
            <button key={s} style={{ ...styles.filterBtn, ...(filter === s ? styles.activeFilter : {}) }} onClick={() => setFilter(s)}>
              {s} {s !== 'All' && <span style={styles.filterCount}>{counts[s] || 0}</span>}
            </button>
          ))}
        </div>

        {/* Job Cards */}
        {loading ? (
          <p style={styles.empty}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={styles.empty}>No jobs found. Add your first application!</p>
        ) : (
          <div style={styles.grid}>
            {filtered.map(job => (
              <JobCard
                key={job._id} job={job}
                onUpdate={updated => setJobs(jobs.map(j => j._id === updated._id ? updated : j))}
                onDelete={id => setJobs(jobs.filter(j => j._id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' },
  statCard: { background: '#1e293b', borderRadius: '12px', padding: '20px', textAlign: 'center', border: '1px solid #334155' },
  statCount: { fontSize: '36px', fontWeight: '800', marginBottom: '4px' },
  statLabel: { fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  heading: { fontSize: '22px', fontWeight: '700', color: '#f1f5f9' },
  addBtn: { padding: '10px 20px', background: '#6366f1', border: 'none', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  exportBtn: { padding: '10px 20px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer' },
  form: { background: '#1e293b', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #334155' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' },
  input: { width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none', marginBottom: '12px' },
  label: { fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' },
  submitBtn: { padding: '10px 24px', background: '#6366f1', border: 'none', borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  searchRow: { display: 'flex', gap: '12px', marginBottom: '16px' },
  searchInput: { flex: 1, padding: '10px 16px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' },
  sortSelect: { padding: '10px 16px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none' },
  filters: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  filterBtn: { padding: '8px 16px', background: '#1e293b', border: '1px solid #334155', borderRadius: '20px', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  activeFilter: { background: '#6366f1', borderColor: '#6366f1', color: 'white' },
  filterCount: { background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '1px 6px', fontSize: '11px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' },
  empty: { textAlign: 'center', color: '#64748b', padding: '60px', fontSize: '15px' },
};