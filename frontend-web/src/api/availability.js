import apiClient, { apiHelpers } from './axios';

/**
 * Availability API service functions
 */

/**
 * Get professional by ID (to access time slots)
 * @param {string} professionalId - Professional ID
 * @returns {Promise<Object>} Professional data with time slots
 */
export const getProfessional = async (professionalId) => {
  const response = await apiClient.get(`/api/professionals/${professionalId}`);
  return response.data;
};

/**
 * Get all professionals (to find current user's professional profile)
 * @returns {Promise<Array>} List of professionals
 */
export const getAllProfessionals = async () => {
  const response = await apiClient.get('/api/professionals');
  return response.data;
};

/**
 * Get professionals with available time slots
 * @returns {Promise<Array>} List of professionals with available slots
 */
export const getProfessionalsWithAvailableSlots = async () => {
  const response = await apiClient.get('/api/professionals/available');
  return response.data;
};

/**
 * Add a time slot to professional's availability
 * @param {string} professionalId - Professional ID
 * @param {string} timeSlot - Time slot in ISO format (e.g., "2024-01-15T09:00:00")
 * @returns {Promise<Object>} Updated professional data
 */
export const addTimeSlot = async (professionalId, timeSlot) => {
  const response = await apiClient.post(`/api/professionals/${professionalId}/time-slots`, {
    timeSlot: timeSlot,
  });
  return response.data;
};

/**
 * Remove a time slot from professional's availability
 * @param {string} professionalId - Professional ID
 * @param {string} timeSlot - Time slot in ISO format
 * @returns {Promise<Object>} Updated professional data
 */
export const removeTimeSlot = async (professionalId, timeSlot) => {
  const response = await apiClient.delete(`/api/professionals/${professionalId}/time-slots`, {
    data: { timeSlot: timeSlot },
  });
  return response.data;
};

/**
 * Add an availability range
 * @param {string} professionalId - Professional ID
 * @param {Object} range - Availability range
 * @param {number} range.dayOfWeek - Day of week (1=Monday, 2=Tuesday, etc. Note: Java uses 1-7, not 0-6)
 * @param {string} range.startTime - Start time (HH:MM format)
 * @param {string} range.endTime - End time (HH:MM format)
 * @param {number} range.intervalMinutes - Interval between slots in minutes
 * @returns {Promise<Object>} Updated professional data
 */
export const addAvailabilityRange = async (professionalId, range) => {
  const response = await apiClient.post(`/api/professionals/${professionalId}/availability-ranges`, range);
  return response.data;
};

/**
 * Remove an availability range
 * @param {string} professionalId - Professional ID
 * @param {number} rangeIndex - Index of the range to remove
 * @returns {Promise<Object>} Updated professional data
 */
export const removeAvailabilityRange = async (professionalId, rangeIndex) => {
  const response = await apiClient.delete(`/api/professionals/${professionalId}/availability-ranges/${rangeIndex}`);
  return response.data;
};

/**
 * Generate time slots from availability ranges
 * @param {string} professionalId - Professional ID
 * @returns {Promise<Object>} Updated professional data with generated time slots
 */
export const generateTimeSlotsFromRanges = async (professionalId) => {
  const response = await apiClient.get(`/api/professionals/${professionalId}/generate-time-slots`);
  return response.data;
};

/**
 * Get professional's availability ranges
 * @param {string} professionalId - Professional ID
 * @returns {Promise<Array>} Array of availability ranges
 */
export const getAvailabilityRanges = async (professionalId) => {
  try {
    const professional = await getProfessional(professionalId);
    return professional.availabilityRanges || [];
  } catch (error) {
    console.error('Error fetching availability ranges:', error);
    throw error;
  }
};

/**
 * Check if a time slot is available
 * @param {string} professionalId - Professional ID
 * @param {string} timeSlot - Time slot in ISO format
 * @returns {Promise<boolean>} True if time slot is available
 */
export const isTimeSlotAvailable = async (professionalId, timeSlot) => {
  const response = await apiClient.get(`/api/professionals/${professionalId}/time-slots/${encodeURIComponent(timeSlot)}/available`);
  return response.data;
};

/**
 * Get professional's time slots
 * @param {string} professionalId - Professional ID
 * @returns {Promise<Array>} Array of time slot strings
 */
export const getTimeSlots = async (professionalId) => {
  try {
    const professional = await getProfessional(professionalId);
    return professional.availableTimeSlots || [];
  } catch (error) {
    console.error('Error fetching time slots:', error);
    throw error;
  }
};

/**
 * Bulk add multiple time slots
 * @param {string} professionalId - Professional ID
 * @param {Array<string>} timeSlots - Array of time slots in ISO format
 * @returns {Promise<Object>} Updated professional data
 */
