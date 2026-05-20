import { createContext, useState, useEffect, useContext } from 'react';
import axiosClient from '../api/axiosClient';

const AppDataContext = createContext();

export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider = ({ children }) => {
  const [clinics, setClinics] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [visitStatus, setVisitStatus] = useState([]);
  const [followupStatus, setFollowupStatus] = useState([]);
  
  // New States
  const [agentNames, setAgentNames] = useState([]);
  const [waiverServices, setWaiverServices] = useState([]);
  const [waivers, setWaivers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const waiverCenterPrefixes = {
    "Premium Dhanmondi": "Dhk",
    "Premium Mirpur-10": "Mir",
    "Bogura RC Centre": "Bog",
    "Gazipur Maternity": "Gaz",
    "Dhanmondi Women's Clinic": "DWC",
    "Narayanganj Clinic": "Nrj",
    "Chattogram Centre": "Ctg",
    "Sylhet Clinic": "Syl",
    "Rangpur": "Rng"
  };

  const fetchData = async () => {
      try {
        // Fetch Settings
        const settingsRes = await axiosClient.get(`/settings`);
        const settingsData = settingsRes.data;
        
        setClinics(settingsData.filter(s => s.category === 'clinic').map(s => s.value));
        setNgos(settingsData.filter(s => s.category === 'ngo').map(s => s.value));
        setReasons(settingsData.filter(s => s.category === 'reason').map(s => s.value));
        setVisitStatus(settingsData.filter(s => s.category === 'visitStatus').map(s => s.value));
        setFollowupStatus(settingsData.filter(s => s.category === 'followupStatus').map(s => s.value));
        setAgentNames(settingsData.filter(s => s.category === 'agentName').map(s => s.value));
        setWaiverServices(settingsData.filter(s => s.category === 'waiverService').map(s => s.value));

        // Fetch Waivers
        const waiversRes = await axiosClient.get(`/waivers`);
        setWaivers(waiversRes.data.map(w => ({
          id: w.id,
          date: w.date,
          center: w.center,
          clientId: w.client_id_code,
          firstName: w.first_name,
          service: w.service,
          totalPrice: w.total_price,
          waiverAmount: w.waiver_amount,
          paidAmount: w.paid_amount,
          waiverCode: w.waiver_code,
          remarks: w.remarks
        })));

        // Fetch Appointments
        const apptsRes = await axiosClient.get(`/appointments`);
        setAppointments(apptsRes.data.map(a => ({
          id: a.id,
          name: a.client_name,
          phone: a.client_phone,
          clinic: a.clinic,
          date: a.visit_date,
          status: a.reconfirmation || "Pending",
          type: a.reason || "Consultation",
          followup: a.followup_status_cc || "—",
          visitStatus: a.visit_status_clinic || "—",
          agent: a.agent_name || "—",
          spendingAmount: a.spending_amount || 0,
        })));

      } catch (error) {
        console.error("Error fetching data from backend:", error);
      }
  };

  useEffect(() => {
    if (localStorage.getItem('authToken')) fetchData();
    const handleLogin = () => fetchData();
    window.addEventListener('crm-login', handleLogin);
    return () => window.removeEventListener('crm-login', handleLogin);
  }, []);

  const addGenericItem = (category, setter, state) => async (newItem) => {
    if (newItem && !state.includes(newItem)) {
      try {
        await axiosClient.post(`/settings?category=${encodeURIComponent(category)}&value=${encodeURIComponent(newItem)}`);
        setter([...state, newItem]);
      } catch (error) {
        console.error(`Error adding ${category}:`, error);
        // Still update local state for better UX, or optionally handle error UI
        setter([...state, newItem]);
      }
    }
  };

  const removeGenericItem = (category, setter, state) => async (itemToRemove) => {
    try {
      // Fetch current settings to get the correct ID
      const settingsRes = await axiosClient.get(`/settings`);
      const item = settingsRes.data.find(s => s.category === category && s.value === itemToRemove);

      if (item) {
        await axiosClient.delete(`/settings/${item.id}`);
      }
      setter(state.filter(i => i !== itemToRemove));
    } catch (error) {
      console.error(`Error removing ${category}:`, error);
      setter(state.filter(i => i !== itemToRemove));
    }
  };

  const addWaiver = async (waiverData) => {
    try {
      const response = await axiosClient.post(`/waivers`, {
        date: waiverData.date,
        center: waiverData.center,
        client_id_code: waiverData.clientId,
        first_name: waiverData.firstName,
        service: waiverData.service,
        total_price: waiverData.totalPrice,
        waiver_amount: waiverData.waiverAmount,
        paid_amount: waiverData.paidAmount,
        waiver_code: waiverData.waiverCode,
        remarks: waiverData.remarks
      });
      const newWaiver = {
        id: response.data.id,
        date: response.data.date,
        center: response.data.center,
        clientId: response.data.client_id_code,
        firstName: response.data.first_name,
        service: response.data.service,
        totalPrice: response.data.total_price,
        waiverAmount: response.data.waiver_amount,
        paidAmount: response.data.paid_amount,
        waiverCode: response.data.waiver_code,
        remarks: response.data.remarks
      };
      setWaivers(prev => [newWaiver, ...prev]);
      return newWaiver;
    } catch (error) {
      console.error("Error adding waiver:", error);
    }
  };

  const updateWaiver = (id, updatedWaiver) => {
    setWaivers(prev => prev.map(w => w.id === id ? updatedWaiver : w));
  };

  return (
    <AppDataContext.Provider value={{
      clinics, addClinic: addGenericItem('clinic', setClinics, clinics), removeClinic: removeGenericItem('clinic', setClinics, clinics),
      ngos, addNgo: addGenericItem('ngo', setNgos, ngos), removeNgo: removeGenericItem('ngo', setNgos, ngos),
      reasons, addReason: addGenericItem('reason', setReasons, reasons), removeReason: removeGenericItem('reason', setReasons, reasons),
      visitStatus, addVisitStatus: addGenericItem('visitStatus', setVisitStatus, visitStatus), removeVisitStatus: removeGenericItem('visitStatus', setVisitStatus, visitStatus),
      followupStatus, addFollowupStatus: addGenericItem('followupStatus', setFollowupStatus, followupStatus), removeFollowupStatus: removeGenericItem('followupStatus', setFollowupStatus, followupStatus),
      
      agentNames, addAgentName: addGenericItem('agentName', setAgentNames, agentNames), removeAgentName: removeGenericItem('agentName', setAgentNames, agentNames),
      waiverServices, addWaiverService: addGenericItem('waiverService', setWaiverServices, waiverServices), removeWaiverService: removeGenericItem('waiverService', setWaiverServices, waiverServices),
      
      waivers, addWaiver, updateWaiver,
      appointments,
      waiverCenterPrefixes,
      refetchAll: fetchData,
    }}>
      {children}
    </AppDataContext.Provider>
  );
};
