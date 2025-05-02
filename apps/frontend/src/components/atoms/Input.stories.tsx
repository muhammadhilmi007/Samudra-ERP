import type { Meta, StoryObj } from '@storybook/react';
import Input from './Input';

/**
 * Input component documentation
 * 
 * The Input component is a form control element following the Atomic Design pattern.
 * It supports various states and configurations to match the design system.
 */
const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
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
type Story = StoryObj<typeof Input>;

/**
 * Default text input
 */
export const Default: Story = {
  args: {
    name: 'default',
    label: 'Default Input',
    placeholder: 'Enter text here',
  },
};

/**
 * Email input
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
 * Password input
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
 * Required input
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
 * Input with error
 */
export const WithError: Story = {
  args: {
    name: 'error',
    label: 'Input with Error',
    placeholder: 'Enter text here',
    error: 'This field has an error',
  },
};

/**
 * Disabled input
 */
export const Disabled: Story = {
  args: {
    name: 'disabled',
    label: 'Disabled Input',
    placeholder: 'This input is disabled',
    disabled: true,
  },
};

/**
 * Input without label
 */
export const WithoutLabel: Story = {
  args: {
    name: 'nolabel',
    placeholder: 'Input without label',
  },
};
