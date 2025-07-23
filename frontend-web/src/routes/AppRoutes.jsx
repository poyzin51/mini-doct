import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import AppointmentsPage from '../pages/AppointmentsPage';
import AvailabilityPage from '../pages/AvailabilityPage';

// Import route protection
import ProtectedRoute from './ProtectedRoute';

// Import layout
import Layout from '../components/layout/Layout';

/**
 * Main application routing configuration
 */
const AppRoutes = () => {
  const { isAuthenticated, isInitialized } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <Layout>
              <AppointmentsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/availability"
        element={
          <ProtectedRoute>
            <Layout>
              <AvailabilityPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          isInitialized ? (
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          ) : (
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          )
        }
      />

      {/* Catch all - redirect to dashboard or login */}
      <Route
        path="*"
        element={
          isInitialized ? (
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          ) : (
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;