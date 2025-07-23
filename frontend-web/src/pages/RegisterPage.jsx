import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../auth/AuthLayout';
import RegisterForm from '../auth/RegisterForm';
import Loader from '../components/ui/Loader';

/**
 * Registration page component
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isInitialized } = useAuth();

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isInitialized, navigate, from]);

  // Handle successful registration
  const handleRegistrationSuccess = (userData) => {
    console.log('Registration successful:', userData);
    navigate(from, { replace: true });
  };

  // Handle switch to login
  const handleSwitchToLogin = () => {
    navigate('/login', { 
      state: { from: location.state?.from },
      replace: true 
    });
  };

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  // Don't render if already authenticated (will redirect)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Redirecting..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center">
          <div className="flex items-center">
            {/* Logo */}
            <div className="bg-primary-600 rounded-lg p-2 mr-3">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mini Docto+</h1>
              <p className="text-sm text-gray-600">Professional Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm
            onSuccess={handleRegistrationSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          © 2024 Mini Docto+. All rights reserved.
        </p>
        <div className="mt-2 space-x-4">
          <a
            href="#"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;