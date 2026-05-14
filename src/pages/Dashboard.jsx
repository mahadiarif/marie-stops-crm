import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { 
  Users, 
  Calendar, 
  PhoneIncoming, 
  TrendingUp,
  Eye,
  Edit
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    appointments, 
    callLogs, 
    clients, 
    waivers 
  } = useAppData();

  const stats = [
    { title: 'Total Appointments', value: appointments.length.toString(), icon: Calendar, color: '#4f46e5' },
    { title: 'Inbound Calls', value: callLogs.length.toString(), icon: PhoneIncoming, color: '#10b981' },
    { title: 'Total Clients', value: clients.length.toString(), icon: Users, color: '#f59e0b' },
    { title: 'Total Waivers', value: waivers.length.toString(), icon: TrendingUp, color: '#0ea5e9' },
  ];

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => b.id - a.id)
      .slice(0, 8);
  }, [appointments]);

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
              <h3 className="card-title">Recent Appointments</h3>
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
                        <p className="text-muted">No recent appointments found.</p>
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
