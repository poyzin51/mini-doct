import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvailabilityStats, findProfessionalIdByUserId } from '../api/availability';
import AvailabilityCalendar from '../features/availability/AvailabilityCalendar';
import TimeSlotForm from '../features/availability/TimeSlotForm';
import TimeSlotList from '../features/availability/TimeSlotList';
import AvailabilityRangeForm from '../features/availability/AvailabilityRangeForm';
import AvailabilityRangesList from '../features/availability/AvailabilityRangesList';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { formatDateTime } from '../utils/dateUtils';

/**
 * Availability management page
 */
const AvailabilityPage = () => {
  const { user } = useAuth();
  const [professionalId, setProfessionalId] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddRangeForm, setShowAddRangeForm] = useState(false);
  const [activeTab, setActiveTab] = useState('ranges'); // 'ranges', 'calendar', or 'list'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get professional ID
  useEffect(() => {
    const getProfessionalId = async () => {
      if (user?.professionalId) {
        setProfessionalId(user.professionalId);
      } else if (user?.userId) {
        try {
          const profId = await findProfessionalIdByUserId(user.userId);
          setProfessionalId(profId);
        } catch (error) {
          console.error('Error finding professional ID:', error);
        }
      }
    };

    getProfessionalId();
  }, [user]);

  // Fetch availability statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!professionalId) return;

      try {
        setIsLoadingStats(true);
        const statsData = await getAvailabilityStats(professionalId);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching availability stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [professionalId, refreshTrigger]);

  // Handle slots changed
  const handleSlotsChanged = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle date selection from calendar
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Stats cards data
  const getStatsCards = () => {
    if (!stats) return [];

    return [
      {
        title: 'Total Time Slots',
        value: stats.totalSlots,
        icon: (
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'text-primary-600',
        bgColor: 'bg-primary-50',
      },
      {
        title: 'Future Slots',
        value: stats.futureSlots,
        icon: (
          <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        ),
        color: 'text-success-600',
        bgColor: 'bg-success-50',
      },
      {
        title: 'Days with Availability',
        value: stats.datesWithAvailability,
        icon: (
          <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 012 0v4h4V3a1 1 0 012 0v4h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2z" />
          </svg>
        ),
        color: 'text-warning-600',
        bgColor: 'bg-warning-50',
      },
      {
        title: 'Avg Slots/Day',
        value: stats.averageSlotsPerDay,
        icon: (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
    ];
  };

  const statsCards = getStatsCards();

  if (!professionalId) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader size="lg" text="Loading professional data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability Management</h1>
          <p className="mt-1 text-gray-600">
            Manage your available time slots for patient appointments
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="primary"
            onClick={() => setShowAddRangeForm(true)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Availability Range
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/appointments'}
          >
            View Appointments
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                    {stat.icon}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Next Available Slot */}
      {stats?.nextAvailableSlot && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Next Available Slot</p>
                  <p className="text-lg font-semibold text-success-600">
                    {formatDateTime(stats.nextAvailableSlot)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const date = new Date(stats.nextAvailableSlot);
                  setSelectedDate(date);
                  setActiveTab('calendar');
                }}
              >
                View in Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Time Slot Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <TimeSlotForm
              professionalId={professionalId}
              onSlotsAdded={() => {
                handleSlotsChanged();
                setShowAddForm(false);
              }}
              onClose={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('ranges')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ranges'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Availability Ranges
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calendar'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Time Slots List
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'ranges' ? (
        <AvailabilityRangesList
          professionalId={professionalId}
          onRangesChanged={handleSlotsChanged}
          showAddForm={() => setShowAddRangeForm(true)}
        />
      ) : activeTab === 'calendar' ? (
        <AvailabilityCalendar
          professionalId={professionalId}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
          onSlotsChanged={refreshTrigger}
        />
      ) : (
        <TimeSlotList
          professionalId={professionalId}
          onSlotsChanged={handleSlotsChanged}
          showAddForm={() => setShowAddForm(true)}
        />
      )}
      
      {/* Add Availability Range Form Modal */}
      {showAddRangeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AvailabilityRangeForm
              professionalId={professionalId}
              onRangeAdded={() => {
                handleSlotsChanged();
                setShowAddRangeForm(false);
              }}
              onClose={() => setShowAddRangeForm(false)}
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => setShowAddForm(true)}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Time Slots
            </Button>
            
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                // TODO: Implement bulk operations
                alert('Bulk operations not implemented yet');
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Bulk Operations
            </Button>
            
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                // TODO: Implement export functionality
                alert('Export functionality not implemented yet');
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityPage;