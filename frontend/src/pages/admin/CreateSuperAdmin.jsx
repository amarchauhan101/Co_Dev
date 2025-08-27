// pages/admin/CreateSuperAdmin.jsx
import React, { useState } from 'react';
import AdminApi from '../../services/adminApi';
import './CreateSuperAdmin.css';

const CreateSuperAdmin = () => {
  const [formData, setFormData] = useState({
    email: '',
    secretkey: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await AdminApi.firstsuperAdmin(
        formData.email, 
        formData.secretkey
      );
      
      setMessage(response.msg || 'Super admin invitation sent successfully!');
      setFormData({ email: '', secretkey: '' });
      
      // Show next steps
      setTimeout(() => {
        setMessage(prev => prev + '\n\n✉️ Please check your email for the invitation link!');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to create super admin');
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
    <div className="create-super-admin">
      <div className="container">
        <div className="form-card">
          <div className="header">
            <h1>👑 Create First Super Admin</h1>
            <p>Initialize the admin system by creating the first super admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="input-group">
              <label htmlFor="email">📧 Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter super admin email"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="secretkey">🔑 Secret Key</label>
              <input
                type="password"
                id="secretkey"
                name="secretkey"
                value={formData.secretkey}
                onChange={handleChange}
                placeholder="Enter the secret key from environment"
                required
              />
              <small className="hint">
                This key is set in your environment variables (SECRET_KEY)
              </small>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? '⏳ Creating...' : '🚀 Create Super Admin'}
            </button>
          </form>

          {message && (
            <div className="success-message">
              <h3>✅ Success!</h3>
              <p>{message}</p>
              <div className="next-steps">
                <h4>Next Steps:</h4>
                <ol>
                  <li>Check the provided email inbox</li>
                  <li>Click the invitation link</li>
                  <li>Complete the registration process</li>
                  <li>Login with your new admin credentials</li>
                </ol>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <h3>❌ Error</h3>
              <p>{error}</p>
              <div className="troubleshooting">
                <h4>Troubleshooting:</h4>
                <ul>
                  <li>Make sure the secret key matches your .env file</li>
                  <li>Check if any admin already exists in the system</li>
                  <li>Verify your email address is correct</li>
                </ul>
              </div>
            </div>
          )}

          <div className="info-section">
            <h3>ℹ️ How it works:</h3>
            <ol>
              <li><strong>Secret Key:</strong> Prevents unauthorized admin creation</li>
              <li><strong>Email Invitation:</strong> Secure registration link sent via email</li>
              <li><strong>One-time Setup:</strong> Only works if no admin exists</li>
              <li><strong>24h Expiry:</strong> Invitation token expires in 24 hours</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSuperAdmin;