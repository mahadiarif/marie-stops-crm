import { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  FileText, Download, Printer, XCircle, Search,
  Calendar, PhoneIncoming, Users, TrendingUp, Activity
} from 'lucide-react';
import './Reports.css';

const TODAY = new Date();
const startOf = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const endOf   = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };

const QUICK_RANGES = [
  { label: 'Today',       get: () => [startOf(TODAY), endOf(TODAY)] },
  { label: 'This Week',   get: () => { const d = new Date(TODAY); d.setDate(d.getDate() - d.getDay()); return [startOf(d), endOf(TODAY)]; } },
  { label: 'This Month',  get: () => [new Date(TODAY.getFullYear(), TODAY.getMonth(), 1), endOf(TODAY)] },
  { label: 'Last Month',  get: () => { const f = new Date(TODAY.getFullYear(), TODAY.getMonth()-1, 1); const t = new Date(TODAY.getFullYear(), TODAY.getMonth(), 0); return [startOf(f), endOf(t)]; } },
  { label: 'This Year',   get: () => [new Date(TODAY.getFullYear(), 0, 1), endOf(TODAY)] },
];

function exportCSV(rows, cols, filename) {
  const header = cols.map(c => c.label).join(',');
  const body = rows.map(r => cols.map(c => `"${(c.get(r) ?? '').toString().replace(/"/g, '""')}"`).join(','));
  const csv = [header, ...body].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

const Reports = () => {
  const { appointments, callLogs, waivers, clinics, agentNames, followupStatus, visitStatus } = useAppData();

  const [activeTab, setActiveTab] = useState('appointments');
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [quickRange, setQuickRange] = useState('');
  const [clinicFilter, setClinicFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [visitStatusFilter, setVisitStatusFilter] = useState('');
  const [followupFilter, setFollowupFilter] = useState('');
  const [callerTypeFilter, setCallerTypeFilter] = useState('');
  const [callStatusFilter, setCallStatusFilter] = useState('');

  const applyQuickRange = (label) => {
    const range = QUICK_RANGES.find(r => r.label === label);
    if (!range) return;
    const [f, t] = range.get();
    setFromDate(f.toISOString().slice(0, 10));
    setToDate(t.toISOString().slice(0, 10));
    setQuickRange(label);
  };

  const clearFilters = () => {
    setSearchTerm(''); setFromDate(''); setToDate(''); setQuickRange('');
    setClinicFilter(''); setAgentFilter(''); setVisitStatusFilter('');
    setFollowupFilter(''); setCallerTypeFilter(''); setCallStatusFilter('');
  };

  const inRange = (dateStr) => {
    if (!fromDate && !toDate) return true;
    const d = new Date(dateStr);
    if (fromDate && d < new Date(fromDate)) return false;
    if (toDate && d > endOf(new Date(toDate))) return false;
    return true;
  };

  const filteredAppts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return appointments.filter(a =>
      (!term || a.name?.toLowerCase().includes(term) || a.phone?.includes(term)) &&
      inRange(a.date) &&
      (!clinicFilter || a.clinic === clinicFilter) &&
      (!agentFilter || a.agent === agentFilter) &&
      (!visitStatusFilter || a.visitStatus === visitStatusFilter) &&
      (!followupFilter || a.followup === followupFilter)
    );
  }, [appointments, searchTerm, fromDate, toDate, clinicFilter, agentFilter, visitStatusFilter, followupFilter]);

  const filteredCalls = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return callLogs.filter(c =>
      (!term || c.callerName?.toLowerCase().includes(term) || c.phone?.includes(term)) &&
      inRange(c.callDate) &&
      (!callerTypeFilter || c.callerType === callerTypeFilter) &&
      (!callStatusFilter || c.status === callStatusFilter)
    );
  }, [callLogs, searchTerm, fromDate, toDate, callerTypeFilter, callStatusFilter]);

  const filteredWaivers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return waivers.filter(w =>
      (!term || w.firstName?.toLowerCase().includes(term) || w.clientId?.toLowerCase().includes(term)) &&
      inRange(w.date) &&
      (!clinicFilter || w.center === clinicFilter)
    );
  }, [waivers, searchTerm, fromDate, toDate, clinicFilter]);

  // KPIs
  const visitedCount = filteredAppts.filter(a => a.visitStatus && a.visitStatus !== '—').length;
  const visitRate = filteredAppts.length ? Math.round((visitedCount / filteredAppts.length) * 100) : 0;
  const totalSpending = filteredAppts.reduce((s, a) => s + (a.spendingAmount || 0), 0);
  const totalWaiverPaid = filteredWaivers.reduce((s, w) => s + (w.paidAmount || 0), 0);

  const kpis = [
    { label: 'Appointments', value: filteredAppts.length, sub: `${visitedCount} visited (${visitRate}%)`, icon: Calendar, color: '#4f46e5', bg: '#ede9fe' },
    { label: 'Total Spending', value: `৳${totalSpending.toLocaleString()}`, sub: 'from filtered appointments', icon: TrendingUp, color: '#059669', bg: '#d1fae5' },
    { label: 'Call Logs', value: filteredCalls.length, sub: `${filteredCalls.filter(c => c.status === 'Pending').length} pending`, icon: PhoneIncoming, color: '#d97706', bg: '#fef3c7' },
    { label: 'Waivers', value: filteredWaivers.length, sub: `৳${totalWaiverPaid.toLocaleString()} collected`, icon: Activity, color: '#0284c7', bg: '#e0f2fe' },
  ];

  const handleExport = () => {
    if (activeTab === 'appointments') {
      exportCSV(filteredAppts, [
        { label: 'Date',           get: r => new Date(r.date).toLocaleDateString() },
        { label: 'Client Name',    get: r => r.name },
        { label: 'Phone',          get: r => r.phone },
        { label: 'Clinic',         get: r => r.clinic },
        { label: 'Agent',          get: r => r.agent },
        { label: 'Reason',         get: r => r.type },
        { label: 'Reconfirmation', get: r => r.status },
        { label: 'Visit Status',   get: r => r.visitStatus },
        { label: 'Follow-up',      get: r => r.followup },
        { label: 'Spending (৳)',   get: r => r.spendingAmount },
      ], 'appointments_report.csv');
    } else if (activeTab === 'calls') {
      exportCSV(filteredCalls, [
        { label: 'Date',        get: r => new Date(r.callDate).toLocaleDateString() },
        { label: 'Caller Name', get: r => r.callerName },
        { label: 'Phone',       get: r => r.phone },
        { label: 'Type',        get: r => r.callerType },
        { label: 'Reason',      get: r => r.reason },
        { label: 'District',    get: r => r.district },
        { label: 'Status',      get: r => r.status },
        { label: 'Duration',    get: r => r.duration },
      ], 'call_logs_report.csv');
    } else {
      exportCSV(filteredWaivers, [
        { label: 'Date',         get: r => new Date(r.date).toLocaleDateString() },
        { label: 'Client ID',    get: r => r.clientId },
        { label: 'Name',         get: r => r.firstName },
        { label: 'Service',      get: r => r.service },
        { label: 'Center',       get: r => r.center },
        { label: 'Total (৳)',    get: r => r.totalPrice },
        { label: 'Waiver (৳)',   get: r => r.waiverAmount },
        { label: 'Paid (৳)',     get: r => r.paidAmount },
      ], 'waivers_report.csv');
    }
  };

  const callerTypes = [...new Set(callLogs.map(c => c.callerType).filter(Boolean))];
  const callStatuses = [...new Set(callLogs.map(c => c.status).filter(Boolean))];

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Analyze and export CRM data</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => window.print()}>
            <Printer size={16} /> Print
          </button>
          <button className="btn btn-primary" onClick={handleExport}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="report-summary-grid no-print">
        {kpis.map((k, i) => (
          <div key={i} className="report-stat-card" style={{ borderTop: `3px solid ${k.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-label">{k.label}</div>
                <div className="stat-value" style={{ color: k.color }}>{k.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{k.sub}</div>
              </div>
              <div style={{ background: k.bg, borderRadius: '8px', padding: '8px' }}>
                <k.icon size={20} style={{ color: k.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card list-card no-print" style={{ marginBottom: '1.25rem' }}>
        {/* Quick range pills */}
        <div style={{ display: 'flex', gap: '0.4rem', padding: '0.75rem 1rem 0', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginRight: '4px' }}>Quick:</span>
          {QUICK_RANGES.map(r => (
            <button key={r.label} onClick={() => applyQuickRange(r.label)} style={{
              padding: '3px 10px', borderRadius: '20px', border: '1.5px solid',
              borderColor: quickRange === r.label ? '#4f46e5' : '#e2e8f0',
              background: quickRange === r.label ? '#ede9fe' : '#f8fafc',
              color: quickRange === r.label ? '#4f46e5' : '#64748b',
              fontSize: '0.75rem', fontWeight: quickRange === r.label ? 600 : 400, cursor: 'pointer'
            }}>{r.label}</button>
          ))}
          {(fromDate || toDate || quickRange) && (
            <button onClick={() => { setFromDate(''); setToDate(''); setQuickRange(''); }} style={{
              padding: '3px 10px', borderRadius: '20px', border: '1.5px solid #fca5a5',
              background: '#fef2f2', color: '#dc2626', fontSize: '0.75rem', cursor: 'pointer'
            }}>✕ Clear date</button>
          )}
        </div>

        <div className="list-toolbar-new" style={{ paddingTop: '0.5rem' }}>
          {/* Search */}
          <div className="filter-group">
            <label>Search</label>
            <div className="search-wrapper">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Name or phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>

          {/* Date range */}
          <div className="filter-group">
            <label>From Date</label>
            <input type="date" className="uniform-input" value={fromDate} onChange={e => { setFromDate(e.target.value); setQuickRange(''); }} />
          </div>
          <div className="filter-group">
            <label>To Date</label>
            <input type="date" className="uniform-input" value={toDate} onChange={e => { setToDate(e.target.value); setQuickRange(''); }} />
          </div>

          {/* Clinic (appt + waiver) */}
          {(activeTab === 'appointments' || activeTab === 'waivers') && (
            <div className="filter-group">
              <label>Clinic</label>
              <select className="uniform-input" value={clinicFilter} onChange={e => setClinicFilter(e.target.value)}>
                <option value="">All Clinics</option>
                {clinics.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* Appointment-specific filters */}
          {activeTab === 'appointments' && (<>
            <div className="filter-group">
              <label>Agent</label>
              <select className="uniform-input" value={agentFilter} onChange={e => setAgentFilter(e.target.value)}>
                <option value="">All Agents</option>
                {agentNames.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Visit Status</label>
              <select className="uniform-input" value={visitStatusFilter} onChange={e => setVisitStatusFilter(e.target.value)}>
                <option value="">All</option>
                {visitStatus.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Follow-up</label>
              <select className="uniform-input" value={followupFilter} onChange={e => setFollowupFilter(e.target.value)}>
                <option value="">All</option>
                {followupStatus.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </>)}

          {/* Call-specific filters */}
          {activeTab === 'calls' && (<>
            <div className="filter-group">
              <label>Caller Type</label>
              <select className="uniform-input" value={callerTypeFilter} onChange={e => setCallerTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                {callerTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select className="uniform-input" value={callStatusFilter} onChange={e => setCallStatusFilter(e.target.value)}>
                <option value="">All</option>
                {callStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </>)}

          <div className="filter-group button-group">
            <button className="btn-search" style={{ background: '#64748b' }} onClick={clearFilters}>
              <XCircle size={15} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="report-tabs no-print">
        {[['appointments', `Appointments (${filteredAppts.length})`], ['calls', `Call Logs (${filteredCalls.length})`], ['waivers', `Waivers (${filteredWaivers.length})`]].map(([key, label]) => (
          <button key={key} className={`tab-btn ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>{label}</button>
        ))}
      </div>

      {/* Print header */}
      <div className="report-print-header only-print">
        <img src="/logo.webp" alt="Logo" style={{ height: '40px' }} />
        <div style={{ textAlign: 'right' }}>
          <h2>CRM {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report</h2>
          <p>{fromDate && `From: ${fromDate}`} {toDate && `To: ${toDate}`}</p>
          <p>Generated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Table */}
      <div className="report-content-card">
        <div className="table-container">
          <table>

            {/* APPOINTMENTS */}
            {activeTab === 'appointments' && (<>
              <thead><tr>
                <th>#</th><th>Date</th><th>Client</th><th>Phone</th>
                <th>Clinic</th><th>Agent</th><th>Reason</th>
                <th>Reconf.</th><th>Visit Status</th><th>Follow-up</th><th>Spending</th>
              </tr></thead>
              <tbody>
                {filteredAppts.map((a, i) => (
                  <tr key={a.id}>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>{i + 1}</td>
                    <td>{new Date(a.date).toLocaleDateString()}</td>
                    <td className="font-semibold">{a.name}</td>
                    <td>{a.phone}</td>
                    <td>{a.clinic}</td>
                    <td>{a.agent}</td>
                    <td>{a.type}</td>
                    <td><span className={`badge ${a.status === 'Okay' ? 'badge-success' : a.status === 'Pending' ? 'badge-warning' : 'badge-info'}`}>{a.status}</span></td>
                    <td>{a.visitStatus}</td>
                    <td>{a.followup}</td>
                    <td style={{ fontWeight: 600, color: '#059669' }}>{a.spendingAmount > 0 ? `৳${a.spendingAmount.toLocaleString()}` : '—'}</td>
                  </tr>
                ))}
                {filteredAppts.length === 0 && <tr><td colSpan="11" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No data found</td></tr>}
              </tbody>
              {filteredAppts.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#f0f7ff', fontWeight: 700 }}>
                    <td colSpan="10" style={{ textAlign: 'right', color: '#475569' }}>Total Spending:</td>
                    <td style={{ color: '#059669' }}>৳{totalSpending.toLocaleString()}</td>
                  </tr>
                </tfoot>
              )}
            </>)}

            {/* CALLS */}
            {activeTab === 'calls' && (<>
              <thead><tr>
                <th>#</th><th>Date</th><th>Caller Name</th><th>Phone</th>
                <th>Type</th><th>Reason</th><th>District</th><th>Status</th><th>Duration</th>
              </tr></thead>
              <tbody>
                {filteredCalls.map((c, i) => (
                  <tr key={c.id}>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>{i + 1}</td>
                    <td>{new Date(c.callDate).toLocaleDateString()}</td>
                    <td className="font-semibold">{c.callerName}</td>
                    <td>{c.phone}</td>
                    <td>{c.callerType}</td>
                    <td>{c.reason}</td>
                    <td>{c.district}</td>
                    <td><span className={`badge ${c.status === 'Pending' ? 'badge-warning' : 'badge-success'}`}>{c.status}</span></td>
                    <td>{c.duration || '—'}</td>
                  </tr>
                ))}
                {filteredCalls.length === 0 && <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No data found</td></tr>}
              </tbody>
            </>)}

            {/* WAIVERS */}
            {activeTab === 'waivers' && (<>
              <thead><tr>
                <th>#</th><th>Date</th><th>Client ID</th><th>Name</th>
                <th>Service</th><th>Center</th><th>Total (৳)</th><th>Waiver (৳)</th><th>Paid (৳)</th>
              </tr></thead>
              <tbody>
                {filteredWaivers.map((w, i) => (
                  <tr key={w.id}>
                    <td className="text-muted" style={{ fontSize: '0.8rem' }}>{i + 1}</td>
                    <td>{new Date(w.date).toLocaleDateString()}</td>
                    <td className="font-semibold">{w.clientId}</td>
                    <td>{w.firstName}</td>
                    <td>{w.service}</td>
                    <td>{w.center}</td>
                    <td>৳{(w.totalPrice || 0).toLocaleString()}</td>
                    <td style={{ color: '#dc2626' }}>৳{(w.waiverAmount || 0).toLocaleString()}</td>
                    <td style={{ color: '#059669', fontWeight: 600 }}>৳{(w.paidAmount || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {filteredWaivers.length === 0 && <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No data found</td></tr>}
              </tbody>
              {filteredWaivers.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#f0f7ff', fontWeight: 700 }}>
                    <td colSpan="6" style={{ textAlign: 'right', color: '#475569' }}>Totals:</td>
                    <td>৳{filteredWaivers.reduce((s,w) => s+(w.totalPrice||0),0).toLocaleString()}</td>
                    <td style={{ color: '#dc2626' }}>৳{filteredWaivers.reduce((s,w) => s+(w.waiverAmount||0),0).toLocaleString()}</td>
                    <td style={{ color: '#059669' }}>৳{totalWaiverPaid.toLocaleString()}</td>
                  </tr>
                </tfoot>
              )}
            </>)}

          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
