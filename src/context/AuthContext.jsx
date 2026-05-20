import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }

    const handleImpersonate = (e) => {
      setToken(localStorage.getItem('authToken'));
      setUser(e.detail);
    };
    window.addEventListener('crm-impersonate', handleImpersonate);
    return () => window.removeEventListener('crm-impersonate', handleImpersonate);
  }, []);

  const verifyToken = async (authToken) => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      const d = response.data;
      setUser({
        id: d.id,
        username: d.username,
        role: d.role,
        email: d.email || '',
        assignedClinic: d.assigned_clinic || null
      });
      setError(null);
    } catch (err) {
      console.error('Token verification failed:', err);
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });

      const { access_token, user_id, username: uname, role, assigned_clinic } = response.data;

      setToken(access_token);
      setUser({
        id: user_id,
        username: uname,
        role,
        email: '',
        assignedClinic: assigned_clinic || null
      });

      localStorage.setItem('authToken', access_token);
      window.dispatchEvent(new Event('crm-login'));
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('authToken');
  };

  const isAuthenticated = !!token && !!user;

  const hasRole = (roles) => {
    if (!Array.isArray(roles)) {
      roles = [roles];
    }
    return user && roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        isAuthenticated,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
