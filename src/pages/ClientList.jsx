import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  UserPlus,
  Phone,
  MapPin
} from 'lucide-react';
import './ClientList.css';

const ClientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const [clients, setClients] = useState([
    { id: 'C-1001', name: 'Nusrat Jahan', phone: '01712345678', age: 28, address: 'Mirpur, Dhaka', registeredAt: '10-04-2024', totalVisits: 3 },
    { id: 'C-1002', name: 'Farhana Islam', phone: '01811223344', age: 32, address: 'Dhanmondi, Dhaka', registeredAt: '15-04-2024', totalVisits: 1 },
    { id: 'C-1003', name: 'Sabina Yasmin', phone: '01911223344', age: 25, address: 'Uttara, Dhaka', registeredAt: '22-04-2024', totalVisits: 2 },
    { id: 'C-1004', name: 'Runa Laila', phone: '01611223344', age: 40, address: 'Gulshan, Dhaka', registeredAt: '05-05-2024', totalVisits: 1 },
    { id: 'C-1005', name: 'Tania Akter', phone: '01755667788', age: 29, address: 'Mohammadpur, Dhaka', registeredAt: '12-05-2024', totalVisits: 0 },
  ]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this client profile?')) {
      setClients(clients.filter(client => client.id !== id));
    }
  };

  const handleEdit = (id) => {
    // Assuming there's a registration form, otherwise navigate to appointments
    navigate(`/appointments/new?clientId=${id}`);
  };

  const handleView = (id) => {
    navigate(`/profile?id=${id}`);
  };

  return (
    <div className="list-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Client Directory</h1>
          <div className="breadcrumb">
            <Users size={14} />
            <span>/ Clients / Directory</span>
          </div>
        </div>
        <button className="btn btn-primary">
          <UserPlus size={18} />
          Register New Client
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card mini">
          <div className="stat-info">
            <span className="stat-label">Total Clients</span>
            <span className="stat-value">{clients.length}</span>
          </div>
          <div className="stat-icon bg-indigo-50 text-indigo-600"><Users size={20} /></div>
        </div>
        <div className="stat-card mini">
          <div className="stat-info">
            <span className="stat-label">New This Month</span>
            <span className="stat-value">12</span>
          </div>
          <div className="stat-icon bg-emerald-50 text-emerald-600"><UserPlus size={20} /></div>
        </div>
      </div>

      <div className="card list-card">
        <div className="list-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by ID, name or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="toolbar-actions">
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
                <th>Client ID</th>
                <th>Client Details</th>
                <th>Contact & Address</th>
                <th>Registration Date</th>
                <th>Total Visits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="font-semibold text-primary">{client.id}</td>
                  <td>
                    <div className="client-details-cell">
                      <span className="client-name">{client.name}</span>
                      <span className="client-age">{client.age} years old</span>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <div className="contact-item"><Phone size={14} /> {client.phone}</div>
                      <div className="contact-item text-muted"><MapPin size={14} /> {client.address}</div>
                    </div>
                  </td>
                  <td>{client.registeredAt}</td>
                  <td>
                    <span className={`badge ${client.totalVisits > 0 ? 'badge-success' : 'badge-warning'}`}>
                      {client.totalVisits} Visits
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="View Profile" onClick={() => handleView(client.id)}><Eye size={16} /></button>
                      <button className="btn-icon" title="Edit Profile" onClick={() => handleEdit(client.id)}><Edit size={16} /></button>
                      <button className="btn-icon text-danger" title="Delete Profile" onClick={() => handleDelete(client.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">No clients found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="pagination-wrapper">
          <span className="showing-text">Showing 1 to {clients.length} of {clients.length} entries</span>
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

export default ClientList;
