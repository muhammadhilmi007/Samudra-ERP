import React from 'react';
import PropTypes from 'prop-types';

/**
 * MainLayout - Primary layout template for the application
 * Provides consistent structure for all pages with header, sidebar, and footer
 */
const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary">Samudra Paket</h1>
          </div>
          <nav className="hidden md:block">
            {/* Navigation items will go here */}
          </nav>
          <div className="flex items-center space-x-4">
            {/* User profile, notifications, etc. */}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200 p-4">
          {/* Sidebar navigation will go here */}
        </aside>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} PT. Sarana Mudah Raya (Samudra Paket). All rights reserved.
        </div>
      </footer>
    </div>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;
