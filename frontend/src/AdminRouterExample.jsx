// Example Router configuration for your App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateSuperAdmin from './pages/admin/CreateSuperAdmin';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
// import AdminDashboard from './pages/admin/AdminDashboard'; // You'll create this next

function App() {
  return (
    <Router>
      <Routes>
        {/* Your existing routes */}
        
        {/* Admin Authentication Routes */}
        
        
        {/* Protected Admin Routes (Add these later) */}
        {/* <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
        
        {/* Your other routes... */}
      </Routes>
    </Router>
  );
}

export default App;
