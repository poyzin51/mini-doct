import React from 'react';
import Button from './Button';

/**
 * Empty state component for when there's no data to display
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionText,
  onAction,
  className = '',
  size = 'md',
}) => {
  // Size classes
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-8 w-8',
      title: 'text-lg',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'h-12 w-12',
      title: 'text-xl',
      description: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'h-16 w-16',
      title: 'text-2xl',
      description: 'text-lg',
    },
  };

  const currentSize = sizeClasses[size];

  // Default icon if none provided
  const DefaultIcon = () => (
    <svg
      className={`${currentSize.icon} text-gray-400`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  return (
    <div className={`text-center ${currentSize.container} ${className}`}>
      <div className="flex justify-center mb-4">
        {Icon ? (
          <Icon className={`${currentSize.icon} text-gray-400`} />
        ) : (
          <DefaultIcon />
        )}
      </div>
      
      {title && (
        <h3 className={`font-semibold text-gray-900 mb-2 ${currentSize.title}`}>
          {title}
        </h3>
      )}
      
      {description && (
        <p className={`text-gray-500 mb-6 max-w-md mx-auto ${currentSize.description}`}>
          {description}
        </p>
      )}
      
      {(action || (actionText && onAction)) && (
        <div>
          {action || (
            <Button onClick={onAction} variant="primary">
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Predefined empty states for common scenarios
 */

// No appointments
export const NoAppointments = ({ onAddAvailability }) => (
  <EmptyState
    icon={() => (
      <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 012 0v4h4V3a1 1 0 012 0v4h2a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2z" />
      </svg>
    )}
    title="No appointments yet"
    description="You don't have any appointments scheduled. Patients will be able to book appointments once you add your availability."
    actionText="Add Availability"
    onAction={onAddAvailability}
  />
);

// No availability
export const NoAvailability = ({ onAddSlots }) => (
  <EmptyState
    icon={() => (
      <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )}
    title="No time slots available"
    description="Add your available time slots so patients can book appointments with you."
    actionText="Add Time Slots"
    onAction={onAddSlots}
  />
);

// Search no results
export const NoSearchResults = ({ searchTerm, onClearSearch }) => (
  <EmptyState
    icon={() => (
      <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )}
    title="No results found"
    description={`No results found for "${searchTerm}". Try adjusting your search terms.`}
    actionText="Clear Search"
    onAction={onClearSearch}
  />
);

// Error state
export const ErrorState = ({ title = "Something went wrong", description, onRetry }) => (
  <EmptyState
    icon={() => (
      <svg className="h-12 w-12 text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    )}
    title={title}
    description={description || "An error occurred while loading the data. Please try again."}
    actionText="Try Again"
    onAction={onRetry}
  />
);

export default EmptyState;