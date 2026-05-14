import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
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
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/call-logs`);
        setCallLogs(response.data);
      } catch (err) {
        console.error("Error fetching call logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleView = (id) => {
    navigate(`/call-logs/new?id=${id}&view=true`);
  };

  const handleEdit = (id) => {
    navigate(`/call-logs/new?id=${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete call log ${id}?`)) {
      try {
        await axios.delete(`${API_URL}/call-logs/${id}`);
        setCallLogs(callLogs.filter(log => log.id !== id));
        alert("Call log deleted successfully.");
      } catch (err) {
        console.error("Error deleting call log:", err);
        alert("Failed to delete call log.");
      }
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
