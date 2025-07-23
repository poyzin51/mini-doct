import React, { useState } from 'react';
import { formatDateTime, formatTime, isToday, isPastDate } from '../../utils/dateUtils';
import { getStatusColor, formatName } from '../../utils/helpers';
import { confirmAppointment, completeAppointment, cancelAppointment } from '../../api/appointments';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

/**
 * Individual appointment card component
 */
const AppointmentCard = ({ appointment, onUpdate, currentUserId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Handle appointment confirmation
  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      const updatedAppointment = await confirmAppointment(appointment.id);
      onUpdate?.(updatedAppointment);
      toast.success('Appointment confirmed successfully');
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error('Failed to confirm appointment');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle appointment completion
  const handleComplete = async () => {
    try {
      setIsLoading(true);
      const updatedAppointment = await completeAppointment(appointment.id);
      onUpdate?.(updatedAppointment);
      toast.success('Appointment marked as completed');
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast.error('Failed to complete appointment');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle appointment cancellation
  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      setIsLoading(true);
      const updatedAppointment = await cancelAppointment(appointment.id, currentUserId);
      onUpdate?.(updatedAppointment);
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    } finally {
      setIsLoading(false);
    }
  };

  // Get available actions based on appointment status and timing
  const getAvailableActions = () => {
    const actions = [];
    const appointmentDate = new Date(appointment.appointmentDateTime);
    const isPast = isPastDate(appointmentDate);

    switch (appointment.status) {
      case 'SCHEDULED':
        if (!isPast) {
          actions.push({ label: 'Confirm', action: handleConfirm, variant: 'primary' });
          actions.push({ label: 'Cancel', action: handleCancel, variant: 'error' });
        }
        break;
      case 'CONFIRMED':
        if (isPast) {
          actions.push({ label: 'Mark Complete', action: handleComplete, variant: 'success' });
        } else {
          actions.push({ label: 'Cancel', action: handleCancel, variant: 'error' });
        }
        break;
      default:
        break;
    }

    return actions;
  };

  const availableActions = getAvailableActions();
  const patientName = formatName(appointment.patient?.firstName, appointment.patient?.lastName);
  const appointmentDate = new Date(appointment.appointmentDateTime);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        {/* Appointment Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {patientName || 'Unknown Patient'}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
              {appointment.status.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            {/* Date and Time */}
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 012 0v4h4V3a1 1 0 012 0v4h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2z" />
              </svg>
              <span className={isToday(appointmentDate) ? 'font-medium text-primary-600' : ''}>
                {formatDateTime(appointment.appointmentDateTime)}
                {isToday(appointmentDate) && ' (Today)'}
              </span>
            </div>

            {/* Patient Contact */}
            {appointment.patient?.email && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${appointment.patient.email}`} className="text-primary-600 hover:text-primary-700">
                  {appointment.patient.email}
                </a>
              </div>
            )}

            {/* Patient Phone */}
            {appointment.patient?.phoneNumber && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${appointment.patient.phoneNumber}`} className="text-primary-600 hover:text-primary-700">
                  {appointment.patient.phoneNumber}
                </a>
              </div>
            )}

            {/* Reason */}
            {appointment.reason && (
              <div className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{appointment.reason}</span>
              </div>
            )}

            {/* Consultation Fee */}
            {appointment.consultationFee && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="font-medium">${appointment.consultationFee}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Notes: </span>
                {appointment.notes}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {availableActions.length > 0 && (
          <div className="ml-4 flex-shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    {availableActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setShowActions(false);
                          action.action();
                        }}
                        disabled={isLoading}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 disabled:opacity-50 ${
                          action.variant === 'error' ? 'text-error-600 hover:bg-error-50' :
                          action.variant === 'success' ? 'text-success-600 hover:bg-success-50' :
                          'text-gray-700'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions (for mobile) */}
      {availableActions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 md:hidden">
          {availableActions.map((action, index) => (
            <Button
              key={index}
              size="sm"
              variant={action.variant}
              onClick={action.action}
              loading={isLoading}
              disabled={isLoading}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Click outside to close actions */}
      {showActions && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowActions(false)}
        />
      )}
    </Card>
  );
};

export default AppointmentCard;