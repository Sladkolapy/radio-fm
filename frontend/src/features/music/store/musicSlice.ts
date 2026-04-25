import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { musicApi } from '@shared/api/axiosClient';
import type { Track, MusicState, TrackPlaying } from '@shared/types';

const initialState: MusicState = {
  allTracks: [],
  privateTracks: [],
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  isLoading: false,
  error: null,
};

export const fetchAllTracks = createAsyncThunk(
  'music/fetchAllTracks',
  async () => {
    const response = await musicApi.getAllTracks();
    return response.tracks;
  }
);

export const fetchPrivateTracks = createAsyncThunk(
  'music/fetchPrivateTracks',
  async () => {
    return await musicApi.getPrivateTracks();
  }
);

export const fetchTrackById = createAsyncThunk(
  'music/fetchTrackById',
  async (id: number) => {
    const response = await musicApi.getTrackById(id);
    return response.track;
  }
);

export const createTrack = createAsyncThunk(
  'music/createTrack',
  async (formData: FormData) => {
    const response = await musicApi.createTrack(formData);
    return response.track;
  }
);

export const updateTrack = createAsyncThunk(
  'music/updateTrack',
  async ({ id, formData }: { id: number; formData: FormData }) => {
    const response = await musicApi.updateTrack(id, formData);
    return response.track;
  }
);

export const deleteTrack = createAsyncThunk(
  'music/deleteTrack',
  async (id: number) => {
    await musicApi.deleteTrack(id);
    return id;
  }
);

const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<TrackPlaying>) => {
      state.currentTrack = action.payload;
      state.isPlaying = true;
      state.progress = 0;
    },
    togglePlayPause: (state) => {
      if (state.currentTrack) {
        state.isPlaying = !state.isPlaying;
      }
    },
    nextTrack: (state) => {
      const currentIndex = state.allTracks.findIndex(t => t.id === state.currentTrack?.id);
      if (currentIndex > -1 && currentIndex < state.allTracks.length - 1) {
        const nextTrack = state.allTracks[currentIndex + 1];
        state.currentTrack = {
          ...nextTrack,
          isPlaying: true,
          progress: 0
        };
        state.isPlaying = true;
        state.progress = 0;
      }
    },
    prevTrack: (state) => {
      const currentIndex = state.allTracks.findIndex(t => t.id === state.currentTrack?.id);
      if (currentIndex > 0) {
        const prevTrack = state.allTracks[currentIndex - 1];
        state.currentTrack = {
          ...prevTrack,
          isPlaying: true,
          progress: 0
        };
        state.isPlaying = true;
        state.progress = 0;
      }
    },
    updateProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    setPlaylist: (state, action: PayloadAction<Track[]>) => {
      state.allTracks = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTracks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllTracks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allTracks = action.payload;
      })
      .addCase(fetchAllTracks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch tracks';
      })
      .addCase(fetchPrivateTracks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrivateTracks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.privateTracks = action.payload;
      })
      .addCase(fetchPrivateTracks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch private tracks';
      })
      .addCase(createTrack.fulfilled, (state, action) => {
        state.allTracks.unshift(action.payload);
        state.isLoading = false;
      })
      .addCase(createTrack.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTrack.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create track';
      })
      .addCase(updateTrack.fulfilled, (state, action) => {
        const index = state.allTracks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.allTracks[index] = action.payload;
        }
        state.isLoading = false;
      })
      .addCase(updateTrack.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTrack.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update track';
      })
      .addCase(deleteTrack.fulfilled, (state, action) => {
        state.allTracks = state.allTracks.filter(t => t.id !== action.payload);
        state.privateTracks = state.privateTracks.filter(t => t.id !== action.payload);
        if (state.currentTrack?.id === action.payload) {
          state.currentTrack = null;
          state.isPlaying = false;
        }
        state.isLoading = false;
      })
      .addCase(deleteTrack.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTrack.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete track';
      });
  },
});

export const {
  setCurrentTrack,
  togglePlayPause,
  nextTrack,
  prevTrack,
  updateProgress,
  setPlaylist,
  setLoading,
  setError
} = musicSlice.actions;

export default musicSlice.reducer;