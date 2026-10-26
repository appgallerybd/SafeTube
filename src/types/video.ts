export interface SafeVideo {
  id: string; // YouTube Video ID (e.g. dQw4w9WgXcQ)
  title: string;
  channel: string;
  category: string;
  duration?: string;
  thumbnail?: string;
  description?: string;
  publishedAt?: string;
  views?: string;
  url: string;
  addedAt?: number;
}

export type PlaybackMode = 'video' | 'audio';

export type NavTab = 'home' | 'audio' | 'favorites' | 'history' | 'watch_later' | 'categories';

export interface SleepTimerOption {
  label: string;
  minutes: number;
}