export const addMultipleTimeSlots = async (professionalId, timeSlots) => {
  try {
    let updatedProfessional = null;
    
    // Add time slots one by one (backend doesn't support bulk operations)
    for (const timeSlot of timeSlots) {
      updatedProfessional = await addTimeSlot(professionalId, timeSlot);
    }
    
    return updatedProfessional;
  } catch (error) {
    console.error('Error adding multiple time slots:', error);
    throw error;
  }
};

/**
 * Remove multiple time slots
 * @param {string} professionalId - Professional ID
 * @param {Array<string>} timeSlots - Array of time slots in ISO format
 * @returns {Promise<Object>} Updated professional data
 */
export const removeMultipleTimeSlots = async (professionalId, timeSlots) => {
  try {
    let updatedProfessional = null;
    
    // Remove time slots one by one (backend doesn't support bulk operations)
    for (const timeSlot of timeSlots) {
      updatedProfessional = await removeTimeSlot(professionalId, timeSlot);
    }
    
    return updatedProfessional;
  } catch (error) {
    console.error('Error removing multiple time slots:', error);
    throw error;
  }
};

/**
 * Availability management utilities
 */

/**
 * Get availability statistics for a professional
 * @param {string} professionalId - Professional ID
 * @returns {Promise<Object>} Availability statistics
 */
export const getAvailabilityStats = async (professionalId) => {
  try {
    const timeSlots = await getTimeSlots(professionalId);
    const now = new Date();
    
    // Filter future time slots
    const futureSlots = timeSlots.filter(slot => {
      const slotDate = new Date(slot);
      return slotDate > now;
    });
    
    // Group by date
    const slotsByDate = futureSlots.reduce((acc, slot) => {
      const date = new Date(slot).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(slot);
      return acc;
    }, {});
    
    // Calculate statistics
    const stats = {
      totalSlots: timeSlots.length,
      futureSlots: futureSlots.length,
      pastSlots: timeSlots.length - futureSlots.length,
      datesWithAvailability: Object.keys(slotsByDate).length,
      averageSlotsPerDay: Object.keys(slotsByDate).length > 0 
        ? Math.round(futureSlots.length / Object.keys(slotsByDate).length * 10) / 10 
        : 0,
      nextAvailableSlot: futureSlots.length > 0 
        ? futureSlots.sort((a, b) => new Date(a) - new Date(b))[0] 
        : null,
    };
    
    return stats;
  } catch (error) {
    console.error('Error calculating availability stats:', error);
    throw error;
  }
};

/**
 * Get availability for a specific date range
 * @param {string} professionalId - Professional ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Time slots within the date range
 */
export const getAvailabilityForDateRange = async (professionalId, startDate, endDate) => {
  try {
    const timeSlots = await getTimeSlots(professionalId);
    
    return timeSlots.filter(slot => {
      const slotDate = new Date(slot);
      return slotDate >= startDate && slotDate <= endDate;
    });
  } catch (error) {
    console.error('Error fetching availability for date range:', error);
    throw error;
  }
};

/**
 * Get availability for a specific date
 * @param {string} professionalId - Professional ID
 * @param {Date} date - Target date
 * @returns {Promise<Array>} Time slots for the specified date
 */
export const getAvailabilityForDate = async (professionalId, date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await getAvailabilityForDateRange(professionalId, startOfDay, endOfDay);
  } catch (error) {
    console.error('Error fetching availability for date:', error);
    throw error;
  }
};

/**
 * Generate recurring time slots
 * @param {Object} config - Configuration object
 * @param {Date} config.startDate - Start date
 * @param {Date} config.endDate - End date
 * @param {Array<number>} config.daysOfWeek - Days of week (0=Sunday, 1=Monday, etc.)
 * @param {string} config.startTime - Start time (HH:MM format)
 * @param {string} config.endTime - End time (HH:MM format)
 * @param {number} config.intervalMinutes - Interval between slots in minutes
 * @returns {Array<string>} Array of time slot strings in ISO format
 */
export const generateRecurringTimeSlots = (config) => {
  const {
    startDate,
    endDate,
    daysOfWeek,
    startTime,
    endTime,
    intervalMinutes = 30,
  } = config;
  
  const slots = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Check if current day is in the selected days of week
    if (daysOfWeek.includes(currentDate.getDay())) {
      // Parse start and end times
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      // Generate slots for this day
      const dayStart = new Date(currentDate);
      dayStart.setHours(startHour, startMinute, 0, 0);
      
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(endHour, endMinute, 0, 0);
      
      const currentSlot = new Date(dayStart);
      
      while (currentSlot < dayEnd) {
        slots.push(currentSlot.toISOString());
        currentSlot.setMinutes(currentSlot.getMinutes() + intervalMinutes);
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return slots;
};

/**
 * Find current user's professional ID
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} Professional ID or null if not found
 */
export const findProfessionalIdByUserId = async (userId) => {
  try {
    const professionals = await getAllProfessionals();
    const professional = professionals.find(prof => prof.user && prof.user.id === userId);
    return professional ? professional.id : null;
  } catch (error) {
    console.error('Error finding professional ID:', error);
    return null;
  }
};