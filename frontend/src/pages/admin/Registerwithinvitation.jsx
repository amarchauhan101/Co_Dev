// import axios from "axios";
// import React from "react";
// import { useEffect,useState } from "react";
// import { useForm } from "react-hook-form";
// import { useNavigate, useParams } from "react-router-dom";
// import { toast } from "react-toastify";

// function Registerwithinvitation() {
//   const { register, handleSubmit } = useForm();
//   const { token } = useParams();
//   const navigate = useNavigate();
//   if (!token) {
//     return <div>Invalid token</div>;
//   }
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     confirmPassword: "",
//     username: "",
//     invitationtoken: token || "",
//   });
//   const [error, setError] = useState(null);
//   const [Loading, setLoading] = useState(false);
//   useEffect(() => {
//     setFormData((prevData) => ({
//       ...prevData,
//       invitationtoken: token || "",
//     }));
//   }, [token]);
//   const onSubmit = async (data) => {
//     if (data.password !== data.confirmPassword) {
//       setError("Passwords do not match");
//       return;
//     }
//     if (formData.invitationtoken !== token) {
//       setError("Invalid invitation token");
//       return;
//     }
//     setFormData({ ...formData, ...data });
//     setLoading(true);
//     try {
//       const res = await axios.post(
//         "http://localhost:8000/api/v1/admin/registerwithinvite",
//         formData
//       );
//       console.log("data while registering=>", data);
//       console.log("res after registering=>", res);
//       toast.success("registered successfully as admin");
//       navigate("/admin/login");
//     } catch (err) {
//       setError(err.response.data.message);
//     } finally {
//       setLoading(false);
//     }
//     console.log("response after register=>", res.data);
//   };

//   return (
//     <div>
//       {error && <div className="error">{error}</div>}
//       {Loading ? (
//         <div>Loading...</div>
//       ) : (
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <input type="email" placeholder="Email" {...register("email")} />
//           <input
//             type="password"
//             placeholder="Password"
//             {...register("password")}
//           />
//           <input
//             type="password"
//             placeholder="Confirm Password"
//             {...register("confirmPassword")}
//           />
//           <input type="text" placeholder="Username" value={username} {...register("username")} />
//           <button type="submit">Register</button>
//         </form>
//       )}
//     </div>
//   );
// }

// export default Registerwithinvitation;


// pages/admin/AdminRegister.jsx - Replace your Registerwithinvitation.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminRegister.css';

const Registerwithinvitation = () => {
  const { token } = useParams(); // Get token from URL: /admin/register/:token
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    invitationToken: token || '' // Use the correct field name
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token) {
      console.log('🎫 Token loaded from URL:', token);
      setFormData(prev => ({ ...prev, invitationToken: token }));
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!formData.invitationToken.trim()) {
      setError('Invitation token is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🚀 Submitting registration with data:', {
        username: formData.username,
        email: formData.email,
        hasPassword: !!formData.password,
        hasToken: !!formData.invitationToken,
        tokenLength: formData.invitationToken.length
      });

      // Send the data with correct field names
      const requestData = {
        username: formData.username.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        invitationToken: formData.invitationToken.trim() // Match backend expectation
      };

      const response = await axios.post(
        `${import.meta.VITE_REACT_APP_BACKEND_BASE_URL}/api/v1/admin/registerwithinvite`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Registration successful:', response.data);
      
      setSuccess(response.data.message || 'Admin account created successfully!');
      toast.success('Registration successful!');
      
      // Clear form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        invitationToken: ''
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/admin/login', { 
          state: { 
            message: 'Registration successful! Please login with your credentials.',
            email: requestData.email 
          } 
        });
      }, 3000);

    } catch (err) {
      console.error('❌ Registration failed:', err);
      
      const errorMessage = err.response?.data?.msg || 
                          err.response?.data?.message || 
                          err.message || 
                          'Registration failed. Please try again.';
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show success state
  if (success) {
    return (
      <div className="admin-register">
        <div className="container">
          <div className="success-card">
            <div className="success-icon">🎉</div>
            <h1>Welcome to the Admin Team!</h1>
            <p className="success-message">{success}</p>
            <div className="success-details">
              <p>✅ Your admin account has been created</p>
              <p>🔐 You now have admin access</p>
              <p>🚀 Redirecting to login...</p>
            </div>
            <div className="loading-spinner"></div>
            <button 
              onClick={() => navigate('/admin/login')}
              className="login-btn"
            >
              Go to Login Now
            </button>
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
            <h1>👑 Complete Admin Registration</h1>
            <p>Set up your admin account using the invitation</p>
            {token && (
              <div className="token-status">
                <span className="token-badge">✅ Valid Invitation Token</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="register-form">
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
                minLength="3"
                maxLength="30"
              />
              <small className="hint">Minimum 3 characters, will be your display name</small>
            </div>

            <div className="input-group">
              <label htmlFor="email">📧 Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
              />
              <small className="hint">Use the email that received the invitation</small>
            </div>

            <div className="input-group">
              <label htmlFor="password">🔒 Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                minLength="6"
              />
              <small className="hint">Minimum 6 characters required</small>
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
              <small className="hint">Must match the password above</small>
            </div>

            <div className="input-group">
              <label htmlFor="invitationToken">🎫 Invitation Token</label>
              <input
                type="text"
                id="invitationToken"
                name="invitationToken"
                value={formData.invitationToken}
                onChange={handleChange}
                placeholder="Enter invitation token"
                required
                readOnly={!!token}
                className={token ? 'readonly' : ''}
              />
              {token ? (
                <small className="hint success">✅ Token loaded from invitation link</small>
              ) : (
                <small className="hint">Enter the token from your invitation email</small>
              )}
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Creating Account...
                </>
              ) : (
                '🚀 Create Admin Account'
              )}
            </button>
          </form>

          {error && (
            <div className="error-message">
              <h3>❌ Registration Failed</h3>
              <p>{error}</p>
              <div className="error-help">
                <h4>Common Issues:</h4>
                <ul>
                  <li>Make sure all fields are filled correctly</li>
                  <li>Username must be at least 3 characters</li>
                  <li>Password must be at least 6 characters</li>
                  <li>Passwords must match exactly</li>
                  <li>Invitation token may have expired (24 hours)</li>
                </ul>
              </div>
            </div>
          )}

          <div className="footer-links">
            <p>Already have an admin account?</p>
            <button 
              onClick={() => navigate('/admin/login')}
              className="link-btn"
            >
              🔐 Login Here
            </button>
          </div>

          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="debug-info">
              <h4>🐛 Debug Info:</h4>
              <p><strong>Token from URL:</strong> {token || 'None'}</p>
              <p><strong>Form token:</strong> {formData.invitationToken || 'None'}</p>
              <p><strong>Username:</strong> {formData.username || 'Empty'}</p>
              <p><strong>Email:</strong> {formData.email || 'Empty'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Registerwithinvitation;