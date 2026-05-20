import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  MapPin,
  Columns
} from 'lucide-react';

const ALL_COLUMNS = [
  { key: 'id',         label: 'Appointment ID' },
  { key: 'client',     label: 'Client Details' },
  { key: 'clinic',     label: 'Clinic / Center' },
  { key: 'reason',     label: 'Reason' },
  { key: 'agent',      label: 'Agent' },
  { key: 'date',       label: 'Date & Time' },
  { key: 'reconf',     label: 'Reconfirmation' },
  { key: 'visitStatus',label: 'Visit Status' },
  { key: 'spending',   label: 'Spending (৳)' },
  { key: 'followup',   label: 'Follow-up Status' },
];
import './AppointmentList.css';

const AppointmentList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isClinicRole = user?.role === 'clinic';
  const canDelete = user?.role === 'admin' || user?.role === 'manager';
  const { clinics, followupStatus } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clinicFilter, setClinicFilter] = useState('');
  const [visitedFilter, setVisitedFilter] = useState('');
  const [followupFilter, setFollowupFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showColMenu, setShowColMenu] = useState(false);
  const [visibleCols, setVisibleCols] = useState(
    () => ALL_COLUMNS.reduce((acc, c) => ({ ...acc, [c.key]: true }), {})
  );
  const PAGE_SIZE = 10;

  const toggleCol = (key) => setVisibleCols(prev => ({ ...prev, [key]: !prev[key] }));
  const col = (key) => visibleCols[key];

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/appointments`);
      setAppointments(response.data.map(a => ({
        id: a.id,
        name: a.client_name,
        phone: a.client_phone,
        clinic: a.clinic,
        date: a.visit_date,
        status: a.reconfirmation || "Pending",
        type: a.reason || "Consultation",
        agent: a.agent_name || "—",
        visitStatus: a.visit_status_clinic || "—",
        followup: a.followup_status_cc || "—",
        spendingAmount: a.spending_amount || 0
      })));
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await axiosClient.delete(`/appointments/${id}`);
        setAppointments(appointments.filter(a => a.id !== id));
      } catch (err) {
        console.error("Error deleting appointment:", err);
        alert("Failed to delete appointment.");
      }
    }
  };

  const handleSearch = () => {
    setAppliedSearch(searchTerm);
    setCurrentPage(1);
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      const matchesSearch =
        app.name.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        app.phone.includes(appliedSearch);

      const matchesStatus = statusFilter === '' || app.status === statusFilter;
      const matchesClinic = isClinicRole
        ? app.clinic === user?.assignedClinic
        : (clinicFilter === '' || app.clinic === clinicFilter);
      const matchesVisited =
        visitedFilter === '' ||
        (visitedFilter === 'yes' && app.visitStatus !== '—') ||
        (visitedFilter === 'no' && app.visitStatus === '—');

      const matchesFollowup = followupFilter === '' || app.followup === followupFilter;

      const appDate = new Date(app.date);
      const matchesDateFrom = !dateFrom || appDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || appDate <= new Date(dateTo + 'T23:59:59');

      return matchesSearch && matchesStatus && matchesClinic && matchesVisited && matchesFollowup && matchesDateFrom && matchesDateTo;
    });
  }, [appointments, appliedSearch, statusFilter, clinicFilter, visitedFilter, followupFilter, dateFrom, dateTo, isClinicRole, user]);

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE));
  const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="list-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointment</h1>
          <div className="breadcrumb">
            <Calendar size={14} />
            <span>/ Appointments / List</span>
          </div>
        </div>
        {!isClinicRole && (
          <button className="btn btn-primary" onClick={() => navigate('/appointments/new')}>
            <Plus size={18} />
            Add New Appointment
          </button>
        )}
      </div>

      <div className="card list-card">
        <div className="list-toolbar-new">
          <div className="filter-group">
            <label>Search Appointments</label>
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by name or phone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Clinic / Center</label>
            <select 
              className="uniform-input" 
              value={clinicFilter} 
              onChange={(e) => setClinicFilter(e.target.value)}
            >
              <option value="">All Clinics</option>
              {clinics.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Visit Status</label>
            <select 
              className="uniform-input" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Okay">Confirmed</option>
              <option value="Visited">Visited</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Visited Clinic?</label>
            <select
              className="uniform-input"
              value={visitedFilter}
              onChange={(e) => setVisitedFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="yes">Yes (Visited)</option>
              <option value="no">No (Not Visited)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Follow-up Status</label>
            <select
              className="uniform-input"
              value={followupFilter}
              onChange={(e) => setFollowupFilter(e.target.value)}
            >
              <option value="">All</option>
              {followupStatus.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Date From</label>
            <input
              type="date"
              className="uniform-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Date To</label>
            <input
              type="date"
              className="uniform-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="filter-group button-group">
            <button className="btn-search" onClick={handleSearch}>
              <Search size={16} />
              Search
            </button>
          </div>
        </div>

        {/* Column visibility control */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.5rem 1rem', borderBottom: '1px solid #f1f5f9', position: 'relative' }}>
          <button
            onClick={() => setShowColMenu(v => !v)}
            title="Show / Hide Columns"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '6px',
              border: '1.5px solid #e2e8f0', background: showColMenu ? '#f1f5f9' : '#fff',
              color: '#475569', cursor: 'pointer',
            }}
          >
            <Columns size={16} />
          </button>

          {showColMenu && (
            <div style={{
              position: 'absolute', top: '110%', right: '1rem', zIndex: 200,
              background: '#fff', borderRadius: '10px', padding: '1rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.14)', border: '1px solid #e2e8f0',
              minWidth: '260px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>Show / Hide Columns</span>
                <button
                  onClick={() => setVisibleCols(ALL_COLUMNS.reduce((a, c) => ({ ...a, [c.key]: true }), {}))}
                  style={{ background: 'none', border: 'none', color: '#005CB9', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                >Reset all</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                {ALL_COLUMNS.map(c => (
                  <label key={c.key} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 10px', borderRadius: '6px', cursor: 'pointer',
                    background: visibleCols[c.key] ? '#eff6ff' : '#f8fafc',
                    border: '1px solid', borderColor: visibleCols[c.key] ? '#bfdbfe' : '#e2e8f0',
                    fontSize: '0.78rem', fontWeight: 500,
                    color: visibleCols[c.key] ? '#1e40af' : '#94a3b8',
                    userSelect: 'none',
                  }}>
                    <span>{c.label}</span>
                    <div style={{
                      width: '28px', height: '15px', borderRadius: '10px',
                      background: visibleCols[c.key] ? '#005CB9' : '#cbd5e1',
                      position: 'relative', flexShrink: 0, marginLeft: '6px',
                      transition: 'background 0.2s',
                    }}>
                      <div style={{
                        position: 'absolute', top: '2px',
                        left: visibleCols[c.key] ? '15px' : '2px',
                        width: '11px', height: '11px', borderRadius: '50%',
                        background: '#fff', transition: 'left 0.2s',
                      }} />
                      <input type="checkbox" checked={visibleCols[c.key]} onChange={() => toggleCol(c.key)}
                        style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', margin: 0 }} />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                {col('id') && <th>Appointment ID</th>}
                {col('client') && <th>Client Details</th>}
                {col('clinic') && <th>Clinic / Center</th>}
                {col('reason') && <th>Reason</th>}
                {col('agent') && <th>Agent</th>}
                {col('date') && <th>Date & Time</th>}
                {col('reconf') && <th>Reconfirmation</th>}
                {col('visitStatus') && <th>Visit Status</th>}
                {col('spending') && <th>Spending (৳)</th>}
                {col('followup') && <th>Follow-up Status</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAppointments.map((app) => (
                <tr key={app.id}>
                  {col('id') && <td className="font-semibold text-primary">#{app.id}</td>}
                  {col('client') && (
                    <td>
                      <div className="client-info-cell">
                        <span className="client-name">{app.name}</span>
                        <span className="client-phone">{app.phone}</span>
                      </div>
                    </td>
                  )}
                  {col('clinic') && (
                    <td>
                      <div className="clinic-cell">
                        <MapPin size={14} className="text-muted" />
                        <span>{app.clinic}</span>
                      </div>
                    </td>
                  )}
                  {col('reason') && <td>{app.type}</td>}
                  {col('agent') && <td>{app.agent}</td>}
                  {col('date') && (
                    <td>
                      <div className="date-cell">
                        <Clock size={14} className="text-muted" />
                        <span>{new Date(app.date).toLocaleString()}</span>
                      </div>
                    </td>
                  )}
                  {col('reconf') && (
                    <td>
                      <span className={`badge ${
                        app.status === 'Okay' ? 'badge-success'
                        : app.status === 'Pending' ? 'badge-warning'
                        : app.status === 'No Response' ? 'badge-danger'
                        : 'badge-info'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                  )}
                  {col('visitStatus') && <td>{app.visitStatus}</td>}
                  {col('spending') && <td>{app.spendingAmount > 0 ? `৳${app.spendingAmount}` : '—'}</td>}
                  {col('followup') && <td>{app.followup}</td>}
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="View Details" onClick={() => navigate(`/appointments/new?id=${app.id}&view=true`)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon" title="Edit" onClick={() => navigate(`/appointments/new?id=${app.id}`)}>
                        <Edit size={16} />
                      </button>
                      {canDelete && (
                        <button className="btn-icon text-danger" title="Delete" onClick={() => handleDelete(app.id)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {filteredAppointments.length > 0 && col('spending') && (
              <tfoot>
                <tr style={{ background: '#f0f7ff', borderTop: '2px solid #e2e8f0' }}>
                  <td
                    colSpan={['id','client','clinic','reason','agent','date','reconf','visitStatus'].filter(k => visibleCols[k]).length}
                    style={{ textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}
                  >Total Spending:</td>
                  <td style={{ fontWeight: 700, color: '#005CB9', fontSize: '0.95rem' }}>
                    ৳{filteredAppointments.reduce((sum, a) => sum + (a.spendingAmount || 0), 0).toLocaleString()}
                  </td>
                  {col('followup') && <td></td>}
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="pagination-bar">
          <span className="pagination-info">
            Showing {filteredAppointments.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filteredAppointments.length)} of {filteredAppointments.length} entries
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
                  ? <span key={`ellipsis-${idx}`} className="page-ellipsis">…</span>
                  : <button key={p} className={`page-btn ${p === currentPage ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
              )}
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppointmentList;
