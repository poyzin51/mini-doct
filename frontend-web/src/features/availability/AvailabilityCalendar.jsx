import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { getTimeSlots, getAvailabilityForDate } from '../../api/availability';
import { formatDate, formatTime, isToday, isPastDate } from '../../utils/dateUtils';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import 'react-calendar/dist/Calendar.css';

/**
 * Availability calendar component
 */
const AvailabilityCalendar = ({ professionalId, onDateSelect, selectedDate, onSlotsChanged }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDateSlots, setSelectedDateSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDateSlots, setIsLoadingDateSlots] = useState(false);
  const [calendarDate, setCalendarDate] = useState(selectedDate || new Date());

  // Fetch all time slots for calendar highlighting
  const fetchTimeSlots = async () => {
    try {
      setIsLoading(true);
      const slots = await getTimeSlots(professionalId);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch time slots for selected date
  const fetchDateSlots = async (date) => {
    try {
      setIsLoadingDateSlots(true);
      const slots = await getAvailabilityForDate(professionalId, date);
      setSelectedDateSlots(slots);
    } catch (error) {
      console.error('Error fetching date slots:', error);
      setSelectedDateSlots([]);
    } finally {
      setIsLoadingDateSlots(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (professionalId) {
      fetchTimeSlots();
    }
  }, [professionalId]);

  // Load slots for selected date
  useEffect(() => {
    if (professionalId && calendarDate) {
      fetchDateSlots(calendarDate);
    }
  }, [professionalId, calendarDate]);

  // Refresh when slots change
  useEffect(() => {
    if (onSlotsChanged) {
      fetchTimeSlots();
      if (calendarDate) {
        fetchDateSlots(calendarDate);
      }
    }
  }, [onSlotsChanged]);

  // Get dates that have availability
  const getDatesWithAvailability = () => {
    const dates = new Set();
    timeSlots.forEach(slot => {
      const date = new Date(slot);
      const dateString = date.toDateString();
      dates.add(dateString);
    });
    return dates;
  };

  // Handle date selection
  const handleDateChange = (date) => {
    setCalendarDate(date);
    onDateSelect?.(date);
  };

  // Custom tile content for calendar
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const datesWithAvailability = getDatesWithAvailability();
    const hasAvailability = datesWithAvailability.has(date.toDateString());
    const isPast = isPastDate(date);
    const today = isToday(date);

    if (hasAvailability) {
      const daySlots = timeSlots.filter(slot => {
        const slotDate = new Date(slot);
        return slotDate.toDateString() === date.toDateString();
      });

      return (
        <div className="flex flex-col items-center">
          <div className={`w-2 h-2 rounded-full mt-1 ${
            isPast ? 'bg-gray-400' : today ? 'bg-primary-600' : 'bg-success-500'
          }`} />
          <div className="text-xs text-gray-600 mt-1">
            {daySlots.length}
          </div>
        </div>
      );
    }

    return null;
  };

  // Custom tile class name
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;

    const classes = [];
    const datesWithAvailability = getDatesWithAvailability();
    const hasAvailability = datesWithAvailability.has(date.toDateString());
    const isPast = isPastDate(date);
    const today = isToday(date);

    if (hasAvailability) {
      if (isPast) {
        classes.push('availability-past');
      } else if (today) {
        classes.push('availability-today');
      } else {
        classes.push('availability-future');
      }
    }

    return classes.join(' ');
  };

  const datesWithAvailability = getDatesWithAvailability();

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Availability Calendar</CardTitle>
          <p className="text-sm text-gray-600">
            Click on a date to view available time slots. Dates with dots have availability.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader size="lg" text="Loading calendar..." />
            </div>
          ) : (
            <div className="calendar-container">
              <Calendar
                onChange={handleDateChange}
                value={calendarDate}
                tileContent={tileContent}
                tileClassName={tileClassName}
                minDate={new Date()}
                className="w-full"
              />
              
              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-success-500"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span>Past</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      <Card>
        <CardHeader>
          <CardTitle>
            {formatDate(calendarDate)}
            {isToday(calendarDate) && (
              <span className="ml-2 text-sm font-normal text-primary-600">(Today)</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingDateSlots ? (
            <div className="flex justify-center py-4">
              <Loader size="md" text="Loading time slots..." />
            </div>
          ) : selectedDateSlots.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No availability</h3>
              <p className="text-gray-600 mb-4">
                No time slots are available for {formatDate(calendarDate)}.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  // TODO: Open add time slot form with pre-selected date
                  alert('Add time slot functionality would open here');
                }}
              >
                Add Time Slots
              </Button>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {selectedDateSlots.length} time slot{selectedDateSlots.length !== 1 ? 's' : ''} available
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {selectedDateSlots
                  .sort((a, b) => new Date(a) - new Date(b))
                  .map((slot) => {
                    const slotDate = new Date(slot);
                    const isPast = isPastDate(slotDate);
                    
                    return (
                      <div
                        key={slot}
                        className={`p-2 text-center text-sm rounded-lg border ${
                          isPast
                            ? 'bg-gray-50 text-gray-500 border-gray-200'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                        }`}
                      >
                        {formatTime(slot)}
                        {isPast && (
                          <div className="text-xs text-gray-400 mt-1">Past</div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar Styles */}
      <style jsx global>{`
        .calendar-container .react-calendar {
          width: 100%;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-family: inherit;
        }

        .calendar-container .react-calendar__tile {
          position: relative;
          padding: 0.75rem 0.5rem;
          background: none;
          border: none;
          font-size: 0.875rem;
        }

        .calendar-container .react-calendar__tile:enabled:hover,
        .calendar-container .react-calendar__tile:enabled:focus {
          background-color: #f3f4f6;
        }

        .calendar-container .react-calendar__tile--active {
          background: #3b82f6 !important;
          color: white;
        }

        .calendar-container .react-calendar__tile--active:enabled:hover,
        .calendar-container .react-calendar__tile--active:enabled:focus {
          background: #2563eb !important;
        }

        .calendar-container .availability-future {
          background-color: #f0fdf4;
          color: #166534;
        }

        .calendar-container .availability-today {
          background-color: #eff6ff;
          color: #1d4ed8;
        }

        .calendar-container .availability-past {
          background-color: #f9fafb;
          color: #6b7280;
        }

        .calendar-container .react-calendar__navigation button {
          color: #374151;
          font-size: 1rem;
          font-weight: 500;
        }

        .calendar-container .react-calendar__navigation button:enabled:hover,
        .calendar-container .react-calendar__navigation button:enabled:focus {
          background-color: #f3f4f6;
        }

        .calendar-container .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-weight: 600;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .calendar-container .react-calendar__month-view__weekdays__weekday {
          padding: 0.5rem;
        }

        .calendar-container .react-calendar__tile--now {
          background: #fef3c7;
          color: #92400e;
        }

        .calendar-container .react-calendar__tile--now:enabled:hover,
        .calendar-container .react-calendar__tile--now:enabled:focus {
          background: #fde68a;
        }
      `}</style>
    </div>
  );
};

export default AvailabilityCalendar;