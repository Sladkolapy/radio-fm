import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { musicApi, tagApi } from '@shared/api/axiosClient';
import type { MusicState, TrackPlaying } from '@shared/types';

const initialState: MusicState = {
  allTracks: [],
  privateTracks: [],
  tags: [],
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  isLoading: false,
  error: null,
  cachedTrackIds: JSON.parse(localStorage.getItem('cachedTrackIds') || '[]'),
};

export const fetchAllTracks = createAsyncThunk(
  'music/fetchAllTracks',
  async (params?: { tag_id?: number; mood_type?: string }) => {
    const response = await musicApi.getAllTracks(params);
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

export const fetchTags = createAsyncThunk(
  'music/fetchTags',
  async () => {
    const response = await tagApi.getAllTags();
    return response.tags;
  }
);

export const createTag = createAsyncThunk(
  'music/createTag',
  async (data: { name: string; color?: string }) => {
    const response = await tagApi.createTag(data.name, data.color);
    return response.tag;
  }
);

export const deleteTag = createAsyncThunk(
  'music/deleteTag',
  async (id: number) => {
    await tagApi.deleteTag(id);
    return id;
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
  async ({ id, data }: { id: number; data: { title?: string; artist?: string; mood_type?: string; tags?: number[] } }) => {
    const response = await musicApi.updateTrack(id, data);
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
        const next = state.allTracks[currentIndex + 1];
        state.currentTrack = { ...next, isPlaying: true, progress: 0 };
        state.isPlaying = true;
        state.progress = 0;
      }
    },
    prevTrack: (state) => {
      const currentIndex = state.allTracks.findIndex(t => t.id === state.currentTrack?.id);
      if (currentIndex > 0) {
        const prev = state.allTracks[currentIndex - 1];
        state.currentTrack = { ...prev, isPlaying: true, progress: 0 };
        state.isPlaying = true;
        state.progress = 0;
      }
    },
    updateProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    addCachedTrack: (state, action: PayloadAction<number>) => {
      if (!state.cachedTrackIds.includes(action.payload)) {
        state.cachedTrackIds.push(action.payload);
        localStorage.setItem('cachedTrackIds', JSON.stringify(state.cachedTrackIds));
      }
    },
    removeCachedTrack: (state, action: PayloadAction<number>) => {
      state.cachedTrackIds = state.cachedTrackIds.filter(id => id !== action.payload);
      localStorage.setItem('cachedTrackIds', JSON.stringify(state.cachedTrackIds));
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
        state.allTracks = action.payload || [];
      })
      .addCase(fetchAllTracks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch tracks';
      })
      .addCase(fetchPrivateTracks.fulfilled, (state, action) => {
        state.privateTracks = action.payload || [];
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags = action.payload || [];
      })
      .addCase(createTrack.fulfilled, (state, action) => {
        if (action.payload) {
          state.allTracks.unshift(action.payload);
        }
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
        if (action.payload) {
          const index = state.allTracks.findIndex(t => t.id === action.payload!.id);
          if (index !== -1) {
            state.allTracks[index] = action.payload;
          }
        }
        state.isLoading = false;
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
      .addCase(deleteTrack.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete track';
      })
      .addCase(createTag.fulfilled, (state, action) => {
        if (action.payload) {
          state.tags.push(action.payload);
        }
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.tags = state.tags.filter(t => t.id !== action.payload);
      });
  },
});

export const {
  setCurrentTrack,
  togglePlayPause,
  nextTrack,
  prevTrack,
  updateProgress,
  addCachedTrack,
  removeCachedTrack,
  setLoading,
  setError
} = musicSlice.actions;

export default musicSlice.reducer;
