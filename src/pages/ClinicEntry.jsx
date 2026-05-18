import { useState, useEffect, useMemo } from 'react';
import axiosClient from '../api/axiosClient';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { Building2, Search, Save, CheckCircle, Plus, ArrowLeft, X, MapPin, Users, ChevronRight, Phone, User, LogIn } from 'lucide-react';
import './ClinicEntry.css';

const ClinicEntry = () => {
  const { clinics, visitStatus, reasons } = useAppData();
  const { user } = useAuth();

  const isClinicRole = user?.role === 'clinic';
  const assignedClinic = user?.assignedClinic || '';

  const emptyEntryForm = {
    client_name: '', client_phone: '', age: '',
    clinic: isClinicRole ? assignedClinic : '',
    reason: '',
    visit_date: new Date().toISOString().slice(0, 10),
    visit_status_clinic: '', spending_amount: '', notes: ''
  };

  const emptyClinicForm = {
    name: '', address: '', phone: '', district: '', center_type: '',
    contact_person: '', username: '', password: '', email: ''
  };

  const [appointments, setAppointments] = useState([]);
  const [clinicCenters, setClinicCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState(isClinicRole ? assignedClinic : null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowState, setRowState] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showClinicForm, setShowClinicForm] = useState(false);
  const [clinicForm, setClinicForm] = useState(emptyClinicForm);
  const [clinicFormSaving, setClinicFormSaving] = useState(false);
  const [formData, setFormData] = useState(emptyEntryForm);
  const [formSaving, setFormSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [apptRes, centerRes] = await Promise.all([
          axiosClient.get('/appointments'),
          axiosClient.get('/clinic-centers'),
        ]);
        const mapped = apptRes.data.map(a => ({
          id: a.id,
          name: a.client_name,
          phone: a.client_phone,
          clinic: a.clinic,
          reason: a.reason || '—',
          visitDate: a.visit_date,
          visitStatus: a.visit_status_clinic || '',
          spendingAmount: a.spending_amount || 0,
          reconfirmation: a.reconfirmation || '—',
        }));
        setAppointments(mapped);
        setClinicCenters(centerRes.data);
        const initial = {};
        mapped.forEach(a => {
          initial[a.id] = { visitStatus: a.visitStatus, spendingAmount: a.spendingAmount };
        });
        setRowState(initial);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ── Clinic summary stats ──
  const clinicStats = useMemo(() => {
    // Use clinic centers from DB; fall back to settings list for any not yet in centers
    const centerNames = clinicCenters.map(c => c.name);
    const allClinicNames = [...new Set([...centerNames, ...clinics])];
    return allClinicNames.map(clinicName => {
      const center = clinicCenters.find(c => c.name === clinicName);
      const appts = appointments.filter(a => a.clinic === clinicName);
      const visited = appts.filter(a => a.visitStatus && a.visitStatus !== '');
      const totalSpending = appts.reduce((s, a) => s + (a.spendingAmount || 0), 0);
      return {
        clinic: clinicName,
        address: center?.address || '',
        phone: center?.phone || '',
        district: center?.district || '',
        center_type: center?.center_type || '',
        contact_person: center?.contact_person || '',
        count: appts.length,
        visited: visited.length,
        totalSpending
      };
    });
  }, [clinics, clinicCenters, appointments]);

  // ── Appointments for selected clinic ──
  const clinicAppointments = useMemo(() => {
    if (!selectedClinic) return [];
    return appointments.filter(a => {
      const matchClinic = a.clinic === selectedClinic;
      const matchSearch =
        !searchTerm ||
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.phone.includes(searchTerm);
      return matchClinic && matchSearch;
    });
  }, [appointments, selectedClinic, searchTerm]);

  const handleChange = (id, field, value) => {
    setRowState(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSave = async (appt) => {
    setSavingId(appt.id);
    try {
      const state = rowState[appt.id];
      await axiosClient.put(`/appointments/${appt.id}`, {
        client_name: appt.name,
        client_phone: appt.phone,
        clinic: appt.clinic,
        reason: appt.reason,
        visit_date: appt.visitDate,
        visit_status_clinic: state.visitStatus,
        spending_amount: parseInt(state.spendingAmount) || 0,
      });
      setAppointments(prev =>
        prev.map(a =>
          a.id === appt.id
            ? { ...a, visitStatus: state.visitStatus, spendingAmount: parseInt(state.spendingAmount) || 0 }
            : a
        )
      );
      setSavedId(appt.id);
      setTimeout(() => setSavedId(null), 2000);
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save.');
    } finally {
      setSavingId(null);
    }
  };

  const isDirty = (appt) => {
    const s = rowState[appt.id];
    if (!s) return false;
    return s.visitStatus !== appt.visitStatus || parseInt(s.spendingAmount) !== appt.spendingAmount;
  };

  const handleClinicFormChange = (e) => {
    const { name, value } = e.target;
    setClinicForm(prev => ({ ...prev, [name]: value }));
  };

  const handleClinicFormSubmit = async (e) => {
    e.preventDefault();
    if (!clinicForm.name.trim()) { alert('Clinic name is required.'); return; }
    setClinicFormSaving(true);
    try {
      const res = await axiosClient.post('/clinic-centers', clinicForm);
      setClinicCenters(prev => [...prev, res.data]);
      setShowClinicForm(false);
      setClinicForm(emptyClinicForm);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save clinic.');
    } finally {
      setClinicFormSaving(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const refreshAppointments = async () => {
    const res = await axiosClient.get('/appointments');
    const mapped = res.data.map(a => ({
      id: a.id,
      name: a.client_name,
      phone: a.client_phone,
      clinic: a.clinic,
      reason: a.reason || '—',
      visitDate: a.visit_date,
      visitStatus: a.visit_status_clinic || '',
      spendingAmount: a.spending_amount || 0,
      reconfirmation: a.reconfirmation || '—',
    }));
    setAppointments(mapped);
    const initial = {};
    mapped.forEach(a => { initial[a.id] = { visitStatus: a.visitStatus, spendingAmount: a.spendingAmount }; });
    setRowState(initial);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_name || !formData.client_phone || !formData.clinic) {
      alert('Please fill in required fields: Client Name, Phone, and Clinic.');
      return;
    }
    setFormSaving(true);
    try {
      await axiosClient.post('/appointments', {
        client_name: formData.client_name,
        client_phone: formData.client_phone,
        age: parseInt(formData.age) || 0,
        clinic: formData.clinic,
        reason: formData.reason,
        visit_date: formData.visit_date ? new Date(formData.visit_date).toISOString() : null,
        visit_status_clinic: formData.visit_status_clinic,
        spending_amount: parseInt(formData.spending_amount) || 0,
        remarks: formData.notes,
      });
      setShowForm(false);
      setFormData(emptyEntryForm);
      await refreshAppointments();
    } catch (err) {
      console.error('Form submit error:', err);
      alert(err.response?.data?.detail || 'Failed to save entry.');
    } finally {
      setFormSaving(false);
    }
  };

  // ── New Clinic Form View ──
  if (showClinicForm) {
    return (
      <div className="form-page-container">
        <div className="form-header">
          <div className="breadcrumb">
            <Building2 size={14} />
            <span>/ Clinic List / Add New Clinic</span>
          </div>
          <button className="btn btn-warning btn-sm" onClick={() => { setShowClinicForm(false); setClinicForm(emptyClinicForm); }}>
            <ArrowLeft size={16} /> Back to List
          </button>
        </div>

        <div className="form-card card">
          <div className="form-card-header">
            <h2 className="form-title">Add New Clinic / Center</h2>
          </div>
          <form onSubmit={handleClinicFormSubmit}>
            <div className="form-body">

              <div className="form-section">
                <h3 className="section-title">Clinic Information</h3>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Clinic / Center Name <span>*</span></label>
                    <input type="text" name="name" className="form-control"
                      placeholder="e.g. Premium Dhanmondi" value={clinicForm.name}
                      onChange={handleClinicFormChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Center Type</label>
                    <select name="center_type" className="form-control" value={clinicForm.center_type} onChange={handleClinicFormChange}>
                      <option value="">-- Select Type --</option>
                      <option value="Maternity Clinic">Maternity Clinic</option>
                      <option value="Women's Clinic">Women's Clinic</option>
                      <option value="RC Centre">RC Centre</option>
                      <option value="Premium Centre">Premium Centre</option>
                      <option value="General Clinic">General Clinic</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">District</label>
                    <input type="text" name="district" className="form-control"
                      placeholder="e.g. Dhaka" value={clinicForm.district}
                      onChange={handleClinicFormChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input type="text" name="phone" className="form-control"
                      placeholder="01XXXXXXXXX" value={clinicForm.phone}
                      onChange={handleClinicFormChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input type="text" name="contact_person" className="form-control"
                      placeholder="Clinic in-charge name" value={clinicForm.contact_person}
                      onChange={handleClinicFormChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Full Address</label>
                  <textarea name="address" className="form-control" rows="2"
                    placeholder="Street, area, city..." value={clinicForm.address}
                    onChange={handleClinicFormChange} />
                </div>
              </div>

              <div className="form-section" style={{ marginTop: '1.5rem' }}>
                <h3 className="section-title">Clinic Login Account</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
                  Create a system user for this clinic. Leave blank to skip.
                </p>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input type="text" name="username" className="form-control"
                      placeholder="e.g. clinic_dhanmondi" value={clinicForm.username}
                      onChange={handleClinicFormChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" className="form-control"
                      placeholder="Enter password" value={clinicForm.password}
                      onChange={handleClinicFormChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email (optional)</label>
                    <input type="email" name="email" className="form-control"
                      placeholder="clinic@mariestopes.org" value={clinicForm.email}
                      onChange={handleClinicFormChange} />
                  </div>
                </div>
              </div>

            </div>
            <div className="form-footer">
              <button type="submit" className="btn btn-success btn-lg" disabled={clinicFormSaving}>
                <Save size={18} /> {clinicFormSaving ? 'Saving...' : 'Add Clinic'}
              </button>
              <button type="button" className="btn btn-danger btn-lg"
                onClick={() => { setShowClinicForm(false); setClinicForm(emptyClinicForm); }}>
                <X size={18} /> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── Form View ──
  if (showForm) {
    return (
      <div className="form-page-container">
        <div className="form-header">
          <div className="breadcrumb">
            <Building2 size={14} />
            <span>/ Clinic Entry / {selectedClinic} / New Entry</span>
          </div>
          <button className="btn btn-warning btn-sm" onClick={() => setShowForm(false)}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div className="form-card card">
          <div className="form-card-header">
            <h2 className="form-title">New Clinic Entry — {selectedClinic}</h2>
          </div>
          <form onSubmit={handleFormSubmit}>
            <div className="form-body">
              <div className="form-section">
                <h3 className="section-title">Client Information</h3>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Client Name <span>*</span></label>
                    <input type="text" name="client_name" className="form-control"
                      placeholder="Full name" value={formData.client_name}
                      onChange={handleFormChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone <span>*</span></label>
                    <input type="text" name="client_phone" className="form-control"
                      placeholder="01XXXXXXXXX" value={formData.client_phone}
                      onChange={handleFormChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input type="number" name="age" className="form-control"
                      placeholder="e.g. 25" value={formData.age}
                      onChange={handleFormChange} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Clinic / Center</label>
                    {isClinicRole ? (
                      <input type="text" className="form-control" value={assignedClinic} readOnly
                        style={{ backgroundColor: '#f1f5f9', color: '#475569' }} />
                    ) : (
                      <input type="text" className="form-control" value={selectedClinic} readOnly
                        style={{ backgroundColor: '#f1f5f9', color: '#475569' }} />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reason for Visit</label>
                    <select name="reason" className="form-control" value={formData.reason}
                      onChange={handleFormChange}>
                      <option value="">-- Select Reason --</option>
                      {reasons.map((r, i) => <option key={i} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Visit Date</label>
                    <input type="date" name="visit_date" className="form-control"
                      value={formData.visit_date} onChange={handleFormChange} />
                  </div>
                </div>
              </div>

              <div className="form-section" style={{ marginTop: '1.5rem' }}>
                <h3 className="section-title">Clinic Data</h3>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Visit Status</label>
                    <select name="visit_status_clinic" className="form-control"
                      value={formData.visit_status_clinic} onChange={handleFormChange}>
                      <option value="">-- Select --</option>
                      {visitStatus.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Spending Amount (৳)</label>
                    <input type="number" name="spending_amount" className="form-control"
                      placeholder="e.g. 2500" value={formData.spending_amount}
                      onChange={handleFormChange} min="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes / Remarks</label>
                  <textarea name="notes" className="form-control" rows="3"
                    placeholder="Any additional notes..." value={formData.notes}
                    onChange={handleFormChange} />
                </div>
              </div>
            </div>

            <div className="form-footer">
              <button type="submit" className="btn btn-success btn-lg" disabled={formSaving}>
                <Save size={18} /> {formSaving ? 'Saving...' : 'Save Entry'}
              </button>
              <button type="button" className="btn btn-danger btn-lg"
                onClick={() => { setShowForm(false); setFormData(emptyEntryForm); }}>
                <X size={18} /> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── Clinic Detail View ──
  if (selectedClinic) {
    const totalSpending = clinicAppointments.reduce((s, a) => s + (a.spendingAmount || 0), 0);

    return (
      <div className="list-page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">{selectedClinic}</h1>
            <div className="breadcrumb">
              <Building2 size={14} />
              <span>/ Clinic Entry / {selectedClinic}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!isClinicRole && (
              <button className="btn btn-warning" onClick={() => { setSelectedClinic(null); setSearchTerm(''); }}>
                <ArrowLeft size={18} /> All Clinics
              </button>
            )}
            <button className="btn btn-primary" onClick={() => {
              setFormData({ ...emptyEntryForm, clinic: selectedClinic });
              setShowForm(true);
            }}>
              <Plus size={18} /> Add New Entry
            </button>
          </div>
        </div>

        <div className="card list-card">
          <div className="list-toolbar-new">
            <div className="filter-group">
              <label>Search Client</label>
              <div className="search-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client Details</th>
                    <th>Reason</th>
                    <th>Visit Date</th>
                    <th>Reconfirmation</th>
                    <th>Visit Status</th>
                    <th>Spending (৳)</th>
                    <th>Save</th>
                  </tr>
                </thead>
                <tbody>
                  {clinicAppointments.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        No appointments for this clinic.
                      </td>
                    </tr>
                  )}
                  {clinicAppointments.map(appt => {
                    const state = rowState[appt.id] || {};
                    const dirty = isDirty(appt);
                    const saving = savingId === appt.id;
                    const saved = savedId === appt.id;

                    return (
                      <tr key={appt.id} className={dirty ? 'row-dirty' : ''}>
                        <td className="font-semibold text-primary">#{appt.id}</td>
                        <td>
                          <div className="client-info-cell">
                            <span className="client-name">{appt.name}</span>
                            <span className="client-phone">{appt.phone}</span>
                          </div>
                        </td>
                        <td>{appt.reason}</td>
                        <td>{appt.visitDate ? new Date(appt.visitDate).toLocaleDateString() : '—'}</td>
                        <td>
                          <span className={`badge ${
                            appt.reconfirmation === 'Okay' ? 'badge-success'
                            : appt.reconfirmation === 'Pending' ? 'badge-warning'
                            : 'badge-info'
                          }`}>{appt.reconfirmation}</span>
                        </td>
                        <td>
                          <select
                            className="inline-select"
                            value={state.visitStatus || ''}
                            onChange={(e) => handleChange(appt.id, 'visitStatus', e.target.value)}
                          >
                            <option value="">-- Select --</option>
                            {visitStatus.map((s, i) => <option key={i} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="inline-input"
                            min="0"
                            placeholder="0"
                            value={state.spendingAmount || ''}
                            onChange={(e) => handleChange(appt.id, 'spendingAmount', e.target.value)}
                          />
                        </td>
                        <td>
                          {saved ? (
                            <span className="save-success"><CheckCircle size={18} /> Saved</span>
                          ) : (
                            <button
                              className={`btn-save-row ${!dirty ? 'btn-save-disabled' : ''}`}
                              onClick={() => handleSave(appt)}
                              disabled={!dirty || saving}
                            >
                              {saving ? '...' : <><Save size={14} /> Save</>}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {clinicAppointments.length > 0 && (
                  <tfoot>
                    <tr style={{ background: '#f0f7ff', borderTop: '2px solid #e2e8f0' }}>
                      <td colSpan={6} style={{ textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>Total Spending:</td>
                      <td style={{ fontWeight: 700, color: '#005CB9', fontSize: '0.95rem' }}>
                        ৳{totalSpending.toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Clinic Grid View (admin/manager) ──
  return (
    <div className="list-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinic List</h1>
          <div className="breadcrumb">
            <Building2 size={14} />
            <span>/ Clinic / All Clinics</span>
          </div>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <button className="btn btn-primary" onClick={() => setShowClinicForm(true)}>
            <Plus size={18} /> Add New Clinic
          </button>
        )}
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#005CB9' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Clinics</span>
            <span className="stat-value">{clinicStats.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#10b981' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Appointments</span>
            <span className="stat-value">{clinicStats.reduce((s, c) => s + c.count, 0)}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fdf4ff', color: '#a855f7' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Visited</span>
            <span className="stat-value">{clinicStats.reduce((s, c) => s + c.visited, 0)}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fff7ed', color: '#f59e0b' }}>
            <MapPin size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Spending (৳)</span>
            <span className="stat-value">{clinicStats.reduce((s, c) => s + c.totalSpending, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</p>
      ) : (
        <div className="clinic-grid">
          {clinicStats.map((cs, i) => (
            <div key={i} className="clinic-card">
              <div className="clinic-card-header">
                <div className="clinic-icon">
                  <MapPin size={22} />
                </div>
                {cs.center_type && (
                  <span className="clinic-type-badge">{cs.center_type}</span>
                )}
              </div>
              <div className="clinic-card-name">{cs.clinic}</div>
              {cs.district && (
                <div className="clinic-card-meta">
                  <MapPin size={12} /> {cs.district}
                </div>
              )}
              {cs.phone && (
                <div className="clinic-card-meta">
                  <Phone size={12} /> {cs.phone}
                </div>
              )}
              {cs.contact_person && (
                <div className="clinic-card-meta">
                  <User size={12} /> {cs.contact_person}
                </div>
              )}
              <div className="clinic-card-stats">
                <div className="clinic-stat">
                  <Users size={14} />
                  <span>{cs.count} Appointments</span>
                </div>
                <div className="clinic-stat">
                  <CheckCircle size={14} />
                  <span>{cs.visited} Visited</span>
                </div>
                <div className="clinic-stat-spending">
                  ৳{cs.totalSpending.toLocaleString()}
                </div>
              </div>
              <button className="clinic-card-btn" onClick={() => setSelectedClinic(cs.clinic)}>
                View &amp; Enter Data
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClinicEntry;
