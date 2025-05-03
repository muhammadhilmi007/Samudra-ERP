import React from 'react';

/**
 * Card - Container component for card-based UI elements
 * Follows the design system with consistent styling
 */
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

/**
 * CardHeader - Header section for Card component
 */
const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b border-gray-200 px-6 py-4 ${className}`}>
    {children}
  </div>
);

/**
 * CardTitle - Title element for Card component
 */
const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-medium text-gray-900 ${className}`}>
    {children}
  </h3>
);

/**
 * CardDescription - Description text for Card component
 */
const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-500 ${className}`}>
    {children}
  </p>
);

/**
 * CardContent - Content container for Card component
 */
const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
