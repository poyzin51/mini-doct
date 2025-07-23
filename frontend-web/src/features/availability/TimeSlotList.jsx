import React, { useState, useEffect } from 'react';
import { getTimeSlots, removeTimeSlot, removeMultipleTimeSlots } from '../../api/availability';
import { formatDateTime, formatDate, formatTime, isToday, isPastDate } from '../../utils/dateUtils';
import { sortByProperty, groupBy } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import EmptyState, { NoAvailability } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

/**
 * Time slot list component for managing availability
 */
const TimeSlotList = ({ professionalId, onSlotsChanged, showAddForm }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'time'
  const [groupByDate, setGroupByDate] = useState(true);

  // Fetch time slots
  const fetchTimeSlots = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const slots = await getTimeSlots(professionalId);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      setError('Failed to load time slots. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (professionalId) {
      fetchTimeSlots();
    }
  }, [professionalId]);

  // Filter and sort time slots
  const getFilteredAndSortedSlots = () => {
    let filtered = [...timeSlots];
    const now = new Date();

    // Apply filter
    switch (filter) {
      case 'upcoming':
        filtered = filtered.filter(slot => new Date(slot) > now);
        break;
      case 'past':
        filtered = filtered.filter(slot => new Date(slot) <= now);
        break;
      case 'today':
        filtered = filtered.filter(slot => isToday(new Date(slot)));
        break;
      default:
        break;
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return sortBy === 'date' ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  };

  // Group time slots by date
  const getGroupedSlots = () => {
    const filtered = getFilteredAndSortedSlots();
    
    if (!groupByDate) {
      return { 'All Slots': filtered };
    }

    const grouped = {};
    filtered.forEach(slot => {
      const date = formatDate(slot);
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(slot);
    });

    return grouped;
  };

  // Handle slot selection
  const handleSlotSelection = (slot, checked) => {
    const newSelected = new Set(selectedSlots);
    if (checked) {
      newSelected.add(slot);
    } else {
      newSelected.delete(slot);
    }
    setSelectedSlots(newSelected);
  };

  // Handle select all for a date group
  const handleSelectAllForDate = (slots, checked) => {
    const newSelected = new Set(selectedSlots);
    slots.forEach(slot => {
      if (checked) {
        newSelected.add(slot);
      } else {
        newSelected.delete(slot);
      }
    });
    setSelectedSlots(newSelected);
  };

  // Handle delete selected slots
  const handleDeleteSelected = async () => {
    if (selectedSlots.size === 0) return;

    const slotsArray = Array.from(selectedSlots);
    const confirmMessage = `Are you sure you want to delete ${slotsArray.length} time slot${slotsArray.length > 1 ? 's' : ''}?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      setIsDeleting(true);
      
      if (slotsArray.length === 1) {
        await removeTimeSlot(professionalId, slotsArray[0]);
      } else {
        await removeMultipleTimeSlots(professionalId, slotsArray);
      }
      
      toast.success(`${slotsArray.length} time slot${slotsArray.length > 1 ? 's' : ''} deleted successfully`);
      setSelectedSlots(new Set());
      await fetchTimeSlots();
      onSlotsChanged?.();
    } catch (error) {
      console.error('Error deleting time slots:', error);
      toast.error('Failed to delete time slots');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete single slot
  const handleDeleteSlot = async (slot) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;

    try {
      await removeTimeSlot(professionalId, slot);
      toast.success('Time slot deleted successfully');
      await fetchTimeSlots();
      onSlotsChanged?.();
    } catch (error) {
      console.error('Error deleting time slot:', error);
      toast.error('Failed to delete time slot');
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedSlots(new Set());
  };

  const filteredSlots = getFilteredAndSortedSlots();
  const groupedSlots = getGroupedSlots();

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Time Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Time Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-error-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Time Slots</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchTimeSlots} variant="primary">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (timeSlots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Time Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <NoAvailability onAddSlots={showAddForm} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Available Time Slots ({timeSlots.length})</CardTitle>
          
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            {selectedSlots.size > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {selectedSlots.size} selected
                </span>
                <Button
                  size="sm"
                  variant="error"
                  onClick={handleDeleteSelected}
                  loading={isDeleting}
                  disabled={isDeleting}
                >
                  Delete Selected
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={clearSelection}
                >
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Time Slots</option>
              <option value="upcoming">Upcoming</option>
              <option value="today">Today</option>
              <option value="past">Past</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="date">Sort by Date</option>
              <option value="time">Sort by Time</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={groupByDate}
                onChange={(e) => setGroupByDate(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Group by date</span>
            </label>

            <span className="text-sm text-gray-600">
              Showing {filteredSlots.length} of {timeSlots.length}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredSlots.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No time slots match the current filter.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSlots).map(([dateGroup, slots]) => (
              <div key={dateGroup}>
                {groupByDate && (
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {dateGroup}
                      {isToday(new Date(slots[0])) && (
                        <span className="ml-2 text-sm font-normal text-primary-600">(Today)</span>
                      )}
                    </h3>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{slots.length} slots</span>
                      <button
                        onClick={() => {
                          const allSelected = slots.every(slot => selectedSlots.has(slot));
                          handleSelectAllForDate(slots, !allSelected);
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        {slots.every(slot => selectedSlots.has(slot)) ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {slots.map((slot) => {
                    const slotDate = new Date(slot);
                    const isPast = isPastDate(slotDate);
                    const isSelected = selectedSlots.has(slot);

                    return (
                      <div
                        key={slot}
                        className={`relative p-3 border rounded-lg transition-colors ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : isPast
                            ? 'border-gray-200 bg-gray-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleSlotSelection(slot, e.target.checked)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <div>
                              {!groupByDate && (
                                <div className="text-sm font-medium text-gray-900">
                                  {formatDate(slot)}
                                </div>
                              )}
                              <div className={`text-sm ${isPast ? 'text-gray-500' : 'text-gray-700'}`}>
                                {formatTime(slot)}
                              </div>
                              {isPast && (
                                <div className="text-xs text-gray-400">Past</div>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteSlot(slot)}
                            className="text-gray-400 hover:text-error-600 transition-colors"
                            title="Delete time slot"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeSlotList;