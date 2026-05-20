import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Catatan from './pages/Catatan';
import BlokKebun from './pages/BlokKebun';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="catatan" element={<Catatan />} />
          <Route path="blok-kebun" element={<BlokKebun />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
