import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '@shared/api/axiosClient';
import type { Track } from '@shared/types';

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
    const response = await adminApi.getAllTracks();
    return response.tracks || [];
  }
);

export const deleteAdminTrack = createAsyncThunk(
  'admin/deleteTrack',
  async (id: number) => {
    await adminApi.deleteTrack(id);
    return id;
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
      })
      .addCase(deleteAdminTrack.fulfilled, (state, action) => {
        state.tracks = state.tracks.filter(t => t.id !== action.payload);
      });
  }
});

export const { clearAdminTracks } = adminSlice.actions;
export default adminSlice.reducer;
