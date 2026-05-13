import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Calendar as CalendarIcon
} from 'lucide-react';
import './AppointmentList.css';

const AppointmentList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [clinicFilter, setClinicFilter] = useState('');
  const [followupFilter, setFollowupFilter] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/appointments`);
        // Map backend models to match frontend expectations if necessary
        const data = response.data.map(a => ({
          id: a.id,
          name: a.client_name || "New Client",
          phone: "01XXXXXXXXX",
          clinic: a.clinic,
          date: a.visit_date || new Date().toISOString(),
          status: a.reconfirmation || "Pending",
          type: a.reason || "Consultation",
          followup: "Pending"
        }));
        setAppointments(data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };
    fetchAppointments();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        // Mock backend delete for now, but in reality:
        // await axios.delete(`http://localhost:8000/appointments/${id}`);
        setAppointments(prev => prev.filter(app => app.id !== id));
        alert("Appointment deleted successfully.");
      } catch (err) {
        console.error("Error deleting appointment:", err);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/appointments/new?id=${id}`);
  };

  const handleView = (id) => {
    navigate(`/appointments/new?id=${id}&view=true`);
  };

  // Filter Logic
  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      // Text Search Filter
      const searchMatch = 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        app.phone.includes(searchTerm) || 
        app.id.toString().includes(searchTerm);
      
      // Clinic Filter
      const clinicMatch = clinicFilter ? app.clinic === clinicFilter : true;
      
      // Followup Filter
      const followupMatch = followupFilter ? app.followup === followupFilter : true;
      
      // Date Range Filter
      let dateMatch = true;
      if (fromDate && toDate) {
        const appDate = new Date(app.date);
        dateMatch = appDate >= new Date(fromDate) && appDate <= new Date(toDate);
      } else if (fromDate) {
        dateMatch = new Date(app.date) >= new Date(fromDate);
      } else if (toDate) {
        dateMatch = new Date(app.date) <= new Date(toDate);
      }

      return searchMatch && clinicMatch && followupMatch && dateMatch;
    });
  }, [appointments, searchTerm, clinicFilter, followupFilter, fromDate, toDate]);

  // Pagination Logic
  const totalRecords = filteredAppointments.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = filteredAppointments.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="list-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <div className="breadcrumb">
            <CalendarIcon size={14} />
            <span>/ Appointments / List</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/appointments/new')}>
          <Plus size={18} />
          Add New Appointment
        </button>
      </div>

      <div className="card list-card">
        {/* Top Filter Bar */}
        <div className="list-toolbar flex-wrap" style={{ display: 'flex', gap: '1rem', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', width: '100%' }}>
            <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
              <label style={{ fontSize: '12px', color: '#64748b' }}>Search</label>
              <div className="search-box" style={{ width: '100%' }}>
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search by name or phone..." 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>

            <div className="form-group" style={{ minWidth: '180px', marginBottom: 0 }}>
              <label style={{ fontSize: '12px', color: '#64748b' }}>From Date</label>
              <DatePicker
                selected={fromDate ? new Date(fromDate) : null}
                onChange={(date) => { setFromDate(date ? date.toISOString() : ''); setCurrentPage(1); }}
                showTimeSelect
                dateFormat="Pp"
                className="form-control"
                placeholderText="Select start date"
              />
            </div>

            <div className="form-group" style={{ minWidth: '180px', marginBottom: 0 }}>
              <label style={{ fontSize: '12px', color: '#64748b' }}>To Date</label>
              <DatePicker
                selected={toDate ? new Date(toDate) : null}
                onChange={(date) => { setToDate(date ? date.toISOString() : ''); setCurrentPage(1); }}
                showTimeSelect
                dateFormat="Pp"
                className="form-control"
                placeholderText="Select end date"
              />
            </div>

            <div className="form-group" style={{ minWidth: '180px', marginBottom: 0 }}>
              <label style={{ fontSize: '12px', color: '#64748b' }}>Clinic</label>
              <select className="form-control" value={clinicFilter} onChange={(e) => { setClinicFilter(e.target.value); setCurrentPage(1); }}>
                <option value="">-- All Clinics --</option>
                <option value="Dhanmondi Women's Clinic">Dhanmondi Women's Clinic</option>
                <option value="Mirpur Branch">Mirpur Branch</option>
                <option value="Uttara Center">Uttara Center</option>
                <option value="Gulshan Clinic">Gulshan Clinic</option>
              </select>
            </div>

            <div className="form-group" style={{ minWidth: '150px', marginBottom: 0 }}>
              <label style={{ fontSize: '12px', color: '#64748b' }}>Followup</label>
              <select className="form-control" value={followupFilter} onChange={(e) => { setFollowupFilter(e.target.value); setCurrentPage(1); }}>
                <option value="">-- All Followups --</option>
                <option value="Followup Done">Followup Done</option>
                <option value="Needs Followup">Needs Followup</option>
                <option value="Unreachable">Unreachable</option>
              </select>
            </div>

            <button className="btn btn-primary" style={{ height: '38px' }} onClick={() => {
               // Manual trigger search if needed, but react handles it on change
               setCurrentPage(1);
            }}>
               <Search size={16} /> Search
            </button>
          </div>
        </div>

        {/* Per Page Selection & Table */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select 
            className="form-control" 
            style={{ width: '80px', padding: '0.25rem 0.5rem', height: '32px' }}
            value={recordsPerPage}
            onChange={(e) => { setRecordsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span style={{ fontSize: '14px', color: '#64748b' }}>records per page</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Appt ID</th>
                <th>Client Details</th>
                <th>Alt Contact</th>
                <th>Clinic & Visit Reason</th>
                <th>Visit Status by Clinic</th>
                <th>Follow up Status by CC</th>
                <th>Generated from</th>
                <th>Visit Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length > 0 ? currentRecords.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="font-semibold text-primary">#{appointment.id}</td>
                  <td>
                    <div className="client-info-cell">
                      <span className="client-name">{appointment.name}</span>
                      <span className="client-phone">{appointment.phone}</span>
                    </div>
                  </td>
                  <td className="text-muted">-</td>
                  <td>
                    <div className="client-info-cell">
                      <span className="client-name">{appointment.clinic}</span>
                      <span className="client-phone">{appointment.type}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-info">Visited</span></td>
                  <td>
                    <span className={`badge ${appointment.followup === 'Followup Done' ? 'badge-success' : 'badge-warning'}`}>
                      {appointment.followup}
                    </span>
                  </td>
                  <td>Direct Call Center</td>
                  <td>{new Date(appointment.date).toLocaleString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="View" onClick={() => handleView(appointment.id)}><Eye size={16} /></button>
                      <button className="btn-icon" title="Edit" onClick={() => handleEdit(appointment.id)}><Edit size={16} /></button>
                      <button className="btn-icon text-danger" title="Delete" onClick={() => handleDelete(appointment.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No appointments found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="pagination-wrapper">
          <span className="showing-text">
            Showing {totalRecords === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + recordsPerPage, totalRecords)} of {totalRecords} entries
          </span>
          <div className="pagination">
            <button 
              className={`btn-page ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`btn-page ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            <button 
              className={`btn-page ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentList;
