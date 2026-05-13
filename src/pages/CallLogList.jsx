import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Trash2,
  PhoneCall, 
  Plus, 
  Clock, 
  Calendar as CalendarIcon 
} from 'lucide-react';
import './CallLogList.css';

const CallLogList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const [callLogs, setCallLogs] = useState([
    { id: 'LOG-001', phone: '01712345678', date: '15-05-2024 11:30 AM', type: 'Female', reason: 'Information on Family Planning', district: 'Dhaka', duration: '00:08:22', status: 'Resolved' },
    { id: 'LOG-002', phone: '01811223344', date: '15-05-2024 10:15 AM', type: 'General', reason: 'General Health', district: 'Gazipur', duration: '00:03:15', status: 'Follow-up' },
    { id: 'LOG-003', phone: '01911223344', date: '14-05-2024 04:45 PM', type: 'Female', reason: 'Support with Family Planning', district: 'Chattogram', duration: '00:12:10', status: 'Resolved' },
    { id: 'LOG-004', phone: '01611223344', date: '14-05-2024 02:20 PM', type: 'Adolescent', reason: 'Adolescent Health', district: 'Sylhet', duration: '00:15:30', status: 'Appointment Set' },
    { id: 'LOG-005', phone: '01755667788', date: '13-05-2024 09:10 AM', type: 'Male', reason: 'Information on Family Planning', district: 'Khulna', duration: '00:05:45', status: 'Resolved' },
  ]);

  const handleView = (id) => {
    alert(`Viewing details for Call Log ${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/call-logs/new?id=${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm(`Are you sure you want to delete call log ${id}?`)) {
      setCallLogs(callLogs.filter(log => log.id !== id));
    }
  };

  return (
    <div className="list-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Call Logs</h1>
          <div className="breadcrumb">
            <PhoneCall size={14} />
            <span>/ Call Logs / History</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/call-logs/new')}>
          <Plus size={18} />
          New Call Log
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card mini">
          <div className="stat-info">
            <span className="stat-label">Total Calls Today</span>
            <span className="stat-value">24</span>
          </div>
          <div className="stat-icon bg-indigo-50 text-indigo-600"><PhoneCall size={20} /></div>
        </div>
        <div className="stat-card mini">
          <div className="stat-info">
            <span className="stat-label">Average Duration</span>
            <span className="stat-value">04:12</span>
          </div>
          <div className="stat-icon bg-emerald-50 text-emerald-600"><Clock size={20} /></div>
        </div>
      </div>

      <div className="card list-card">
        <div className="list-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by phone number or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="toolbar-actions">
            <button className="btn btn-outline">
              <CalendarIcon size={18} />
              Date Range
            </button>
            <button className="btn btn-outline">
              <Filter size={18} />
              Filters
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Caller Phone</th>
                <th>Date & Time</th>
                <th>Caller Type</th>
                <th>Reason</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {callLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-semibold text-primary">{log.id}</td>
                  <td className="font-medium">{log.phone}</td>
                  <td className="text-muted">{log.date}</td>
                  <td>{log.type}</td>
                  <td>{log.reason}</td>
                  <td>{log.duration}</td>
                  <td>
                    <span className={`badge ${
                      log.status === 'Resolved' ? 'badge-success' : 
                      log.status === 'Appointment Set' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="View Details" onClick={() => handleView(log.id)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon" title="Edit Log" onClick={() => handleEdit(log.id)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon text-danger" title="Delete Log" onClick={() => handleDelete(log.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="pagination-wrapper">
          <span className="showing-text">Showing 1 to {callLogs.length} of {callLogs.length} entries</span>
          <div className="pagination">
            <button className="btn-page disabled">Previous</button>
            <button className="btn-page active">1</button>
            <button className="btn-page disabled">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallLogList;
