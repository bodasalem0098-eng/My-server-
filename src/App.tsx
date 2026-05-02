import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Dashboard from './pages/SaaS/Dashboard';
import MenuPage from './pages/SaaS/MenuPage';
import ManageMenu from './pages/SaaS/ManageMenu';
import PayPage from './pages/SaaS/PayPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Routes>
          {/* Admin Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Public Gate */}
          <Route path="/menu/:subdomain" element={<MenuPage />} />
          
          {/* Payment Page */}
          <Route path="/pay/:id" element={<PayPage />} />
          
          {/* Manage items for a restaurant (Internal) */}
          <Route path="/manage/:id" element={<ManageMenu />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <Toaster position="top-center" />
    </Router>
  );
}
