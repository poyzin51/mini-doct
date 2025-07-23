import apiClient, { apiHelpers } from './axios';

/**
 * Appointments API service functions
 */

/**
 * Get appointments for a professional
 * @param {string} professionalId - Professional ID
 * @returns {Promise<Array>} List of appointments
 */
export const getAppointments = async (professionalId) => {
  const response = await apiClient.get(`/api/appointments/professional/${professionalId}`);
  return response.data;
};

/**
 * Get upcoming appointments for a professional
 * @param {string} professionalId - Professional ID
 * @returns {Promise<Array>} List of upcoming appointments
 */
export const getUpcomingAppointments = async (professionalId) => {
  const response = await apiClient.get(`/api/appointments/professional/${professionalId}/upcoming`);
  return response.data;
};

/**
 * Get appointments by status for a professional
 * @param {string} professionalId - Professional ID
 * @param {string} status - Appointment status (SCHEDULED, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW)
 * @returns {Promise<Array>} List of appointments with specified status
 */
export const getAppointmentsByStatus = async (professionalId, status) => {
  const response = await apiClient.get(`/api/appointments/professional/${professionalId}/status/${status}`);
  return response.data;
};

/**
 * Get a specific appointment by ID
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<Object>} Appointment details
 */
export const getAppointmentById = async (appointmentId) => {
  const response = await apiClient.get(`/api/appointments/${appointmentId}`);
  return response.data;
};

/**
 * Confirm an appointment (professional action)
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<Object>} Updated appointment
 */
export const confirmAppointment = async (appointmentId) => {
  const response = await apiClient.put(`/api/appointments/${appointmentId}/confirm`);
  return response.data;
};

/**
 * Complete an appointment (professional action)
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<Object>} Updated appointment
 */
export const completeAppointment = async (appointmentId) => {
  const response = await apiClient.put(`/api/appointments/${appointmentId}/complete`);
  return response.data;
};

/**
 * Cancel an appointment
 * @param {string} appointmentId - Appointment ID
 * @param {string} userId - User ID (professional or patient)
 * @returns {Promise<Object>} Updated appointment
 */
export const cancelAppointment = async (appointmentId, userId) => {
  const response = await apiClient.put(`/api/appointments/${appointmentId}/cancel`, {
    userId: userId,
  });
  return response.data;
};

/**
 * Update an appointment
 * @param {string} appointmentId - Appointment ID
 * @param {Object} updateData - Update data
 * @param {string} updateData.appointmentDateTime - New appointment date/time (ISO string)
 * @param {string} updateData.timeSlot - New time slot
 * @param {string} [updateData.reason] - Updated reason
 * @returns {Promise<Object>} Updated appointment
 */
export const updateAppointment = async (appointmentId, updateData) => {
  const response = await apiClient.put(`/api/appointments/${appointmentId}`, updateData);
  return response.data;
};

/**
 * Get all appointments with a specific status (admin function)
 * @param {string} status - Appointment status
 * @returns {Promise<Array>} List of appointments
 */
export const getAllAppointmentsByStatus = async (status) => {
  const response = await apiClient.get(`/api/appointments/status/${status}`);
  return response.data;
};

/**
 * Appointment statistics and analytics
 */

/**
 * Get appointment statistics for a professional
 * @param {string} professionalId - Professional ID
 * @param {Object} options - Query options
 * @param {string} [options.startDate] - Start date for statistics (ISO string)
 * @param {string} [options.endDate] - End date for statistics (ISO string)
 * @returns {Promise<Object>} Appointment statistics
 */
export const getAppointmentStats = async (professionalId, options = {}) => {
  try {
    // Get all appointments for the professional
    const appointments = await getAppointments(professionalId);
    
    // Filter by date range if provided
    let filteredAppointments = appointments;
    if (options.startDate || options.endDate) {
      filteredAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.appointmentDateTime);
        const start = options.startDate ? new Date(options.startDate) : null;
        const end = options.endDate ? new Date(options.endDate) : null;
        
        if (start && appointmentDate < start) return false;
        if (end && appointmentDate > end) return false;
        return true;
      });
    }
    
    // Calculate statistics
    const stats = {
      total: filteredAppointments.length,
      scheduled: filteredAppointments.filter(a => a.status === 'SCHEDULED').length,
      confirmed: filteredAppointments.filter(a => a.status === 'CONFIRMED').length,
      completed: filteredAppointments.filter(a => a.status === 'COMPLETED').length,
      cancelled: filteredAppointments.filter(a => a.status === 'CANCELLED').length,
      noShow: filteredAppointments.filter(a => a.status === 'NO_SHOW').length,
      upcoming: filteredAppointments.filter(a => {
        const appointmentDate = new Date(a.appointmentDateTime);
        return appointmentDate > new Date() && (a.status === 'SCHEDULED' || a.status === 'CONFIRMED');
      }).length,
      totalRevenue: filteredAppointments
        .filter(a => a.status === 'COMPLETED')
        .reduce((sum, a) => sum + (a.consultationFee || 0), 0),
    };
    
    return stats;
  } catch (error) {
    console.error('Error calculating appointment stats:', error);
    throw error;
  }
};

/**
 * Get recent appointments for dashboard
 * @param {string} professionalId - Professional ID
 * @param {number} limit - Number of appointments to return (default: 5)
 * @returns {Promise<Array>} Recent appointments
 */
export const getRecentAppointments = async (professionalId, limit = 5) => {
  try {
    const appointments = await getAppointments(professionalId);
    
    // Sort by creation date (most recent first) and limit
    return appointments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent appointments:', error);
    throw error;
  }
};

/**
 * Get today's appointments for a professional
 * @param {string} professionalId - Professional ID
 * @returns {Promise<Array>} Today's appointments
 */
export const getTodaysAppointments = async (professionalId) => {
  try {
    const appointments = await getAppointments(professionalId);
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDateTime);
      return appointmentDate >= startOfDay && appointmentDate < endOfDay;
    });
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    throw error;
  }
};

/**
 * Search appointments by patient name or reason
 * @param {string} professionalId - Professional ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Filtered appointments
 */
export const searchAppointments = async (professionalId, searchTerm) => {
  try {
    const appointments = await getAppointments(professionalId);
    const term = searchTerm.toLowerCase();
    
    return appointments.filter(appointment => {
      const patientName = `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.toLowerCase();
      const reason = (appointment.reason || '').toLowerCase();
      
      return patientName.includes(term) || reason.includes(term);
    });
  } catch (error) {
    console.error('Error searching appointments:', error);
    throw error;
  }
};