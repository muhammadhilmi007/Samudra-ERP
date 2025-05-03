import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Select - Dropdown select component
 * Follows the design system with consistent styling
 */
const Select = forwardRef(({ 
  children, 
  className = '', 
  error, 
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      <select
        ref={ref}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  error: PropTypes.string,
};

export { Select };
