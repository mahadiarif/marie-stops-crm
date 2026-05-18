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
import UserManagement from './pages/UserManagement';
import ClinicEntry from './pages/ClinicEntry';
import AgentManagement from './pages/AgentManagement';
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
              <Route path="call-logs" element={<ProtectedRoute requiredRole={["admin", "manager", "staff"]}><CallLogList /></ProtectedRoute>} />
              <Route path="call-logs/new" element={<ProtectedRoute requiredRole={["admin", "manager", "staff"]}><CallLogForm /></ProtectedRoute>} />
              <Route path="clients" element={<ProtectedRoute requiredRole={["admin", "manager", "staff"]}><ClientList /></ProtectedRoute>} />
              <Route path="waiver" element={<ProtectedRoute requiredRole={["admin", "manager", "clinic"]}><WaiverList /></ProtectedRoute>} />
              <Route path="waiver/new" element={<ProtectedRoute requiredRole={["admin", "manager", "clinic"]}><NewWaiver /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute requiredRole="admin"><Settings /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute requiredRole={["admin", "manager"]}><Reports /></ProtectedRoute>} />
              <Route path="clinic-entry" element={<ProtectedRoute requiredRole={["admin", "manager", "clinic"]}><ClinicEntry /></ProtectedRoute>} />
              <Route path="agents" element={<ProtectedRoute requiredRole={["admin", "manager"]}><AgentManagement /></ProtectedRoute>} />
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
