import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomerListPage from '@/app/customers/page';
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
    getCustomers: jest.fn(),
  },
}));

jest.mock('@/components/organisms/DataTable', () => ({
  DataTable: ({ columns, data }) => (
    <div data-testid="data-table">
      <div data-testid="data-table-columns">{JSON.stringify(columns)}</div>
      <div data-testid="data-table-data">{JSON.stringify(data)}</div>
    </div>
  ),
}));

describe('CustomerListPage Component', () => {
  const mockCustomers = [
    {
      _id: '1',
      customerCode: 'CUST001',
      name: 'PT. Test Company',
      customerType: 'corporate',
      contactPerson: 'John Doe',
      phoneNumber: '08123456789',
      email: 'contact@testcompany.com',
      status: 'active',
    },
    {
      _id: '2',
      customerCode: 'CUST002',
      name: 'Jane Smith',
      customerType: 'individual',
      contactPerson: 'Jane Smith',
      phoneNumber: '08987654321',
      email: 'jane.smith@example.com',
      status: 'inactive',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    customerService.getCustomers.mockResolvedValue({ data: mockCustomers });
  });

  it('renders the customer list page with header and filters', async () => {
    render(<CustomerListPage />);
    
    // Check if the page header is rendered
    expect(screen.getByText('Customer Management')).toBeInTheDocument();
    expect(screen.getByText('Manage your customers and their information')).toBeInTheDocument();
    
    // Check if the filters are rendered
    expect(screen.getByPlaceholderText(/Search by name, code, email, or phone/i)).toBeInTheDocument();
    expect(screen.getByText('All Status')).toBeInTheDocument();
    expect(screen.getByText('All Types')).toBeInTheDocument();
    
    // Check if the data table is rendered with the correct data
    await waitFor(() => {
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
      expect(screen.getByTestId('data-table-data')).toHaveTextContent('PT. Test Company');
      expect(screen.getByTestId('data-table-data')).toHaveTextContent('Jane Smith');
    });
  });

  it('fetches customers on initial load', async () => {
    render(<CustomerListPage />);
    
    await waitFor(() => {
      expect(customerService.getCustomers).toHaveBeenCalledTimes(1);
    });
  });

  it('filters customers by search term', async () => {
    render(<CustomerListPage />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('data-table-data')).toHaveTextContent('PT. Test Company');
    });
    
    // Enter search term
    const searchInput = screen.getByPlaceholderText(/Search by name, code, email, or phone/i);
    fireEvent.change(searchInput, { target: { value: 'Jane' } });
    
    // Check if the data is filtered
    await waitFor(() => {
      expect(screen.getByTestId('data-table-data')).not.toHaveTextContent('PT. Test Company');
      expect(screen.getByTestId('data-table-data')).toHaveTextContent('Jane Smith');
    });
  });

  it('filters customers by status', async () => {
    render(<CustomerListPage />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('data-table-data')).toHaveTextContent('PT. Test Company');
      expect(screen.getByTestId('data-table-data')).toHaveTextContent('Jane Smith');
    });
    
    // Select active status
    const statusSelect = screen.getByText('All Status').closest('select');
    fireEvent.change(statusSelect, { target: { value: 'active' } });
    
    // Check if the data is filtered
    await waitFor(() => {
      expect(screen.getByTestId('data-table-data')).toHaveTextContent('PT. Test Company');
      expect(screen.getByTestId('data-table-data')).not.toHaveTextContent('Jane Smith');
    });
  });

  it('filters customers by type', async () => {
    render(<CustomerListPage />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('data-table-data')).toHaveTextContent('PT. Test Company');
      expect(screen.getByTestId('data-table-data')).toHaveTextContent('Jane Smith');
    });
    
    // Select corporate type
    const typeSelect = screen.getByText('All Types').closest('select');
    fireEvent.change(typeSelect, { target: { value: 'corporate' } });
    
    // Check if the data is filtered
    await waitFor(() => {
      expect(screen.getByTestId('data-table-data')).toHaveTextContent('PT. Test Company');
      expect(screen.getByTestId('data-table-data')).not.toHaveTextContent('Jane Smith');
    });
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    customerService.getCustomers.mockRejectedValue(new Error('API Error'));
    
    render(<CustomerListPage />);
    
    // Check if the component doesn't crash
    await waitFor(() => {
      expect(screen.getByText('Customer Management')).toBeInTheDocument();
    });
  });
});
