import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, TrendingUp, Building2 } from 'lucide-react';
import './Dashboard.css';

const DASH_PAGE_SIZE = 10;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments, waivers } = useAppData();

  const role = user?.role;
  const assignedClinic = user?.assignedClinic;

  const [apptPage, setApptPage] = useState(1);

  // For clinic role, appointments are already filtered by backend
  // For waivers/callLogs, filter in frontend by assignedClinic
  const clinicWaivers = useMemo(() =>
    role === 'clinic' && assignedClinic
      ? waivers.filter(w => w.center === assignedClinic)
      : waivers,
  [role, assignedClinic, waivers]);

  const stats = useMemo(() => {
    const visited = appointments.filter(a => a.visitStatus === 'Visited').length;
    const pending = appointments.filter(a => !a.visitStatus || a.visitStatus === '—' || a.visitStatus === '').length;
    const totalSpending = appointments.reduce((s, a) => s + (a.spendingAmount || 0), 0);

    if (role === 'staff') {
      return [
        { title: 'Appointments Booked', value: appointments.length, icon: Calendar, color: '#005CB9' },
        { title: 'Visited', value: visited, icon: Users, color: '#10b981' },
        { title: 'Pending Visit', value: pending, icon: TrendingUp, color: '#f59e0b' },
        { title: 'Total Spending (৳)', value: `৳${totalSpending.toLocaleString()}`, icon: Building2, color: '#e4007e' },
      ];
    }
    if (role === 'clinic') {
      return [
        { title: 'Appointments', value: appointments.length, icon: Calendar, color: '#005CB9' },
        { title: 'Visited', value: visited, icon: Users, color: '#10b981' },
        { title: 'Discounts', value: clinicWaivers.length, icon: TrendingUp, color: '#e4007e' },
        { title: 'Total Spending (৳)', value: `৳${totalSpending.toLocaleString()}`, icon: Building2, color: '#f59e0b' },
      ];
    }
    return [
      { title: 'Total Appointments', value: appointments.length, icon: Calendar, color: '#005CB9' },
      { title: 'Visited', value: visited, icon: Users, color: '#10b981' },
      { title: 'Total Discounts', value: waivers.length, icon: TrendingUp, color: '#e4007e' },
      { title: 'Total Spending (৳)', value: `৳${totalSpending.toLocaleString()}`, icon: Building2, color: '#f59e0b' },
    ];
  }, [role, appointments, waivers, clinicWaivers]);

  const sortedAppointments = useMemo(() => [...appointments].sort((a, b) => b.id - a.id), [appointments]);

  const apptTotalPages = Math.max(1, Math.ceil(sortedAppointments.length / DASH_PAGE_SIZE));

  const recentAppointments = useMemo(() =>
    sortedAppointments.slice((apptPage - 1) * DASH_PAGE_SIZE, apptPage * DASH_PAGE_SIZE),
  [sortedAppointments, apptPage]);

  const roleLabel = {
    admin: 'Admin Overview',
    manager: 'Manager Overview',
    staff: 'Call Center View',
    clinic: `Clinic View${assignedClinic ? ` — ${assignedClinic}` : ''}`,
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {roleLabel[role] || 'Overview'}{user ? ` · ${user.username}` : ''}
          </p>
        </div>
        {role !== 'clinic' && (
          <button className="btn btn-primary" onClick={() => navigate('/appointments/new')}>
            <Calendar size={18} /> New Appointment
          </button>
        )}
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
                  {role === 'clinic' ? `Recent Appointments — ${assignedClinic || 'My Clinic'}` : 'Recent Appointments'}
                </h3>
                <button className="btn-text" onClick={() => navigate('/appointments')}>View All</button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Phone</th>
                      {role !== 'clinic' && <th>Clinic</th>}
                      <th>Reason</th>
                      <th>Visit Date</th>
                      <th>Reconfirmation</th>
                      <th>Visit Status</th>
                      <th>Spending (৳)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAppointments.length > 0 ? recentAppointments.map((app) => (
                      <tr key={app.id}>
                        <td className="font-semibold">{app.name}</td>
                        <td>{app.phone || '—'}</td>
                        {role !== 'clinic' && <td>{app.clinic}</td>}
                        <td>{app.type || '—'}</td>
                        <td>{app.date ? new Date(app.date).toLocaleDateString() : '—'}</td>
                        <td>
                          <span className={`badge ${
                            app.status === 'Okay' ? 'badge-success'
                            : app.status === 'Pending' ? 'badge-warning'
                            : 'badge-info'
                          }`}>{app.status}</span>
                        </td>
                        <td>{app.visitStatus || '—'}</td>
                        <td>{app.spendingAmount > 0 ? `৳${app.spendingAmount}` : '—'}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={role !== 'clinic' ? 8 : 7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No appointments found.</td></tr>
                    )}
                  </tbody>
                  {sortedAppointments.length > 0 && (
                    <tfoot>
                      <tr style={{ background: '#f0f7ff', borderTop: '2px solid #e2e8f0' }}>
                        <td colSpan={role !== 'clinic' ? 7 : 6} style={{ textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>Total Spending:</td>
                        <td style={{ fontWeight: 700, color: '#005CB9', fontSize: '0.95rem' }}>
                          ৳{sortedAppointments.reduce((sum, a) => sum + (a.spendingAmount || 0), 0).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              <div className="pagination-bar">
                <span className="pagination-info">Showing {sortedAppointments.length === 0 ? 0 : (apptPage - 1) * DASH_PAGE_SIZE + 1}–{Math.min(apptPage * DASH_PAGE_SIZE, sortedAppointments.length)} of {sortedAppointments.length}</span>
                <div className="pagination-controls">
                  <button className="page-btn" onClick={() => setApptPage(p => Math.max(1, p - 1))} disabled={apptPage === 1}>Previous</button>
                  {Array.from({ length: apptTotalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === apptTotalPages || Math.abs(p - apptPage) <= 1)
                    .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...'); acc.push(p); return acc; }, [])
                    .map((p, idx) => p === '...' ? <span key={`e${idx}`} className="page-ellipsis">…</span> : <button key={p} className={`page-btn ${p === apptPage ? 'active' : ''}`} onClick={() => setApptPage(p)}>{p}</button>)}
                  <button className="page-btn" onClick={() => setApptPage(p => Math.min(apptTotalPages, p + 1))} disabled={apptPage === apptTotalPages}>Next</button>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
