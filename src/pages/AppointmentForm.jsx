import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAppData } from '../context/AppDataContext';
import { Calendar, Trash2, Save, X, Phone, User, CheckCircle2, Send, Plus, Info, ArrowLeft } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './AppointmentForm.css';

const AppointmentForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientId');
  const editId = searchParams.get('id');
  const isViewOnly = searchParams.get('view') === 'true';

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
  
  // Form States
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [remarks, setRemarks] = useState('');
  const [referralFee, setReferralFee] = useState('No');
  const [reconfirmation, setReconfirmation] = useState('Okay');
  const [visitDate, setVisitDate] = useState(new Date());
  const [refId, setRefId] = useState('');
  const [smsCode, setSmsCode] = useState('');
  
  // Referral/Source States
  const [isReferral, setIsReferral] = useState(true);
  const [sourceName, setSourceName] = useState('');
  const [sourcePhone, setSourcePhone] = useState('');
  const [selectedNgo, setSelectedNgo] = useState('');
  const [selectedAddedBy, setSelectedAddedBy] = useState('');
  const [selectedEnumerator, setSelectedEnumerator] = useState('');
  const [sourceRemarks, setSourceRemarks] = useState('');

  // Existing Visits State (Mocked for now as we don't have a history endpoint)
  const [existingVisits, setExistingVisits] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (editId) {
          // Fetch Appointment
          const apptRes = await axios.get(`http://localhost:8000/appointments`);
          const appt = apptRes.data.find(a => a.id === parseInt(editId));
          
          if (appt) {
            setClientName(appt.client_name);
            setPhone(appt.client_phone);
            setSelectedClinic(appt.clinic);
            setSelectedReason(appt.reason);
            setVisitDate(new Date(appt.visit_date));
            setRemarks(appt.remarks || '');
            setReferralFee(appt.referral_fee || 'No');
            setReconfirmation(appt.reconfirmation || 'Okay');
            setRefId(appt.ref_id || '');
            
            // If we have client details in appt, we could also fetch full client info if needed
            // For now, let's assume we have what we need
          }
        } else if (clientId) {
          // Fetch Client only
          const clientRes = await axios.get(`http://localhost:8000/clients`);
          const client = clientRes.data.find(c => c.id === parseInt(clientId));
          if (client) {
            setClientName(client.name);
            setPhone(client.phone);
            setAge(client.age || '');
            setAddress(client.address || '');
          }
        }

        // Generate REF ID if not editing
        if (!editId) {
          const year = new Date().getFullYear();
          const randomCounter = Math.floor(10000 + Math.random() * 90000);
          setRefId(`REF-${year}-${randomCounter}`);
        }
        
        // Generate SMS Code
        const generateSmsCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
        setSmsCode(generateSmsCode());

      } catch (err) {
        console.error("Error fetching form data:", err);
      }
    };

    fetchData();
  }, [editId, clientId]);

  const handleSave = async () => {
    try {
      const data = {
        client_name: clientName,
        client_phone: phone,
        clinic: selectedClinic,
        reason: selectedReason,
        visit_date: visitDate.toISOString(),
        remarks: remarks,
        referral_fee: referralFee,
        reconfirmation: reconfirmation,
        ref_id: refId,
        generated_from: isReferral ? "Referral" : "Direct"
      };
      
      if (editId) {
        // In a real app, we'd use PUT /appointments/{id}
        // For now, let's just log and mock
        console.log("Updating appointment:", editId, data);
        alert("Update functionality is being implemented. For now, data is logged.");
      } else {
        await axios.post('http://localhost:8000/appointments', data);
      }
      
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        navigate('/appointments');
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Backend error. Make sure the server is running on port 8000.");
    }
  };

  const addExistingVisit = () => {
    const newVisit = {
      id: Date.now(),
      clinic: clinics[0] || "Clinic",
      date: new Date().toISOString().slice(0,16),
      remarks: "New visit",
      referralFee: "No",
      reconfirmation: "Pending"
    };
    setExistingVisits([...existingVisits, newVisit]);
  };

  const removeExistingVisit = (id) => {
    setExistingVisits(existingVisits.filter(v => v.id !== id));
  };

  return (
    <div className="form-page-container">
      <div className="form-header">
        <div className="breadcrumb">
          <Calendar size={14} />
          <span>/ Appointment / {isViewOnly ? 'View Details' : (editId || clientId ? 'Edit Appointment' : 'Add New Appointment')}</span>
        </div>
        <div className="header-actions">
          <button className="btn btn-warning btn-sm" onClick={() => navigate('/appointments')}>
            <ArrowLeft size={16} />
            Go To List
          </button>
        </div>
      </div>

      <div className="form-card card">
        <div className="form-card-header">
          <h2 className="form-title">
            {isViewOnly ? 'View Appointment Details' : (editId || clientId ? 'Update Appointment' : 'Client Appointment Form')}
          </h2>
        </div>

        <div className="form-body">
          {successMessage && (
            <div className="alert alert-success">
              <span className="font-bold">**[NB]</span> Appointment saved successfully.
            </div>
          )}

          <div className="form-section">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Client Name <span>*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Nusrat Jahan" 
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  readOnly={isViewOnly}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact No <span>*</span></label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 01712345678" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  readOnly={isViewOnly}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Alternative Contact No.</label>
                <input type="text" className="form-control" placeholder="e.g. 01811223344" readOnly={isViewOnly} />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="e.g. 28" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  readOnly={isViewOnly} 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detail Address</label>
              <textarea 
                className="form-control" 
                rows="2" 
                placeholder="Enter detailed address..." 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                readOnly={isViewOnly}
              ></textarea>
            </div>

            <div className="grid-2 mt-4">
              <div className="form-group">
                <label className="form-label">Reason for Visit <span>*</span></label>
                <select 
                  className="form-control" 
                  value={selectedReason} 
                  onChange={(e) => setSelectedReason(e.target.value)}
                  disabled={isViewOnly}
                >
                  <option value="">-- Select Reason --</option>
                  {reasons.map((reason, idx) => (
                    <option key={idx} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Clinic to Visit <span>*</span></label>
                <select 
                  className="form-control" 
                  value={selectedClinic} 
                  onChange={(e) => setSelectedClinic(e.target.value)}
                  disabled={isViewOnly}
                >
                  <option value="">-- Select Clinic --</option>
                  {clinics.map((clinic, idx) => (
                    <option key={idx} value={clinic}>{clinic}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Visit Date <span>*</span></label>
                <div className="datepicker-container">
                  <DatePicker 
                    selected={visitDate} 
                    onChange={(date) => setVisitDate(date)} 
                    showTimeSelect
                    dateFormat="Pp"
                    className="form-control"
                    readOnly={isViewOnly}
                    disabled={isViewOnly}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Agent Name <span>*</span></label>
                <select 
                  className="form-control"
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  disabled={isViewOnly}
                >
                  <option value="">-- Select Agent --</option>
                  {agentNames.map((agent, idx) => (
                    <option key={idx} value={agent}>{agent}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea 
                  className="form-control" 
                  rows="1" 
                  placeholder="Enter remarks..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  readOnly={isViewOnly}
                ></textarea>
              </div>
            </div>

            <div className="grid-3 mt-4">
              <div className="form-group checkbox-group">
                <label className="form-label">Contact Preferences</label>
                <div className="checkbox-item">
                  <input type="checkbox" id="confirmContact" defaultChecked disabled={isViewOnly} />
                  <label htmlFor="confirmContact">Confirm we can contact you</label>
                </div>
                <div className="checkbox-item mt-2">
                  <input type="checkbox" id="unsafeContact" disabled={isViewOnly} />
                  <label htmlFor="unsafeContact"><strong>Is it unsafe to call you?</strong> We'll use another method of contact (SMS, WhatsApp)</label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Referral fee received</label>
                <select 
                  className="form-control"
                  value={referralFee}
                  onChange={(e) => setReferralFee(e.target.value)}
                  disabled={isViewOnly}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Reconfirmation</label>
                <select 
                  className="form-control"
                  value={reconfirmation}
                  onChange={(e) => setReconfirmation(e.target.value)}
                  disabled={isViewOnly}
                >
                  <option value="Okay">Okay</option>
                  <option value="Not Okay">Not Okay</option>
                  <option value="No Response">No Response</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
              <h3 className="section-title" style={{margin: 0}}>Existing Visits (if any)</h3>
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
                    <th>Clinic to Visit</th>
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
                    <tr><td colSpan={isViewOnly ? 6 : 7} style={{textAlign: 'center', padding: '1rem'}}>No existing visits found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Follow up Call/SMS</h3>
            
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Visit Status by Clinic</label>
                <select className="form-control" disabled={isViewOnly}>
                  <option>-- Select Status --</option>
                  {visitStatus.map((status, i) => <option key={i} value={status}>{status}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Follow up Status by CC</label>
                <select className="form-control" disabled={isViewOnly}>
                  <option>-- Select Followup --</option>
                  {followupStatus.map((status, i) => <option key={i} value={status}>{status}</option>)}
                </select>
              </div>
            </div>

            <div className="grid-3 mt-4">
              <div className="form-group">
                <label className="form-label">Would you like follow up call/SMS?</label>
                <select className="form-control" disabled={isViewOnly}>
                  <option>Call Only</option>
                  <option>SMS Only</option>
                  <option>Call & SMS</option>
                  <option>No</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input type="text" className="form-control" placeholder="Mobile Number" value={phone} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">SMS Code</label>
                <div className="input-group">
                  <input type="text" className="form-control" value={smsCode} readOnly />
                  {!isViewOnly && (
                    <button className="btn btn-primary" onClick={() => console.log('Sending SMS to:', phone, 'Code:', smsCode)}>
                      <Send size={14} /> Send SMS
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-section referral-section">
            <div className="section-header" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <h3 className="section-title" style={{margin: 0}}>Generated From (Referral)</h3>
              <div className="checkbox-item">
                <input 
                  type="checkbox" 
                  id="isReferral" 
                  checked={isReferral}
                  onChange={(e) => setIsReferral(e.target.checked)}
                  disabled={isViewOnly}
                />
                <label htmlFor="isReferral" style={{fontWeight: 600}}>Referral</label>
              </div>
            </div>
            
            {isReferral && (
              <div className="referral-body mt-4">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Name" 
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      readOnly={isViewOnly}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Phone Number" 
                      value={sourcePhone}
                      onChange={(e) => setSourcePhone(e.target.value)}
                      readOnly={isViewOnly}
                    />
                  </div>
                </div>

                <div className="grid-2 mt-4">
                  <div className="form-group">
                    <label className="form-label">NGO</label>
                    <select 
                      className="form-control"
                      value={selectedNgo}
                      onChange={(e) => setSelectedNgo(e.target.value)}
                      disabled={isViewOnly}
                    >
                      <option value="">-- Select NGO --</option>
                      {ngos.map((ngo, idx) => (
                        <option key={idx} value={ngo}>{ngo}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Added By</label>
                    <select 
                      className="form-control"
                      value={selectedAddedBy}
                      onChange={(e) => setSelectedAddedBy(e.target.value)}
                      disabled={isViewOnly}
                    >
                      <option value="">-- Select Agent --</option>
                      {addedByList.map((agent, idx) => (
                        <option key={idx} value={agent}>{agent}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-2 mt-4">
                  <div className="form-group">
                    <label className="form-label">Enumerator</label>
                    <select 
                      className="form-control"
                      value={selectedEnumerator}
                      onChange={(e) => setSelectedEnumerator(e.target.value)}
                      disabled={isViewOnly}
                    >
                      <option value="">-- Select Enumerator --</option>
                      {enumerators.map((enumr, idx) => (
                        <option key={idx} value={enumr}>{enumr}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reference ID</label>
                    <input type="text" className="form-control" value={refId} readOnly />
                  </div>
                </div>

                <div className="form-group mt-4">
                  <label className="form-label">Remarks</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    placeholder="Enter remarks..."
                    value={sourceRemarks}
                    onChange={(e) => setSourceRemarks(e.target.value)}
                    readOnly={isViewOnly}
                  ></textarea>
                </div>
              </div>
            )}
          </div>

          <div className="note-box">
            <Info size={18} className="text-warning" />
            <p>Note: Fields marked with <span>*</span> are required.</p>
          </div>
        </div>

        {!isViewOnly && (
          <div className="form-footer">
            <button className="btn btn-success btn-lg" onClick={handleSave}>
              <Save size={18} />
              Save / Approve
            </button>
            <button className="btn btn-danger btn-lg" onClick={() => navigate('/appointments')}>
              <X size={18} />
              Cancel
            </button>
          </div>
        )}
        {isViewOnly && (
          <div className="form-footer">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/appointments')}>
              <ArrowLeft size={18} />
              Back to List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentForm;

