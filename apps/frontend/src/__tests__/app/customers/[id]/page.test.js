import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomerDetailPage from '@/app/customers/[id]/page';
import { customerService } from '@/services/customerService';

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock('@/services/customerService', () => ({
  customerService: {
    getCustomerById: jest.fn(),
    getCustomerActivityHistory: jest.fn(),
    activateCustomer: jest.fn(),
    deactivateCustomer: jest.fn(),
  },
}));

jest.mock('@/components/molecules/Timeline', () => ({
  Timeline: ({ items }) => (
    <div data-testid="timeline">
      <div data-testid="timeline-items">{JSON.stringify(items)}</div>
    </div>
  ),
}));

describe('CustomerDetailPage Component', () => {
  const mockCustomer = {
    _id: '1',
    customerCode: 'CUST001',
    name: 'PT. Test Company',
    customerType: 'corporate',
    contactPerson: 'John Doe',
    phoneNumber: '08123456789',
    email: 'contact@testcompany.com',
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
    branch: {
      _id: '1',
      name: 'Jakarta Branch',
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
  };

  const mockActivityHistory = [
    {
      action: 'Customer created',
      description: 'Customer was created by Admin',
      timestamp: '2025-01-01T00:00:00.000Z',
    },
    {
      action: 'Customer updated',
      description: 'Customer details were updated by Admin',
      timestamp: '2025-01-02T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    customerService.getCustomerById.mockResolvedValue({ data: mockCustomer });
    customerService.getCustomerActivityHistory.mockResolvedValue({ data: mockActivityHistory });
    customerService.activateCustomer.mockResolvedValue({ data: { ...mockCustomer, status: 'active' } });
    customerService.deactivateCustomer.mockResolvedValue({ data: { ...mockCustomer, status: 'inactive' } });
  });

  it('renders the customer detail page with customer information', async () => {
    render(<CustomerDetailPage params={{ id: '1' }} />);
    
    // Check if the page is loading initially
    expect(screen.getByText('Loading customer details...')).toBeInTheDocument();
    
    // Check if the customer details are rendered after loading
    await waitFor(() => {
      expect(screen.getByText('PT. Test Company')).toBeInTheDocument();
      expect(screen.getByText('Customer Code: CUST001')).toBeInTheDocument();
    });
    
    // Check if tabs are rendered
    expect(screen.getByRole('tab', { name: /Customer Details/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Activity History/i })).toBeInTheDocument();
    
    // Check if customer details are displayed
    expect(screen.getByText('Corporate')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('08123456789')).toBeInTheDocument();
    expect(screen.getByText('contact@testcompany.com')).toBeInTheDocument();
    expect(screen.getByText('123456789')).toBeInTheDocument();
    expect(screen.getByText('Jl. Test No. 123')).toBeInTheDocument();
    expect(screen.getByText('Jakarta')).toBeInTheDocument();
    expect(screen.getByText('Central Jakarta')).toBeInTheDocument();
    expect(screen.getByText('DKI Jakarta')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('Indonesia')).toBeInTheDocument();
    expect(screen.getByText('Rp 5,000,000')).toBeInTheDocument();
    expect(screen.getByText('30 days')).toBeInTheDocument();
    expect(screen.getByText('Jakarta Branch')).toBeInTheDocument();
  });

  it('fetches customer data and activity history on initial load', async () => {
    render(<CustomerDetailPage params={{ id: '1' }} />);
    
    await waitFor(() => {
      expect(customerService.getCustomerById).toHaveBeenCalledTimes(1);
      expect(customerService.getCustomerById).toHaveBeenCalledWith('1');
      expect(customerService.getCustomerActivityHistory).toHaveBeenCalledTimes(1);
      expect(customerService.getCustomerActivityHistory).toHaveBeenCalledWith('1');
    });
  });

  it('displays activity history when tab is clicked', async () => {
    render(<CustomerDetailPage params={{ id: '1' }} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('PT. Test Company')).toBeInTheDocument();
    });
    
    // Click on the Activity History tab
    fireEvent.click(screen.getByRole('tab', { name: /Activity History/i }));
    
    // Check if activity history is displayed
    await waitFor(() => {
      expect(screen.getByTestId('timeline')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-items')).toHaveTextContent('Customer created');
      expect(screen.getByTestId('timeline-items')).toHaveTextContent('Customer updated');
    });
  });

  it('handles customer status change (deactivate)', async () => {
    // Mock customer as active
    customerService.getCustomerById.mockResolvedValue({ 
      data: { ...mockCustomer, status: 'active' } 
    });
    
    render(<CustomerDetailPage params={{ id: '1' }} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('PT. Test Company')).toBeInTheDocument();
    });
    
    // Click on the Deactivate button
    fireEvent.click(screen.getByRole('button', { name: /Deactivate/i }));
    
    // Check if deactivateCustomer was called
    await waitFor(() => {
      expect(customerService.deactivateCustomer).toHaveBeenCalledTimes(1);
      expect(customerService.deactivateCustomer).toHaveBeenCalledWith('1');
    });
  });

  it('handles customer status change (activate)', async () => {
    // Mock customer as inactive
    customerService.getCustomerById.mockResolvedValue({ 
      data: { ...mockCustomer, status: 'inactive' } 
    });
    
    render(<CustomerDetailPage params={{ id: '1' }} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('PT. Test Company')).toBeInTheDocument();
    });
    
    // Click on the Activate button
    fireEvent.click(screen.getByRole('button', { name: /Activate/i }));
    
    // Check if activateCustomer was called
    await waitFor(() => {
      expect(customerService.activateCustomer).toHaveBeenCalledTimes(1);
      expect(customerService.activateCustomer).toHaveBeenCalledWith('1');
    });
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    customerService.getCustomerById.mockRejectedValue(new Error('API Error'));
    
    render(<CustomerDetailPage params={{ id: '1' }} />);
    
    // Check if the component doesn't crash
    await waitFor(() => {
      expect(screen.getByText('Loading customer details...')).toBeInTheDocument();
    });
  });

  it('shows not found message when customer is not found', async () => {
    // Mock customer not found
    customerService.getCustomerById.mockResolvedValue({ data: null });
    
    render(<CustomerDetailPage params={{ id: '1' }} />);
    
    // Check if not found message is displayed
    await waitFor(() => {
      expect(screen.getByText('Customer not found')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Back to Customers/i })).toBeInTheDocument();
    });
  });
});
