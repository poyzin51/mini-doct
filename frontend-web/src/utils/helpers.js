/**
 * Utility helper functions
 */

/**
 * Combine class names utility (similar to clsx)
 * @param {...any} classes - Class names to combine
 * @returns {string} Combined class names
 */
export const cn = (...classes) => {
  return classes
    .filter(Boolean)
    .join(' ');
};

/**
 * Debounce function to limit the rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit the rate of function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Generate a random ID
 * @param {number} length - Length of the ID
 * @returns {string} Random ID
 */
export const generateId = (length = 8) => {
  return Math.random().toString(36).substring(2, length + 2);
};

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format a name for display
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Formatted full name
 */
export const formatName = (firstName, lastName) => {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  return `${first} ${last}`.trim();
};

/**
 * Get initials from a name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Initials
 */
export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}`;
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (typeof amount !== 'number') return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original if not a standard format
  return phone;
};

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
};

/**
 * Sort array of objects by a property
 * @param {Array} array - Array to sort
 * @param {string} property - Property to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export const sortByProperty = (array, property, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Filter array of objects by search term
 * @param {Array} array - Array to filter
 * @param {string} searchTerm - Search term
 * @param {Array} searchFields - Fields to search in
 * @returns {Array} Filtered array
 */
export const filterBySearch = (array, searchTerm, searchFields) => {
  if (!searchTerm) return array;
  
  const term = searchTerm.toLowerCase();
  return array.filter(item => 
    searchFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(term);
    })
  );
};

/**
 * Get status color class for appointment status
 * @param {string} status - Appointment status
 * @returns {string} CSS class name
 */
export const getStatusColor = (status) => {
  const statusColors = {
    SCHEDULED: 'text-warning-600 bg-warning-100',
    CONFIRMED: 'text-primary-600 bg-primary-100',
    COMPLETED: 'text-success-600 bg-success-100',
    CANCELLED: 'text-error-600 bg-error-100',
    NO_SHOW: 'text-gray-600 bg-gray-100',
  };
  
  return statusColors[status] || 'text-gray-600 bg-gray-100';
};

/**
 * Group array of objects by a property or function
 * @param {Array} array - Array to group
 * @param {string|Function} keyOrFn - Property name or function to group by
 * @returns {Object} Grouped object
 */
export const groupBy = (array, keyOrFn) => {
  return array.reduce((groups, item) => {
    const key = typeof keyOrFn === 'function' ? keyOrFn(item) : item[keyOrFn];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

/**
 * Get score color class based on score value
 * @param {number} score - Score value (0-100)
 * @returns {string} CSS class name
 */
export const getScoreColor = (score) => {
  if (score >= 80) return 'text-success-600';
  if (score >= 60) return 'text-warning-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-error-600';
};