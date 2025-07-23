import React from 'react';

/**
 * Loading spinner component
 */
const Loader = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text = '',
  fullScreen = false,
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  // Color classes
  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    success: 'text-success-600',
    error: 'text-error-600',
    warning: 'text-warning-600',
    white: 'text-white',
  };

  // Spinner component
  const Spinner = () => (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Full screen loader
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          <Spinner />
          {text && (
            <p className="mt-4 text-sm text-gray-600">{text}</p>
          )}
        </div>
      </div>
    );
  }

  // Inline loader
  return (
    <div className="flex items-center justify-center">
      <Spinner />
      {text && (
        <span className="ml-2 text-sm text-gray-600">{text}</span>
      )}
    </div>
  );
};

/**
 * Skeleton loader for content placeholders
 */
export const Skeleton = ({ 
  className = '', 
  width = 'full', 
  height = '4',
  rounded = 'md',
  ...props 
}) => {
  const widthClasses = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '1/4': 'w-1/4',
  };

  const heightClasses = {
    '2': 'h-2',
    '3': 'h-3',
    '4': 'h-4',
    '6': 'h-6',
    '8': 'h-8',
    '12': 'h-12',
    '16': 'h-16',
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 ${widthClasses[width]} ${heightClasses[height]} ${roundedClasses[rounded]} ${className}`}
      {...props}
    />
  );
};

/**
 * Loading overlay for components
 */
export const LoadingOverlay = ({ 
  isLoading, 
  children, 
  text = 'Loading...',
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <Loader size="lg" />
            <p className="mt-2 text-sm text-gray-600">{text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loader;