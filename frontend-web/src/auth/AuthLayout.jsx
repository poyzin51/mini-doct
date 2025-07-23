import React from 'react';

/**
 * Layout component for authentication pages
 */
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center">
            {/* Logo */}
            <div className="bg-primary-600 rounded-lg p-2 mr-3">
              <svg
                className="h-8 w-8 text-white"
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
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mini Docto+</h1>
              <p className="text-sm text-gray-600">Professional Portal</p>
            </div>
          </div>
        </div>
        
        {title && (
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-gray-600">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          © 2024 Mini Docto+. All rights reserved.
        </p>
        <div className="mt-2 space-x-4">
          <a
            href="#"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;