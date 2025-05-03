import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Textarea - Multi-line text input component
 * Follows the design system with consistent styling
 */
const Textarea = forwardRef(({ 
  className = '', 
  error, 
  rows = 4,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      <textarea
        ref={ref}
        rows={rows}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  className: PropTypes.string,
  error: PropTypes.string,
  rows: PropTypes.number,
};

export { Textarea };
