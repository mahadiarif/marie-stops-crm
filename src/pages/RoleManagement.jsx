import { useState, useEffect } from 'react';
import { Crown, Shield, UserCheck, Building2, Save, ChevronDown } from 'lucide-react';

const ModuleRow = ({ label, checked, onChange, disabled, columns, rolePerms, module, onToggleCol }) => {
  const [open, setOpen] = useState(false);
  const hasCols = columns && columns.length > 0;
  return (
    <div className="module-row-wrap">
      <div className="perm-row">
        <button
          className={`module-label-btn ${hasCols ? 'has-cols' : ''}`}
          onClick={() => hasCols && setOpen(o => !o)}
          style={{ cursor: hasCols ? 'pointer' : 'default' }}
        >
          {hasCols && <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginRight: '0.35rem', color: '#94a3b8' }} />}
          <span className="perm-row-label">{label}</span>
        </button>
        <Toggle checked={checked} onChange={onChange} disabled={disabled} />
      </div>
      {open && hasCols && (
        <div className="col-expand">
          {columns.map(({ key, label: colLabel }) => (
            <div className="perm-row perm-row-indent" key={key}>
              <span className="perm-row-label">{colLabel}</span>
              <Toggle
                checked={!!rolePerms?.columns?.[module]?.[key]}
                onChange={() => onToggleCol(module, key)}
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
import axiosClient from '../api/axiosClient';
import { usePermissions } from '../context/PermissionsContext';
import './RoleManagement.css';

const ROLE_META = {
  admin:   { label: 'Admin',        icon: Crown,      color: '#7c3aed', bg: '#f5f3ff', locked: true },
  manager: { label: 'Manager',      icon: Shield,     color: '#0369a1', bg: '#f0f9ff', locked: false },
  staff:   { label: 'Agent (Staff)',icon: UserCheck,  color: '#059669', bg: '#f0fdf4', locked: false },
  clinic:  { label: 'Clinic User',  icon: Building2,  color: '#e4007e', bg: '#fdf2f8', locked: false },
};

const FEATURE_LABELS = {
  appointments:     'Appointments',
  call_logs:        'Call Logs',
  clients:          'Clients',
  clinic_data:      'Clinic List',
  waivers:          'Waivers',
  reports:          'Reports',
  agent_management: 'Agent Management',
  user_management:  'User Management',
  settings:         'System Settings',
};

const COLUMN_DEFS = {
  appointments: [  // key matches FEATURE_LABELS key
    { key: 'id',          label: 'Appointment ID' },
    { key: 'client',      label: 'Client Details' },
    { key: 'clinic',      label: 'Clinic' },
    { key: 'reason',      label: 'Reason' },
    { key: 'agent',       label: 'Agent' },
    { key: 'date',        label: 'Visit Date' },
    { key: 'reconf',      label: 'Reconfirmation' },
    { key: 'visitStatus', label: 'Visit Status' },
    { key: 'spending',    label: 'Spending (৳)' },
    { key: 'followup',    label: 'Follow-up Status' },
  ],
  call_logs: [
    { key: 'callerName',  label: 'Caller Details' },
    { key: 'callerType',  label: 'Caller Type' },
    { key: 'reason',      label: 'Reason' },
    { key: 'district',    label: 'District' },
    { key: 'duration',    label: 'Duration' },
    { key: 'status',      label: 'Status' },
    { key: 'date',        label: 'Date' },
  ],
  clients: [
    { key: 'name',        label: 'Client Name' },
    { key: 'contact',     label: 'Contact Details' },
    { key: 'age',         label: 'Age' },
    { key: 'registered',  label: 'Registered On' },
  ],
};

const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    style={{
      width: 40, height: 22, borderRadius: 11, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      background: checked ? '#22c55e' : '#cbd5e1', position: 'relative', transition: 'background 0.2s',
      opacity: disabled ? 0.5 : 1, flexShrink: 0,
    }}
  >
    <span style={{
      position: 'absolute', top: 3, left: checked ? 21 : 3,
      width: 16, height: 16, borderRadius: '50%', background: '#fff',
      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }} />
  </button>
);

const RoleManagement = () => {
  const { fetchPerms } = usePermissions();
  const [perms, setPerms] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axiosClient.get('/role-permissions').then(r => setPerms(r.data)).catch(() => {});
  }, []);

  const toggle = (role, feature) => {
    setPerms(prev => ({
      ...prev,
      [role]: { ...prev[role], [feature]: !prev[role][feature] }
    }));
    setSaved(false);
  };

  const toggleCol = (role, module, colKey) => {
    setPerms(prev => {
      const prevCols = prev[role]?.columns?.[module] || {};
      return {
        ...prev,
        [role]: {
          ...prev[role],
          columns: {
            ...prev[role]?.columns,
            [module]: { ...prevCols, [colKey]: !prevCols[colKey] }
          }
        }
      };
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosClient.put('/role-permissions', perms);
      await fetchPerms();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert('Failed to save permissions.');
    } finally {
      setSaving(false);
    }
  };

  if (!perms) return <div style={{ padding: '2rem', color: '#94a3b8' }}>Loading...</div>;

  return (
    <div className="role-mgmt-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Role Management</h1>
          <p className="page-subtitle">Configure module access per role. Admin permissions are fixed.</p>
        </div>
        <button className="btn btn-success" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="roles-grid">
        {Object.entries(ROLE_META).map(([roleKey, meta]) => {
          const Icon = meta.icon;
          const rolePerms = perms[roleKey] || {};
          return (
            <div className="role-card" key={roleKey} style={{ borderTop: `4px solid ${meta.color}` }}>
              <div className="role-card-header" style={{ background: meta.bg }}>
                <div className="role-icon-wrap" style={{ background: meta.color + '20', color: meta.color }}>
                  <Icon size={22} />
                </div>
                <div>
                  <div className="role-name" style={{ color: meta.color }}>{meta.label}</div>
                  {meta.locked && <div className="role-locked-badge">Permissions locked</div>}
                </div>
              </div>
              <div className="role-perms-body">
                <div className="perm-section-title">Permissions</div>
                {Object.entries(FEATURE_LABELS).map(([feature, label]) => (
                  <ModuleRow
                    key={feature}
                    label={label}
                    checked={!!rolePerms[feature]}
                    onChange={() => toggle(roleKey, feature)}
                    disabled={meta.locked}
                    columns={COLUMN_DEFS[feature] || []}
                    rolePerms={rolePerms}
                    module={feature}
                    onToggleCol={(mod, key) => toggleCol(roleKey, mod, key)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoleManagement;
