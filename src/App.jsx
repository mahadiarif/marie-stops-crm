import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import Login from './pages/Login';
import { AppDataProvider } from './context/AppDataContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="appointments" element={<AppointmentList />} />
              <Route path="appointments/new" element={<AppointmentForm />} />
              <Route path="call-logs" element={<CallLogList />} />
              <Route path="call-logs/new" element={<CallLogForm />} />
              <Route path="clients" element={<ClientList />} />
              <Route path="waiver" element={<WaiverList />} />
              <Route path="waiver/new" element={<NewWaiver />} />
              <Route path="settings" element={<ProtectedRoute requiredRole="admin"><Settings /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute requiredRole={["admin", "manager"]}><Reports /></ProtectedRoute>} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </AppDataProvider>
    </AuthProvider>
  );
}

export default App;
