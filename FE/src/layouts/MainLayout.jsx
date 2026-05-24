import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './MainLayout.css';

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
