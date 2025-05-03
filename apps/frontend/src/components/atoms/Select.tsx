/* eslint-disable react/button-has-type */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */
/* eslint-disable react/require-default-props */

'use client';

import React, { forwardRef } from 'react';

// In Select.tsx
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children?: React.ReactNode;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ children, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
          {...props}
        >
          {/* Add null check for children */}
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return null;
            return child;
          })}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

export { Select };
