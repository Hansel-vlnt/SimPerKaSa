import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>SIM-PERKASA</h1>
        <p>Manajemen Perkebunan Sawit</p>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <ul className="nav-list">
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
                <span className="icon"></span>
                <span className="link-text">Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/catatan" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <span className="icon"></span>
                <span className="link-text">Catatan</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/tahunan" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <span className="icon"></span>
                <span className="link-text">Buku Tahunan</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/blok-kebun" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <span className="icon"></span>
                <span className="link-text">Blok Kebun</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
