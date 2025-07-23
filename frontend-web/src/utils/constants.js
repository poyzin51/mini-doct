// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
};

// User Types
export const USER_TYPES = {
  PATIENT: 'PATIENT',
  PROFESSIONAL: 'PROFESSIONAL',
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM dd, yyyy',
  DISPLAY_TIME: 'HH:mm',
  DISPLAY_DATETIME: 'MMM dd, yyyy HH:mm',
  API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss",
  INPUT_DATE: 'yyyy-MM-dd',
  INPUT_TIME: 'HH:mm',
};

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
  PHONE_INVALID: 'Please enter a valid phone number',
  LICENSE_REQUIRED: 'License number is required',
  SPECIALIZATION_REQUIRED: 'Specialization is required',
  CONSULTATION_FEE_INVALID: 'Please enter a valid consultation fee',
};

// Toast Messages
export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  LOGIN_ERROR: 'Invalid email or password',
  REGISTER_SUCCESS: 'Registration successful!',
  REGISTER_ERROR: 'Registration failed. Please try again.',
  LOGOUT_SUCCESS: 'Logged out successfully',
  APPOINTMENT_CONFIRMED: 'Appointment confirmed successfully',
  APPOINTMENT_CANCELLED: 'Appointment cancelled successfully',
  TIME_SLOT_ADDED: 'Time slot added successfully',
  TIME_SLOT_REMOVED: 'Time slot removed successfully',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};

// Professional Score
export const SCORE_CONFIG = {
  MIN: 0,
  MAX: 100,
  DEFAULT: 0,
};

// Time Slot Configuration
export const TIME_SLOT_CONFIG = {
  DURATION_MINUTES: 30,
  START_HOUR: 8,
  END_HOUR: 18,
  DAYS_AHEAD: 30,
};

// Responsive Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};