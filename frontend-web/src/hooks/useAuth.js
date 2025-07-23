import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Custom hook to use authentication context
 * This is a convenience hook that provides the same functionality as useAuth from AuthContext
 * but can be imported separately for better organization
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;