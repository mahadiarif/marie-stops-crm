import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppData } from '../../context/AppDataContext';
import { Save, X, ArrowLeft, ClipboardList, Info } from 'lucide-react';
import './NewWaiver.css';

const NewWaiver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clinics, waiverCenterPrefixes, waiverServices, addWaiver, updateWaiver, waivers } = useAppData();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 16),
    center: '',
    clientId: '',
    firstName: '',
    service: '',
    totalPrice: 0,
    waiverAmount: 0,
    paidAmount: 0,
    waiverCode: '',
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  // Check for edit mode
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const view = params.get('view') === 'true';
    setIsViewOnly(view);

    if (id) {
      const existing = waivers.find(w => w.id === parseInt(id));
      if (existing) {
        setFormData(existing);
        setEditId(parseInt(id));
      }
    } else {
      // Generate initial waiver code for new form
      const randomCode = 'wv-' + Math.floor(10000 + Math.random() * 90000);
      setFormData(prev => ({ ...prev, waiverCode: randomCode }));
    }
  }, [location.search, waivers]);

  // Handle Center Select & ID Generation
  useEffect(() => {
    if (formData.center && !editId) {
      const prefix = waiverCenterPrefixes[formData.center] || 'Gen';
      // Count existing waivers for this center to increment ID
      const centerWaivers = waivers.filter(w => w.center === formData.center);
      const nextNum = (centerWaivers.length + 1).toString().padStart(4, '0');
      setFormData(prev => ({ ...prev, clientId: `${prefix}-ae-${nextNum}` }));
    }
  }, [formData.center, waiverCenterPrefixes, waivers, editId]);

  // Handle Paid Amount Auto-calculation
  useEffect(() => {
    const paid = Math.max(0, formData.totalPrice - formData.waiverAmount);
    setFormData(prev => ({ ...prev, paidAmount: paid }));
    
    // Validation: Waiver cannot exceed total
    if (formData.waiverAmount > formData.totalPrice && formData.totalPrice > 0) {
      setErrors(prev => ({ ...prev, waiverAmount: "Amount of Waiver cannot exceed Total Service Price" }));
    } else {
      setErrors(prev => {
        const { waiverAmount, ...rest } = prev;
        return rest;
      });
    }
  }, [formData.totalPrice, formData.waiverAmount]);

  const handleChange = (e) => {
    if (isViewOnly) return;
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalPrice' || name === 'waiverAmount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isViewOnly) return;
    
    // Final validation
    if (formData.waiverAmount > formData.totalPrice) {
      alert("Amount of Waiver cannot exceed Total Service Price");
      return;
    }

    if (!formData.center || !formData.firstName || !formData.service) {
      alert("Please fill in all required fields.");
      return;
    }

    if (editId) {
      updateWaiver(editId, formData);
    } else {
      addWaiver({
        ...formData,
        id: Date.now()
      });
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      if (editId) {
        navigate('/waiver');
      } else {
        // Reset for new waiver
        const randomCode = 'wv-' + Math.floor(10000 + Math.random() * 90000);
        setFormData({
          date: new Date().toISOString().slice(0, 16),
          center: '',
          clientId: '',
          firstName: '',
          service: '',
          totalPrice: 0,
          waiverAmount: 0,
          paidAmount: 0,
          waiverCode: randomCode,
          remarks: ''
        });
      }
    }, 2000);
  };

  return (
    <div className="form-page-container">
      <div className="form-header">
        <div className="breadcrumb">
          <ClipboardList size={14} />
          <span>/ Waiver / {isViewOnly ? 'View Details' : (editId ? 'Edit Waiver' : 'New Waiver')}</span>
        </div>
        <div className="header-actions">
          <button className="btn btn-warning btn-sm" onClick={() => navigate('/waiver')}>
            <ArrowLeft size={16} />
            Go To List
          </button>
        </div>
      </div>

      <div className="form-card card">
        <div className="form-card-header">
          <h2 className="form-title">{isViewOnly ? 'View Waiver Details' : (editId ? 'Update Waiver Record' : 'New Waiver Request')}</h2>
        </div>

        <div className="form-body">
          {success && (
            <div className="alert alert-success">
              Waiver saved successfully!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Date <span>*</span></label>
                <input 
                  type="datetime-local" 
                  name="date"
                  className="form-control" 
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Waiver Center <span>*</span></label>
                <select 
                  name="center"
                  className="form-control" 
                  value={formData.center}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Center --</option>
                  {clinics.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Waiver Client ID <span>*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.clientId}
                  readOnly 
                  placeholder="Auto-generated"
                />
              </div>
              <div className="form-group">
                <label className="form-label">First Name <span>*</span></label>
                <input 
                  type="text" 
                  name="firstName"
                  className="form-control" 
                  placeholder="Client First Name" 
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid-2 mt-4">
              <div className="form-group">
                <label className="form-label">Service <span>*</span></label>
                <select 
                  name="service"
                  className="form-control" 
                  value={formData.service}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Service --</option>
                  {waiverServices.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Total Service Price <span>*</span></label>
                <input 
                  type="number" 
                  name="totalPrice"
                  className="form-control" 
                  value={formData.totalPrice}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Amount of Waiver <span>*</span></label>
                <input 
                  type="number" 
                  name="waiverAmount"
                  className={`form-control ${errors.waiverAmount ? 'is-invalid' : ''}`} 
                  value={formData.waiverAmount}
                  onChange={handleChange}
                  required
                />
                {errors.waiverAmount && <div className="error-text">{errors.waiverAmount}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Amount Paid by Client</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={formData.paidAmount}
                  readOnly 
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Waiver Code</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.waiverCode}
                  readOnly 
                />
              </div>
            </div>

            <div className="form-group mt-4">
              <label className="form-label">Remarks</label>
              <textarea 
                name="remarks"
                className="form-control" 
                rows="3" 
                placeholder="Enter remarks..."
                value={formData.remarks}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="note-box">
              <Info size={18} className="text-warning" />
              <p>Note: Fields marked with <span>*</span> are required. Amount Paid is automatically calculated.</p>
            </div>

            <div className="form-footer mt-6">
              <button type="submit" className="btn btn-success btn-lg">
                <Save size={18} />
                {editId ? 'Update Waiver' : 'Save Waiver'}
              </button>
              <button type="button" className="btn btn-danger btn-lg" onClick={() => navigate('/waiver')}>
                <X size={18} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewWaiver;
