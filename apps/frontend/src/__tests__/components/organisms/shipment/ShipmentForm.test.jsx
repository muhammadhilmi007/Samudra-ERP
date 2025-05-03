/**
 * Samudra Paket ERP - ShipmentForm Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { useRouter } from 'next/navigation';
import ShipmentForm from '@/components/organisms/shipment/ShipmentForm';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Create mock store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Sample initial data
const initialData = {
  senderName: 'John Doe',
  senderPhone: '08123456789',
  senderEmail: 'john@example.com',
  senderAddress: 'Jl. Contoh No. 123',
  senderCity: 'Jakarta',
  senderPostalCode: '12345',
  recipientName: 'Jane Smith',
  recipientPhone: '08987654321',
  recipientEmail: 'jane@example.com',
  recipientAddress: 'Jl. Sample No. 456',
  recipientCity: 'Surabaya',
  recipientPostalCode: '54321',
  serviceType: 'regular',
  paymentMethod: 'CASH',
  shipmentDate: '2025-05-01T00:00:00.000Z',
  items: [
    {
      description: 'Sample Item',
      weight: 1,
      length: 10,
      width: 10,
      height: 10,
      quantity: 1,
      itemType: 'GOODS',
      declaredValue: 100000,
    },
  ],
  totalPrice: 150000,
  notes: 'Sample notes',
};

describe('ShipmentForm Component', () => {
  let store;
  let pushMock;

  beforeEach(() => {
    store = mockStore({
      shipment: {
        loading: false,
        error: null,
        createSuccess: false,
        updateSuccess: false,
        currentShipment: initialData,
        priceCalculationResult: null,
        destinationValidationResult: null,
      },
    });

    // Mock router push function
    pushMock = jest.fn();
    useRouter.mockReturnValue({
      push: pushMock,
    });

    // Mock dispatch function
    store.dispatch = jest.fn().mockImplementation(() => Promise.resolve());
  });

  test('renders the form with tabs', () => {
    render(
      <Provider store={store}>
        <ShipmentForm />
      </Provider>
    );

    // Check if tabs are rendered
    expect(screen.getByText('Sender & Recipient')).toBeInTheDocument();
    expect(screen.getByText('Shipment Details')).toBeInTheDocument();
  });

  test('fills form with initial data when provided', () => {
    render(
      <Provider store={store}>
        <ShipmentForm initialData={initialData} />
      </Provider>
    );

    // Check if sender data is filled
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('08123456789')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });

  test('switches between tabs when clicked', () => {
    render(
      <Provider store={store}>
        <ShipmentForm />
      </Provider>
    );

    // Get tab buttons
    const shipmentDetailsTab = screen.getByText('Shipment Details');
    
    // Click on shipment details tab
    fireEvent.click(shipmentDetailsTab);
    
    // Check if service type selector is visible
    expect(screen.getByText('Service Type')).toBeInTheDocument();
    
    // Click back to sender & recipient tab
    const senderRecipientTab = screen.getByText('Sender & Recipient');
    fireEvent.click(senderRecipientTab);
    
    // Check if sender name field is visible
    expect(screen.getByText('Sender Name')).toBeInTheDocument();
  });

  test('validates required fields on submit', async () => {
    render(
      <Provider store={store}>
        <ShipmentForm />
      </Provider>
    );

    // Get submit button (shown on second tab)
    const shipmentDetailsTab = screen.getByText('Shipment Details');
    fireEvent.click(shipmentDetailsTab);
    
    const submitButton = screen.getByText('Create Shipment');
    
    // Submit the form without filling required fields
    fireEvent.click(submitButton);
    
    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText('Sender name is required')).toBeInTheDocument();
    });
  });

  test('handles edit mode properly', () => {
    render(
      <Provider store={store}>
        <ShipmentForm initialData={initialData} isEdit={true} shipmentId="123" />
      </Provider>
    );

    // Check if title reflects edit mode
    expect(screen.getByText('Edit Shipment')).toBeInTheDocument();
    
    // Get to the second tab to check the submit button text
    const shipmentDetailsTab = screen.getByText('Shipment Details');
    fireEvent.click(shipmentDetailsTab);
    
    // Check if button text reflects edit mode
    expect(screen.getByText('Update Shipment')).toBeInTheDocument();
  });
});
