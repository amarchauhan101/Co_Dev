// AdminRouter.jsx - Add this to your main App.jsx or create separate router
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CreateSuperAdmin from './pages/admin/CreateSuperAdmin';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
// import AdminDashboard from './pages/admin/AdminDashboard'; // Create this next

// Example App.jsx setup
function App() {
  return (
    <Router>
      <Routes>
        {/* Regular Routes */}
        <Route path="/" element={<div>Home Page</div>} />
        
        {/* Admin Authentication Routes */}
        <Route path="/admin/create-super-admin" element={<CreateSuperAdmin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register/:token" element={<AdminRegister />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        
        {/* Protected Admin Routes (add these after creating components) */}
        {/* <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} /> */}
        
        {/* Redirect /admin to create-super-admin for now */}
        <Route path="/admin" element={<Navigate to="/admin/create-super-admin" replace />} />
        
        {/* Catch all */}
        <Route path="*" element={<div>404 - Page not found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
