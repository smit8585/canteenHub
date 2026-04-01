import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './global.css';

// Customer Pages
import Login from './pages/customer/Login';
import Menu from './pages/customer/Menu';
import Orders from './pages/customer/Orders';
import Wallet from './pages/customer/Wallet';

// Operator Pages
import Dashboard from './pages/operator/Dashboard';
import MenuManagement from './pages/operator/MenuManagement';
import OrderManagement from './pages/operator/OrderManagement';

import { getToken, getRole } from './utils/auth';

function ProtectedRoute({ children, allowedRole }) {
  const token = getToken();
  const role = getRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const [userRole, setUserRole] = useState(getRole());

  useEffect(() => {
    const token = getToken();
    const role = getRole();
    setIsAuthenticated(!!token);
    setUserRole(role);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login setAuth={setIsAuthenticated} setRole={setUserRole} />} />

        {/* Customer Routes */}
        <Route
          path="/menu"
          element={
            <ProtectedRoute allowedRole="customer">
              <Menu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRole="customer">
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute allowedRole="customer">
              <Wallet />
            </ProtectedRoute>
          }
        />

        {/* Operator Routes */}
        <Route
          path="/operator/dashboard"
          element={
            <ProtectedRoute allowedRole="operator">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/menu-management"
          element={
            <ProtectedRoute allowedRole="operator">
              <MenuManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/order-management"
          element={
            <ProtectedRoute allowedRole="operator">
              <OrderManagement />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              userRole === 'operator' ? (
                <Navigate to="/operator/dashboard" replace />
              ) : (
                <Navigate to="/menu" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
