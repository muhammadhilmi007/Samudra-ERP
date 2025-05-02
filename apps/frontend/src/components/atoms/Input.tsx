/* eslint-disable react/button-has-type */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */
/* eslint-disable react/require-default-props */

import React, { forwardRef } from 'react';

/**
 * Input - Base input component
 * Follows the design system with consistent styling
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  label,
  name,
  id,
  placeholder,
  error,
  disabled = false,
  required = false,
  className = '',
  ...props
}, ref) => {
  const inputId = id || name;
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={inputId}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400
          focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary
          disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
