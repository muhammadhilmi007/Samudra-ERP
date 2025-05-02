import React from 'react';
import PropTypes from 'prop-types';
import Input from '../atoms/Input';

/**
 * FormField - Molecule component that combines input with label and error handling
 * Used as a building block for forms
 */
const FormField = ({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  register,
  rules,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <Input
        type={type}
        label={label}
        name={name}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        required={required}
        {...register(name, rules)}
        {...props}
      />
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  register: PropTypes.func.isRequired,
  rules: PropTypes.object,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default FormField;
