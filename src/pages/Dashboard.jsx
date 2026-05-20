import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, PhoneIncoming, TrendingUp, Building2 } from 'lucide-react'; // Building2 used in clinic stats
import './Dashboard.css';

const DASH_PAGE_SIZE = 10;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments, callLogs, clients, waivers } = useAppData();

  const role = user?.role;
  const assignedClinic = user?.assignedClinic;

  const [apptPage, setApptPage] = useState(1);
  const [callPage, setCallPage] = useState(1);

  // For clinic role, appointments are already filtered by backend
  // For waivers/callLogs, filter in frontend by assignedClinic
  const clinicWaivers = useMemo(() =>
    role === 'clinic' && assignedClinic
      ? waivers.filter(w => w.center === assignedClinic)
      : waivers,
  [role, assignedClinic, waivers]);

  const stats = useMemo(() => {
    if (role === 'staff') {
      return [
        { title: 'Total Calls', value: callLogs.length, icon: PhoneIncoming, color: '#10b981' },
        { title: 'Appointments Booked', value: appointments.length, icon: Calendar, color: '#005CB9' },
        { title: 'Total Clients', value: clients.length, icon: Users, color: '#f59e0b' },
      ];
    }
    if (role === 'clinic') {
      const visited = appointments.filter(a => a.visitStatus && a.visitStatus !== '—' && a.visitStatus !== '');
      const totalSpending = appointments.reduce((s, a) => s + (a.spendingAmount || 0), 0);
      return [
        { title: 'Appointments', value: appointments.length, icon: Calendar, color: '#005CB9' },
        { title: 'Visited', value: visited.length, icon: Users, color: '#10b981' },
        { title: 'Waivers', value: clinicWaivers.length, icon: TrendingUp, color: '#e4007e' },
        { title: 'Total Spending (৳)', value: `৳${totalSpending.toLocaleString()}`, icon: Building2, color: '#f59e0b' },
      ];
    }
    return [
      { title: 'Total Appointments', value: appointments.length, icon: Calendar, color: '#005CB9' },
      { title: 'Inbound Calls', value: callLogs.length, icon: PhoneIncoming, color: '#10b981' },
      { title: 'Total Clients', value: clients.length, icon: Users, color: '#f59e0b' },
      { title: 'Total Waivers', value: waivers.length, icon: TrendingUp, color: '#e4007e' },
    ];
  }, [role, appointments, callLogs, clients, waivers, clinicWaivers]);

  const sortedAppointments = useMemo(() => [...appointments].sort((a, b) => b.id - a.id), [appointments]);
  const sortedCalls = useMemo(() => [...callLogs].sort((a, b) => b.id - a.id), [callLogs]);

  const apptTotalPages = Math.max(1, Math.ceil(sortedAppointments.length / DASH_PAGE_SIZE));
  const callTotalPages = Math.max(1, Math.ceil(sortedCalls.length / DASH_PAGE_SIZE));

  const recentAppointments = useMemo(() =>
    sortedAppointments.slice((apptPage - 1) * DASH_PAGE_SIZE, apptPage * DASH_PAGE_SIZE),
  [sortedAppointments, apptPage]);

  const recentCalls = useMemo(() =>
    sortedCalls.slice((callPage - 1) * DASH_PAGE_SIZE, callPage * DASH_PAGE_SIZE),
  [sortedCalls, callPage]);

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

          {role === 'staff' ? (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Call Logs</h3>
                <button className="btn-text" onClick={() => navigate('/call-logs')}>View All</button>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Caller Name</th>
                      <th>Phone</th>
                      <th>Caller Type</th>
                      <th>Reason</th>
                      <th>District</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCalls.length > 0 ? recentCalls.map((log) => (
                      <tr key={log.id}>
                        <td className="font-semibold">{log.callerName}</td>
                        <td>{log.phone || '—'}</td>
                        <td>{log.callerType || '—'}</td>
                        <td>{log.reason || '—'}</td>
                        <td>{log.district || '—'}</td>
                        <td>
                          <span className={`badge ${log.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td>{log.callDate ? new Date(log.callDate).toLocaleDateString() : '—'}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No call logs found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="pagination-bar">
                <span className="pagination-info">Showing {sortedCalls.length === 0 ? 0 : (callPage - 1) * DASH_PAGE_SIZE + 1}–{Math.min(callPage * DASH_PAGE_SIZE, sortedCalls.length)} of {sortedCalls.length}</span>
                <div className="pagination-controls">
                  <button className="page-btn" onClick={() => setCallPage(p => Math.max(1, p - 1))} disabled={callPage === 1}>Previous</button>
                  {Array.from({ length: callTotalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === callTotalPages || Math.abs(p - callPage) <= 1)
                    .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...'); acc.push(p); return acc; }, [])
                    .map((p, idx) => p === '...' ? <span key={`e${idx}`} className="page-ellipsis">…</span> : <button key={p} className={`page-btn ${p === callPage ? 'active' : ''}`} onClick={() => setCallPage(p)}>{p}</button>)}
                  <button className="page-btn" onClick={() => setCallPage(p => Math.min(callTotalPages, p + 1))} disabled={callPage === callTotalPages}>Next</button>
                </div>
              </div>
            </div>
          ) : (
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
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
