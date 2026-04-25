export interface User {
  id: number;
  username: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface Track {
  id: number;
  title: string;
  artist: string;
  file_path?: string;
  cover_url?: string;
  mood_type: string;
  created_at?: string;
  creator_name?: string;
  tags?: Tag[];
}

export interface TrackPlaying extends Track {
  isPlaying?: boolean;
  progress?: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface TrackResponse {
  track?: Track;
  tracks?: Track[];
  error?: string;
}

export interface TagResponse {
  tag?: Tag;
  tags?: Tag[];
  error?: string;
}

export interface ApiError {
  error: string;
}

export interface MusicState {
  allTracks: Track[];
  privateTracks: Track[];
  tags: Tag[];
  currentTrack: TrackPlaying | null;
  isPlaying: boolean;
  progress: number;
  isLoading: boolean;
  error: string | null;
  cachedTrackIds: number[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
