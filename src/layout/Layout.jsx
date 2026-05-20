import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
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
  UserCheck,
  ArrowLeftCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../context/PermissionsContext';
import './Layout.css';

const NavGroup = ({ label, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = Array.isArray(children) ? children.some(Boolean) : !!children;
  if (!hasChildren) return null;
  return (
    <>
      <button className="nav-group-btn" onClick={() => setOpen(o => !o)}>
        <span>{label}</span>
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && <div className="nav-group-items">{children}</div>}
    </>
  );
};

const Layout = () => {
  const navigate = useNavigate();
  const { user, logout, hasRole, isImpersonating, returnToAdmin } = useAuth();
  const { can } = usePermissions();
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

          <NavGroup label="RECORDS" defaultOpen={true}>
            {can('appointments') && (
              <NavLink to="/appointments" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <UserPlus size={20} /><span>Appointments</span>
              </NavLink>
            )}
          </NavGroup>

          <NavGroup label="DISCOUNT" defaultOpen={true}>
            {can('waivers') && (
              <NavLink to="/waiver" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <ClipboardList size={20} /><span>Discount Tracking</span>
              </NavLink>
            )}
            {can('clinic_data') && (
              <NavLink to="/clinic-entry" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <Building2 size={20} /><span>Clinic List</span>
              </NavLink>
            )}
          </NavGroup>

          {can('reports') && (
            <NavGroup label="ANALYTICS" defaultOpen={true}>
              <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <FileText size={20} /><span>Reports</span>
              </NavLink>
            </NavGroup>
          )}

          {hasRole('admin') && (
            <NavGroup label="SYSTEM" defaultOpen={true}>
              <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <Shield size={20} /><span>Users</span>
              </NavLink>
              <NavLink to="/roles" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <UserCheck size={20} /><span>Roles & Permissions</span>
              </NavLink>
              {can('agent_management') && (
                <NavLink to="/agents" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <UserCheck size={20} /><span>Agents</span>
                </NavLink>
              )}
              {can('settings') && (
                <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <Settings size={20} /><span>Settings</span>
                </NavLink>
              )}
            </NavGroup>
          )}

          {!hasRole('admin') && can('agent_management') && (
            <NavGroup label="SYSTEM" defaultOpen={true}>
              <NavLink to="/agents" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <UserCheck size={20} /><span>Agents</span>
              </NavLink>
            </NavGroup>
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
                  {isImpersonating && (
                    <>
                      <div className="menu-divider"></div>
                      <div className="menu-section">
                        <button className="menu-item" style={{ color: '#f59e0b', fontWeight: 600 }}
                          onClick={async () => { setShowProfileMenu(false); await returnToAdmin(); navigate('/'); }}>
                          <ArrowLeftCircle size={16} /> <span>Back to Users</span>
                        </button>
                      </div>
                    </>
                  )}
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
