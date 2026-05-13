import { useSearchParams } from 'react-router-dom';
import { User, Mail, Shield, MapPin, Phone, Calendar, Edit2, ArrowLeft } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('id');
  const [isEditing, setIsEditing] = useState(false);

  // Mock database (should be fetched from context or API later)
  const allClients = [
    { id: 'C-1001', name: 'Nusrat Jahan', phone: '01712345678', age: 28, address: 'Mirpur, Dhaka', registeredAt: '10-04-2024', email: 'nusrat@example.com', joined: '10 Apr 2024', avatar: 'NJ' },
    { id: 'C-1002', name: 'Farhana Islam', phone: '01811223344', age: 32, address: 'Dhanmondi, Dhaka', registeredAt: '15-04-2024', email: 'farhana@example.com', joined: '15 Apr 2024', avatar: 'FI' },
    { id: 'C-1003', name: 'Sabina Yasmin', phone: '01911223344', age: 25, address: 'Uttara, Dhaka', registeredAt: '22-04-2024', email: 'sabina@example.com', joined: '22 Apr 2024', avatar: 'SY' },
    { id: 'C-1004', name: 'Runa Laila', phone: '01611223344', age: 40, address: 'Gulshan, Dhaka', registeredAt: '05-05-2024', email: 'runa@example.com', joined: '05 May 2024', avatar: 'RL' },
    { id: 'C-1005', name: 'Tania Akter', phone: '01755667788', age: 29, address: 'Mohammadpur, Dhaka', registeredAt: '12-05-2024', email: 'tania@example.com', joined: '12 May 2024', avatar: 'TA' },
  ];

  const [user, setUser] = useState({
    id: 'ADMIN',
    name: 'Super Admin',
    role: 'Administrator',
    email: 'admin@mariestopes.org.bd',
    phone: '+880 1700-000000',
    location: 'Dhaka, Bangladesh',
    joined: 'January 2024',
    avatar: 'SA'
  });

  const [editForm, setEditForm] = useState({ ...user });

  useEffect(() => {
    const client = allClients.find(c => c.id === clientId);
    if (client) {
      const clientData = {
        name: client.name,
        role: 'Client',
        email: client.email,
        phone: client.phone,
        location: client.address,
        joined: client.joined,
        avatar: client.avatar
      };
      setUser(prev => ({...prev, ...clientData}));
      setEditForm(prev => ({...prev, ...clientData}));
    }
  }, [clientId]);

  const handleSave = () => {
    setUser(editForm);
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleCancel = () => {
    setEditForm({ ...user });
    setIsEditing(false);
  };

  return (
    <div className="profile-page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Profile</h1>
          <p className="page-subtitle">View and manage your personal information.</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Profile Card */}
        <div className="card profile-main-card">
          <div className="profile-cover"></div>
          <div className="profile-info-section">
            <div className="profile-avatar-large">{user.avatar}</div>
            <div className="profile-header-info">
              {isEditing ? (
                <input 
                  type="text" 
                  className="form-control" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}
                />
              ) : (
                <h2>{user.name}</h2>
              )}
              <span className="badge badge-primary">{user.role}</span>
            </div>
            {!isEditing ? (
              <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}>
                <Edit2 size={14} /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-success btn-sm" onClick={handleSave}>
                  Save
                </button>
                <button className="btn btn-outline btn-sm" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          <div className="profile-details-list">
            <div className="detail-item">
              <Mail size={18} className="text-muted" />
              <div>
                <label>Email Address</label>
                {isEditing ? (
                  <input 
                    type="email" 
                    className="form-control" 
                    value={editForm.email} 
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} 
                  />
                ) : (
                  <p>{user.email}</p>
                )}
              </div>
            </div>
            <div className="detail-item">
              <Phone size={18} className="text-muted" />
              <div>
                <label>Phone Number</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editForm.phone} 
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} 
                  />
                ) : (
                  <p>{user.phone}</p>
                )}
              </div>
            </div>
            <div className="detail-item">
              <MapPin size={18} className="text-muted" />
              <div>
                <label>Location</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editForm.location} 
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} 
                  />
                ) : (
                  <p>{user.location}</p>
                )}
              </div>
            </div>
            <div className="detail-item">
              <Calendar size={18} className="text-muted" />
              <div>
                <label>Joined Since</label>
                <p>{user.joined}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security / Activity */}
        <div className="profile-secondary-col">
          <div className="card stat-card-simple">
            <div className="card-header">
              <h3 className="card-title">Account Security</h3>
            </div>
            <div className="card-body">
              <div className="security-item">
                <Shield size={18} className="text-success" />
                <span>Two-Factor Authentication: <b>Enabled</b></span>
              </div>
              <div className="security-item">
                <Shield size={18} className="text-primary" />
                <span>Last Password Change: <b>2 months ago</b></span>
              </div>
              <button className="btn btn-outline btn-full mt-4">Change Password</button>
            </div>
          </div>

          <div className="card stat-card-simple mt-4">
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
            </div>
            <div className="card-body p-0">
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <p>Updated system settings</p>
                    <span>2 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <p>Created new waiver record</p>
                    <span>Yesterday</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <p>Logged in from New Device</p>
                    <span>3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
