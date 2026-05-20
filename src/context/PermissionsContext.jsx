import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from './AuthContext';

const DEFAULT = {
  admin:   { appointments: true, clinic_data: true, waivers: true, reports: true, user_management: true, agent_management: true, settings: true },
  manager: { appointments: true, clinic_data: true, waivers: true, reports: true, user_management: false, agent_management: true, settings: false },
  staff:   { appointments: true, clinic_data: false, waivers: false, reports: false, user_management: false, agent_management: false, settings: false },
  clinic:  { appointments: true, clinic_data: true, waivers: true, reports: false, user_management: false, agent_management: false, settings: false },
};

const PermissionsContext = createContext(null);

export function PermissionsProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [allPerms, setAllPerms] = useState(DEFAULT);

  const fetchPerms = async () => {
    try {
      const res = await axiosClient.get('/role-permissions');
      setAllPerms(res.data);
    } catch {
      setAllPerms(DEFAULT);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchPerms();
  }, [isAuthenticated]);

  const can = (feature) => {
    if (!user) return false;
    const rolePerms = allPerms[user.role];
    if (!rolePerms) return false;
    return !!rolePerms[feature];
  };

  const getColumns = (module) => {
    if (!user) return {};
    const rolePerms = allPerms[user.role];
    if (!rolePerms?.columns?.[module]) return {};
    return rolePerms.columns[module];
  };

  return (
    <PermissionsContext.Provider value={{ can, getColumns, allPerms, fetchPerms }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}
