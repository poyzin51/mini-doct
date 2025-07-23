import React from 'react';
import Navbar from './Navbar';

/**
 * Main layout component for authenticated pages
 */
const Layout = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar />
      
      {/* Main content */}
      <main className={`max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 ${className}`}>
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2024 Mini Docto+. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Privacy Policy not implemented yet');
                }}
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Terms of Service not implemented yet');
                }}
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Support not implemented yet');
                }}
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;