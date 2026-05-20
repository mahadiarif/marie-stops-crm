import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Plus, Trash2, Building2, ClipboardList } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const {
    ngos, addNgo, removeNgo,
    reasons, addReason, removeReason,
    visitStatus, addVisitStatus, removeVisitStatus,
    followupStatus, addFollowupStatus, removeFollowupStatus,
    waiverServices, addWaiverService, removeWaiverService
  } = useAppData();

  const [newNgo, setNewNgo] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newVisitStatus, setNewVisitStatus] = useState('');
  const [newFollowupStatus, setNewFollowupStatus] = useState('');
  const [newWaiverService, setNewWaiverService] = useState('');

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

  const handleAddVisitStatus = (e) => {
    e.preventDefault();
    if (newVisitStatus.trim()) { addVisitStatus(newVisitStatus.trim()); setNewVisitStatus(''); }
  };

  const handleAddFollowupStatus = (e) => {
    e.preventDefault();
    if (newFollowupStatus.trim()) { addFollowupStatus(newFollowupStatus.trim()); setNewFollowupStatus(''); }
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

        {/* Waiver Services Manager */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <ClipboardList size={24} className="text-primary" />
            <h2>Discount Services</h2>
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
