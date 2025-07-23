import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/ui/Loader';

/**
 * Protected route component that requires authentication
 */
const ProtectedRoute = ({ children, requireProfessional = true }) => {
  const { isAuthenticated, isInitialized, isProfessional, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check if professional access is required
  if (requireProfessional && !isProfessional()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-error-50 rounded-lg p-6 max-w-md mx-auto">
            <svg
              className="h-12 w-12 text-error-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              This area is restricted to healthcare professionals only.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="btn btn-primary"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;