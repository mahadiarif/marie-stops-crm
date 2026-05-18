import { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { UserCheck, Plus, Trash2, Save, X, ArrowLeft, Search, Phone, Calendar, TrendingUp } from 'lucide-react';

const AgentManagement = () => {
  const { agentNames, addAgentName, removeAgentName, appointments } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingName, setDeletingName] = useState(null);

  const agentStats = useMemo(() => {
    return agentNames.map(name => {
      const agentAppts = appointments.filter(a => a.agent === name);
      const visited = agentAppts.filter(a => a.visitStatus && a.visitStatus !== '—');
      const totalSpending = agentAppts.reduce((s, a) => s + (a.spendingAmount || 0), 0);
      return { name, total: agentAppts.length, visited: visited.length, totalSpending };
    });
  }, [agentNames, appointments]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return agentStats;
    return agentStats.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [agentStats, searchTerm]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = newAgentName.trim();
    if (!name) return;
    if (agentNames.includes(name)) { alert('Agent already exists.'); return; }
    setSaving(true);
    try {
      await addAgentName(name);
      setNewAgentName('');
      setShowForm(false);
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
          <button className="btn btn-warning btn-sm" onClick={() => { setShowForm(false); setNewAgentName(''); }}>
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
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Zeba Akter"
                      value={newAgentName}
                      onChange={e => setNewAgentName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="form-footer">
              <button type="submit" className="btn btn-success btn-lg" disabled={saving}>
                <Save size={18} /> {saving ? 'Saving...' : 'Add Agent'}
              </button>
              <button type="button" className="btn btn-danger btn-lg"
                onClick={() => { setShowForm(false); setNewAgentName(''); }}>
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
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fdf4ff', color: '#a855f7' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Spending (৳)</span>
            <span className="stat-value">
              {agentStats.reduce((s, a) => s + a.totalSpending, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="card list-card">
        <div className="list-toolbar-new">
          <div className="filter-group">
            <label>Search Agent</label>
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Agent Name</th>
                <th>Total Appointments</th>
                <th>Visited</th>
                <th>Total Spending (৳)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No agents found.
                  </td>
                </tr>
              )}
              {filtered.map((agent, i) => (
                <tr key={agent.name}>
                  <td className="text-muted">{i + 1}</td>
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
                  <td>{agent.total}</td>
                  <td>{agent.visited}</td>
                  <td className="font-semibold" style={{ color: '#005CB9' }}>
                    {agent.totalSpending > 0 ? `৳${agent.totalSpending.toLocaleString()}` : '—'}
                  </td>
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
            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ background: '#f0f7ff', borderTop: '2px solid #e2e8f0' }}>
                  <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>Total Spending:</td>
                  <td style={{ fontWeight: 700, color: '#005CB9', fontSize: '0.95rem' }}>
                    ৳{filtered.reduce((s, a) => s + a.totalSpending, 0).toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentManagement;
