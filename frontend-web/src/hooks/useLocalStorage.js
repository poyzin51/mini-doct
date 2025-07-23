import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @returns {[any, Function]} Current value and setter function
 */
export const useLocalStorage = (key, initialValue) => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (valueToStore === undefined || valueToStore === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
};

/**
 * Hook for managing authentication token in localStorage
 * @returns {[string|null, Function, Function]} Token, setter, and remover
 */
export const useAuthToken = () => {
  const [token, setToken] = useLocalStorage('authToken', null);

  const removeToken = () => {
    setToken(null);
  };

  return [token, setToken, removeToken];
};

/**
 * Hook for managing user data in localStorage
 * @returns {[Object|null, Function, Function]} User data, setter, and remover
 */
export const useUserData = () => {
  const [userData, setUserData] = useLocalStorage('userData', null);

  const removeUserData = () => {
    setUserData(null);
  };

  return [userData, setUserData, removeUserData];
};

export default useLocalStorage;