// pages/admin/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use your existing login API endpoint
      const response = await fetch('http://localhost:8000/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.message || 'Login failed');
      }

      // Check if user is admin
      if (!data.user.isAdmin) {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Success message
      alert(`Welcome ${data.user.username}! Redirecting to admin dashboard...`);

      // Redirect to admin dashboard
      navigate('/admin/dashboard');

    } catch (err) {
      setError(err.message);
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

  return (
    <div className="admin-login">
      <div className="container">
        <div className="form-card">
          <div className="header">
            <h1>🔐 Admin Login</h1>
            <p>Access the administration panel</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="email">📧 Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your admin email"
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
                placeholder="Enter your password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? '⏳ Logging in...' : '🚀 Login to Admin Panel'}
            </button>
          </form>

          {error && (
            <div className="error-message">
              <h3>❌ Login Failed</h3>
              <p>{error}</p>
            </div>
          )}

          <div className="footer-links">
            <p>Need to create the first admin?</p>
            <button 
              onClick={() => navigate('/admin/create-super-admin')}
              className="link-btn"
            >
              Create Super Admin
            </button>
          </div>

          <div className="info-section">
            <h3>ℹ️ Admin Access Steps:</h3>
            <ol>
              <li><strong>Create Super Admin:</strong> Use secret key to create first admin</li>
              <li><strong>Check Email:</strong> Look for invitation email with registration link</li>
              <li><strong>Register:</strong> Complete registration with invitation token</li>
              <li><strong>Login:</strong> Use your credentials to access admin panel</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
