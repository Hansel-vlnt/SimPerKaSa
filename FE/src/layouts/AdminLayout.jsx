import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>SimPerKaSa Admin</h2>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
            Overview
          </Link>
          <Link to="/admin/dashboard-data" className={location.pathname === '/admin/dashboard-data' ? 'active' : ''}>
            Manage Dashboard
          </Link>
          <Link to="/admin/finances" className={location.pathname === '/admin/finances' ? 'active' : ''}>
            Manage Finances
          </Link>
          <Link to="/admin/harvests" className={location.pathname === '/admin/harvests' ? 'active' : ''}>
            Manage Harvests
          </Link>
          <Link to="/admin/inventory" className={location.pathname === '/admin/inventory' ? 'active' : ''}>
            Manage Inventory
          </Link>
          <Link to="/admin/map" className={location.pathname === '/admin/map' ? 'active' : ''}>
            Map Editor
          </Link>
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" className="back-link">← Back to App</Link>
          <button 
            onClick={() => {
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_username');
              window.location.href = '/login';
            }} 
            className="back-link" 
            style={{marginTop: '10px', color: '#c62828', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: '1rem', width: '100%'}}
          >
             Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
