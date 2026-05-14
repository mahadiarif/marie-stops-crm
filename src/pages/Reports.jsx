import React, { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  FileText, 
  Download, 
  Printer, 
  Filter, 
  XCircle, 
  ChevronDown,
  Calendar,
  PhoneIncoming,
  Users,
  TrendingUp,
  Search,
  Calendar as CalendarIcon
} from 'lucide-react';
import './Reports.css';

const Reports = () => {
  const { 
    appointments, 
    callLogs, 
    clients, 
    waivers, 
    clinics, 
    visitStatus 
  } = useAppData();

  const [activeTab, setActiveTab] = useState('appointments');
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [clinicFilter, setClinicFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const clearFilters = () => {
    setSearchTerm('');
    setFromDate(null);
    setToDate(null);
    setClinicFilter('');
    setStatusFilter('');
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    let filteredAppts = [...appointments];
    let filteredCalls = [...callLogs];
    let filteredWaivers = [...waivers];

    // Search Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredAppts = filteredAppts.filter(a => 
        (a.name && a.name.toLowerCase().includes(term)) || 
        (a.phone && a.phone.includes(term))
      );
      filteredCalls = filteredCalls.filter(c => 
        (c.callerName && c.callerName.toLowerCase().includes(term)) || 
        (c.phone && c.phone.includes(term))
      );
      filteredWaivers = filteredWaivers.filter(w => 
        (w.firstName && w.firstName.toLowerCase().includes(term)) || 
        (w.clientId && w.clientId.toLowerCase().includes(term))
      );
    }

    // Clinic Filter
    if (clinicFilter) {
      filteredAppts = filteredAppts.filter(a => a.clinic === clinicFilter);
      filteredWaivers = filteredWaivers.filter(w => w.center === clinicFilter);
    }

    // Status Filter
    if (statusFilter) {
      filteredAppts = filteredAppts.filter(a => a.status === statusFilter);
      filteredCalls = filteredCalls.filter(c => c.status === statusFilter);
    }

    // Date Range Filter
    const filterByDateRange = (date, from, to) => {
      const d = new Date(date);
      if (from && to) return d >= from && d <= to;
      if (from) return d >= from;
      if (to) return d <= to;
      return true;
    };

    if (fromDate || toDate) {
      filteredAppts = filteredAppts.filter(a => filterByDateRange(a.date, fromDate, toDate));
      filteredCalls = filteredCalls.filter(c => filterByDateRange(c.callDate, fromDate, toDate));
      filteredWaivers = filteredWaivers.filter(w => filterByDateRange(w.date, fromDate, toDate));
    }

    return {
      appointments: filteredAppts,
      calls: filteredCalls,
      waivers: filteredWaivers,
      clients: clients
    };
  }, [searchTerm, clinicFilter, statusFilter, fromDate, toDate, appointments, callLogs, waivers, clients]);

  const stats = [
    { title: 'Appointments', value: filteredData.appointments.length, icon: Calendar, color: '#4f46e5' },
    { title: 'Call Logs', value: filteredData.calls.length, icon: PhoneIncoming, color: '#10b981' },
    { title: 'Clients', value: filteredData.clients.length, icon: Users, color: '#f59e0b' },
    { title: 'Waivers', value: filteredData.waivers.length, icon: TrendingUp, color: '#0ea5e9' },
  ];

  return (
    <div className="reports-container">
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and analyze CRM data reports.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={handlePrint}>
            <Printer size={18} /> Print Report
          </button>
          <button className="btn btn-primary">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="report-summary-grid no-print">
        {stats.map((stat, index) => (
          <div key={index} className="report-stat-card">
            <div className="stat-label">{stat.title}</div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Modern Toolbar Filter Section (Same as Appointments) */}
      <div className="card list-card no-print" style={{ marginBottom: '1.5rem' }}>
        <div className="list-toolbar flex-wrap" style={{ display: 'flex', gap: '1rem', padding: '1.5rem', background: '#fff' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', width: '100%' }}>
            <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
              <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Search</label>
              <div className="search-box" style={{ width: '100%' }}>
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search by name, phone, or ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ minWidth: '180px', marginBottom: 0 }}>
              <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>From Date</label>
              <DatePicker
                selected={fromDate}
                onChange={(date) => setFromDate(date)}
                showTimeSelect
                dateFormat="Pp"
                className="form-control"
                placeholderText="Select start date"
              />
            </div>

            <div className="form-group" style={{ minWidth: '180px', marginBottom: 0 }}>
              <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>To Date</label>
              <DatePicker
                selected={toDate}
                onChange={(date) => setToDate(date)}
                showTimeSelect
                dateFormat="Pp"
                className="form-control"
                placeholderText="Select end date"
              />
            </div>

            <div className="form-group" style={{ minWidth: '180px', marginBottom: 0 }}>
              <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Clinic</label>
              <select className="form-control" value={clinicFilter} onChange={(e) => setClinicFilter(e.target.value)}>
                <option value="">-- All Clinics --</option>
                {clinics.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ minWidth: '150px', marginBottom: 0 }}>
              <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Status</label>
              <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">-- All Statuses --</option>
                {visitStatus.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button className="btn btn-outline" style={{ height: '38px' }} onClick={clearFilters}>
              <XCircle size={16} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Report Content for Printing */}
      <div className="report-print-header only-print">
        <img src="/logo.webp" alt="Logo" style={{ height: '40px' }} />
        <div style={{ textAlign: 'right' }}>
          <h2>CRM Activity Report</h2>
          <p>{fromDate ? `From: ${fromDate.toLocaleDateString()}` : ''} {toDate ? `To: ${toDate.toLocaleDateString()}` : ''}</p>
          <p>Generated on: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="report-tabs no-print">
        <button 
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
        <button 
          className={`tab-btn ${activeTab === 'calls' ? 'active' : ''}`}
          onClick={() => setActiveTab('calls')}
        >
          Call Logs
        </button>
        <button 
          className={`tab-btn ${activeTab === 'waivers' ? 'active' : ''}`}
          onClick={() => setActiveTab('waivers')}
        >
          Waivers
        </button>
      </div>

      <div className="report-content-card">
        <div className="card-header no-print">
          <h3 className="card-title">
            Detailed {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} List
          </h3>
        </div>
        
        <div className="table-container">
          <table>
            {activeTab === 'appointments' && (
              <>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client Name</th>
                    <th>Clinic</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.appointments.map(a => (
                    <tr key={a.id}>
                      <td>{new Date(a.date).toLocaleDateString()}</td>
                      <td className="font-semibold">{a.name}</td>
                      <td>{a.clinic}</td>
                      <td><span className={`badge badge-info`}>{a.status}</span></td>
                      <td>{a.type}</td>
                      <td>{a.phone}</td>
                    </tr>
                  ))}
                  {filteredData.appointments.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-8 text-muted">No appointments found for selected filters.</td></tr>
                  )}
                </tbody>
              </>
            )}

            {activeTab === 'calls' && (
              <>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Caller Name</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.calls.map(c => (
                    <tr key={c.id}>
                      <td>{new Date(c.callDate).toLocaleDateString()}</td>
                      <td className="font-semibold">{c.callerName}</td>
                      <td>{c.phone}</td>
                      <td>{c.callerType}</td>
                      <td>{c.status}</td>
                      <td>{c.duration}</td>
                    </tr>
                  ))}
                  {filteredData.calls.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-8 text-muted">No call logs found for selected filters.</td></tr>
                  )}
                </tbody>
              </>
            )}

            {activeTab === 'waivers' && (
              <>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client ID</th>
                    <th>Service</th>
                    <th>Center</th>
                    <th>Total</th>
                    <th>Waiver</th>
                    <th>Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.waivers.map(w => (
                    <tr key={w.id}>
                      <td>{new Date(w.date).toLocaleDateString()}</td>
                      <td className="font-semibold">{w.clientId}</td>
                      <td>{w.service}</td>
                      <td>{w.center}</td>
                      <td>৳{w.totalPrice}</td>
                      <td className="text-danger">৳{w.waiverAmount}</td>
                      <td className="text-success font-semibold">৳{w.paidAmount}</td>
                    </tr>
                  ))}
                  {filteredData.waivers.length === 0 && (
                    <tr><td colSpan="7" className="text-center py-8 text-muted">No waivers found for selected filters.</td></tr>
                  )}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
