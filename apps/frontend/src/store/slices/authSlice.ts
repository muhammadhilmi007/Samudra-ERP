import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

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
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginResponse {
  user: User;
  token: string;
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
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Async thunk for user login
 */
export const loginUser = createAsyncThunk<LoginResponse, LoginCredentials>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      // Simulating API call
      const response = await new Promise<LoginResponse>((resolve) => {
        setTimeout(() => {
          resolve({
            user: {
              id: '1',
              email,
              name: 'Test User',
              role: 'admin',
            },
            token: 'sample-jwt-token',
          });
        }, 1000);
      });
      
      // Store token in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.token);
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
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
      // Clear token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
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
        if (token) {
          state.token = token;
          state.isAuthenticated = true;
          // TODO: Decode token to get user info or make API call to get user data
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
