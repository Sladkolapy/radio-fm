import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '@shared/api/axiosClient';
import { Track } from '@shared/types';

interface AdminState {
  tracks: Track[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  tracks: [],
  loading: false,
  error: null
};

export const fetchAdminTracks = createAsyncThunk(
  'admin/fetchTracks',
  async () => {
    return await adminApi.getAllTracks();
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminTracks: (state) => {
      state.tracks = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminTracks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminTracks.fulfilled, (state, action) => {
        state.loading = false;
        state.tracks = action.payload;
      })
      .addCase(fetchAdminTracks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tracks';
      });
  }
});

export const { clearAdminTracks } = adminSlice.actions;
export default adminSlice.reducer;