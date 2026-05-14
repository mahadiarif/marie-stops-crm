import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import Dashboard from './pages/Dashboard';
import AppointmentList from './pages/AppointmentList';
import AppointmentForm from './pages/AppointmentForm';
import CallLogForm from './pages/CallLogForm';
import CallLogList from './pages/CallLogList';
import ClientList from './pages/ClientList';
import WaiverList from './pages/waiver/WaiverList';
import NewWaiver from './pages/waiver/NewWaiver';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import { AppDataProvider } from './context/AppDataContext';

function App() {
  return (
    <AppDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="appointments" element={<AppointmentList />} />
            <Route path="appointments/new" element={<AppointmentForm />} />
            <Route path="call-logs" element={<CallLogList />} />
            <Route path="call-logs/new" element={<CallLogForm />} />
            <Route path="clients" element={<ClientList />} />
            <Route path="waiver" element={<WaiverList />} />
            <Route path="waiver/new" element={<NewWaiver />} />
            <Route path="settings" element={<Settings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppDataProvider>
  );
}

export default App;
