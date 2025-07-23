import React from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

/**
 * Appointment filters component
 */
const AppointmentFilters = ({
  filters,
  onFilterChange,
  onSearch,
  searchTerm,
  appointmentsCount = 0,
  filteredCount = 0,
}) => {
  // Handle search input change
  const handleSearchChange = (e) => {
    onSearch(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  // Clear all filters
  const clearFilters = () => {
    onFilterChange({
      status: 'all',
      dateRange: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
    });
    onSearch('');
  };

  // Check if any filters are active
  const hasActiveFilters = filters.status !== 'all' || 
                          filters.dateRange !== 'all' || 
                          searchTerm.trim() !== '';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="space-y-4">
        {/* Search */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by patient name, email, or reason..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {searchTerm && (
              <button
                onClick={() => onSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="past">Past</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="date">Date</option>
              <option value="patient">Patient Name</option>
              <option value="status">Status</option>
              <option value="created">Created Date</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Filter Actions and Results */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            {hasActiveFilters && (
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
            
            <span className="text-sm text-gray-600">
              {filteredCount !== appointmentsCount ? (
                <>
                  Showing <span className="font-medium">{filteredCount}</span> of{' '}
                  <span className="font-medium">{appointmentsCount}</span> appointments
                </>
              ) : (
                <>
                  <span className="font-medium">{appointmentsCount}</span> appointments total
                </>
              )}
            </span>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('dateRange', 'today')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filters.dateRange === 'today'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleFilterChange('dateRange', 'upcoming')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filters.dateRange === 'upcoming'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => handleFilterChange('status', 'CONFIRMED')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filters.status === 'CONFIRMED'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Confirmed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentFilters;