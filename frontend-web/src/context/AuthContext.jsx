import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  registerProfessional as apiRegisterProfessional,
  getCurrentUser,
  isAuthenticated,
  validateToken,
  refreshUserData,
  tokenUtils,
} from '../api/auth';
import { TOAST_MESSAGES } from '../utils/constants';
import toast from 'react-hot-toast';

// Auth context
const AuthContext = createContext();

// Auth action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_ERROR: 'REGISTER_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  SET_INITIALIZED: 'SET_INITIALIZED',
};

// Initial auth state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.REGISTER_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };

    case AUTH_ACTIONS.SET_INITIALIZED:
      return {
        ...state,
        isInitialized: true,
      };

    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

        // Check if user is authenticated
        if (isAuthenticated()) {
          const userData = getCurrentUser();
          
          // Validate token
          const isValid = await validateToken();
          
          if (isValid && userData) {
            // Refresh user data to get latest info
            const refreshedUserData = await refreshUserData();
            dispatch({ 
              type: AUTH_ACTIONS.LOGIN_SUCCESS, 
              payload: refreshedUserData 
            });
          } else {
            // Token is invalid, clear auth state
            await apiLogout();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid auth state
        await apiLogout();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      } finally {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        dispatch({ type: AUTH_ACTIONS.SET_INITIALIZED });
      }
    };

    initializeAuth();
  }, []);

  // Set up token expiration check
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const checkTokenExpiration = () => {
      const token = localStorage.getItem('authToken');
      if (token && tokenUtils.isTokenExpired(token)) {
        console.log('Token expired, logging out...');
        logout();
        toast.error('Session expired. Please login again.');
      }
    };

    // Check token expiration every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    // Check immediately
    checkTokenExpiration();

    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await apiLogin(credentials);
      
      // Create user object from response
      const userData = {
        userId: response.userId,
        email: response.email,
        userType: response.userType,
        firstName: response.firstName,
        lastName: response.lastName,
      };

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: userData });
      toast.success(TOAST_MESSAGES.LOGIN_SUCCESS);
      
      return { success: true, data: userData };
    } catch (error) {
      const errorMessage = error.data?.message || TOAST_MESSAGES.LOGIN_ERROR;
      dispatch({ type: AUTH_ACTIONS.LOGIN_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (registrationData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      await apiRegisterProfessional(registrationData);
      
      dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS });
      toast.success(TOAST_MESSAGES.REGISTER_SUCCESS);
      
      // Auto-login after successful registration
      const loginResult = await login({
        email: registrationData.email,
        password: registrationData.password,
      });
      
      return { success: true, data: loginResult.data };
    } catch (error) {
      const errorMessage = error.data?.message || TOAST_MESSAGES.REGISTER_ERROR;
      dispatch({ type: AUTH_ACTIONS.REGISTER_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiLogout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success(TOAST_MESSAGES.LOGOUT_SUCCESS);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if API call fails
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update user data
  const updateUser = async () => {
    try {
      const refreshedUserData = await refreshUserData();
      dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: refreshedUserData });
      return refreshedUserData;
    } catch (error) {
      console.error('Error updating user data:', error);
      return state.user;
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.userType === role;
  };

  // Check if user is professional
  const isProfessional = () => {
    return hasRole('PROFESSIONAL');
  };

  // Get user's full name
  const getUserFullName = () => {
    if (!state.user) return '';
    return `${state.user.firstName} ${state.user.lastName}`.trim();
  };

  // Get user's initials
  const getUserInitials = () => {
    if (!state.user) return '';
    const first = state.user.firstName?.charAt(0)?.toUpperCase() || '';
    const last = state.user.lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}`;
  };

  // Context value
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    
    // Utilities
    hasRole,
    isProfessional,
    getUserFullName,
    getUserInitials,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// HOC for components that require authentication
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isInitialized } = useAuth();
    
    if (!isInitialized) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please log in to access this page.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="btn btn-primary"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};

export default AuthContext;