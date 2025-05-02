import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '@/services/authService';

// Define types for the auth state
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastTokenRefresh: number | null;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Initial state for authentication
 */
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastTokenRefresh: null,
};

/**
 * Async thunk for user login
 */
export const loginUser = createAsyncThunk<LoginResponse, LoginCredentials>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Call the auth service login method
      const response = await authService.login({ email, password });
      
      // Store tokens in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

/**
 * Async thunk for user logout
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Call the auth service logout method
      await authService.logout();
      
      // Clear tokens from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
      return null;
    } catch (error: any) {
      // Even if API call fails, we still want to clear local tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

/**
 * Async thunk for refreshing token
 */
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const refreshToken = state.auth.refreshToken || localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // Call refresh token API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const data = await response.json();
      
      // Store new tokens
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      return data;
    } catch (error: any) {
      // If refresh fails, clear tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

/**
 * Async thunk for getting current user profile
 */
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const userData = await authService.getCurrentUser();
      return userData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get user profile');
    }
  }
);

/**
 * Auth slice for Redux store
 * Manages authentication state and related actions
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Check if user is already logged in (from localStorage)
    checkAuthState: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (token) {
          state.token = token;
          state.refreshToken = refreshToken;
          state.isAuthenticated = true;
          state.lastTokenRefresh = Date.now();
          // User data will be fetched by getCurrentUser thunk
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Login failed';
      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Logout failed';
      });
  },
});

export const { checkAuthState, clearError } = authSlice.actions;

export default authSlice.reducer;
