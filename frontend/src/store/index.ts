import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '@features/auth/store/authSlice';
import musicReducer from '@features/music/store/musicSlice';
import { authMiddleware } from '@features/auth/middleware/authMiddleware';

const rootReducer = combineReducers({
  auth: authReducer,
  music: musicReducer,
});

// Initialize state from localStorage on app load
const initialState = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return {
      auth: {
        token,
        user: null,
        isLoading: true,
        error: null
      }
    };
  }
  return {};
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authMiddleware),
  preloadedState: initialState()
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;