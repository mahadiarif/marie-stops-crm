import { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import axiosClient from '../api/axiosClient';
import { UserCheck, Plus, Trash2, Save, X, ArrowLeft, Search, Calendar } from 'lucide-react';

const PAGE_SIZE = 10;

const AgentManagement = () => {
  const { agentNames, addAgentName, removeAgentName, appointments } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [agentForm, setAgentForm] = useState({ name: '', username: '', password: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [deletingName, setDeletingName] = useState(null);

  const resetForm = () => setAgentForm({ name: '', username: '', password: '', email: '' });

  const agentStats = useMemo(() => {
    return agentNames.map(name => {
      const total = appointments.filter(a => a.agent === name).length;
      return { name, total };
    });
  }, [agentNames, appointments]);

  const filtered = useMemo(() => {
    const term = appliedSearch.toLowerCase();
    if (!term) return agentStats;
    return agentStats.filter(a => a.name.toLowerCase().includes(term));
  }, [agentStats, appliedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = agentForm.name.trim();
    if (!name) return;
    if (agentNames.includes(name)) { alert('Agent already exists.'); return; }
    setSaving(true);
    try {
      await addAgentName(name);
      if (agentForm.username.trim() && agentForm.password.trim()) {
        await axiosClient.post('/auth/register', {
          username: agentForm.username.trim(),
          password: agentForm.password.trim(),
          email: agentForm.email.trim() || `${agentForm.username.trim()}@mariestopes.org`,
          role: 'staff',
          agent_name: name,
        });
      }
      resetForm();
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save agent.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Remove agent "${name}"?`)) return;
    setDeletingName(name);
    try {
      await removeAgentName(name);
    } finally {
      setDeletingName(null);
    }
  };

  if (showForm) {
    return (
      <div className="form-page-container">
        <div className="form-header">
          <div className="breadcrumb">
            <UserCheck size={14} />
            <span>/ Agent Management / Add Agent</span>
          </div>
          <button className="btn btn-warning btn-sm" onClick={() => { setShowForm(false); resetForm(); }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <div className="form-card card">
          <div className="form-card-header">
            <h2 className="form-title">Add New Agent</h2>
          </div>
          <form onSubmit={handleAdd}>
            <div className="form-body">
              <div className="form-section">
                <h3 className="section-title">Agent Information</h3>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Agent Full Name <span>*</span></label>
                    <input type="text" className="form-control" placeholder="e.g. Zeba Akter"
                      value={agentForm.name} onChange={e => setAgentForm(p => ({ ...p, name: e.target.value }))}
                      required autoFocus />
                  </div>
                </div>
              </div>

              <div className="form-section" style={{ marginTop: '1.5rem' }}>
                <h3 className="section-title">System Login Account</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
                  Create a call center (staff) login for this agent. Leave blank to skip.
                </p>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input type="text" className="form-control" placeholder="e.g. zeba.akter"
                      value={agentForm.username} onChange={e => setAgentForm(p => ({ ...p, username: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" placeholder="Enter password"
                      value={agentForm.password} onChange={e => setAgentForm(p => ({ ...p, password: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email (optional)</label>
                    <input type="email" className="form-control" placeholder="agent@mariestopes.org"
                      value={agentForm.email} onChange={e => setAgentForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>
            <div className="form-footer">
              <button type="submit" className="btn btn-success btn-lg" disabled={saving}>
                <Save size={18} /> {saving ? 'Saving...' : 'Add Agent'}
              </button>
              <button type="button" className="btn btn-danger btn-lg"
                onClick={() => { setShowForm(false); resetForm(); }}>
                <X size={18} /> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="list-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Agent Management</h1>
          <div className="breadcrumb">
            <UserCheck size={14} />
            <span>/ Agents / List</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add New Agent
        </button>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#005CB9' }}>
            <UserCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Agents</span>
            <span className="stat-value">{agentNames.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#10b981' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Appointments</span>
            <span className="stat-value">{agentStats.reduce((s, a) => s + a.total, 0)}</span>
          </div>
        </div>
      </div>

      <div className="card list-card">
        <div className="list-toolbar-new">
          <div className="filter-group">
            <label>Search</label>
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setAppliedSearch(searchTerm); setCurrentPage(1); } }}
              />
            </div>
          </div>
          <div className="filter-group button-group">
            <button className="btn-search" onClick={() => { setAppliedSearch(searchTerm); setCurrentPage(1); }}>
              <Search size={16} /> Search
            </button>
            {appliedSearch && (
              <button className="btn-search" style={{ background: '#64748b' }}
                onClick={() => { setSearchTerm(''); setAppliedSearch(''); setCurrentPage(1); }}>
                <X size={15} /> Reset
              </button>
            )}
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Agent Name</th>
                <th>Appointments Booked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No agents found.
                  </td>
                </tr>
              )}
              {paginated.map((agent, i) => (
                <tr key={agent.name}>
                  <td className="text-muted" style={{ fontSize: '0.8rem' }}>{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: '#eff6ff', color: '#005CB9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.8rem', flexShrink: 0
                      }}>
                        {agent.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold">{agent.name}</span>
                    </div>
                  </td>
                  <td>{agent.total || '—'}</td>
                  <td>
                    <button
                      className="btn-icon text-danger"
                      title="Remove Agent"
                      onClick={() => handleDelete(agent.name)}
                      disabled={deletingName === agent.name}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <span className="pagination-info">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="pagination-controls">
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx-1] > 1) acc.push('...'); acc.push(p); return acc; }, [])
              .map((p, idx) => p === '...'
                ? <span key={`e${idx}`} className="page-ellipsis">…</span>
                : <button key={p} className={`page-btn ${p === currentPage ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
              )}
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentManagement;
