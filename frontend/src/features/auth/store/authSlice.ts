import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@shared/api/axiosClient';
import type { User } from '@shared/types';

interface AuthState {
  user: User | null;
  token?: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData.username, userData.password);
      localStorage.setItem('token', response.token);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (userData: { username: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('login: Attempting login...');
      const response = await authApi.login(userData.username, userData.password);
      localStorage.setItem('token', response.token);
      console.log('login: Login successful, token saved');
      return response.user;
    } catch (error: any) {
      console.error('login: Login failed:', error);
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async () => {
    console.log('getProfile: Fetching profile...');
    const response = await authApi.getProfile();
    console.log('getProfile: Profile fetched successfully:', response.user);
    return response.user;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    console.log('logout: Clearing token from localStorage');
    localStorage.removeItem('token');
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    try {
      const user = await authApi.getProfile();
      return user;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.token = localStorage.getItem('token');
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.token = localStorage.getItem('token');
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
          state.token = localStorage.getItem('token');
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.token = null;
      })
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        const token = localStorage.getItem('token');
        if (token) {
          state.token = token;
        }
      })
      .addCase(getProfile.rejected, (state) => {
        state.isLoading = false;
        state.token = null;
      });
  },
});

export const { setUser, setError } = authSlice.actions;
export default authSlice.reducer;