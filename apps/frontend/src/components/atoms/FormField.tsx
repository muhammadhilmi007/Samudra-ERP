/* eslint-disable react/button-has-type */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/function-component-definition */
/* eslint-disable react/require-default-props */

'use client';

import React from 'react';
import { FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  error?: string;
  register: (name: string) => Record<string, unknown>;
  [key: string]: unknown;
}

function FormField({
  label,
  name,
  type = 'text',
  error,
  register,
  ...props
}: FormFieldProps) {
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <Input
        id={name}
        type={type}
        {...register(name)}
        {...props}
      />
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}

export default FormField;
