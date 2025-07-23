import apiClient, { apiHelpers } from './axios';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Authentication API service functions
 */

/**
 * Login user with email and password
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Login response with token and user data
 */
export const login = async (credentials) => {
  const response = await apiClient.post('/api/auth/login', credentials);
  
  // Store token and user data in localStorage
  if (response.data.token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
    
    const userData = {
      userId: response.data.userId,
      email: response.data.email,
      userType: response.data.userType,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
    };
    
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }
  
  return response.data;
};

/**
 * Register a new professional
 * @param {Object} registrationData - Professional registration data
 * @param {string} registrationData.email - Professional email
 * @param {string} registrationData.password - Professional password
 * @param {string} registrationData.firstName - Professional first name
 * @param {string} registrationData.lastName - Professional last name
 * @param {string} registrationData.phoneNumber - Professional phone number
 * @param {string} registrationData.specialization - Professional specialization
 * @param {string} registrationData.licenseNumber - Professional license number
 * @param {string} [registrationData.description] - Professional description
 * @param {string} [registrationData.address] - Professional address
 * @param {number} [registrationData.consultationFee] - Consultation fee
 * @returns {Promise<Object>} Registration response
 */
export const registerProfessional = async (registrationData) => {
  const response = await apiClient.post('/api/auth/register/professional', registrationData);
  return response.data;
};

/**
 * Logout user by clearing stored data
 * @returns {Promise<void>}
 */
export const logout = async () => {
  // Clear stored authentication data
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  
  // Note: Backend doesn't have a logout endpoint, so we just clear local data
  return Promise.resolve();
};

/**
 * Get current user data from localStorage
 * @returns {Object|null} User data or null if not logged in
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    return null;
  }
};

/**
 * Get current auth token from localStorage
 * @returns {string|null} Auth token or null if not logged in
 */
export const getAuthToken = () => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  const userData = getCurrentUser();
  return !!(token && userData);
};

/**
 * Check if current user is a professional
 * @returns {boolean} True if user is a professional
 */
export const isProfessional = () => {
  const userData = getCurrentUser();
  return userData?.userType === 'PROFESSIONAL';
};

/**
 * Validate token by making a test API call
 * @returns {Promise<boolean>} True if token is valid
 */
export const validateToken = async () => {
  try {
    const token = getAuthToken();
    if (!token) return false;
    
    // Make a simple API call to validate token
    // We'll use the professionals endpoint since it requires authentication
    await apiClient.get('/api/professionals');
    return true;
  } catch (error) {
    // If token is invalid, clear stored data
    if (error.type === 'AUTH_ERROR') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
    return false;
  }
};

/**
 * Refresh user data (useful after profile updates)
 * @returns {Promise<Object>} Updated user data
 */
export const refreshUserData = async () => {
  const userData = getCurrentUser();
  if (!userData) throw new Error('No user data found');
  
  // Since backend doesn't have a dedicated user info endpoint,
  // we'll need to get professional data if user is a professional
  if (userData.userType === 'PROFESSIONAL') {
    try {
      // Get professional data to refresh user info
      const response = await apiClient.get('/api/professionals');
      const professionals = response.data;
      
      // Find current user's professional profile
      const currentProfessional = professionals.find(prof => 
        prof.user && prof.user.id === userData.userId
      );
      
      if (currentProfessional) {
        const updatedUserData = {
          ...userData,
          firstName: currentProfessional.user.firstName,
          lastName: currentProfessional.user.lastName,
          email: currentProfessional.user.email,
          professionalId: currentProfessional.id,
          specialization: currentProfessional.specialization,
          score: currentProfessional.score,
        };
        
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUserData));
        return updatedUserData;
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }
  
  return userData;
};

/**
 * Token management utilities
 */
export const tokenUtils = {
  /**
   * Decode JWT token payload (without verification)
   * @param {string} token - JWT token
   * @returns {Object|null} Decoded payload or null if invalid
   */
  decodeToken: (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} True if token is expired
   */
  isTokenExpired: (token) => {
    const payload = tokenUtils.decodeToken(token);
    if (!payload || !payload.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  },

  /**
   * Get token expiration time
   * @param {string} token - JWT token
   * @returns {Date|null} Expiration date or null if invalid
   */
  getTokenExpiration: (token) => {
    const payload = tokenUtils.decodeToken(token);
    if (!payload || !payload.exp) return null;
    
    return new Date(payload.exp * 1000);
  },

  /**
   * Check if token will expire soon (within specified minutes)
   * @param {string} token - JWT token
   * @param {number} minutesThreshold - Minutes threshold (default: 5)
   * @returns {boolean} True if token will expire soon
   */
  willExpireSoon: (token, minutesThreshold = 5) => {
    const expirationDate = tokenUtils.getTokenExpiration(token);
    if (!expirationDate) return true;
    
    const thresholdTime = new Date(Date.now() + (minutesThreshold * 60 * 1000));
    return expirationDate <= thresholdTime;
  },
};