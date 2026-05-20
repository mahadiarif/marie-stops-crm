import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Shield, Edit, Trash2, X, Save, ArrowLeft, Users, LogIn } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import './UserManagement.css';

const PAGE_SIZE = 10;
const emptyForm = { username: '', password: '', role: 'staff', email: '', is_active: true, assigned_clinic: '' };

const UserManagement = () => {
  const { clinics, refetchAll } = useAppData();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosClient.get('/users/');
      setUsers(response.data);
    } catch {
      setUsers([
        { id: 1, username: 'admin', role: 'admin', email: '', is_active: true },
        { id: 2, username: 'manager', role: 'manager', email: '', is_active: true },
      ]);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosClient.delete(`/users/${id}`);
        fetchUsers();
      } catch {
        alert('Failed to delete user');
      }
    }
  };

  const openForm = (user = null) => {
    setEditingUser(user);
    setFormData(user
      ? { username: user.username, password: '', role: user.role, email: user.email || '', is_active: user.is_active, assigned_clinic: user.assigned_clinic || '' }
      : emptyForm
    );
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingUser(null); };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axiosClient.put(`/users/${editingUser.id}`, {
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active,
          assigned_clinic: formData.role === 'clinic' ? formData.assigned_clinic : null
        });
      } else {
        await axiosClient.post('/auth/register', {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          role: formData.role,
          assigned_clinic: formData.role === 'clinic' ? formData.assigned_clinic : null
        });
      }
      closeForm();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.detail || 'Error saving user');
    }
  };

  const handleImpersonate = async (userId) => {
    try {
      const originalToken = localStorage.getItem('authToken');
      const res = await axiosClient.post(`/auth/impersonate/${userId}`);
      const { access_token, user_id, username, role, assigned_clinic, agent_name } = res.data;
      localStorage.setItem('adminToken', originalToken);
      localStorage.setItem('authToken', access_token);
      window.dispatchEvent(new CustomEvent('crm-impersonate', {
        detail: { id: user_id, username, role, email: '', assignedClinic: assigned_clinic || null, agentName: agent_name || null }
      }));
      await refetchAll();
      navigate(role === 'clinic' ? '/clinic-entry' : '/');
    } catch (err) {
      alert(err.response?.data?.detail || 'Impersonate failed.');
    }
  };

  const filteredUsers = useMemo(() => {
    const term = appliedSearch.toLowerCase();
    return users.filter(u =>
      (!term || u.username.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)) &&
      (!roleFilter || u.role === roleFilter)
    );
  }, [users, appliedSearch, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginated  = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const roleLabel = { admin: 'Admin', manager: 'Manager', staff: 'Staff (CC)', clinic: 'Clinic User' };

  // ── Form View ──
  if (showForm) {
    return (
      <div className="form-page-container">
        <div className="form-header">
          <div className="breadcrumb">
            <Users size={14} />
            <span>/ Users / {editingUser ? 'Edit User' : 'Add New User'}</span>
          </div>
          <button className="btn btn-warning btn-sm" onClick={closeForm}>
            <ArrowLeft size={16} /> Go To List
          </button>
        </div>

        <div className="form-card card">
          <div className="form-card-header">
            <h2 className="form-title">{editingUser ? 'Edit System User' : 'Register New User'}</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-body">

              <div className="form-section">
                <h3 className="section-title">Account Information</h3>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Username <span>*</span></label>
                    <input
                      type="text"
                      name="username"
                      className="form-control"
                      placeholder="e.g. jdoe"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      readOnly={!!editingUser}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address <span>*</span></label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {!editingUser && (
                    <div className="form-group">
                      <label className="form-label">Password <span>*</span></label>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">System Role <span>*</span></label>
                    <select name="role" className="form-control" value={formData.role} onChange={handleInputChange}>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff (Call Center)</option>
                      <option value="clinic">Clinic User</option>
                    </select>
                  </div>
                  {formData.role === 'clinic' && (
                    <div className="form-group">
                      <label className="form-label">Assigned Clinic <span>*</span></label>
                      <select name="assigned_clinic" className="form-control" value={formData.assigned_clinic} onChange={handleInputChange} required>
                        <option value="">-- Select Clinic --</option>
                        {clinics.map((c, i) => <option key={i} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="is_active"><strong>Account Active</strong></label>
                  </div>
                </div>
              </div>

            </div>
            <div className="form-footer">
              <button type="submit" className="btn btn-success btn-lg">
                <Save size={18} /> {editingUser ? 'Update User' : 'Create User'}
              </button>
              <button type="button" className="btn btn-danger btn-lg" onClick={closeForm}>
                <X size={18} /> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── List View ──
  return (
    <div className="user-mgmt-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Access Control (RBA)</h1>
          <p className="page-subtitle">Manage system users, roles, and permissions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openForm()}>
          <UserPlus size={18} /> Add New User
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
                placeholder="Username or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setAppliedSearch(searchTerm); setCurrentPage(1); } }}
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Role</label>
            <select className="uniform-input" value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff (CC)</option>
              <option value="clinic">Clinic User</option>
            </select>
          </div>
          <div className="filter-group button-group">
            <button className="btn-search" onClick={() => { setAppliedSearch(searchTerm); setCurrentPage(1); }}>
              <Search size={16} /> Search
            </button>
            {(appliedSearch || roleFilter) && (
              <button className="btn-search" style={{ background: '#64748b' }}
                onClick={() => { setSearchTerm(''); setAppliedSearch(''); setRoleFilter(''); setCurrentPage(1); }}>
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
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Assigned Clinic</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((user, i) => (
                <tr key={user.id}>
                  <td className="text-muted" style={{ fontSize: '0.8rem' }}>{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-sm">{user.username.substring(0, 2).toUpperCase()}</div>
                      <span className="font-semibold">{user.username}</span>
                    </div>
                  </td>
                  <td>{user.email || '—'}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      <Shield size={12} /> {roleLabel[user.role] || user.role}
                    </span>
                  </td>
                  <td>{user.assigned_clinic || '—'}</td>
                  <td>
                    <span className={`status-pill ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Edit" onClick={() => openForm(user)}><Edit size={16} /></button>
                      <button className="btn-icon" title={`Login as ${user.username}`} onClick={() => handleImpersonate(user.id)} style={{ color: '#005CB9' }}>
                        <LogIn size={16} />
                      </button>
                      <button className="btn-icon text-danger" title="Delete" onClick={() => handleDelete(user.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination-bar">
          <span className="pagination-info">
            Showing {filteredUsers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length}
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
    </div>
  );
};

export default UserManagement;
