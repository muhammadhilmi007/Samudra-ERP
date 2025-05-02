import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import Input from '../atoms/Input';

/**
 * FormField - Molecule component that combines input with label and error handling
 * Used as a building block for forms
 */
interface FormFieldProps {
  label?: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  register: UseFormRegister<any>;
  rules?: Record<string, any>;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  [key: string]: any;
}

const FormField: React.FC<FormFieldProps> = ({
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

export default FormField;
