import React from 'react';

/**
 * Input component with validation error display
 */
const Input = React.forwardRef(({
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  type = 'text',
  required = false,
  disabled = false,
  ...props
}, ref) => {
  // Base input classes
  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // State-based classes
  const stateClasses = error 
    ? 'border-error-500 focus:ring-error-500 focus:border-error-500' 
    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500';
  
  // Combine classes
  const inputClasses = `${baseClasses} ${stateClasses} ${className}`;

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        disabled={disabled}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-error-600 flex items-center">
          <svg
            className="w-4 h-4 mr-1 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;