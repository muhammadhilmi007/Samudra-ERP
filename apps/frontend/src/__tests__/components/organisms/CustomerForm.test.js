import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomerForm } from '@/components/organisms/CustomerForm';

// Mock the dependencies
jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('CustomerForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockInitialData = {
    name: 'Test Customer',
    customerType: 'corporate',
    contactPerson: 'John Doe',
    phoneNumber: '08123456789',
    email: 'test@example.com',
    taxId: '123456789',
    creditLimit: 5000000,
    paymentTerms: 30,
    address: {
      street: 'Jl. Test No. 123',
      city: 'Jakarta',
      district: 'Central Jakarta',
      province: 'DKI Jakarta',
      postalCode: '12345',
      country: 'Indonesia',
    },
    status: 'active',
    branch: '1',
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders the form with all required fields', () => {
    render(<CustomerForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    
    // Check if all required fields are rendered
    expect(screen.getByLabelText(/Customer Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Customer Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Person/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/District/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Province/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Postal Code/i)).toBeInTheDocument();
  });

  it('loads initial data correctly when provided', () => {
    render(<CustomerForm initialData={mockInitialData} onSubmit={mockOnSubmit} isSubmitting={false} />);
    
    // Check if form fields are populated with initial data
    expect(screen.getByLabelText(/Customer Name/i)).toHaveValue(mockInitialData.name);
    expect(screen.getByLabelText(/Contact Person/i)).toHaveValue(mockInitialData.contactPerson);
    expect(screen.getByLabelText(/Phone Number/i)).toHaveValue(mockInitialData.phoneNumber);
    expect(screen.getByLabelText(/Email/i)).toHaveValue(mockInitialData.email);
    expect(screen.getByLabelText(/Street Address/i)).toHaveValue(mockInitialData.address.street);
    expect(screen.getByLabelText(/City/i)).toHaveValue(mockInitialData.address.city);
  });

  it('shows validation errors for required fields', async () => {
    render(<CustomerForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    
    // Submit the form without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /Create Customer/i }));
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Contact person must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Phone number must be at least 10 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
    });
    
    // Ensure onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits the form with valid data', async () => {
    render(<CustomerForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    
    // Fill in the required fields
    await userEvent.type(screen.getByLabelText(/Customer Name/i), 'New Test Customer');
    await userEvent.selectOptions(screen.getByLabelText(/Customer Type/i), 'corporate');
    await userEvent.type(screen.getByLabelText(/Contact Person/i), 'Jane Smith');
    await userEvent.type(screen.getByLabelText(/Phone Number/i), '08123456789');
    await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/Street Address/i), 'Jl. New Test No. 456');
    await userEvent.type(screen.getByLabelText(/City/i), 'Surabaya');
    await userEvent.type(screen.getByLabelText(/District/i), 'East Surabaya');
    await userEvent.type(screen.getByLabelText(/Province/i), 'East Java');
    await userEvent.type(screen.getByLabelText(/Postal Code/i), '54321');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Customer/i }));
    
    // Check if onSubmit was called with the correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Test Customer',
        customerType: 'corporate',
        contactPerson: 'Jane Smith',
        phoneNumber: '08123456789',
        email: 'jane@example.com',
        address: expect.objectContaining({
          street: 'Jl. New Test No. 456',
          city: 'Surabaya',
          district: 'East Surabaya',
          province: 'East Java',
          postalCode: '54321',
        }),
      }));
    });
  });

  it('disables the submit button when isSubmitting is true', () => {
    render(<CustomerForm onSubmit={mockOnSubmit} isSubmitting={true} />);
    
    // Check if the submit button is disabled
    expect(screen.getByRole('button', { name: /Saving/i })).toBeDisabled();
  });

  it('shows different button text for create vs update', () => {
    // Render for create (no initialData)
    const { rerender } = render(<CustomerForm onSubmit={mockOnSubmit} isSubmitting={false} />);
    expect(screen.getByRole('button', { name: /Create Customer/i })).toBeInTheDocument();
    
    // Rerender for update (with initialData)
    rerender(<CustomerForm initialData={mockInitialData} onSubmit={mockOnSubmit} isSubmitting={false} />);
    expect(screen.getByRole('button', { name: /Update Customer/i })).toBeInTheDocument();
  });
});
