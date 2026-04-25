export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Track {
  id: number;
  title: string;
  artist: string;
  cover_url?: string;
  mood_type: string;
  created_at?: string;
  creator_name?: string;
  is_public: boolean;
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

export interface ApiError {
  error: string;
}