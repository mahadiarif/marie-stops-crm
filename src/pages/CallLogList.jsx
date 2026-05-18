import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
  Phone,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter
} from 'lucide-react';
import './CallLogList.css';

const CallLogList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([]);
  const [, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/call-logs`);
      setLogs(res.data);
    } catch (err) {
      console.error("Error fetching call logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this call log?')) {
      try {
        await axiosClient.delete(`/call-logs/${id}`);
        setLogs(logs.filter(l => l.id !== id));
      } catch (err) {
        alert("Failed to delete.");
      }
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      log.caller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.phone?.includes(searchTerm)
    );
  }, [logs, searchTerm]);

  return (
    <div className="list-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Call Logs</h1>
          <div className="breadcrumb">
            <Phone size={14} />
            <span>/ Call Logs / List</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/call-logs/new')}>
          <Plus size={18} /> Add New Call Log
        </button>
      </div>

      <div className="card list-card">
        <div className="list-toolbar-new">
          <div className="filter-group">
            <label>Search Logs</label>
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by name or phone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-group">
            <button className="btn-search"><Filter size={16} /> Filters</button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Caller Details</th>
                <th>Caller Type</th>
                <th>Reason</th>
                <th>District</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-semibold text-primary">#{log.id}</td>
                  <td>
                    <div className="client-info-cell">
                      <span className="client-name">{log.caller_name}</span>
                      <span className="client-phone">{log.phone}</span>
                    </div>
                  </td>
                  <td>{log.caller_type || '—'}</td>
                  <td>{log.reason_for_calling || '—'}</td>
                  <td>{log.district || '—'}</td>
                  <td>{log.duration || '—'}</td>
                  <td><span className={`badge ${log.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`}>{log.status}</span></td>
                  <td>{new Date(log.call_date).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="View" onClick={() => navigate(`/call-logs/new?id=${log.id}&view=true`)}><Eye size={16} /></button>
                      <button className="btn-icon" title="Edit" onClick={() => navigate(`/call-logs/new?id=${log.id}`)}><Edit size={16} /></button>
                      <button className="btn-icon text-danger" onClick={() => handleDelete(log.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CallLogList;
