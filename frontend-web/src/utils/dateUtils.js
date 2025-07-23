import { format, parseISO, isValid, addDays, startOfDay, endOfDay, isBefore, isAfter, isSameDay } from 'date-fns';
import { DATE_FORMATS } from './constants';

/**
 * Format a date for display
 * @param {Date|string} date - Date to format
 * @param {string} formatString - Format string (defaults to display date)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatString = DATE_FORMATS.DISPLAY_DATE) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format a date and time for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date) => {
  return formatDate(date, DATE_FORMATS.DISPLAY_DATETIME);
};

/**
 * Format time only for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  return formatDate(date, DATE_FORMATS.DISPLAY_TIME);
};

/**
 * Format date for API requests
 * @param {Date|string} date - Date to format
 * @returns {string} API-formatted date string
 */
export const formatForAPI = (date) => {
  return formatDate(date, DATE_FORMATS.API_DATETIME);
};

/**
 * Parse ISO date string to Date object
 * @param {string} dateString - ISO date string
 * @returns {Date|null} Parsed date or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) && isBefore(dateObj, new Date());
};

/**
 * Check if a date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) && isAfter(dateObj, new Date());
};

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) && isSameDay(dateObj, new Date());
};

/**
 * Get date range for availability (next N days)
 * @param {number} daysAhead - Number of days ahead
 * @returns {Date[]} Array of dates
 */
export const getAvailabilityDateRange = (daysAhead = 30) => {
  const dates = [];
  const today = startOfDay(new Date());
  
  for (let i = 0; i < daysAhead; i++) {
    dates.push(addDays(today, i));
  }
  
  return dates;
};

/**
 * Generate time slots for a given date
 * @param {Date} date - Date to generate slots for
 * @param {number} startHour - Start hour (24h format)
 * @param {number} endHour - End hour (24h format)
 * @param {number} intervalMinutes - Interval in minutes
 * @returns {string[]} Array of time slot strings
 */
export const generateTimeSlots = (date, startHour = 8, endHour = 18, intervalMinutes = 30) => {
  const slots = [];
  const baseDate = startOfDay(date);
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const slotDate = new Date(baseDate);
      slotDate.setHours(hour, minute, 0, 0);
      slots.push(formatForAPI(slotDate));
    }
  }
  
  return slots;
};

/**
 * Get relative time description (e.g., "in 2 hours", "2 days ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time description
 */
export const getRelativeTime = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (Math.abs(diffMinutes) < 60) {
    return diffMinutes > 0 ? `in ${diffMinutes} minutes` : `${Math.abs(diffMinutes)} minutes ago`;
  } else if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `in ${diffHours} hours` : `${Math.abs(diffHours)} hours ago`;
  } else {
    return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
  }
};

/**
 * Combine date and time strings into a single Date object
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @param {string} timeString - Time string (HH:MM)
 * @returns {Date|null} Combined date object
 */
export const combineDateAndTime = (dateString, timeString) => {
  if (!dateString || !timeString) return null;
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = parseISO(dateString);
    
    if (!isValid(date) || isNaN(hours) || isNaN(minutes)) return null;
    
    date.setHours(hours, minutes, 0, 0);
    return date;
  } catch (error) {
    console.error('Error combining date and time:', error);
    return null;
  }
};