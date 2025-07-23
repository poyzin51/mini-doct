import React, { useState, useEffect } from 'react';
import { getAppointments, searchAppointments } from '../../api/appointments';
import { useAuth } from '../../context/AuthContext';
import AppointmentCard from './AppointmentCard';
import AppointmentFilters from './AppointmentFilters';
import Loader from '../../components/ui/Loader';
import EmptyState, { NoAppointments, NoSearchResults } from '../../components/ui/EmptyState';
import { sortByProperty, filterBySearch } from '../../utils/helpers';
import { debounce } from '../../utils/helpers';

/**
 * Appointments list component with filtering and search
 */
const AppointmentsList = ({ professionalId, showFilters = true, limit = null }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getAppointments(professionalId);
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (professionalId) {
      fetchAppointments();
    }
  }, [professionalId]);

  // Filter and sort appointments
  useEffect(() => {
    let filtered = [...appointments];

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === filters.status);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(appointment => {
            const appointmentDate = new Date(appointment.appointmentDateTime);
            const appointmentDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
            return appointmentDay.getTime() === today.getTime();
          });
          break;
        case 'upcoming':
          filtered = filtered.filter(appointment => {
            const appointmentDate = new Date(appointment.appointmentDateTime);
            return appointmentDate > now && (appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED');
          });
          break;
        case 'past':
          filtered = filtered.filter(appointment => {
            const appointmentDate = new Date(appointment.appointmentDateTime);
            return appointmentDate < now;
          });
          break;
        case 'thisWeek':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          
          filtered = filtered.filter(appointment => {
            const appointmentDate = new Date(appointment.appointmentDateTime);
            return appointmentDate >= weekStart && appointmentDate < weekEnd;
          });
          break;
        case 'thisMonth':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          
          filtered = filtered.filter(appointment => {
            const appointmentDate = new Date(appointment.appointmentDateTime);
            return appointmentDate >= monthStart && appointmentDate < monthEnd;
          });
          break;
      }
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(appointment => {
        const patientName = `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.toLowerCase();
        const reason = (appointment.reason || '').toLowerCase();
        const email = (appointment.patient?.email || '').toLowerCase();
        
        return patientName.includes(term) || reason.includes(term) || email.includes(term);
      });
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'date':
        filtered = sortByProperty(filtered, 'appointmentDateTime', filters.sortOrder);
        break;
      case 'patient':
        filtered = filtered.sort((a, b) => {
          const nameA = `${a.patient?.firstName || ''} ${a.patient?.lastName || ''}`.toLowerCase();
          const nameB = `${b.patient?.firstName || ''} ${b.patient?.lastName || ''}`.toLowerCase();
          return filters.sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
        break;
      case 'status':
        filtered = sortByProperty(filtered, 'status', filters.sortOrder);
        break;
      case 'created':
        filtered = sortByProperty(filtered, 'createdAt', filters.sortOrder);
        break;
    }

    // Apply limit if specified
    if (limit && limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    setFilteredAppointments(filtered);
  }, [appointments, filters, searchTerm, limit]);

  // Debounced search handler
  const debouncedSearch = debounce((term) => {
    setSearchTerm(term);
  }, 300);

  // Handle appointment update
  const handleAppointmentUpdate = (updatedAppointment) => {
    setAppointments(prev => 
      prev.map(appointment => 
        appointment.id === updatedAppointment.id ? updatedAppointment : appointment
      )
    );
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle search
  const handleSearch = (term) => {
    debouncedSearch(term);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Retry loading
  const handleRetry = () => {
    fetchAppointments();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="flex space-x-4">
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-error-50 rounded-lg p-6 max-w-md mx-auto">
          <svg
            className="h-12 w-12 text-error-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Appointments
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (appointments.length === 0) {
    return (
      <div>
        {showFilters && (
          <AppointmentFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            searchTerm={searchTerm}
            appointmentsCount={appointments.length}
          />
        )}
        <NoAppointments 
          onAddAvailability={() => window.location.href = '/availability'}
        />
      </div>
    );
  }

  // No search results
  if (searchTerm && filteredAppointments.length === 0) {
    return (
      <div>
        {showFilters && (
          <AppointmentFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            searchTerm={searchTerm}
            appointmentsCount={appointments.length}
          />
        )}
        <NoSearchResults 
          searchTerm={searchTerm}
          onClearSearch={handleClearSearch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <AppointmentFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          searchTerm={searchTerm}
          appointmentsCount={appointments.length}
          filteredCount={filteredAppointments.length}
        />
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredAppointments.length} of {appointments.length} appointments
          {searchTerm && ` for "${searchTerm}"`}
        </p>
        
        {!showFilters && (
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange({ sortBy, sortOrder });
              }}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="patient-asc">Patient A-Z</option>
              <option value="patient-desc">Patient Z-A</option>
              <option value="status-asc">Status A-Z</option>
            </select>
          </div>
        )}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onUpdate={handleAppointmentUpdate}
            currentUserId={user?.userId}
          />
        ))}
      </div>

      {/* Load More (if limit is applied and there are more items) */}
      {limit && filteredAppointments.length >= limit && appointments.length > limit && (
        <div className="text-center">
          <button
            onClick={() => window.location.href = '/appointments'}
            className="btn btn-secondary"
          >
            View All Appointments
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;