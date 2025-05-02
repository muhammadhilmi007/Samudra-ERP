import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import LoginForm from '@/components/organisms/LoginForm';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  __esModule: true,
  default: () => ({
    login: jest.fn().mockImplementation((credentials) => {
      if (credentials.email === 'valid@example.com' && credentials.password === 'password123') {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error('Invalid credentials'));
      }
    }),
    isLoading: false,
    error: null,
  }),
}));

// Mock the next/router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Setup mock store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);
const initialState = {
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
};
const store = mockStore(initialState);

describe('LoginForm Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the login form correctly', () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    // Check if form elements are rendered
    expect(screen.getByText('Login Samudra Paket')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByText(/Lupa password/i)).toBeInTheDocument();
  });

  it('displays validation errors for empty fields', async () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    // Submit the form without filling any fields
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText(/Email harus diisi/i)).toBeInTheDocument();
      expect(screen.getByText(/Password minimal 6 karakter/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for invalid email', async () => {
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    // Fill in invalid email and submit
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Check if validation error for email is displayed
    await waitFor(() => {
      expect(screen.getByText(/Email tidak valid/i)).toBeInTheDocument();
    });
  });

  it('submits the form with valid credentials', async () => {
    const useAuth = require('@/hooks/useAuth').default;
    const mockLogin = jest.fn().mockResolvedValue(undefined);
    useAuth.mockImplementation(() => ({
      login: mockLogin,
      isLoading: false,
      error: null,
    }));

    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    // Fill in valid credentials and submit
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'valid@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Check if login function was called with correct credentials
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'valid@example.com',
        password: 'password123',
      });
    });
  });

  it('displays loading state when submitting', async () => {
    const useAuth = require('@/hooks/useAuth').default;
    useAuth.mockImplementation(() => ({
      login: jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100))),
      isLoading: true,
      error: null,
    }));

    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    // Check if loading state is displayed
    expect(screen.getByRole('button', { name: /Memproses/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Memproses/i })).toBeDisabled();
  });

  it('displays error message when login fails', async () => {
    const useAuth = require('@/hooks/useAuth').default;
    useAuth.mockImplementation(() => ({
      login: jest.fn(),
      isLoading: false,
      error: 'Invalid credentials',
    }));

    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    // Check if error message is displayed
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
});
