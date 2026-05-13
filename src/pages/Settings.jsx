import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Settings as SettingsIcon, Plus, Trash2, Building, Building2, ClipboardList, Users } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const { 
    clinics, addClinic, removeClinic, 
    ngos, addNgo, removeNgo,
    reasons, addReason, removeReason,
    addedByList, addAddedBy, removeAddedBy,
    enumerators, addEnumerator, removeEnumerator,
    visitStatus, addVisitStatus, removeVisitStatus,
    followupStatus, addFollowupStatus, removeFollowupStatus,
    agentNames, addAgentName, removeAgentName,
    waiverServices, addWaiverService, removeWaiverService
  } = useAppData();
  
  const [newClinic, setNewClinic] = useState('');
  const [newNgo, setNewNgo] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newAddedBy, setNewAddedBy] = useState('');
  const [newEnumerator, setNewEnumerator] = useState('');
  const [newVisitStatus, setNewVisitStatus] = useState('');
  const [newFollowupStatus, setNewFollowupStatus] = useState('');
  const [newAgentName, setNewAgentName] = useState('');
  const [newWaiverService, setNewWaiverService] = useState('');

  const handleAddClinic = (e) => {
    e.preventDefault();
    if (newClinic.trim()) {
      addClinic(newClinic.trim());
      setNewClinic('');
    }
  };

  const handleAddNgo = (e) => {
    e.preventDefault();
    if (newNgo.trim()) {
      addNgo(newNgo.trim());
      setNewNgo('');
    }
  };

  const handleAddReason = (e) => {
    e.preventDefault();
    if (newReason.trim()) { addReason(newReason.trim()); setNewReason(''); }
  };

  const handleAddAddedBy = (e) => {
    e.preventDefault();
    if (newAddedBy.trim()) { addAddedBy(newAddedBy.trim()); setNewAddedBy(''); }
  };

  const handleAddEnumerator = (e) => {
    e.preventDefault();
    if (newEnumerator.trim()) { addEnumerator(newEnumerator.trim()); setNewEnumerator(''); }
  };

  const handleAddVisitStatus = (e) => {
    e.preventDefault();
    if (newVisitStatus.trim()) { addVisitStatus(newVisitStatus.trim()); setNewVisitStatus(''); }
  };

  const handleAddFollowupStatus = (e) => {
    e.preventDefault();
    if (newFollowupStatus.trim()) { addFollowupStatus(newFollowupStatus.trim()); setNewFollowupStatus(''); }
  };

  const handleAddAgentName = (e) => {
    e.preventDefault();
    if (newAgentName.trim()) { addAgentName(newAgentName.trim()); setNewAgentName(''); }
  };

  const handleAddWaiverService = (e) => {
    e.preventDefault();
    if (newWaiverService.trim()) { addWaiverService(newWaiverService.trim()); setNewWaiverService(''); }
  };

  return (
    <div className="settings-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings</h1>
          <p className="page-subtitle">Manage dynamic dropdowns and configuration.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Clinics Manager */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <Building className="text-primary" size={24} />
            <h2>Manage Clinics</h2>
          </div>
          <div className="settings-card-body">
            <form onSubmit={handleAddClinic} className="add-form">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Enter new clinic name..." 
                value={newClinic}
                onChange={(e) => setNewClinic(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={!newClinic.trim()}>
                <Plus size={18} /> Add
              </button>
            </form>
            
            <ul className="settings-list">
              {clinics.map((clinic, index) => (
                <li key={index} className="settings-list-item">
                  <span>{clinic}</span>
                  <button onClick={() => removeClinic(clinic)} className="btn-icon text-danger" title="Remove">
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
              {clinics.length === 0 && <li className="empty-text">No clinics found.</li>}
            </ul>
          </div>
        </div>

        {/* NGOs Manager */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <Building2 className="text-primary" size={24} />
            <h2>Manage NGOs</h2>
          </div>
          <div className="settings-card-body">
            <form onSubmit={handleAddNgo} className="add-form">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Enter new NGO name..." 
                value={newNgo}
                onChange={(e) => setNewNgo(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={!newNgo.trim()}>
                <Plus size={18} /> Add
              </button>
            </form>
            
            <ul className="settings-list">
              {ngos.map((ngo, index) => (
                <li key={index} className="settings-list-item">
                  <span>{ngo}</span>
                  <button onClick={() => removeNgo(ngo)} className="btn-icon text-danger" title="Remove"><Trash2 size={16} /></button>
                </li>
              ))}
              {ngos.length === 0 && <li className="empty-text">No NGOs found.</li>}
            </ul>
          </div>
        </div>

        {/* Reasons Manager */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <ClipboardList className="text-primary" size={24} />
            <h2>Visit Reasons</h2>
          </div>
          <div className="settings-card-body">
            <form onSubmit={handleAddReason} className="add-form">
              <input type="text" className="form-control" placeholder="Enter new visit reason..." value={newReason} onChange={(e) => setNewReason(e.target.value)} />
              <button type="submit" className="btn btn-primary" disabled={!newReason.trim()}><Plus size={18} /> Add</button>
            </form>
            
            <ul className="settings-list">
              {reasons.map((reason, index) => (
                <li key={index} className="settings-list-item">
                  <span>{reason}</span>
                  <button onClick={() => removeReason(reason)} className="btn-icon text-danger" title="Remove"><Trash2 size={16} /></button>
                </li>
              ))}
              {reasons.length === 0 && <li className="empty-text">No reasons found.</li>}
            </ul>
          </div>
        </div>

        {/* Agent Names Manager */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <Users size={24} className="text-primary" />
            <h2>Agent Names</h2>
          </div>
          <div className="settings-card-body">
            <form onSubmit={handleAddAgentName} className="add-form">
              <input type="text" className="form-control" placeholder="Enter agent name..." value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} />
              <button type="submit" className="btn btn-primary" disabled={!newAgentName.trim()}><Plus size={18} /> Add</button>
            </form>
            <ul className="settings-list">
              {agentNames.map((item, index) => (
                <li key={index} className="settings-list-item">
                  <span>{item}</span>
                  <button onClick={() => removeAgentName(item)} className="btn-icon text-danger" title="Remove"><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Waiver Services Manager */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <ClipboardList size={24} className="text-primary" />
            <h2>Waiver Services</h2>
          </div>
          <div className="settings-card-body">
            <form onSubmit={handleAddWaiverService} className="add-form">
              <input type="text" className="form-control" placeholder="Enter service name..." value={newWaiverService} onChange={(e) => setNewWaiverService(e.target.value)} />
              <button type="submit" className="btn btn-primary" disabled={!newWaiverService.trim()}><Plus size={18} /> Add</button>
            </form>
            <ul className="settings-list">
              {waiverServices.map((item, index) => (
                <li key={index} className="settings-list-item">
                  <span>{item}</span>
                  <button onClick={() => removeWaiverService(item)} className="btn-icon text-danger" title="Remove"><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Added By Manager */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <ClipboardList className="text-primary" size={24} />
            <h2>Added By (Source)</h2>
          </div>
          <div className="settings-card-body">
            <form onSubmit={handleAddAddedBy} className="add-form">
              <input type="text" className="form-control" placeholder="Enter source..." value={newAddedBy} onChange={(e) => setNewAddedBy(e.target.value)} />
              <button type="submit" className="btn btn-primary" disabled={!newAddedBy.trim()}><Plus size={18} /> Add</button>
            </form>
            <ul className="settings-list">
              {addedByList.map((item, index) => (
                <li key={index} className="settings-list-item">
                  <span>{item}</span>
                  <button onClick={() => removeAddedBy(item)} className="btn-icon text-danger" title="Remove"><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Enumerators Manager */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <ClipboardList className="text-primary" size={24} />
            <h2>Enumerators</h2>
          </div>
          <div className="settings-card-body">
            <form onSubmit={handleAddEnumerator} className="add-form">
              <input type="text" className="form-control" placeholder="Enter enumerator..." value={newEnumerator} onChange={(e) => setNewEnumerator(e.target.value)} />
              <button type="submit" className="btn btn-primary" disabled={!newEnumerator.trim()}><Plus size={18} /> Add</button>
            </form>
            <ul className="settings-list">
              {enumerators.map((item, index) => (
                <li key={index} className="settings-list-item">
                  <span>{item}</span>
                  <button onClick={() => removeEnumerator(item)} className="btn-icon text-danger" title="Remove"><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Visit Status Manager */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <ClipboardList className="text-primary" size={24} />
            <h2>Visit Status</h2>
          </div>
          <div className="settings-card-body">
            <form onSubmit={handleAddVisitStatus} className="add-form">
              <input type="text" className="form-control" placeholder="Enter visit status..." value={newVisitStatus} onChange={(e) => setNewVisitStatus(e.target.value)} />
              <button type="submit" className="btn btn-primary" disabled={!newVisitStatus.trim()}><Plus size={18} /> Add</button>
            </form>
            <ul className="settings-list">
              {visitStatus.map((item, index) => (
                <li key={index} className="settings-list-item">
                  <span>{item}</span>
                  <button onClick={() => removeVisitStatus(item)} className="btn-icon text-danger" title="Remove"><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Followup Status Manager */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <ClipboardList className="text-primary" size={24} />
            <h2>Followup Status</h2>
          </div>
          <div className="settings-card-body">
            <form onSubmit={handleAddFollowupStatus} className="add-form">
              <input type="text" className="form-control" placeholder="Enter followup status..." value={newFollowupStatus} onChange={(e) => setNewFollowupStatus(e.target.value)} />
              <button type="submit" className="btn btn-primary" disabled={!newFollowupStatus.trim()}><Plus size={18} /> Add</button>
            </form>
            <ul className="settings-list">
              {followupStatus.map((item, index) => (
                <li key={index} className="settings-list-item">
                  <span>{item}</span>
                  <button onClick={() => removeFollowupStatus(item)} className="btn-icon text-danger" title="Remove"><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
