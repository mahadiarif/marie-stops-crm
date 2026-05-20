import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, Trash2, Save, X, Send, Plus, Info, ArrowLeft } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './AppointmentForm.css';

// ── Pure form content (used by both modal and standalone page) ──
export function AppointmentFormContent({ editId, clientId, isViewOnly, onClose, onSaved }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isClinicRole = user?.role === 'clinic';
  const isStaffRole = user?.role === 'staff';

  const {
    clinics, ngos, reasons,
    addedByList, enumerators,
    visitStatus, followupStatus,
    agentNames
  } = useAppData();

  const [successMessage, setSuccessMessage] = useState(false);
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');

  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [remarks, setRemarks] = useState('');
  const [referralFee, setReferralFee] = useState('No');
  const [reconfirmation, setReconfirmation] = useState('Okay');
  const [visitDate, setVisitDate] = useState(new Date());
  const [refId, setRefId] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [unsafeToCall, setUnsafeToCall] = useState(false);
  const [visitStatusClinic, setVisitStatusClinic] = useState('');
  const [followupStatusCc, setFollowupStatusCc] = useState('');
  const [followupPreference, setFollowupPreference] = useState('Call Only');
  const [spendingAmount, setSpendingAmount] = useState('');

  const [isReferral, setIsReferral] = useState(true);
  const [sourceName, setSourceName] = useState('');
  const [sourcePhone, setSourcePhone] = useState('');
  const [selectedNgo, setSelectedNgo] = useState('');
  const [selectedAddedBy, setSelectedAddedBy] = useState('');
  const [selectedEnumerator, setSelectedEnumerator] = useState('');
  const [sourceRemarks, setSourceRemarks] = useState('');

  const [existingVisits, setExistingVisits] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (editId) {
          const apptRes = await axiosClient.get(`/appointments`);
          const appt = apptRes.data.find(a => a.id === parseInt(editId));
          if (appt) {
            setClientName(appt.client_name || '');
            setPhone(appt.client_phone || '');
            setAge(appt.age || '');
            setAddress(appt.address || '');
            setSelectedClinic(appt.clinic || '');
            setSelectedReason(appt.reason || '');
            setVisitDate(appt.visit_date ? new Date(appt.visit_date) : new Date());
            setSelectedAgent(appt.agent_name || '');
            setRemarks(appt.remarks || '');
            setReferralFee(appt.referral_fee || 'No');
            setReconfirmation(appt.reconfirmation || 'Okay');
            setRefId(appt.ref_id || '');
            setIsReferral(appt.generated_from === "Referral");
            setSourceName(appt.source_name || '');
            setSourcePhone(appt.source_phone || '');
            setSelectedNgo(appt.ngo || '');
            setSelectedAddedBy(appt.added_by || '');
            setSelectedEnumerator(appt.enumerator || '');
            setSourceRemarks(appt.source_remarks || '');
            setAltPhone(appt.alt_phone || '');
            setUnsafeToCall(appt.unsafe_to_call || false);
            setVisitStatusClinic(appt.visit_status_clinic || '');
            setFollowupStatusCc(appt.followup_status_cc || '');
            setFollowupPreference(appt.followup_preference || 'Call Only');
            setSpendingAmount(appt.spending_amount || '');
          }
        } else if (clientId) {
          const clientRes = await axiosClient.get(`/clients`);
          const client = clientRes.data.find(c => c.id === parseInt(clientId));
          if (client) {
            setClientName(client.name);
            setPhone(client.phone);
            setAge(client.age || '');
            setAddress(client.address || '');
          }
        }

        if (!editId) {
          const year = new Date().getFullYear();
          const randomCounter = Math.floor(10000 + Math.random() * 90000);
          setRefId(`REF-${year}-${randomCounter}`);
          if (isStaffRole && user?.agentName) {
            setSelectedAgent(user.agentName);
          }
        }

        const generateSmsCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
        setSmsCode(generateSmsCode());
      } catch (err) {
        console.error("Error fetching form data:", err);
      }
    };
    fetchData();
  }, [editId, clientId]);

  const handleSave = async () => {
    if (isClinicRole) {
      try {
        await axiosClient.put(`/appointments/${editId}`, {
          visit_status_clinic: visitStatusClinic,
          followup_status_cc: followupStatusCc,
          spending_amount: parseInt(spendingAmount) || 0
        });
        setSuccessMessage(true);
        setTimeout(() => {
          setSuccessMessage(false);
          if (onSaved) onSaved();
          else if (onClose) onClose();
          else navigate('/appointments');
        }, 1500);
      } catch (err) {
        alert(`Failed to save: ${err.response?.data?.detail || err.message}`);
      }
      return;
    }

    // Basic Validation
    if (!clientName || !phone || !selectedClinic || !selectedReason || !selectedAgent) {
      alert("Please fill in all required fields (Client Name, Phone, Clinic, Reason, Agent).");
      return;
    }

    try {
      if (!visitDate || isNaN(visitDate.getTime())) {
        alert("Please select a valid visit date.");
        return;
      }

      // Conflict check for staff on new appointments (system-wide)
      if (isStaffRole && !editId) {
        const res = await axiosClient.get('/appointments/conflict-check', { params: { phone } });
        if (res.data.conflict) {
          const proceed = window.confirm(
            `Warning: This client already has an active appointment at ${res.data.clinic} on ${new Date(res.data.visit_date).toLocaleDateString()}.\n\nProceed anyway?`
          );
          if (!proceed) return;
        }
      }

      const data = {
        client_name: clientName,
        client_phone: phone,
        age: parseInt(age) || 0,
        address,
        clinic: selectedClinic,
        reason: selectedReason,
        visit_date: visitDate.toISOString(),
        agent_name: selectedAgent,
        remarks,
        referral_fee: referralFee,
        reconfirmation,
        ref_id: refId,
        generated_from: isReferral ? "Referral" : "Direct",
        source_name: sourceName,
        source_phone: sourcePhone,
        ngo: selectedNgo,
        added_by: selectedAddedBy,
        enumerator: selectedEnumerator,
        source_remarks: sourceRemarks,
        alt_phone: altPhone,
        unsafe_to_call: unsafeToCall,
        visit_status_clinic: visitStatusClinic,
        followup_status_cc: followupStatusCc,
        followup_preference: followupPreference,
        spending_amount: parseInt(spendingAmount) || 0
      };

      console.log("Submitting data:", data);

      if (editId) {
        await axiosClient.put(`/appointments/${editId}`, data);
      } else {
        await axiosClient.post(`/appointments`, data);
      }

      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        if (onSaved) onSaved();
        else if (onClose) onClose();
        else navigate('/appointments');
      }, 1500);
    } catch (err) {
      console.error("Save Error:", err);
      const errMsg = err.response?.data?.detail || err.message || "Unknown error";
      alert(`Failed to save appointment: ${errMsg}`);
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
    else navigate('/appointments');
  };

  const addExistingVisit = () => {
    setExistingVisits([...existingVisits, {
      id: Date.now(),
      clinic: clinics[0] || "Clinic",
      date: new Date().toISOString().slice(0, 16),
      remarks: "New visit",
      referralFee: "No",
      reconfirmation: "Pending"
    }]);
  };

  const removeExistingVisit = (id) => {
    setExistingVisits(existingVisits.filter(v => v.id !== id));
  };

  return (
    <div className="appt-form-content">
      {successMessage && (
        <div className="alert alert-success">
          ✅ Appointment saved successfully.
        </div>
      )}

      {/* ── Section 1: Client Info ── */}
      <div className="form-section">
        <h3 className="section-title">Client Information</h3>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Client Name <span>*</span></label>
            <input type="text" className="form-control" placeholder="e.g. Nusrat Jahan"
              value={clientName} onChange={(e) => setClientName(e.target.value)} readOnly={isViewOnly || isClinicRole} />
          </div>
          <div className="form-group">
            <label className="form-label">Contact No <span>*</span></label>
            <input type="text" className="form-control" placeholder="e.g. 01712345678"
              value={phone} onChange={(e) => setPhone(e.target.value)} readOnly={isViewOnly || isClinicRole} />
          </div>
          <div className="form-group">
            <label className="form-label">Alternative Contact No.</label>
            <input type="text" className="form-control" placeholder="e.g. 01811223344"
              value={altPhone} onChange={(e) => setAltPhone(e.target.value)} readOnly={isViewOnly || isClinicRole} />
          </div>
          <div className="form-group">
            <label className="form-label">Age</label>
            <input type="number" className="form-control" placeholder="e.g. 28"
              value={age} onChange={(e) => setAge(e.target.value)} readOnly={isViewOnly || isClinicRole} />
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label">Detail Address</label>
          <textarea className="form-control" rows="2" placeholder="Enter detailed address..."
            value={address} onChange={(e) => setAddress(e.target.value)} readOnly={isViewOnly || isClinicRole} />
        </div>
      </div>

      {/* ── Section 2: Appointment Details ── */}
      <div className="form-section">
        <h3 className="section-title">Appointment Details</h3>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Reason for Visit <span>*</span></label>
            <select className="form-control" value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)} disabled={isViewOnly || isClinicRole}>
              <option value="">-- Select Reason --</option>
              {reasons.map((r, i) => <option key={i} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Clinic to Visit <span>*</span></label>
            <select className="form-control" value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)} disabled={isViewOnly || isClinicRole}>
              <option value="">-- Select Clinic --</option>
              {clinics.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Visit Date <span>*</span></label>
            <DatePicker selected={visitDate} onChange={(d) => setVisitDate(d)}
              showTimeSelect dateFormat="Pp" className="form-control"
              readOnly={isViewOnly || isClinicRole} disabled={isViewOnly || isClinicRole} />
          </div>
          <div className="form-group">
            <label className="form-label">Agent Name <span>*</span></label>
            {isStaffRole && user?.agentName ? (
              <input type="text" className="form-control" value={selectedAgent} readOnly
                style={{ backgroundColor: '#f1f5f9', color: '#475569' }} />
            ) : (
              <select className="form-control" value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)} disabled={isViewOnly || isClinicRole}>
                <option value="">-- Select Agent --</option>
                {agentNames.map((a, i) => <option key={i} value={a}>{a}</option>)}
              </select>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Referral Fee Received</label>
            <select className="form-control" value={referralFee}
              onChange={(e) => setReferralFee(e.target.value)} disabled={isViewOnly || isClinicRole}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Reconfirmation</label>
            <select className="form-control" value={reconfirmation}
              onChange={(e) => setReconfirmation(e.target.value)} disabled={isViewOnly || isClinicRole}>
              <option value="Okay">Okay</option>
              <option value="Not Okay">Not Okay</option>
              <option value="No Response">No Response</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label">Remarks</label>
          <textarea className="form-control" rows="2" placeholder="Enter remarks..."
            value={remarks} onChange={(e) => setRemarks(e.target.value)} readOnly={isViewOnly || isClinicRole} />
        </div>
        <div className="form-group" style={{ marginTop: '0.75rem' }}>
          <div className="checkbox-item">
            <input type="checkbox" id="unsafeContact" checked={unsafeToCall}
              onChange={(e) => setUnsafeToCall(e.target.checked)} disabled={isViewOnly || isClinicRole} />
            <label htmlFor="unsafeContact"><strong>Is it unsafe to call?</strong> (Use SMS/WhatsApp instead)</label>
          </div>
        </div>
      </div>

      {/* ── Section 3: Existing Visits ── */}
      <div className="form-section">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Existing Visits (if any)</h3>
          {!isViewOnly && (
            <button className="btn btn-primary btn-sm" onClick={addExistingVisit}>
              <Plus size={16} /> Add Visit
            </button>
          )}
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Clinic</th>
                <th>Visit Date</th>
                <th>Remarks</th>
                <th>Referral Fee</th>
                <th>Reconfirmation</th>
                {!isViewOnly && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {existingVisits.map((visit, index) => (
                <tr key={visit.id}>
                  <td>{index + 1}</td>
                  <td>
                    <select className="form-control" defaultValue={visit.clinic} disabled={isViewOnly}>
                      {clinics.map((c, i) => <option key={i}>{c}</option>)}
                    </select>
                  </td>
                  <td><input type="datetime-local" className="form-control" defaultValue={visit.date} readOnly={isViewOnly} /></td>
                  <td><input type="text" className="form-control" defaultValue={visit.remarks} readOnly={isViewOnly} /></td>
                  <td>
                    <select className="form-control" defaultValue={visit.referralFee} disabled={isViewOnly}>
                      <option>Yes</option><option>No</option>
                    </select>
                  </td>
                  <td>
                    <select className="form-control" defaultValue={visit.reconfirmation} disabled={isViewOnly}>
                      <option>Okay</option><option>Not Okay</option><option>Pending</option>
                    </select>
                  </td>
                  {!isViewOnly && <td><button className="btn-icon text-danger" onClick={() => removeExistingVisit(visit.id)}><Trash2 size={16} /></button></td>}
                </tr>
              ))}
              {existingVisits.length === 0 && (
                <tr><td colSpan={isViewOnly ? 6 : 7} style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>No existing visits found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 4: Follow Up ── */}
      <div className="form-section">
        <h3 className="section-title">Follow up Call/SMS</h3>
        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Client Spending Amount (৳)</label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 2500"
              value={spendingAmount}
              onChange={(e) => setSpendingAmount(e.target.value)}
              readOnly={isViewOnly || isStaffRole}
              min="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Visit Status by Clinic</label>
            <select className="form-control" value={visitStatusClinic}
              onChange={(e) => setVisitStatusClinic(e.target.value)} disabled={isViewOnly || isStaffRole}>
              <option value="">-- Select Status --</option>
              {visitStatus.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Follow up Status by CC</label>
            <select className="form-control" value={followupStatusCc}
              onChange={(e) => setFollowupStatusCc(e.target.value)} disabled={isViewOnly}>
              <option value="">-- Select Followup --</option>
              {followupStatus.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Follow up Preference</label>
            <select className="form-control" value={followupPreference}
              onChange={(e) => setFollowupPreference(e.target.value)} disabled={isViewOnly || isClinicRole}>
              <option value="Call Only">Call Only</option>
              <option value="SMS Only">SMS Only</option>
              <option value="Call & SMS">Call & SMS</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
        <div className="grid-2" style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input type="text" className="form-control" value={phone} readOnly />
          </div>
          <div className="form-group">
            <label className="form-label">SMS Code</label>
            <div className="input-group">
              <input type="text" className="form-control" value={smsCode} readOnly />
              {!isViewOnly && (
                <button className="btn btn-primary" onClick={() => console.log('Sending SMS')}>
                  <Send size={14} /> Send SMS
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Referral ── */}
      <div className="form-section referral-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Generated From (Referral)</h3>
          <div className="checkbox-item">
            <input type="checkbox" id="isReferral" checked={isReferral}
              onChange={(e) => setIsReferral(e.target.checked)} disabled={isViewOnly || isClinicRole} />
            <label htmlFor="isReferral" style={{ fontWeight: 600 }}>Referral</label>
          </div>
        </div>
        {isReferral && (
          <div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" placeholder="Source Name"
                  value={sourceName} onChange={(e) => setSourceName(e.target.value)} readOnly={isViewOnly || isClinicRole} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-control" placeholder="Source Phone"
                  value={sourcePhone} onChange={(e) => setSourcePhone(e.target.value)} readOnly={isViewOnly || isClinicRole} />
              </div>
              <div className="form-group">
                <label className="form-label">NGO</label>
                <select className="form-control" value={selectedNgo}
                  onChange={(e) => setSelectedNgo(e.target.value)} disabled={isViewOnly || isClinicRole}>
                  <option value="">-- Select NGO --</option>
                  {ngos.map((n, i) => <option key={i} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Added By</label>
                <select className="form-control" value={selectedAddedBy}
                  onChange={(e) => setSelectedAddedBy(e.target.value)} disabled={isViewOnly || isClinicRole}>
                  <option value="">-- Select Agent --</option>
                  {addedByList.map((a, i) => <option key={i} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Enumerator</label>
                <select className="form-control" value={selectedEnumerator}
                  onChange={(e) => setSelectedEnumerator(e.target.value)} disabled={isViewOnly || isClinicRole}>
                  <option value="">-- Select Enumerator --</option>
                  {enumerators.map((e, i) => <option key={i} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Reference ID</label>
                <input type="text" className="form-control" value={refId} readOnly />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Remarks</label>
              <textarea className="form-control" rows="2" placeholder="Enter remarks..."
                value={sourceRemarks} onChange={(e) => setSourceRemarks(e.target.value)} readOnly={isViewOnly || isClinicRole} />
            </div>
          </div>
        )}
      </div>

      <div className="note-box">
        <Info size={18} />
        <p>Note: Fields marked with <span>*</span> are required.</p>
      </div>

      {/* ── Footer Buttons ── */}
      {!isViewOnly && (!isClinicRole || editId) && (
        <div className="form-footer">
          <button className="btn btn-success btn-lg" onClick={handleSave}>
            <Save size={18} /> Save / Approve
          </button>
          <button className="btn btn-danger btn-lg" onClick={handleCancel}>
            <X size={18} /> Cancel
          </button>
        </div>
      )}
      {isViewOnly && (
        <div className="form-footer">
          <button className="btn btn-primary btn-lg" onClick={handleCancel}>
            <ArrowLeft size={18} /> Back to List
          </button>
        </div>
      )}
    </div>
  );
}

// ── Standalone page wrapper (for direct /appointments/new URL access) ──
const AppointmentForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const editId = searchParams.get('id');
  const isViewOnly = searchParams.get('view') === 'true';

  return (
    <div className="form-page-container">
      <div className="form-header">
        <div className="breadcrumb">
          <Calendar size={14} />
          <span>/ Appointment / {isViewOnly ? 'View Details' : (editId || clientId ? 'Edit Appointment' : 'Add New Appointment')}</span>
        </div>
        <button className="btn btn-warning btn-sm" onClick={() => navigate('/appointments')}>
          <ArrowLeft size={16} /> Go To List
        </button>
      </div>
      <div className="form-card card">
        <div className="form-card-header">
          <h2 className="form-title">
            {isViewOnly ? 'View Appointment Details' : (editId || clientId ? 'Update Appointment' : 'Client Appointment Form')}
          </h2>
        </div>
        <div className="form-body">
          <AppointmentFormContent
            editId={editId}
            clientId={clientId}
            isViewOnly={isViewOnly}
            onClose={() => navigate('/appointments')}
          />
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
