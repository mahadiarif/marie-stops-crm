import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, ClipboardList, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import './WaiverList.css';

const WaiverList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [waivers, setWaivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWaivers = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/waivers`);
      setWaivers(response.data);
    } catch (err) {
      console.error("Error fetching waivers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaivers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this waiver record?')) {
      try {
        await axiosClient.delete(`/waivers/${id}`);
        setWaivers(waivers.filter(w => w.id !== id));
      } catch (err) {
        alert("Failed to delete.");
      }
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const filteredWaivers = useMemo(() => {
    if (!searchTerm.trim()) return waivers;
    const term = searchTerm.toLowerCase();
    return waivers.filter(w =>
      (w.first_name || '').toLowerCase().includes(term) ||
      (w.waiver_code || '').toLowerCase().includes(term) ||
      (w.client_id_code || '').toLowerCase().includes(term) ||
      (w.center || '').toLowerCase().includes(term)
    );
  }, [waivers, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredWaivers.length / PAGE_SIZE));
  const paginatedWaivers = filteredWaivers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: waivers.length,
    totalPrice: waivers.reduce((s, w) => s + (w.total_price || 0), 0),
    totalWaiver: waivers.reduce((s, w) => s + (w.waiver_amount || 0), 0),
    totalPaid: waivers.reduce((s, w) => s + (w.paid_amount || 0), 0),
  }), [waivers]);

  return (
    <div className="list-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Waiver List</h1>
          <div className="breadcrumb">
            <ClipboardList size={14} />
            <span>/ Waiver / Records</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/waiver/new')}>
          <Plus size={18} /> New Waiver Request
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#005CB9' }}>
            <ClipboardList size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Waivers</span>
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
            <span className="stat-label">Total Waiver (৳)</span>
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
            <label>Search Waivers</label>
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by ID or name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-group">
            <button className="btn-search"><Filter size={16} /> Filters</button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Waiver Code</th>
                <th>Client Name</th>
                <th>Client ID</th>
                <th>Service</th>
                <th>Center</th>
                <th>Date</th>
                <th>Total</th>
                <th>Waiver</th>
                <th>Paid</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWaivers.length === 0 && (
                <tr><td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No waivers found.</td></tr>
              )}
              {paginatedWaivers.map((waiver) => (
                <tr key={waiver.id}>
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
                      <button className="btn-icon text-danger" onClick={() => handleDelete(waiver.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {filteredWaivers.length > 0 && (
              <tfoot>
                <tr style={{ background: '#f0f7ff', borderTop: '2px solid #e2e8f0' }}>
                  <td colSpan={6} style={{ textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>Total:</td>
                  <td style={{ fontWeight: 700, color: '#1e293b' }}>
                    ৳{filteredWaivers.reduce((s, w) => s + (w.total_price || 0), 0).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 700, color: '#ef4444' }}>
                    ৳{filteredWaivers.reduce((s, w) => s + (w.waiver_amount || 0), 0).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>
                    ৳{filteredWaivers.reduce((s, w) => s + (w.paid_amount || 0), 0).toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="pagination-bar">
          <span className="pagination-info">
            Showing {filteredWaivers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filteredWaivers.length)} of {filteredWaivers.length} entries
          </span>
          <div className="pagination-controls">
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === '...'
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
