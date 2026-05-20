import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { Save, X, ArrowLeft, ClipboardList, Info } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import './NewWaiver.css';

// ── Pure form content for modal/page ──
export function WaiverFormContent({ editId, isViewOnly, onClose, onSaved }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isClinicRole = user?.role === 'clinic';
  const { clinics, waiverCenterPrefixes, waiverServices } = useAppData();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    center: '',
    client_id_code: '',
    discount_client_id: '',
    first_name: '',
    service: '',
    total_price: 0,
    waiver_amount: 0,
    paid_amount: 0,
    waiver_code: '',
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (editId) {
      const fetchWaiver = async () => {
        try {
          const response = await axiosClient.get(`/waivers`);
          const existing = response.data.find(w => w.id === parseInt(editId));
          if (existing) {
            setFormData({
              ...existing,
              date: existing.date ? new Date(existing.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
            });
          }
        } catch (err) {
          console.error("Waiver Save Error:", err);
          const errMsg = err.response?.data?.detail || err.message || "Unknown error";
          alert(`Failed to load: ${errMsg}`);
        }
      };
      fetchWaiver();
    } else {
      const randomCode = 'wv-' + Math.floor(10000 + Math.random() * 90000);
      setFormData(prev => ({
        ...prev,
        waiver_code: randomCode,
        ...(isClinicRole && user?.assignedClinic ? { center: user.assignedClinic } : {})
      }));
    }
  }, [editId]);


  useEffect(() => {
    if (formData.center && !editId) {
      const prefix = waiverCenterPrefixes[formData.center] || 'Gen';
      const nextNum = Math.floor(1000 + Math.random() * 9000).toString();
      setFormData(prev => ({ ...prev, client_id_code: `${prefix}-ae-${nextNum}` }));
    }
  }, [formData.center, waiverCenterPrefixes, editId]);

  useEffect(() => {
    const paid = Math.max(0, formData.total_price - formData.waiver_amount);
    setFormData(prev => ({ ...prev, paid_amount: paid }));
  }, [formData.total_price, formData.waiver_amount]);

  const handleChange = (e) => {
    if (isViewOnly) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'total_price' || name === 'waiver_amount' ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewOnly) return;

    // Basic Validation
    if (!formData.first_name || !formData.center || !formData.service || formData.total_price <= 0) {
      alert("Please fill in required fields and ensure total price is greater than zero.");
      return;
    }

    if (formData.waiver_amount > formData.total_price) {
      alert("Discount amount cannot exceed Total Service Price.");
      return;
    }

    try {
      console.log("Saving waiver data...");

      if (editId) await axiosClient.put(`/waivers/${editId}`, formData);
      else await axiosClient.post(`/waivers`, formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSaved) onSaved();
        else if (onClose) onClose();
        else navigate('/waiver');
      }, 1500);
    } catch (err) { alert("Failed to save."); }
  };

  return (
    <div className="appt-form-content">
      {success && <div className="alert alert-success">✅ Saved successfully!</div>}
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Date <span>*</span></label>
            <input type="datetime-local" name="date" className="form-control" value={formData.date} onChange={handleChange} required readOnly={isViewOnly} />
          </div>
          <div className="form-group">
            <label className="form-label">Clinic/Center <span>*</span></label>
            <select name="center" className="form-control" value={formData.center} onChange={handleChange} required disabled={isViewOnly || isClinicRole}>
              <option value="">-- Select Center --</option>
              {clinics.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Client ID <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>(auto)</span></label>
            <input type="text" className="form-control" value={formData.client_id_code} readOnly style={{ background: '#f1f5f9' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Discount Client ID</label>
            <input type="text" name="discount_client_id" className="form-control" value={formData.discount_client_id} onChange={handleChange} placeholder="Enter discount client ID..." readOnly={isViewOnly} />
          </div>
          <div className="form-group">
            <label className="form-label">First Name <span>*</span></label>
            <input type="text" name="first_name" className="form-control" value={formData.first_name} onChange={handleChange} required readOnly={isViewOnly} />
          </div>
        </div>
        <div className="grid-2 mt-4">
          <div className="form-group">
            <label className="form-label">Service <span>*</span></label>
            <select name="service" className="form-control" value={formData.service} onChange={handleChange} required disabled={isViewOnly}>
              <option value="">-- Select Service --</option>
              {waiverServices.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Total Price</label>
            <input type="number" name="total_price" className="form-control" value={formData.total_price} onChange={handleChange} required readOnly={isViewOnly} />
          </div>
          <div className="form-group">
            <label className="form-label">Discount Amount</label>
            <input type="number" name="waiver_amount" className="form-control" value={formData.waiver_amount} onChange={handleChange} required readOnly={isViewOnly} />
          </div>
          <div className="form-group">
            <label className="form-label">Paid Amount</label>
            <input type="number" className="form-control" value={formData.paid_amount} readOnly style={{background: '#f1f5f9'}} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Remarks</label>
          <textarea name="remarks" className="form-control" rows="2" value={formData.remarks} onChange={handleChange} readOnly={isViewOnly} />
        </div>
        <div className="form-footer mt-6">
          {!isViewOnly && <button type="submit" className="btn btn-success btn-lg"><Save size={18} /> Save</button>}
          <button type="button" className="btn btn-danger btn-lg" onClick={() => (onClose ? onClose() : navigate('/waiver'))}><X size={18} /> {isViewOnly ? 'Close' : 'Cancel'}</button>
        </div>
      </form>
    </div>
  );
}

const NewWaiver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useState(new URLSearchParams(location.search));
  const editId = searchParams.get('id');
  const isViewOnly = searchParams.get('view') === 'true';

  return (
    <div className="form-page-container">
      <div className="form-header">
        <div className="breadcrumb"><ClipboardList size={14} /> <span>/ Discount / Form</span></div>
        <button className="btn btn-warning btn-sm" onClick={() => navigate('/waiver')}><ArrowLeft size={16} /> Go To List</button>
      </div>
      <div className="form-card card">
        <div className="form-card-header"><h2 className="form-title">Discount Entry</h2></div>
        <div className="form-body"><WaiverFormContent editId={editId} isViewOnly={isViewOnly} /></div>
      </div>
    </div>
  );
};

export default NewWaiver;
