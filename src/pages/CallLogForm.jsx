import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, CheckCircle2, Save, X, Calendar, MapPin, Activity, HelpCircle, HeartPulse, Search } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './CallLogForm.css';
import { useAppData } from '../context/AppDataContext';

const CallLogForm = () => {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState(false);

  // Constants
  const sourceOptions = ["Friend/Relative", "TV/Radio", "Newspaper", "Social Media", "Doctor/Health Worker", "NGO", "Others"];
  const callerTypeOptions = ["Female", "Male", "Adolescent Female", "Adolescent Male", "Others"];
  const repeatCallerOptions = ["Yes", "No"];
  const hearAboutOptions = ["Family/Friends", "TV", "Radio", "Newspaper", "Social Media", "Health Worker", "NGO", "Others"];
  
  const reasonOptions = [
    "Adolescent Health", "Information on Family Planning", "Support with Family Planning", 
    "Misoprostol for MRM", "Reproductive Health", "General Health", "Child Health", 
    "Complain", "Audit Call", "Calling for Waiver", "(Re)solve", "Appointment", "Others"
  ];
  
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
  const [q3Source, setQ3Source] = useState('');
  const [q5Type, setQ5Type] = useState('');
  const [q7Repeat, setQ7Repeat] = useState('');
  const [q8Hear, setQ8Hear] = useState('');
  const [callDate, setCallDate] = useState(new Date());
  
  const [selectedReasons, setSelectedReasons] = useState([]);
  
  // Sub states
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

  const handleReasonToggle = (reason) => {
    setSelectedReasons(prev => 
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const handleDistrictChange = (e) => {
    const val = e.target.value;
    setDistrict(val);
    if (val) {
      for (const [div, dists] of Object.entries(districtsByDivision)) {
        if (dists.includes(val)) {
          setDivision(div);
          break;
        }
      }
    } else {
      setDivision('');
    }
  };

  const handleSave = () => {
    setSuccessMessage(true);
    setTimeout(() => {
      setSuccessMessage(false);
      navigate('/call-logs');
    }, 2000);
  };

  const renderSelectWithOthers = (label, options, value, setValue) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select className="form-control" value={value} onChange={(e) => setValue(e.target.value)}>
        <option value="">-- Select --</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {value === "Others" && (
        <input type="text" className="form-control mt-2" placeholder="Please specify..." />
      )}
    </div>
  );

  return (
    <div className="form-page-container">
      <div className="form-header">
        <div className="breadcrumb">
          <Phone size={14} />
          <span>/ Call Logs / New Form</span>
        </div>
        <div className="header-actions">
          <button className="btn btn-warning btn-sm" onClick={() => navigate('/call-logs')}>
            Go To List
          </button>
        </div>
      </div>

      <div className="form-card card">
        <div className="form-card-header bg-primary text-white">
          <h2 className="form-title">MSI CRM Form</h2>
        </div>

        <div className="form-body p-6">
          {successMessage && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} />
              <span>Call Log saved successfully.</span>
            </div>
          )}

          {/* BASIC INFO */}
          <div className="form-section">
            <h3 className="section-title"><User size={18} /> Caller Basic Information</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Q1. Date <span>*</span></label>
                <DatePicker 
                  selected={callDate} 
                  onChange={(date) => setCallDate(date)} 
                  dateFormat="dd/MM/yyyy"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Q2. Caller Name <span>*</span></label>
                <input type="text" className="form-control" placeholder="Caller Name" />
              </div>
            </div>

            <div className="grid-2">
              {renderSelectWithOthers("Q3. Source of Caller's Number", sourceOptions, q3Source, setQ3Source)}
              <div className="form-group">
                <label className="form-label">Q4. Age <span>*</span></label>
                <input type="number" className="form-control" placeholder="Age" />
              </div>
            </div>

            <div className="grid-2">
              {renderSelectWithOthers("Q5. Caller Type", callerTypeOptions, q5Type, setQ5Type)}
              <div className="form-group">
                <label className="form-label">Q6. Language</label>
                <select className="form-control">
                  <option>Bangla</option>
                  <option>English</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              {renderSelectWithOthers("Q7. Is it a repeat caller?", repeatCallerOptions, q7Repeat, setQ7Repeat)}
              {renderSelectWithOthers("Q8. How did you hear about call center?", hearAboutOptions, q8Hear, setQ8Hear)}
            </div>
          </div>

          {/* REASON FOR CALLING */}
          <div className="form-section">
            <h3 className="section-title"><HelpCircle size={18} /> Q9. Reason for Calling (Multiple Select)</h3>
            <div className="grid-3" style={{gap: '1rem'}}>
              {reasonOptions.map(reason => (
                <div key={reason} className="checkbox-item" style={{background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0'}}>
                  <input 
                    type="checkbox" 
                    id={`reason-${reason}`} 
                    checked={selectedReasons.includes(reason)}
                    onChange={() => handleReasonToggle(reason)}
                  />
                  <label htmlFor={`reason-${reason}`} style={{fontSize: '0.875rem', margin: 0}}>{reason}</label>
                </div>
              ))}
            </div>
            {selectedReasons.includes("Others") && (
              <input type="text" className="form-control mt-4" placeholder="Specify other reason for calling..." />
            )}
          </div>

          {/* DYNAMIC SUB QUESTIONS */}
          {selectedReasons.length > 0 && (
            <div className="form-section bg-light-blue" style={{background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '0.5rem', padding: '1.5rem'}}>
              <h3 className="section-title text-primary"><Activity size={18} /> Detailed Reasons</h3>
              <div className="grid-2">
                {selectedReasons.includes("Adolescent Health") && 
                  renderSelectWithOthers("Q9.1 Adolescent Health", subOptions["Adolescent Health"], adolescentSub, setAdolescentSub)}
                
                {selectedReasons.includes("Information on Family Planning") && 
                  renderSelectWithOthers("Q9.2 Want to use family planning", subOptions["Information on Family Planning"], fpInfoSub, setFpInfoSub)}

                {selectedReasons.includes("Support with Family Planning") && (
                  <>
                    {renderSelectWithOthers("Q9.3 Support with Family Planning Reason", subOptions["Support with Family Planning Reason"], fpSupportReason, setFpSupportReason)}
                    {renderSelectWithOthers("Q9.3a Family Planning Method", subOptions["Support with Family Planning Method"], fpSupportMethod, setFpSupportMethod)}
                  </>
                )}

                {selectedReasons.includes("Misoprostol for MRM") && 
                  renderSelectWithOthers("Q9.4 Misoprostol for MRM", subOptions["Misoprostol for MRM"], mrmSub, setMrmSub)}

                {selectedReasons.includes("Reproductive Health") && 
                  renderSelectWithOthers("Q9.5 Reproductive Health", subOptions["Reproductive Health"], reproSub, setReproSub)}

                {selectedReasons.includes("General Health") && 
                  renderSelectWithOthers("Q9.6 General Health", subOptions["General Health"], generalSub, setGeneralSub)}

                {selectedReasons.includes("Child Health") && 
                  renderSelectWithOthers("Q9.7 Child Health", subOptions["Child Health"], childSub, setChildSub)}
              </div>
            </div>
          )}

          {/* LOCATION INFO */}
          <div className="form-section">
            <h3 className="section-title"><MapPin size={18} /> Location Information</h3>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Q10. District <span>*</span></label>
                <select className="form-control" value={district} onChange={handleDistrictChange}>
                  <option value="">-- Select District --</option>
                  {divisions.map(div => (
                    <optgroup key={div} label={div}>
                      {districtsByDivision[div].map(dist => <option key={dist} value={dist}>{dist}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Q10. Division (Auto-filled) <span>*</span></label>
                <input type="text" className="form-control" value={division} readOnly style={{background: '#f1f5f9'}} placeholder="Division will auto-fill" />
              </div>
              {renderSelectWithOthers("Q10b. Living Area", livingAreaOptions, livingArea, setLivingArea)}
            </div>
          </div>

          {/* MRM & FOLLOWUP */}
          <div className="form-section">
            <h3 className="section-title"><HeartPulse size={18} /> Medical & Followup Details</h3>
            <div className="grid-2">
              {renderSelectWithOthers("Q11. Have you tried to end pregnancy?", pregnancyOptions, pregnancy, setPregnancy)}
              {renderSelectWithOthers("Q12. Have you purchased MRM medicine?", mrmMedicineOptions, mrmMedicine, setMrmMedicine)}
              {renderSelectWithOthers("Q13. Which MRM medicine?", mrmMedicineNameOptions, mrmMedName, setMrmMedName)}
              {renderSelectWithOthers("Q14. Which medicine have you already taken?", medicineTakenOptions, medTaken, setMedTaken)}
              {renderSelectWithOthers("Q15. Would you like to be referred?", referredOptions, referred, setReferred)}
              {renderSelectWithOthers("Q16. Would you like followup call/SMS?", followupCallOptions, followupCall, setFollowupCall)}
            </div>
          </div>
        </div>

        <div className="form-footer" style={{padding: '1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem'}}>
          <button className="btn btn-success btn-lg" onClick={handleSave}>
            <Save size={18} /> Save Details
          </button>
          <button className="btn btn-danger btn-lg" onClick={() => navigate('/call-logs')}>
            <X size={18} /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallLogForm;
