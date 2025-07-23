import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAppointmentStats, getRecentAppointments, getTodaysAppointments } from '../api/appointments';
import { getAvailabilityStats, findProfessionalIdByUserId, getProfessional } from '../api/availability';
import AppointmentsList from '../features/appointments/AppointmentsList';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { formatCurrency, getScoreColor } from '../utils/helpers';
import { formatDateTime, isToday } from '../utils/dateUtils';

/**
 * Dashboard page component
 */
const DashboardPage = () => {
  const { user, getUserFullName } = useAuth();
  const [professionalId, setProfessionalId] = useState(null);
  const [professionalData, setProfessionalData] = useState(null);
  const [appointmentStats, setAppointmentStats] = useState(null);
  const [availabilityStats, setAvailabilityStats] = useState(null);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get professional ID and data
  useEffect(() => {
    const getProfessionalData = async () => {
      try {
        let profId = user?.professionalId;
        
        if (!profId && user?.userId) {
          profId = await findProfessionalIdByUserId(user.userId);
        }
        
        if (profId) {
          setProfessionalId(profId);
          const profData = await getProfessional(profId);
          setProfessionalData(profData);
        }
      } catch (error) {
        console.error('Error getting professional data:', error);
        setError('Failed to load professional data');
      }
    };

    if (user) {
      getProfessionalData();
    }
  }, [user]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!professionalId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [appointmentStatsData, availabilityStatsData, todaysAppts] = await Promise.all([
          getAppointmentStats(professionalId).catch(err => {
            console.error('Error fetching appointment stats:', err);
            return null;
          }),
          getAvailabilityStats(professionalId).catch(err => {
            console.error('Error fetching availability stats:', err);
            return null;
          }),
          getTodaysAppointments(professionalId).catch(err => {
            console.error('Error fetching today\'s appointments:', err);
            return [];
          }),
        ]);

        setAppointmentStats(appointmentStatsData);
        setAvailabilityStats(availabilityStatsData);
        setTodaysAppointments(todaysAppts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [professionalId]);

  // Get overview stats cards
  const getOverviewCards = () => {
    const cards = [];

    // Professional Score
    if (professionalData) {
      cards.push({
        title: 'Professional Score',
        value: `${professionalData.score || 0}/100`,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ),
        color: getScoreColor(professionalData.score || 0),
        bgColor: 'bg-yellow-50',
        description: 'Your professional rating',
      });
    }

    // Today's Appointments
    cards.push({
      title: "Today's Appointments",
      value: todaysAppointments.length,
      icon: (
        <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 012 0v4h4V3a1 1 0 012 0v4h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2z" />
        </svg>
      ),
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      description: 'Appointments scheduled for today',
    });

    // Total Appointments
    if (appointmentStats) {
      cards.push({
        title: 'Total Appointments',
        value: appointmentStats.total,
        icon: (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        description: 'All time appointments',
      });

      // Total Revenue
      cards.push({
        title: 'Total Revenue',
        value: formatCurrency(appointmentStats.totalRevenue),
        icon: (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        ),
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        description: 'From completed appointments',
      });
    }

    // Available Time Slots
    if (availabilityStats) {
      cards.push({
        title: 'Available Slots',
        value: availabilityStats.futureSlots,
        icon: (
          <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'text-success-600',
        bgColor: 'bg-success-50',
        description: 'Future time slots available',
      });
    }

    return cards;
  };

  const overviewCards = getOverviewCards();

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Cards Skeleton */}
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

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
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
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {getUserFullName()}!
          </h1>
          <p className="mt-1 text-gray-600">
            Here's an overview of your practice today
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="primary"
            onClick={() => window.location.href = '/availability'}
          >
            Manage Availability
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/appointments'}
          >
            View All Appointments
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${card.bgColor}`}>
                  {card.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>
                    {card.value}
                  </p>
                  {card.description && (
                    <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Professional Profile Summary */}
      {professionalData && (
        <Card>
          <CardHeader>
            <CardTitle>Professional Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Specialization</h4>
                <p className="text-gray-600">{professionalData.specialization}</p>
              </div>
              
              {professionalData.consultationFee && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Consultation Fee</h4>
                  <p className="text-gray-600">{formatCurrency(professionalData.consultationFee)}</p>
                </div>
              )}
              
              {professionalData.address && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Address</h4>
                  <p className="text-gray-600">{professionalData.address}</p>
                </div>
              )}
              
              {professionalData.description && (
                <div className="md:col-span-2 lg:col-span-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{professionalData.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Today's Appointments</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/appointments'}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todaysAppointments.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 012 0v4h4V3a1 1 0 012 0v4h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
                <p className="text-gray-600">You have a free day! Consider adding more availability.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.patient?.firstName} {appointment.patient?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(appointment.appointmentDateTime)}
                      </p>
                      {appointment.reason && (
                        <p className="text-sm text-gray-500">{appointment.reason}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === 'CONFIRMED' ? 'bg-primary-100 text-primary-800' :
                        appointment.status === 'SCHEDULED' ? 'bg-warning-100 text-warning-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
                
                {todaysAppointments.length > 3 && (
                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = '/appointments?filter=today'}
                    >
                      View {todaysAppointments.length - 3} more
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointmentStats && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Upcoming Appointments</span>
                    <span className="font-semibold text-primary-600">{appointmentStats.upcoming}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed This Month</span>
                    <span className="font-semibold text-success-600">{appointmentStats.completed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cancelled</span>
                    <span className="font-semibold text-error-600">{appointmentStats.cancelled}</span>
                  </div>
                </>
              )}
              
              {availabilityStats && (
                <>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Available Time Slots</span>
                      <span className="font-semibold text-success-600">{availabilityStats.futureSlots}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Days with Availability</span>
                      <span className="font-semibold text-blue-600">{availabilityStats.datesWithAvailability}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      {professionalId && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6">
              <AppointmentsList 
                professionalId={professionalId}
                showFilters={false}
                limit={5}
              />
            </div>
          </CardContent>
        </Card>
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
              onClick={() => window.location.href = '/availability'}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Manage Availability
            </Button>
            
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => window.location.href = '/appointments'}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 012 0v4h4V3a1 1 0 012 0v4h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2z" />
              </svg>
              View Appointments
            </Button>
            
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                // TODO: Implement profile settings
                alert('Profile settings not implemented yet');
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Update Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;