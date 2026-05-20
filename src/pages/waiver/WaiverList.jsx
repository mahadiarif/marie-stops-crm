import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, ClipboardList, TrendingDown, TrendingUp, Wallet, X } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import './WaiverList.css';

const PAGE_SIZE = 10;

const WaiverList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isClinicRole = user?.role === 'clinic';
  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  const [waivers, setWaivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    axiosClient.get('/waivers')
      .then(r => {
        const all = r.data;
        setWaivers(isClinicRole && user?.assignedClinic
          ? all.filter(w => w.center === user.assignedClinic)
          : all);
      })
      .catch(err => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this discount record?')) return;
    try {
      await axiosClient.delete(`/waivers/${id}`);
      setWaivers(prev => prev.filter(w => w.id !== id));
    } catch { alert('Failed to delete.'); }
  };

  const filtered = useMemo(() => {
    const term = appliedSearch.toLowerCase();
    if (!term) return waivers;
    return waivers.filter(w =>
      (w.first_name || '').toLowerCase().includes(term) ||
      (w.waiver_code || '').toLowerCase().includes(term) ||
      (w.client_id_code || '').toLowerCase().includes(term) ||
      (w.center || '').toLowerCase().includes(term)
    );
  }, [waivers, appliedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: waivers.length,
    totalPrice:  waivers.reduce((s, w) => s + (w.total_price   || 0), 0),
    totalWaiver: waivers.reduce((s, w) => s + (w.waiver_amount || 0), 0),
    totalPaid:   waivers.reduce((s, w) => s + (w.paid_amount   || 0), 0),
  }), [waivers]);

  return (
    <div className="list-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Discount Tracking</h1>
          <div className="breadcrumb">
            <ClipboardList size={14} />
            <span>/ Discount / Records</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/waiver/new')}>
          <Plus size={18} /> New Discount Entry
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#005CB9' }}>
            <ClipboardList size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Discounts</span>
            <span className="stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
            <Wallet size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Price (৳)</span>
            <span className="stat-value">{stats.totalPrice.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
            <TrendingDown size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Discount (৳)</span>
            <span className="stat-value">{stats.totalWaiver.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#10b981' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Paid (৳)</span>
            <span className="stat-value">{stats.totalPaid.toLocaleString()}</span>
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
                placeholder="Name, discount code, client ID..."
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
                <th>Discount Code</th>
                <th>Client Name</th>
                <th>Client ID</th>
                <th>Service</th>
                <th>Center</th>
                <th>Date</th>
                <th>Total</th>
                <th>Discount</th>
                <th>Paid</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr><td colSpan="11" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No discounts found.</td></tr>
              )}
              {paginated.map((waiver, i) => (
                <tr key={waiver.id}>
                  <td className="text-muted" style={{ fontSize: '0.8rem' }}>{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="font-semibold text-primary">{waiver.waiver_code}</td>
                  <td>{waiver.first_name}</td>
                  <td>{waiver.client_id_code || '—'}</td>
                  <td>{waiver.service}</td>
                  <td>{waiver.center}</td>
                  <td>{waiver.date ? new Date(waiver.date).toLocaleDateString() : '—'}</td>
                  <td>৳{waiver.total_price ?? '—'}</td>
                  <td className="text-danger">৳{waiver.waiver_amount ?? '—'}</td>
                  <td className="text-success font-semibold">৳{waiver.paid_amount ?? '—'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="View" onClick={() => navigate(`/waiver/new?id=${waiver.id}&view=true`)}><Eye size={16} /></button>
                      <button className="btn-icon" title="Edit" onClick={() => navigate(`/waiver/new?id=${waiver.id}`)}><Edit size={16} /></button>
                      {canDelete && (
                        <button className="btn-icon text-danger" title="Delete" onClick={() => handleDelete(waiver.id)}><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ background: '#f0f7ff', borderTop: '2px solid #e2e8f0' }}>
                  <td colSpan={7} style={{ textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>Total:</td>
                  <td style={{ fontWeight: 700, color: '#1e293b' }}>
                    ৳{filtered.reduce((s, w) => s + (w.total_price || 0), 0).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 700, color: '#ef4444' }}>
                    ৳{filtered.reduce((s, w) => s + (w.waiver_amount || 0), 0).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>
                    ৳{filtered.reduce((s, w) => s + (w.paid_amount || 0), 0).toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
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

export default WaiverList;
