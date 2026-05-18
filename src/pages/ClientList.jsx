import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { 
  Users, 
  Search, 
  UserPlus, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Phone,
  MapPin
} from 'lucide-react';
import './ClientList.css';

const ClientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/clients`);
        setClients(response.data);
      } catch (err) {
        console.error("Error fetching clients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client profile?')) {
      try {
        await axiosClient.delete(`/clients/${id}`);
        setClients(clients.filter(c => c.id !== id));
      } catch (err) {
        console.error("Error deleting client:", err);
        alert("Failed to delete client.");
      }
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    );
  }, [clients, searchTerm]);

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
        <button className="btn btn-primary" onClick={() => navigate('/appointments/new')}>
          <UserPlus size={18} />
          Register New Client
        </button>
      </div>

      <div className="card list-card">
        <div className="list-toolbar-new">
          <div className="filter-group">
            <label>Search Directory</label>
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
            <label>Sort By</label>
            <select className="uniform-input">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          <div className="filter-group button-group">
            <button className="btn-search">
              <Search size={16} />
              Filter
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Client ID</th>
                <th>Basic Information</th>
                <th>Contact Details</th>
                <th>Registered On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td className="font-semibold text-primary">#{client.id}</td>
                  <td>
                    <div className="client-info-cell">
                      <span className="client-name">{client.name}</span>
                      <span className="client-meta">{client.age ? `${client.age} Years` : 'Age N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <div className="contact-item">
                        <Phone size={14} className="text-muted" />
                        <span>{client.phone}</span>
                      </div>
                      <div className="contact-item">
                        <MapPin size={14} className="text-muted" />
                        <span>{client.address || 'Address N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="last-interaction">{client.created_at ? new Date(client.created_at).toLocaleDateString() : '—'}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="View Profile" onClick={() => navigate(`/appointments/new?clientId=${client.id}&view=true`)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon" title="Edit" onClick={() => navigate(`/appointments/new?clientId=${client.id}`)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon text-danger" title="Delete" onClick={() => handleDelete(client.id)}>
                        <Trash2 size={16} />
                      </button>
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

export default ClientList;
