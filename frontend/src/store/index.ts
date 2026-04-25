import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '@features/auth/store/authSlice';
import musicReducer from '@features/music/store/musicSlice';
import adminReducer from '@features/admin/store/adminSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  music: musicReducer,
  admin: adminReducer,
});

const preloadedState = () => {
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
  preloadedState: preloadedState()
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
