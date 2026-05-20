import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { Phone, Search, Plus, Edit, Trash2, Eye, X } from 'lucide-react';
import './CallLogList.css';

const PAGE_SIZE = 10;

const CallLogList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    axiosClient.get('/call-logs')
      .then(r => setLogs(r.data))
      .catch(err => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this call log?')) return;
    try {
      await axiosClient.delete(`/call-logs/${id}`);
      setLogs(prev => prev.filter(l => l.id !== id));
    } catch { alert('Failed to delete.'); }
  };

  const callerTypes = useMemo(() => [...new Set(logs.map(l => l.caller_type).filter(Boolean))], [logs]);
  const statuses    = useMemo(() => [...new Set(logs.map(l => l.status).filter(Boolean))], [logs]);

  const filtered = useMemo(() => {
    const term = appliedSearch.toLowerCase();
    return logs.filter(l => {
      const matchSearch = !term || l.caller_name?.toLowerCase().includes(term) || l.phone?.includes(term);
      const matchType   = !typeFilter || l.caller_type === typeFilter;
      const matchStatus = !statusFilter || l.status === statusFilter;
      const d = new Date(l.call_date);
      const matchFrom = !dateFrom || d >= new Date(dateFrom);
      const matchTo   = !dateTo   || d <= new Date(dateTo + 'T23:59:59');
      return matchSearch && matchType && matchStatus && matchFrom && matchTo;
    });
  }, [logs, appliedSearch, typeFilter, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const clearFilters = () => {
    setSearchTerm(''); setAppliedSearch('');
    setDateFrom(''); setDateTo('');
    setTypeFilter(''); setStatusFilter('');
    setCurrentPage(1);
  };

  const hasFilters = appliedSearch || dateFrom || dateTo || typeFilter || statusFilter;

  return (
    <div className="list-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Call Logs</h1>
          <div className="breadcrumb">
            <Phone size={14} />
            <span>/ Call Logs / List</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/call-logs/new')}>
          <Plus size={18} /> Add New Call Log
        </button>
      </div>

      <div className="card list-card">
        <div className="list-toolbar-new">
          <div className="filter-group">
            <label>Search</label>
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Name or phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setAppliedSearch(searchTerm); setCurrentPage(1); } }}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Date From</label>
            <input type="date" className="uniform-input" value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }} />
          </div>

          <div className="filter-group">
            <label>Date To</label>
            <input type="date" className="uniform-input" value={dateTo}
              onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }} />
          </div>

          <div className="filter-group">
            <label>Caller Type</label>
            <select className="uniform-input" value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}>
              <option value="">All Types</option>
              {callerTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select className="uniform-input" value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
              <option value="">All Status</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="filter-group button-group">
            <button className="btn-search" onClick={() => { setAppliedSearch(searchTerm); setCurrentPage(1); }}>
              <Search size={16} /> Search
            </button>
            {hasFilters && (
              <button className="btn-search" style={{ background: '#64748b' }} onClick={clearFilters}>
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
                <th>Caller Details</th>
                <th>Caller Type</th>
                <th>Reason</th>
                <th>District</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((log, i) => (
                <tr key={log.id}>
                  <td className="text-muted" style={{ fontSize: '0.8rem' }}>{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                  <td>
                    <div className="client-info-cell">
                      <span className="client-name">{log.caller_name}</span>
                      <span className="client-phone">{log.phone}</span>
                    </div>
                  </td>
                  <td>{log.caller_type || '—'}</td>
                  <td>{log.reason_for_calling || '—'}</td>
                  <td>{log.district || '—'}</td>
                  <td>{log.duration || '—'}</td>
                  <td>
                    <span className={`badge ${log.status === 'Resolved' ? 'badge-success' : log.status === 'Pending' ? 'badge-warning' : 'badge-info'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td>{new Date(log.call_date).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="View" onClick={() => navigate(`/call-logs/new?id=${log.id}&view=true`)}><Eye size={16} /></button>
                      <button className="btn-icon" title="Edit" onClick={() => navigate(`/call-logs/new?id=${log.id}`)}><Edit size={16} /></button>
                      {canDelete && (
                        <button className="btn-icon text-danger" title="Delete" onClick={() => handleDelete(log.id)}><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No call logs found</td></tr>
              )}
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

export default CallLogList;
