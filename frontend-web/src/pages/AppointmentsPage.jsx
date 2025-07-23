import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAppointmentStats } from '../api/appointments';
import AppointmentsList from '../features/appointments/AppointmentsList';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import { formatCurrency } from '../utils/helpers';

/**
 * Appointments page component
 */
const AppointmentsPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [professionalId, setProfessionalId] = useState(null);

  // Get professional ID from user data
  useEffect(() => {
    if (user?.professionalId) {
      setProfessionalId(user.professionalId);
    } else if (user?.userId) {
      // If professionalId is not in user data, we'll need to fetch it
      // For now, we'll use userId as a fallback
      setProfessionalId(user.userId);
    }
  }, [user]);

  // Fetch appointment statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!professionalId) return;

      try {
        setIsLoadingStats(true);
        const statsData = await getAppointmentStats(professionalId);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching appointment stats:', error);
        // Don't show error for stats, just continue without them
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [professionalId]);

  // Stats cards data
  const getStatsCards = () => {
    if (!stats) return [];

    return [
      {
        title: 'Total Appointments',
        value: stats.total,
        icon: (
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 012 0v4h4V3a1 1 0 012 0v4h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2z" />
          </svg>
        ),
        color: 'text-primary-600',
        bgColor: 'bg-primary-50',
      },
      {
        title: 'Upcoming',
        value: stats.upcoming,
        icon: (
          <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'text-warning-600',
        bgColor: 'bg-warning-50',
      },
      {
        title: 'Completed',
        value: stats.completed,
        icon: (
          <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'text-success-600',
        bgColor: 'bg-success-50',
      },
      {
        title: 'Total Revenue',
        value: formatCurrency(stats.totalRevenue),
        icon: (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        ),
        color: 'text-green-600',
        bgColor: 'bg-green-50',
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
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-1 text-gray-600">
            Manage your patient appointments and schedule
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => window.location.href = '/availability'}
            className="btn btn-secondary"
          >
            Manage Availability
          </button>
          <button
            onClick={() => {
              // TODO: Implement export functionality
              alert('Export functionality not implemented yet');
            }}
            className="btn btn-outline"
          >
            Export Data
          </button>
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

      {/* Status Breakdown */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Appointment Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-600">{stats.scheduled}</div>
                <div className="text-sm text-gray-600">Scheduled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{stats.confirmed}</div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-error-600">{stats.cancelled}</div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.noShow}</div>
                <div className="text-sm text-gray-600">No Show</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6">
            <AppointmentsList 
              professionalId={professionalId}
              showFilters={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentsPage;