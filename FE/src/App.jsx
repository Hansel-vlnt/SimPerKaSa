import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Catatan from './pages/Catatan';
import BlokKebun from './pages/BlokKebun';
import Login from './pages/Login';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboardData from './pages/admin/AdminDashboardData';
import AdminFinances from './pages/admin/AdminFinances';
import AdminHarvests from './pages/admin/AdminHarvests';
import AdminInventory from './pages/admin/AdminInventory';
import AdminMapEditor from './pages/admin/AdminMapEditor';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="catatan" element={<Catatan />} />
          <Route path="blok-kebun" element={<BlokKebun />} />
        </Route>
        
        <Route path="/login" element={<Login />} />
        
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<div className="admin-page"><h1>Admin Dashboard</h1><p>Welcome to SimPerKaSa Admin.</p></div>} />
          <Route path="dashboard-data" element={<AdminDashboardData />} />
          <Route path="finances" element={<AdminFinances />} />
          <Route path="harvests" element={<AdminHarvests />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="map" element={<AdminMapEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
