import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

/**
 * Redux store configuration
 * Follows the Redux Toolkit pattern as specified in TDD Section 3.1.1 and 3.1.2
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers here as the application grows
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export the store's dispatch and getState functions
export const { dispatch, getState } = store;
