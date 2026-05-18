import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAppData } from '../context/AppDataContext';
import { 
  Calendar, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  X
} from 'lucide-react';
import './AppointmentList.css';

const AppointmentList = () => {
  const navigate = useNavigate();
  const { clinics, followupStatus } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clinicFilter, setClinicFilter] = useState('');
  const [visitedFilter, setVisitedFilter] = useState('');
  const [followupFilter, setFollowupFilter] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

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
      const matchesClinic = clinicFilter === '' || app.clinic === clinicFilter;
      const matchesVisited =
        visitedFilter === '' ||
        (visitedFilter === 'yes' && app.visitStatus !== '—') ||
        (visitedFilter === 'no' && app.visitStatus === '—');

      const matchesFollowup = followupFilter === '' || app.followup === followupFilter;

      return matchesSearch && matchesStatus && matchesClinic && matchesVisited && matchesFollowup;
    });
  }, [appointments, appliedSearch, statusFilter, clinicFilter, visitedFilter, followupFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE));
  const paginatedAppointments = filteredAppointments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="list-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointment Management</h1>
          <div className="breadcrumb">
            <Calendar size={14} />
            <span>/ Appointments / List</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/appointments/new')}>
          <Plus size={18} />
          Add New Appointment
        </button>
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

          <div className="filter-group button-group">
            <button className="btn-search" onClick={handleSearch}>
              <Search size={16} />
              Filter
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Client Details</th>
                <th>Clinic / Center</th>
                <th>Reason</th>
                <th>Agent</th>
                <th>Date & Time</th>
                <th>Reconfirmation</th>
                <th>Visit Status</th>
                <th>Spending (৳)</th>
                <th>Follow-up Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAppointments.map((app) => (
                <tr key={app.id}>
                  <td className="font-semibold text-primary">#{app.id}</td>
                  <td>
                    <div className="client-info-cell">
                      <span className="client-name">{app.name}</span>
                      <span className="client-phone">{app.phone}</span>
                    </div>
                  </td>
                  <td>
                    <div className="clinic-cell">
                      <MapPin size={14} className="text-muted" />
                      <span>{app.clinic}</span>
                    </div>
                  </td>
                  <td>{app.type}</td>
                  <td>{app.agent}</td>
                  <td>
                    <div className="date-cell">
                      <Clock size={14} className="text-muted" />
                      <span>{new Date(app.date).toLocaleString()}</span>
                    </div>
                  </td>
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
                  <td>{app.visitStatus}</td>
                  <td>{app.spendingAmount > 0 ? `৳${app.spendingAmount}` : '—'}</td>
                  <td>{app.followup}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="View Details" onClick={() => navigate(`/appointments/new?id=${app.id}&view=true`)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon" title="Edit" onClick={() => navigate(`/appointments/new?id=${app.id}`)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon text-danger" title="Delete" onClick={() => handleDelete(app.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {filteredAppointments.length > 0 && (
              <tfoot>
                <tr style={{ background: '#f0f7ff', borderTop: '2px solid #e2e8f0' }}>
                  <td colSpan={8} style={{ textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>Total Spending:</td>
                  <td style={{ fontWeight: 700, color: '#005CB9', fontSize: '0.95rem' }}>
                    ৳{filteredAppointments.reduce((sum, a) => sum + (a.spendingAmount || 0), 0).toLocaleString()}
                  </td>
                  <td></td>
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
