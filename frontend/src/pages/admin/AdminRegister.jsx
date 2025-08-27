// pages/admin/AdminRegister.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminApi from '../../services/adminApi';
import './AdminRegister.css';

const AdminRegister = () => {
  const { token } = useParams(); // Get token from URL
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    invitationToken: token || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token) {
      setFormData(prev => ({ ...prev, invitationToken: token }));
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await AdminApi.registerWithInvitation(
        formData.email,
        formData.password,
        formData.invitationToken,
        formData.username
      );

      setSuccess(response.message || response.msg || 'Admin account created successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);

    } catch (err) {
      setError(err.message || 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
    return (
      <div className="admin-register">
        <div className="container">
          <div className="success-card">
            <div className="success-icon">🎉</div>
            <h1>Welcome, Admin!</h1>
            <p>{success}</p>
            <p>Redirecting to login page...</p>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-register">
      <div className="container">
        <div className="form-card">
          <div className="header">
            <h1>👑 Admin Registration</h1>
            <p>Complete your admin account setup</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="input-group">
              <label htmlFor="username">👤 Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">📧 Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">🔒 Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                minLength="6"
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">🔒 Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="invitationToken">🎫 Invitation Token</label>
              <input
                type="text"
                id="invitationToken"
                name="invitationToken"
                value={formData.invitationToken}
                onChange={handleChange}
                placeholder="Invitation token from email"
                required
                readOnly={!!token}
              />
              {token && <small className="hint">Token loaded from invitation link</small>}
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? '⏳ Creating Account...' : '🚀 Create Admin Account'}
            </button>
          </form>

          {error && (
            <div className="error-message">
              <h3>❌ Error</h3>
              <p>{error}</p>
            </div>
          )}

          <div className="footer-links">
            <p>Already have an admin account?</p>
            <button 
              onClick={() => navigate('/admin/login')}
              className="link-btn"
            >
              Login Here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
