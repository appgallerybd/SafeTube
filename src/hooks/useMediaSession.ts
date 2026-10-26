import { useEffect, useRef } from 'react';
import { SafeVideo } from '../types/video';

interface MediaSessionProps {
  currentVideo: SafeVideo | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeekForward?: () => void;
  onSeekBackward?: () => void;
}

/**
 * Hook to manage Background Audio & Lock Screen Media Controls via MediaSession API
 */
export function useMediaSession({
  currentVideo,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeekForward,
  onSeekBackward,
}: MediaSessionProps) {
  // Silent background audio anchor to keep mobile OS audio context active when screen turns off
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create silent audio anchor (1 second silent base64 WAV loop)
    if (!bgAudioRef.current && typeof window !== 'undefined') {
      const audio = new Audio();
      // 1-second silent WAV base64
      audio.src =
        'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0.01; // nearly silent, keeps OS audio channel active
      bgAudioRef.current = audio;
    }

    return () => {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
      }
    };
  }, []);

  // Sync silent background audio to keep wake lock/audio thread alive on mobile
  useEffect(() => {
    const bgAudio = bgAudioRef.current;
    if (!bgAudio) return;

    if (isPlaying && currentVideo) {
      bgAudio.play().catch(() => {
        // Autoplay policy may catch before user gesture, that's normal
      });
    } else {
      bgAudio.pause();
    }
  }, [isPlaying, currentVideo]);

  // Update MediaSession metadata and action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentVideo) return;

    try {
      const artwork = [
        {
          src: currentVideo.thumbnail || `https://img.youtube.com/vi/${currentVideo.id}/hqdefault.jpg`,
          sizes: '480x360',
          type: 'image/jpeg',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ];

      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentVideo.title,
        artist: currentVideo.channel,
        album: 'SafeTube Audio',
        artwork,
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      navigator.mediaSession.setActionHandler('play', () => {
        onPlay();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        onPause();
      });

      if (onNext) {
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          onNext();
        });
      }

      if (onPrevious) {
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          onPrevious();
        });
      }

      if (onSeekForward) {
        navigator.mediaSession.setActionHandler('seekforward', () => {
          onSeekForward();
        });
      }

      if (onSeekBackward) {
        navigator.mediaSession.setActionHandler('seekbackward', () => {
          onSeekBackward();
        });
      }
    } catch (err) {
      console.warn('MediaSession update warning:', err);
    }
  }, [currentVideo, isPlaying, onPlay, onPause, onNext, onPrevious, onSeekForward, onSeekBackward]);
}
