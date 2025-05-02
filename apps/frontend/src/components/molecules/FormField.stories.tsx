import type { Meta, StoryObj } from '@storybook/react';
import FormField from './FormField';
import { useForm } from 'react-hook-form';

/**
 * FormField component documentation
 * 
 * The FormField component is a molecule in the Atomic Design pattern that combines
 * the Input atom with label and error handling for form fields.
 */
const FormFieldWrapper = (args) => {
  const { register } = useForm();
  return <FormField {...args} register={register} />;
};

const meta: Meta<typeof FormFieldWrapper> = {
  title: 'Molecules/FormField',
  component: FormFieldWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'date'],
      description: 'The type of input',
    },
    label: {
      control: 'text',
      description: 'The label for the input',
    },
    name: {
      control: 'text',
      description: 'The name of the input field',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FormFieldWrapper>;

/**
 * Default form field
 */
export const Default: Story = {
  args: {
    name: 'default',
    label: 'Default Form Field',
    placeholder: 'Enter text here',
  },
};

/**
 * Email form field
 */
export const Email: Story = {
  args: {
    type: 'email',
    name: 'email',
    label: 'Email Address',
    placeholder: 'Enter your email',
  },
};

/**
 * Password form field
 */
export const Password: Story = {
  args: {
    type: 'password',
    name: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
  },
};

/**
 * Required form field
 */
export const Required: Story = {
  args: {
    name: 'required',
    label: 'Required Field',
    placeholder: 'This field is required',
    required: true,
  },
};

/**
 * Form field with error
 */
export const WithError: Story = {
  args: {
    name: 'error',
    label: 'Form Field with Error',
    placeholder: 'Enter text here',
    error: 'This field has an error',
  },
};

/**
 * Disabled form field
 */
export const Disabled: Story = {
  args: {
    name: 'disabled',
    label: 'Disabled Form Field',
    placeholder: 'This form field is disabled',
    disabled: true,
  },
};
