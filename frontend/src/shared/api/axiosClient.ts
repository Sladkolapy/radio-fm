import axios from 'axios';
import type { Track, AuthResponse, TrackResponse, TagResponse } from '@shared/types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      const requestUrl = error.config?.url || '';
      if (requestUrl.includes('/auth/profile')) {
        localStorage.removeItem('token');
        isRedirecting = true;
        window.location.href = '/login';
        setTimeout(() => { isRedirecting = false; }, 1000);
      }
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
  getAllTracks: async (params?: { tag_id?: number; mood_type?: string }): Promise<TrackResponse> => {
    const response = await api.get('/tracks', { params });
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

  createTrack: async (formData: FormData): Promise<TrackResponse> => {
    const response = await api.post('/tracks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateTrack: async (id: number, data: { title?: string; artist?: string; mood_type?: string; tags?: number[] }): Promise<TrackResponse> => {
    const response = await api.put(`/tracks/${id}`, data);
    return response.data;
  },

  deleteTrack: async (id: number): Promise<void> => {
    await api.delete(`/tracks/${id}`);
  }
};

export const tagApi = {
  getAllTags: async (): Promise<TagResponse> => {
    const response = await api.get('/tags');
    return response.data;
  },

  createTag: async (name: string, color?: string): Promise<TagResponse> => {
    const response = await api.post('/tags', { name, color });
    return response.data;
  },

  updateTag: async (id: number, data: { name?: string; color?: string }): Promise<TagResponse> => {
    const response = await api.put(`/tags/${id}`, data);
    return response.data;
  },

  deleteTag: async (id: number): Promise<void> => {
    await api.delete(`/tags/${id}`);
  },

  getTracksByTag: async (tagId: number): Promise<TrackResponse> => {
    const response = await api.get(`/tags/${tagId}/tracks`);
    return response.data;
  }
};

export const adminApi = {
  getAllTracks: async (): Promise<TrackResponse> => {
    const response = await api.get('/admin/tracks');
    return response.data;
  },

  createTrack: async (formData: FormData): Promise<TrackResponse> => {
    const response = await api.post('/admin/tracks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteTrack: async (id: number): Promise<void> => {
    await api.delete(`/admin/tracks/${id}`);
  }
};
