import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, User, CheckCircle2, Save, X, Calendar, MapPin, Activity, HelpCircle, HeartPulse, Search, ArrowLeft } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axiosClient from '../api/axiosClient';
import './CallLogForm.css';

// ── Pure form content for modal/page ──
export function CallLogFormContent({ editId, isViewOnly, onClose, onSaved }) {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState(false);

  // Constants
  const sourceOptions = ["Friend/Relative", "TV/Radio", "Newspaper", "Social Media", "Doctor/Health Worker", "NGO", "Others"];
  const callerTypeOptions = ["Female", "Male", "Adolescent Female", "Adolescent Male", "Others"];
  const repeatCallerOptions = ["Yes", "No"];
  const hearAboutOptions = ["Family/Friends", "TV", "Radio", "Newspaper", "Social Media", "Health Worker", "NGO", "Others"];
  const reasonOptions = ["Adolescent Health", "Information on Family Planning", "Support with Family Planning", "Misoprostol for MRM", "Reproductive Health", "General Health", "Child Health", "Complain", "Audit Call", "Calling for Waiver", "(Re)solve", "Appointment", "Others"];
  const subOptions = {
    "Adolescent Health": ["Puberty", "Menstruation", "Sexual Health", "Early Marriage", "Others"],
    "Information on Family Planning": ["Pills", "Condom", "Injectables", "Implant", "IUD", "Permanent Method", "Others"],
    "Support with Family Planning Reason": ["Side effect", "Method switching", "Availability", "Cost", "Others"],
    "Support with Family Planning Method": ["Pills", "Condom", "Injectables", "Implant", "IUD", "Others"],
    "Misoprostol for MRM": ["Abortion", "Incomplete abortion", "Post-abortion care", "Others"],
    "Reproductive Health": ["Menstrual problem", "Vaginal discharge", "Infertility", "STI", "Others"],
    "General Health": ["Fever", "Diabetes", "Hypertension", "Nutrition", "Others"],
    "Child Health": ["Diarrhea", "Pneumonia", "Malnutrition", "Vaccination", "Others"]
  };
  const divisions = ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh"];
  const districtsByDivision = {
    "Dhaka": ["Dhaka", "Gazipur", "Narayanganj", "Manikganj", "Munshiganj", "Narsingdi", "Faridpur"],
    "Chittagong": ["Chittagong", "Cox's Bazar", "Comilla", "Noakhali", "Feni", "Lakshmipur"],
    "Rajshahi": ["Rajshahi", "Bogura", "Natore", "Sirajganj", "Pabna", "Naogaon"],
    "Khulna": ["Khulna", "Jessore", "Satkhira", "Bagerhat", "Chuadanga"],
    "Barisal": ["Barisal", "Bhola", "Patuakhali", "Pirojpur", "Jhalokati"],
    "Sylhet": ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
    "Rangpur": ["Rangpur", "Dinajpur", "Gaibandha", "Kurigram", "Nilphamari"],
    "Mymensingh": ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"]
  };
  const livingAreaOptions = ["Urban", "Rural", "Semi-urban"];
  const pregnancyOptions = ["Yes", "No", "Others"];
  const mrmMedicineOptions = ["Yes", "No"];
  const mrmMedicineNameOptions = ["Misoprostol", "Mifepristone", "Both", "Others"];
  const medicineTakenOptions = ["Misoprostol", "Mifepristone", "Both", "Others"];
  const referredOptions = ["Yes", "No"];
  const followupCallOptions = ["Call", "SMS", "Call & SMS", "No"];

  // States
  const [callDate, setCallDate] = useState(new Date());
  const [callerName, setCallerName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [language, setLanguage] = useState('Bangla');
  const [q3Source, setQ3Source] = useState('');
  const [q5Type, setQ5Type] = useState('');
  const [q7Repeat, setQ7Repeat] = useState('');
  const [q8Hear, setQ8Hear] = useState('');
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [adolescentSub, setAdolescentSub] = useState('');
  const [fpInfoSub, setFpInfoSub] = useState('');
  const [fpSupportReason, setFpSupportReason] = useState('');
  const [fpSupportMethod, setFpSupportMethod] = useState('');
  const [mrmSub, setMrmSub] = useState('');
  const [reproSub, setReproSub] = useState('');
  const [generalSub, setGeneralSub] = useState('');
  const [childSub, setChildSub] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [livingArea, setLivingArea] = useState('');
  const [pregnancy, setPregnancy] = useState('');
  const [mrmMedicine, setMrmMedicine] = useState('');
  const [mrmMedName, setMrmMedName] = useState('');
  const [medTaken, setMedTaken] = useState('');
  const [referred, setReferred] = useState('');
  const [followupCall, setFollowupCall] = useState('');
  const [status, setStatus] = useState('Pending');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editId) {
      const fetchLog = async () => {
        try {
          const res = await axiosClient.get(`/call-logs`);
          const log = res.data.find(l => l.id === parseInt(editId));
          if (log) {
            setCallDate(log.call_date ? new Date(log.call_date) : new Date());
            setCallerName(log.caller_name || '');
            setPhone(log.phone || '');
            setAge(log.age || '');
            setLanguage(log.language || 'Bangla');
            setQ3Source(log.source_of_number || '');
            setQ5Type(log.caller_type || '');
            setQ7Repeat(log.is_repeat_caller || '');
            setQ8Hear(log.hear_about_us || '');
            setSelectedReasons(log.reason_for_calling ? log.reason_for_calling.split(', ') : []);
            const detailed = log.detailed_reasons ? JSON.parse(log.detailed_reasons) : {};
            setAdolescentSub(detailed.adolescent || '');
            setFpInfoSub(detailed.fpInfo || '');
            setFpSupportReason(detailed.fpSupportReason || '');
            setFpSupportMethod(detailed.fpSupportMethod || '');
            setMrmSub(detailed.mrm || '');
            setReproSub(detailed.repro || '');
            setGeneralSub(detailed.general || '');
            setChildSub(detailed.child || '');
            setDivision(log.division || '');
            setDistrict(log.district || '');
            setLivingArea(log.living_area || '');
            setPregnancy(log.end_pregnancy_tried || '');
            setMrmMedicine(log.purchased_mrm || '');
            setMrmMedName(log.mrm_medicine_name || '');
            setMedTaken(log.medicine_taken || '');
            setReferred(log.referred_status || '');
            setFollowupCall(log.followup_preference || '');
            setStatus(log.status || 'Pending');
            setNotes(log.notes || '');
          }
        } catch (err) {
      console.error("Call Log Save Error:", err);
      const errMsg = err.response?.data?.detail || err.message || "Unknown error";
      alert(`Failed to save call log: ${errMsg}`);
    }
      };
      fetchLog();
    }
  }, [editId]);

  const handleReasonToggle = (reason) => {
    if (isViewOnly) return;
    setSelectedReasons(prev => prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]);
  };

  const handleDistrictChange = (e) => {
    const val = e.target.value;
    setDistrict(val);
    if (val) {
      for (const [div, dists] of Object.entries(districtsByDivision)) {
        if (dists.includes(val)) { setDivision(div); break; }
      }
    } else { setDivision(''); }
  };

  const handleSave = async () => {
    // Basic Validation
    if (!callerName || !phone || !division || !district || selectedReasons.length === 0) {
      alert("Please fill in required fields (Name, Phone, Location, and at least one Reason).");
      return;
    }

    try {
      console.log("Saving call log data...");

      const data = {
        call_date: callDate.toISOString(),
        caller_name: callerName,
        phone,
        age: parseInt(age) || 0,
        language,
        source_of_number: q3Source,
        caller_type: q5Type,
        is_repeat_caller: q7Repeat,
        hear_about_us: q8Hear,
        reason_for_calling: selectedReasons.join(', '),
        detailed_reasons: JSON.stringify({ adolescent: adolescentSub, fpInfo: fpInfoSub, fpSupportReason, fpSupportMethod, mrm: mrmSub, repro: reproSub, general: generalSub, child: childSub }),
        division, district, living_area: livingArea, end_pregnancy_tried: pregnancy, purchased_mrm: mrmMedicine, mrm_medicine_name: mrmMedName, medicine_taken: medTaken, referred_status: referred, followup_preference: followupCall, status, notes
      };
      if (editId) await axiosClient.put(`/call-logs/${editId}`, data);
      else await axiosClient.post(`/call-logs`, data);
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
        if (onSaved) onSaved();
        else if (onClose) onClose();
        else navigate('/call-logs');
      }, 1500);
    } catch (err) { alert("Failed to save."); }
  };

  const renderSelect = (label, options, value, setValue) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select className="form-control" value={value} onChange={(e) => setValue(e.target.value)} disabled={isViewOnly}>
        <option value="">-- Select --</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="appt-form-content">
      {successMessage && <div className="alert alert-success">✅ Call Log saved successfully.</div>}
      
      <div className="form-section">
        <h3 className="section-title"><User size={18} /> Caller Basic Information</h3>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Date <span>*</span></label>
            <DatePicker selected={callDate} onChange={(d) => setCallDate(d)} dateFormat="dd/MM/yyyy" className="form-control" disabled={isViewOnly} />
          </div>
          <div className="form-group">
            <label className="form-label">Caller Name <span>*</span></label>
            <input type="text" className="form-control" value={callerName} onChange={(e) => setCallerName(e.target.value)} readOnly={isViewOnly} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone <span>*</span></label>
            <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} readOnly={isViewOnly} />
          </div>
          <div className="form-group">
            <label className="form-label">Age <span>*</span></label>
            <input type="number" className="form-control" value={age} onChange={(e) => setAge(e.target.value)} readOnly={isViewOnly} />
          </div>
        </div>
        <div className="grid-2">
          {renderSelect("Source of Number", sourceOptions, q3Source, setQ3Source)}
          {renderSelect("Caller Type", callerTypeOptions, q5Type, setQ5Type)}
          {renderSelect("Repeat Caller?", repeatCallerOptions, q7Repeat, setQ7Repeat)}
          {renderSelect("Hear About Us?", hearAboutOptions, q8Hear, setQ8Hear)}
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title"><HelpCircle size={18} /> Reason for Calling</h3>
        <div className="grid-3" style={{gap: '0.75rem'}}>
          {reasonOptions.map(reason => (
            <div key={reason} className="checkbox-item" style={{background: '#f8fafc', padding: '0.5rem', borderRadius: '0.5rem'}}>
              <input type="checkbox" id={`reason-${reason}`} checked={selectedReasons.includes(reason)} onChange={() => handleReasonToggle(reason)} disabled={isViewOnly} />
              <label htmlFor={`reason-${reason}`}>{reason}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title"><MapPin size={18} /> Location & Medical Details</h3>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">District <span>*</span></label>
            <select className="form-control" value={district} onChange={handleDistrictChange} disabled={isViewOnly}>
              <option value="">-- Select District --</option>
              {divisions.map(div => (
                <optgroup key={div} label={div}>
                  {districtsByDivision[div].map(dist => <option key={dist} value={dist}>{dist}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Division (Auto)</label>
            <input type="text" className="form-control" value={division} readOnly style={{background: '#f1f5f9'}} />
          </div>
          {renderSelect("Pregnancy Status", pregnancyOptions, pregnancy, setPregnancy)}
          {renderSelect("Status", ["Pending", "Resolved", "Appointment Set", "Followup Required"], status, setStatus)}
        </div>
        <div className="form-group" style={{marginTop: '1rem'}}>
          <label className="form-label">Notes / Remarks</label>
          <textarea className="form-control" rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} readOnly={isViewOnly} />
        </div>
      </div>

      <div className="form-footer">
        {!isViewOnly && <button className="btn btn-success btn-lg" onClick={handleSave}><Save size={18} /> Save Details</button>}
        <button className="btn btn-danger btn-lg" onClick={() => (onClose ? onClose() : navigate('/call-logs'))}><X size={18} /> {isViewOnly ? 'Close' : 'Cancel'}</button>
      </div>
    </div>
  );
}

const CallLogForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const isViewOnly = searchParams.get('view') === 'true';

  return (
    <div className="form-page-container">
      <div className="form-header">
        <div className="breadcrumb"><Phone size={14} /> <span>/ Call Logs / Form</span></div>
        <button className="btn btn-warning btn-sm" onClick={() => navigate('/call-logs')}><ArrowLeft size={16} /> Go To List</button>
      </div>
      <div className="form-card card">
        <div className="form-card-header"><h2 className="form-title">Call Log Form</h2></div>
        <div className="form-body p-6"><CallLogFormContent editId={editId} isViewOnly={isViewOnly} /></div>
      </div>
    </div>
  );
};

export default CallLogForm;
