import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../auth/AuthLayout';
import LoginForm from '../auth/LoginForm';
import Loader from '../components/ui/Loader';

/**
 * Login page component
 */
const LoginPage = () => {
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

  // Handle successful login
  const handleLoginSuccess = (userData) => {
    console.log('Login successful:', userData);
    navigate(from, { replace: true });
  };

  // Handle switch to register
  const handleSwitchToRegister = () => {
    navigate('/register', { 
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
    <AuthLayout>
      <LoginForm
        onSuccess={handleLoginSuccess}
        onSwitchToRegister={handleSwitchToRegister}
      />
    </AuthLayout>
  );
};

export default LoginPage;