/**
 * Redux store configuration for Samudra Paket ERP Mobile
 */
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

// Define the root state type
export interface RootState {
  auth: ReturnType<typeof authReducer>;
  // Add other slices as they are created
}

// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers as they are created
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user.lastSyncAt'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Export the store's dispatch type
export type AppDispatch = typeof store.dispatch;
