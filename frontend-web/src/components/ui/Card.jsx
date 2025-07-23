import React from 'react';

/**
 * Card component for content containers
 */
const Card = ({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'sm',
  hover = false,
  ...props 
}) => {
  // Base card classes
  const baseClasses = 'bg-white rounded-lg border border-gray-200 transition-shadow duration-200';
  
  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  // Shadow classes
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };
  
  // Hover effect
  const hoverClasses = hover ? 'hover:shadow-md cursor-pointer' : '';
  
  // Combine classes
  const cardClasses = [
    baseClasses,
    paddingClasses[padding],
    shadowClasses[shadow],
    hoverClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Header component
 */
export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Title component
 */
export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  );
};

/**
 * Card Content component
 */
export const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Footer component
 */
export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;