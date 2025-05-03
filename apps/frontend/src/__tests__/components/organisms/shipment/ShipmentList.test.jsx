/**
 * Samudra Paket ERP - ShipmentList Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { useRouter } from 'next/navigation';
import ShipmentList from '@/components/organisms/shipment/ShipmentList';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Create mock store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Sample shipment data
const mockShipments = [
  {
    _id: '1',
    waybillNo: 'SM230501BR001',
    createdAt: '2025-05-01T10:00:00.000Z',
    senderName: 'John Doe',
    senderCity: 'Jakarta',
    recipientName: 'Jane Smith',
    recipientCity: 'Surabaya',
    serviceType: 'regular',
    paymentMethod: 'CASH',
    status: 'processed',
    totalPrice: 150000,
  },
  {
    _id: '2',
    waybillNo: 'SM230502BR002',
    createdAt: '2025-05-02T11:00:00.000Z',
    senderName: 'Alice Johnson',
    senderCity: 'Bandung',
    recipientName: 'Bob Brown',
    recipientCity: 'Semarang',
    serviceType: 'express',
    paymentMethod: 'COD',
    status: 'in_transit',
    totalPrice: 200000,
  },
];

// Initial state for the shipment slice
const initialState = {
  shipment: {
    shipments: mockShipments,
    pagination: {
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    loading: false,
    error: null,
  },
};

describe('ShipmentList Component', () => {
  let store;
  let pushMock;

  beforeEach(() => {
    store = mockStore(initialState);
    // Mock router push function
    pushMock = jest.fn();
    useRouter.mockReturnValue({
      push: pushMock,
    });
  });

  test('renders shipment list correctly', () => {
    render(
      <Provider store={store}>
        <ShipmentList />
      </Provider>
    );

    // Check if both shipments are rendered
    expect(screen.getByText('SM230501BR001')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('SM230502BR002')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  });

  test('displays shipment status with correct format', () => {
    render(
      <Provider store={store}>
        <ShipmentList />
      </Provider>
    );

    // Check if status is displayed correctly
    expect(screen.getByText('Processed')).toBeInTheDocument();
    expect(screen.getByText('In Transit')).toBeInTheDocument();
  });

  test('filters shipments when search input changes', async () => {
    render(
      <Provider store={store}>
        <ShipmentList />
      </Provider>
    );

    // Get search input
    const searchInput = screen.getByPlaceholderText('Search by waybill no, customer name or phone...');
    
    // Type in search box
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    // Check if the store was called with the correct action
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions.some(action => 
        action.type === 'shipment/fetchShipments/pending' && 
        action.meta.arg.filters.search === 'John'
      )).toBeTruthy();
    });
  });

  test('changes page when pagination is clicked', () => {
    // Create a store with multiple pages
    const multiPageState = {
      shipment: {
        ...initialState.shipment,
        pagination: {
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3,
        },
      },
    };
    
    const multiPageStore = mockStore(multiPageState);
    
    render(
      <Provider store={multiPageStore}>
        <ShipmentList />
      </Provider>
    );
    
    // Find and click next page button
    const nextPageButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextPageButton);
    
    // Check if the store was called with the correct action
    const actions = multiPageStore.getActions();
    expect(actions.some(action => 
      action.type === 'shipment/fetchShipments/pending' && 
      action.meta.arg.page === 2
    )).toBeTruthy();
  });
});
