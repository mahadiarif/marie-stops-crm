import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { 
  Users, 
  Calendar, 
  PhoneIncoming, 
  TrendingUp,
  Eye,
  Edit,
  Filter,
  XCircle,
  ChevronDown
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    appointments, 
    callLogs, 
    clients, 
    waivers, 
    clinics, 
    visitStatus 
  } = useAppData();

  const [filters, setFilters] = useState({
    clinic: '',
    status: '',
    month: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ clinic: '', status: '', month: '' });
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    let filteredAppts = [...appointments];
    let filteredCalls = [...callLogs];
    let filteredWaivers = [...waivers];

    // Clinic Filter (Applies to Appts and Waivers)
    if (filters.clinic) {
      filteredAppts = filteredAppts.filter(a => a.clinic === filters.clinic);
      filteredWaivers = filteredWaivers.filter(w => w.center === filters.clinic);
      // Calls don't have a specific clinic field in this schema, 
      // but if they did, we would filter them here.
    }

    // Status Filter (Applies to Appts and Calls)
    if (filters.status) {
      filteredAppts = filteredAppts.filter(a => a.status === filters.status);
      filteredCalls = filteredCalls.filter(c => c.status === filters.status);
    }

    // Month Filter (Applies to all)
    if (filters.month) {
      const [year, month] = filters.month.split('-').map(Number);
      
      filteredAppts = filteredAppts.filter(a => {
        const d = new Date(a.date);
        return d.getFullYear() === year && (d.getMonth() + 1) === month;
      });

      filteredCalls = filteredCalls.filter(c => {
        const d = new Date(c.callDate);
        return d.getFullYear() === year && (d.getMonth() + 1) === month;
      });

      filteredWaivers = filteredWaivers.filter(w => {
        const d = new Date(w.date);
        return d.getFullYear() === year && (d.getMonth() + 1) === month;
      });
    }

    return {
      appointments: filteredAppts,
      calls: filteredCalls,
      waivers: filteredWaivers,
      clients: clients // Clients are generally global, but could be filtered by registration date if needed
    };
  }, [filters, appointments, callLogs, waivers, clients]);

  const stats = [
    { title: 'Total Appointments', value: filteredData.appointments.length.toString(), icon: Calendar, color: '#4f46e5' },
    { title: 'Inbound Calls', value: filteredData.calls.length.toString(), icon: PhoneIncoming, color: '#10b981' },
    { title: 'Total Clients', value: filteredData.clients.length.toString(), icon: Users, color: '#f59e0b' },
    { title: 'Total Waivers', value: filteredData.waivers.length.toString(), icon: TrendingUp, color: '#0ea5e9' },
  ];

  const recentAppointments = useMemo(() => {
    return [...filteredData.appointments]
      .sort((a, b) => b.id - a.id)
      .slice(0, 8);
  }, [filteredData.appointments]);

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, Super Admin.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/appointments/new')}>
          <Calendar size={18} />
          New Appointment
        </button>
      </div>

      {/* Filter Section */}
      <div className="dashboard-filters-card">
        <div className="filters-header">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-primary" />
            <span className="font-semibold">Report Filters</span>
          </div>
          {(filters.clinic || filters.status || filters.month) && (
            <button className="btn-text btn-sm text-danger flex items-center gap-1" onClick={clearFilters}>
              <XCircle size={14} /> Clear All
            </button>
          )}
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Clinic Location</label>
            <div className="select-wrapper">
              <select 
                name="clinic" 
                value={filters.clinic} 
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Clinics</option>
                {clinics.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="select-icon" size={16} />
            </div>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <div className="select-wrapper">
              <select 
                name="status" 
                value={filters.status} 
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                {visitStatus.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="select-icon" size={16} />
            </div>
          </div>

          <div className="filter-group">
            <label>Reporting Month</label>
            <input 
              type="month" 
              name="month" 
              value={filters.month} 
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.title}</span>
              <div className="stat-value-row">
                <span className="stat-value">{stat.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="content-main" style={{ width: '100%' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                {filters.clinic || filters.status || filters.month ? 'Filtered Appointments' : 'Recent Appointments'}
              </h3>
              <button className="btn-text" onClick={() => navigate('/appointments')}>View All</button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Clinic</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.length > 0 ? (
                    recentAppointments.map((app) => (
                      <tr key={app.id}>
                        <td className="font-semibold">{app.name}</td>
                        <td>{app.clinic}</td>
                        <td>{new Date(app.date).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${
                            app.status === 'Visited' || app.status === 'Done' || app.status === 'Confirmed' || app.status === 'Okay' 
                            ? 'badge-success' 
                            : app.status === 'Pending' 
                            ? 'badge-warning' 
                            : 'badge-info'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-icon" title="View" onClick={() => navigate(`/appointments/new?id=${app.id}&view=true`)}>
                              <Eye size={16} />
                            </button>
                            <button className="btn-icon" title="Edit" onClick={() => navigate(`/appointments/new?id=${app.id}`)}>
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                        <div className="empty-state">
                          <p className="text-muted">No appointments match the selected filters.</p>
                          {(filters.clinic || filters.status || filters.month) && (
                            <button className="btn btn-outline btn-sm mt-2" onClick={clearFilters}>
                              Clear Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
