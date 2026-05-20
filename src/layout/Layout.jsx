import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  PhoneCall,
  Users,
  Settings,
  LogOut,
  Bell,
  Menu,
  ChevronDown,
  ClipboardList,
  User,
  Shield,
  HelpCircle,
  FileText,
  Building2,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for auth errors and redirect to login
  useEffect(() => {
    const handleAuthError = () => {
      logout();
      navigate('/login');
    };
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, [logout, navigate]);

  const notifications = [
    { id: 1, title: 'New Appointment', desc: 'Nusrat Jahan scheduled for Dhanmondi', time: '5m ago', unread: true },
    { id: 2, title: 'Follow-up Due', desc: 'Call due for Farhana Islam', time: '1h ago', unread: true },
    { id: 3, title: 'System Update', desc: 'Backend sync completed successfully', time: '2h ago', unread: false },
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const getUserInitials = () => {
    if (!user) return '?';
    return user.username.substring(0, 2).toUpperCase();
  };

  const getRoleLabel = () => {
    if (!user) return 'User';
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/logo.webp" alt="Marie Stopes Logo" className="app-logo" />
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <div className="nav-group">RECORDS</div>

          <NavLink to="/appointments" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <UserPlus size={20} />
            <span>Appointments</span>
          </NavLink>

          {hasRole(['admin', 'manager', 'staff']) && (
            <NavLink to="/call-logs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <PhoneCall size={20} />
              <span>Call Logs</span>
            </NavLink>
          )}

          {hasRole(['admin', 'manager', 'staff']) && (
            <NavLink to="/clients" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Users size={20} />
              <span>Clients</span>
            </NavLink>
          )}

          <div className="nav-group">WAIVER</div>

          {hasRole(['admin', 'manager', 'clinic']) && (
            <NavLink to="/waiver" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <ClipboardList size={20} />
              <span>Waiver List</span>
            </NavLink>
          )}

          {hasRole(['admin', 'manager', 'clinic']) && (
            <NavLink to="/clinic-entry" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Building2 size={20} />
              <span>Clinic List</span>
            </NavLink>
          )}

          {hasRole(['admin', 'manager']) && (
            <>
              <div className="nav-group">ANALYTICS</div>
              <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <FileText size={20} />
                <span>Reports</span>
              </NavLink>
            </>
          )}

          {hasRole('admin') && (
            <>
              <div className="nav-group">SYSTEM</div>
              <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <Shield size={20} />
                <span>User Management</span>
              </NavLink>
            </>
          )}

          {hasRole(['admin', 'manager']) && (
            <NavLink to="/agents" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <UserCheck size={20} />
              <span>Agent Management</span>
            </NavLink>
          )}

          {hasRole('admin') && (
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <button className="mobile-menu-btn">
              <Menu size={24} />
            </button>
          </div>
          
          <div className="header-right">
            {/* Notification Dropdown */}
            <div className="dropdown-container" ref={notificationsRef}>
              <button 
                className={`header-action-btn ${showNotifications ? 'active' : ''}`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                <span className="notification-dot"></span>
              </button>
              
              {showNotifications && (
                <div className="dropdown-menu notification-menu shadow-lg">
                  <div className="dropdown-header">
                    <h3>Notifications</h3>
                    <button className="text-primary btn-link">Mark all as read</button>
                  </div>
                  <div className="dropdown-body">
                    {notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`notification-item ${n.unread ? 'unread' : ''}`}
                        onClick={() => setShowNotifications(false)}
                      >
                        <div className="item-icon"><Bell size={14} /></div>
                        <div className="item-content">
                          <p className="item-title">{n.title}</p>
                          <p className="item-desc">{n.desc}</p>
                          <span className="item-time">{n.time}</span>
                        </div>
                        {n.unread && <span className="unread-dot"></span>}
                      </div>
                    ))}
                  </div>
                  <div className="dropdown-footer">
                    <button className="btn-link" onClick={() => setShowNotifications(false)}>View all notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="dropdown-container" ref={profileRef}>
              <div
                className={`user-profile ${showProfileMenu ? 'active' : ''}`}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="user-avatar">{getUserInitials()}</div>
                <div className="user-info">
                  <span className="user-name">{user?.username}</span>
                  <span className="user-role">{getRoleLabel()}</span>
                </div>
                <ChevronDown size={16} className={`chevron ${showProfileMenu ? 'rotate' : ''}`} />
              </div>

              {showProfileMenu && (
                <div className="dropdown-menu profile-menu shadow-lg">
                  <div className="menu-section">
                    <button className="menu-item" onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}>
                      <User size={16} /> <span>My Profile</span>
                    </button>
                    {hasRole('admin') && (
                      <button className="menu-item" onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}>
                        <Settings size={16} /> <span>Account Settings</span>
                      </button>
                    )}
                    <button className="menu-item" onClick={() => setShowProfileMenu(false)}>
                      <Shield size={16} /> <span>Security</span>
                    </button>
                  </div>
                  <div className="menu-divider"></div>
                  <div className="menu-section">
                    <button className="menu-item" onClick={() => setShowProfileMenu(false)}>
                      <HelpCircle size={16} /> <span>Help Center</span>
                    </button>
                    <button className="menu-item text-danger" onClick={handleLogout}>
                      <LogOut size={16} /> <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
