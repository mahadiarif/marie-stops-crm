import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import { 
  Users, 
  Calendar, 
  PhoneIncoming, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: 'Total Appointments', value: '0', icon: Calendar, color: '#4f46e5' },
    { title: 'Inbound Calls', value: '0', icon: PhoneIncoming, color: '#10b981' },
    { title: 'Total Clients', value: '0', icon: Users, color: '#f59e0b' },
    { title: 'Total Waivers', value: '0', icon: TrendingUp, color: '#0ea5e9' },
  ]);

  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [apptsRes, callsRes, clientsRes, waiversRes] = await Promise.all([
          axios.get(`${API_URL}/appointments`),
          axios.get(`${API_URL}/call-logs`),
          axios.get(`${API_URL}/clients`),
          axios.get(`${API_URL}/waivers`)
        ]);

        const appts = apptsRes.data;
        const calls = callsRes.data;
        const clients = clientsRes.data;
        const waivers = waiversRes.data;

        setStats([
          { title: 'Total Appointments', value: appts.length.toString(), icon: Calendar, color: '#4f46e5' },
          { title: 'Inbound Calls', value: calls.length.toString(), icon: PhoneIncoming, color: '#10b981' },
          { title: 'Total Clients', value: clients.length.toString(), icon: Users, color: '#f59e0b' },
          { title: 'Total Waivers', value: waivers.length.toString(), icon: TrendingUp, color: '#0ea5e9' },
        ]);

        // Take last 5 appointments as recent
        const sortedAppts = [...appts].sort((a, b) => b.id - a.id).slice(0, 5);
        setRecentAppointments(sortedAppts.map(a => ({
          id: a.id,
          name: a.client_name,
          clinic: a.clinic,
          date: new Date(a.visit_date).toLocaleString(),
          status: a.reconfirmation || 'Pending'
        })));

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
                <span className="stat-value">{loading ? '...' : stat.value}</span>
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
                  {loading ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Loading appointments...</td></tr>
                  ) : recentAppointments.length > 0 ? (
                    recentAppointments.map((app) => (
                      <tr key={app.id}>
                        <td className="font-semibold">{app.name}</td>
                        <td>{app.clinic}</td>
                        <td>{app.date}</td>
                        <td>
                          <span className={`badge ${app.status === 'Visited' || app.status === 'Done' || app.status === 'Confirmed' || app.status === 'Okay' ? 'badge-success' : app.status === 'Pending' ? 'badge-warning' : 'badge-info'}`}>
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
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No recent appointments found.</td></tr>
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

