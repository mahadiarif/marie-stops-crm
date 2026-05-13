import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { 
  Plus, 
  Search, 
  Edit, 
  ClipboardList,
  Calendar as CalendarIcon
} from 'lucide-react';
import './WaiverList.css';

const WaiverList = () => {
  const navigate = useNavigate();
  const { waivers } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Pagination State
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Logic
  const filteredWaivers = useMemo(() => {
    return waivers.filter(w => {
      // Text Search Filter
      const searchMatch = 
        w.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (w.phone && w.phone.includes(searchTerm)) || 
        w.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.waiverCode.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date Range Filter
      let dateMatch = true;
      if (fromDate && toDate) {
        const wDate = new Date(w.date);
        dateMatch = wDate >= new Date(fromDate) && wDate <= new Date(toDate);
      } else if (fromDate) {
        dateMatch = new Date(w.date) >= new Date(fromDate);
      } else if (toDate) {
        dateMatch = new Date(w.date) <= new Date(toDate);
      }

      return searchMatch && dateMatch;
    });
  }, [waivers, searchTerm, fromDate, toDate]);

  // Pagination Logic
  const totalRecords = filteredWaivers.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = filteredWaivers.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="list-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Waiver List</h1>
          <div className="breadcrumb">
            <ClipboardList size={14} />
            <span>/ Waiver / List</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/waiver/new')}>
          <Plus size={18} />
          Create Waiver
        </button>
      </div>

      <div className="card list-card">
        {/* Top Filter Bar */}
        <div className="list-toolbar flex-wrap" style={{ display: 'flex', gap: '1rem', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', width: '100%' }}>
            <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
              <label style={{ fontSize: '12px', color: '#64748b' }}>Search Box</label>
              <div className="search-box" style={{ width: '100%' }}>
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search by name, phone, client ID..." 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>

            <div className="form-group" style={{ minWidth: '180px', marginBottom: 0 }}>
              <label style={{ fontSize: '12px', color: '#64748b' }}>From Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <div className="form-group" style={{ minWidth: '180px', marginBottom: 0 }}>
              <label style={{ fontSize: '12px', color: '#64748b' }}>To Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <button className="btn btn-primary" style={{ height: '38px' }} onClick={() => setCurrentPage(1)}>
               <Search size={16} /> Search
            </button>
          </div>
        </div>

        {/* Per Page Selection & Table */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select 
            className="form-control" 
            style={{ width: '80px', padding: '0.25rem 0.5rem', height: '32px' }}
            value={recordsPerPage}
            onChange={(e) => { setRecordsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span style={{ fontSize: '14px', color: '#64748b' }}>records per page</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Waiver Center</th>
                <th>Client ID</th>
                <th>First Name</th>
                <th>Service</th>
                <th>Total Price</th>
                <th>Waiver Amount</th>
                <th>Client Paid</th>
                <th>Waiver Code</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length > 0 ? currentRecords.map((waiver, index) => (
                <tr key={waiver.id}>
                  <td>{startIndex + index + 1}</td>
                  <td>{new Date(waiver.date).toLocaleDateString()}</td>
                  <td>{waiver.center}</td>
                  <td className="font-semibold text-primary">{waiver.clientId}</td>
                  <td>{waiver.firstName}</td>
                  <td>{waiver.service}</td>
                  <td>৳{waiver.totalPrice}</td>
                  <td className="text-danger">৳{waiver.waiverAmount}</td>
                  <td className="font-semibold text-success">৳{waiver.paidAmount}</td>
                  <td><code className="waiver-code-badge">{waiver.waiverCode}</code></td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon text-warning" title="Edit" onClick={() => navigate(`/waiver/new?id=${waiver.id}`)}>
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No waiver records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="pagination-wrapper">
          <span className="showing-text">
            Showing {totalRecords === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + recordsPerPage, totalRecords)} of {totalRecords} entries
          </span>
          <div className="pagination">
            <button 
              className={`btn-page ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            
            <button 
              className={`btn-page ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WaiverList;
