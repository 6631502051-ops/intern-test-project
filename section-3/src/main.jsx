import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { RequireRole } from './RouteGuard';
import { AdminPage, EmployeePage, LoginPage } from './pages';
import './styles.css';

function App() {
  const auth = useAuth();
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/admin" element={<RequireRole role="admin"><AdminPage /></RequireRole>} />
    <Route path="/employee" element={<RequireRole role="employee"><EmployeePage /></RequireRole>} />
    <Route path="*" element={<Navigate to={auth.user ? (auth.user.role === 'admin' ? '/admin' : '/employee') : '/login'} replace />} />
  </Routes>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter></React.StrictMode>);
