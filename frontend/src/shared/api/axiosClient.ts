import axios from 'axios';
import type { Track, AuthResponse, ApiError } from '@shared/types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

export const musicApi = {
  getAllTracks: async (): Promise<TrackResponse> => {
    const response = await api.get('/tracks');
    return response.data;
  },

  getTrackById: async (id: number): Promise<TrackResponse> => {
    const response = await api.get(`/tracks/${id}`);
    return response.data;
  },

  getPrivateTracks: async (): Promise<Track[]> => {
    const response = await api.get('/tracks/private');
    return response.data.tracks;
  },

  createTrack: async (
    formData: FormData
  ): Promise<TrackResponse> => {
    const response = await api.post('/tracks', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateTrack: async (
    id: number,
    formData: FormData
  ): Promise<TrackResponse> => {
    const response = await api.put(`/tracks/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteTrack: async (id: number): Promise<ApiError> => {
    const response = await api.delete(`/tracks/${id}`);
    return response.data;
  }
};