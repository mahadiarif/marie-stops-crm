import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { Users, Search, UserPlus, Edit, Trash2, Eye, Phone, MapPin, X, Save, User, Calendar } from 'lucide-react';
import './ClientList.css';

const PAGE_SIZE = 10;

const ClientList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', age: '', address: '' });
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    axiosClient.get('/clients')
      .then(r => setClients(r.data))
      .catch(err => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    try {
      await axiosClient.delete(`/clients/${id}`);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch { alert('Failed to delete.'); }
  };

  const openEdit = (client) => {
    setEditingClient(client);
    setEditForm({ name: client.name || '', phone: client.phone || '', age: client.age || '', address: client.address || '' });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      const res = await axiosClient.put(`/clients/${editingClient.id}`, {
        name: editForm.name, phone: editForm.phone,
        age: parseInt(editForm.age) || 0, address: editForm.address,
      });
      setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...res.data } : c));
      setEditingClient(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update.');
    } finally { setEditSaving(false); }
  };

  const filtered = useMemo(() => {
    const term = appliedSearch.toLowerCase();
    let list = clients.filter(c =>
      !term || c.name?.toLowerCase().includes(term) || c.phone?.includes(term)
    );
    if (sortBy === 'newest') list = [...list].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    if (sortBy === 'oldest') list = [...list].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    if (sortBy === 'name')   list = [...list].sort((a, b) => a.name?.localeCompare(b.name));
    return list;
  }, [clients, appliedSearch, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="list-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <div className="breadcrumb">
            <Users size={14} />
            <span>/ Clients / Directory</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/appointments/new')}>
          <UserPlus size={18} /> Register New Client
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#005CB9' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Clients</span>
            <span className="stat-value">{clients.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#10b981' }}>
            <User size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">With Address</span>
            <span className="stat-value">{clients.filter(c => c.address).length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Registered This Month</span>
            <span className="stat-value">{clients.filter(c => {
              if (!c.created_at) return false;
              const d = new Date(c.created_at);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}</span>
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
                placeholder="Name or phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setAppliedSearch(searchTerm); setCurrentPage(1); } }}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select className="uniform-input" value={sortBy}
              onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>

          <div className="filter-group button-group">
            <button className="btn-search" onClick={() => { setAppliedSearch(searchTerm); setCurrentPage(1); }}>
              <Search size={16} /> Search
            </button>
            {(appliedSearch || sortBy !== 'newest') && (
              <button className="btn-search" style={{ background: '#64748b' }}
                onClick={() => { setSearchTerm(''); setAppliedSearch(''); setSortBy('newest'); setCurrentPage(1); }}>
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
                <th>Client Name</th>
                <th>Contact Details</th>
                <th>Age</th>
                <th>Registered On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((client, i) => (
                <tr key={client.id}>
                  <td className="text-muted" style={{ fontSize: '0.8rem' }}>{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                  <td>
                    <div className="client-info-cell">
                      <span className="client-name">{client.name}</span>
                      <span className="client-meta" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>#{client.id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <div className="contact-item">
                        <Phone size={13} className="text-muted" />
                        <span>{client.phone}</span>
                      </div>
                      {client.address && (
                        <div className="contact-item">
                          <MapPin size={13} className="text-muted" />
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{client.address}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{client.age ? `${client.age} yrs` : '—'}</td>
                  <td>{client.created_at ? new Date(client.created_at).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="View" onClick={() => setViewingClient(client)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon" title="Edit" onClick={() => openEdit(client)}>
                        <Edit size={16} />
                      </button>
                      {canDelete && (
                        <button className="btn-icon text-danger" title="Delete" onClick={() => handleDelete(client.id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No clients found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <span className="pagination-info">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="pagination-controls">
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>Previous</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx-1] > 1) acc.push('...'); acc.push(p); return acc; }, [])
              .map((p, idx) => p === '...'
                ? <span key={`e${idx}`} className="page-ellipsis">…</span>
                : <button key={p} className={`page-btn ${p === currentPage ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
              )}
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}>Next</button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewingClient && (
        <div className="client-modal-overlay" onClick={() => setViewingClient(null)}>
          <div className="client-modal" onClick={e => e.stopPropagation()}>
            <div className="client-modal-header">
              <h3>Client Details — #{viewingClient.id}</h3>
              <button className="btn-icon" onClick={() => setViewingClient(null)}><X size={18} /></button>
            </div>
            <div className="client-modal-body">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" value={viewingClient.name || '—'} readOnly
                  style={{ backgroundColor: '#f8fafc', color: '#475569' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="text" className="form-control" value={viewingClient.phone || '—'} readOnly
                  style={{ backgroundColor: '#f8fafc', color: '#475569' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input type="text" className="form-control" value={viewingClient.age ? `${viewingClient.age} years` : '—'} readOnly
                  style={{ backgroundColor: '#f8fafc', color: '#475569' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-control" rows="2" value={viewingClient.address || '—'} readOnly
                  style={{ backgroundColor: '#f8fafc', color: '#475569' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Registered On</label>
                <input type="text" className="form-control"
                  value={viewingClient.created_at ? new Date(viewingClient.created_at).toLocaleDateString() : '—'} readOnly
                  style={{ backgroundColor: '#f8fafc', color: '#475569' }} />
              </div>
              <div className="client-modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => { setViewingClient(null); openEdit(viewingClient); }}>
                  <Edit size={16} /> Edit
                </button>
                <button type="button" className="btn btn-danger" onClick={() => setViewingClient(null)}>
                  <X size={16} /> Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingClient && (
        <div className="client-modal-overlay" onClick={() => setEditingClient(null)}>
          <div className="client-modal" onClick={e => e.stopPropagation()}>
            <div className="client-modal-header">
              <h3>Edit Client — #{editingClient.id}</h3>
              <button className="btn-icon" onClick={() => setEditingClient(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleEditSave} className="client-modal-body">
              <div className="form-group">
                <label className="form-label">Full Name <span>*</span></label>
                <input type="text" className="form-control" value={editForm.name} required
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone <span>*</span></label>
                <input type="text" className="form-control" value={editForm.phone} required
                  onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input type="number" className="form-control" value={editForm.age} min="0"
                  onChange={e => setEditForm(p => ({ ...p, age: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-control" rows="2" value={editForm.address}
                  onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="client-modal-footer">
                <button type="submit" className="btn btn-success" disabled={editSaving}>
                  <Save size={16} /> {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-danger" onClick={() => setEditingClient(null)}>
                  <X size={16} /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
