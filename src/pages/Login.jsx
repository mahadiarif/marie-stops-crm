import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import '../styles/Login.css';

export default function Login() {
  const { login, loading, error } = useAuth();
  const { refetchAll } = useAppData();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!username || !password) {
      setLocalError('Please enter both username and password');
      return;
    }
    const result = await login(username, password);
    if (result.success) {
      await refetchAll();
      navigate('/');
    } else {
      setLocalError(result.error);
    }
  };

  return (
    <div className="login-container">

      {/* Left branding panel */}
      <div className="login-left">
        <div className="login-left-bg-circle"></div>
        <div className="login-left-bg-circle"></div>
        <div className="login-left-content">
          <img src="/logo.webp" alt="Marie Stopes Bangladesh" className="login-left-logo" />
          <div className="login-left-tagline">
            Integrated CRM Platform<br />for Clinical Operations
          </div>
          <div className="login-left-sub">
            Manage appointments, discounts<br />
            and clinic data — all in one place.
          </div>
          <div className="login-left-badge">Marie Stopes Bangladesh</div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-right">
        <div className="login-box">
          <div className="login-header">
            <img src="/logo.webp" alt="Marie Stopes Bangladesh" className="login-logo" />
            <h2>Welcome Back</h2>
            <p>Sign in to your CRM account</p>
          </div>

          <div className="login-divider"></div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            {(error || localError) && (
              <div className="error-message">
                {error || localError}
              </div>
            )}

            <button type="submit" disabled={loading} className="login-button">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="login-footer">
              <p>Need help? Contact your CRM administrator.</p>
            </div>

            <div className="test-credentials">
              <p><strong>Demo Credentials</strong></p>
              <p>admin / admin123</p>
              <p>manager / manager123</p>
              <p>staff / staff123 &nbsp;|&nbsp; clinic / clinic123</p>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
