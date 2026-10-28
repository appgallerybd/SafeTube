import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CategoryChips } from './components/CategoryChips';
import { VideoGrid } from './components/VideoGrid';
import { SafePlayer } from './components/SafePlayer';
import { AudioPlayerView } from './components/AudioPlayerView';
import { MiniPlayer } from './components/MiniPlayer';
import { PWAInstallModal } from './components/PWAInstallModal';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';

import { SafeVideo, PlaybackMode, NavTab } from './types/video';
import { fetchVideosFromGoogleSheet } from './services/sheetService';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useMediaSession } from './hooks/useMediaSession';
import { Heart, Clock, BookmarkCheck, Headphones, Sparkles, CheckCircle } from 'lucide-react';

const STORAGE_KEY_FAVORITES = 'safetube_favorites';
const STORAGE_KEY_WATCH_LATER = 'safetube_watch_later';
const STORAGE_KEY_HISTORY = 'safetube_history';
const STORAGE_KEY_THEME = 'safetube_theme';

export default function App() {
  // Theme state: default dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved !== null) return saved === 'dark';
    return true;
  });

  // Data states
  const [videos, setVideos] = useState<SafeVideo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Playback states
  const [currentVideo, setCurrentVideo] = useState<SafeVideo | null>(null);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('video');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState<boolean>(false);

  // Time tracking for seekbar
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Sleep timer states
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number>(0);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState<number | null>(null);
  const [sleepTimerToast, setSleepTimerToast] = useState<string | null>(null);

  // Set sleep timer helper
  const handleSetSleepTimer = useCallback((minutes: number) => {
    setSleepTimerMinutes(minutes);
    if (minutes > 0) {
      setSleepTimeRemaining(minutes * 60);
      setSleepTimerToast(`⏰ স্লিপ টাইমার সেট করা হয়েছে: ${minutes} মিনিট`);
      setTimeout(() => setSleepTimerToast(null), 3000);
    } else {
      setSleepTimeRemaining(null);
      setSleepTimerToast('স্লিপ টাইমার বন্ধ করা হয়েছে');
      setTimeout(() => setSleepTimerToast(null), 2500);
    }
  }, []);

  // Sleep timer countdown
  useEffect(() => {
    let interval: any = null;

    if (sleepTimerMinutes > 0 && isPlaying) {
      interval = setInterval(() => {
        setSleepTimeRemaining((prev) => {
          if (prev === null) {
            return sleepTimerMinutes * 60;
          }
          if (prev <= 1) {
            // STOP PLAYBACK when timer hits 0
            setIsPlaying(false);
            setSleepTimerMinutes(0);
            const iframe = document.getElementById(`safetube-player-${currentVideo?.id}`) as HTMLIFrameElement;
            if (iframe?.contentWindow) {
              iframe.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
                '*'
              );
            }
            setSleepTimerToast('⏰ স্লিপ টাইমার সমাপ্ত: অডিও প্লেব্যাক স্বয়ংক্রিয়ভাবে বন্ধ করা হয়েছে।');
            setTimeout(() => setSleepTimerToast(null), 5000);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (sleepTimerMinutes === 0) {
      setSleepTimeRemaining(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sleepTimerMinutes, isPlaying, currentVideo?.id]);

  // Navigation and filtering
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('সব');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Modals
  const [installModalOpen, setInstallModalOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  // User Library Lists
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_FAVORITES) || '[]');
    } catch {
      return [];
    }
  });

  const [watchLater, setWatchLater] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_WATCH_LATER) || '[]');
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
    } catch {
      return [];
    }
  });

  // PWA install hook
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Dark mode effect on <html> tag
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Load safe videos on mount
  const loadVideos = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await fetchVideosFromGoogleSheet(forceRefresh);
      setVideos(data);
    } catch (err) {
      console.warn('Load videos failed:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.removeItem('safetube_videos_cache');
      localStorage.removeItem('safetube_videos_timestamp');
      localStorage.removeItem('safetube_custom_sheet_url');
      localStorage.removeItem('safetube_last_sheet_url');
    } catch {
      // ignore
    }
    loadVideos(true);
  }, [loadVideos]);

  // Save library changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WATCH_LATER, JSON.stringify(watchLater));
  }, [watchLater]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }, [history]);

  // Toggle favorite
  const handleToggleFavorite = (video: SafeVideo) => {
    setFavorites((prev) =>
      prev.includes(video.id) ? prev.filter((id) => id !== video.id) : [video.id, ...prev]
    );
  };

  // Toggle watch later
  const handleToggleWatchLater = (video: SafeVideo) => {
    setWatchLater((prev) =>
      prev.includes(video.id) ? prev.filter((id) => id !== video.id) : [video.id, ...prev]
    );
  };

  // Select and play video
  const handleSelectVideo = (video: SafeVideo, mode: PlaybackMode = 'video') => {
    setCurrentVideo(video);
    setPlaybackMode(mode);
    setIsPlaying(true);
    setIsPlayerMinimized(false);

    // Add to history
    setHistory((prev) => [video.id, ...prev.filter((id) => id !== video.id)]);

    // If audio mode selected, switch tab to audio
    if (mode === 'audio') {
      setCurrentTab('audio');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Playlist navigation
  const handleNext = () => {
    if (!currentVideo || videos.length === 0) return;
    const currentIndex = videos.findIndex((v) => v.id === currentVideo.id);
    const nextVideo = currentIndex < videos.length - 1 ? videos[currentIndex + 1] : videos[0];
    handleSelectVideo(nextVideo, playbackMode);
  };

  const handlePrevious = () => {
    if (!currentVideo || videos.length === 0) return;
    const currentIndex = videos.findIndex((v) => v.id === currentVideo.id);
    const prevVideo = currentIndex > 0 ? videos[currentIndex - 1] : videos[videos.length - 1];
    handleSelectVideo(prevVideo, playbackMode);
  };

  const handleTogglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    const iframe = document.getElementById(`safetube-player-${currentVideo?.id}`) as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: next ? 'playVideo' : 'pauseVideo',
          args: '',
        }),
        '*'
      );
    }
  };

  const handleSeekBackward = () => {
    const target = Math.max(0, currentTime - 10);
    handleSeekTo(target);
  };

  const handleSeekForward = () => {
    const target = Math.min(duration || 99999, currentTime + 10);
    handleSeekTo(target);
  };

  const handleSeekTo = (targetSec: number) => {
    const iframe = document.getElementById(`safetube-player-${currentVideo?.id}`) as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [targetSec, true] }),
        '*'
      );
      setCurrentTime(targetSec);
    }
  };

  // MediaSession API setup for mobile lock screen & background controls
  useMediaSession({
    currentVideo,
    isPlaying,
    onPlay: () => {
      setIsPlaying(true);
      const iframe = document.getElementById(`safetube-player-${currentVideo?.id}`) as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: '' }), '*');
      }
    },
    onPause: () => {
      setIsPlaying(false);
      const iframe = document.getElementById(`safetube-player-${currentVideo?.id}`) as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*');
      }
    },
    onNext: handleNext,
    onPrevious: handlePrevious,
    onSeekForward: handleSeekForward,
    onSeekBackward: handleSeekBackward,
  });

  // Keyboard shortcuts (Desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeekBackward();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeekForward();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, duration, currentVideo]);

  // Extract unique categories from videos
  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add('সব');
    videos.forEach((v) => {
      if (v.category) set.add(v.category.trim());
    });
    return Array.from(set);
  }, [videos]);

  // Filter videos based on active tab, search query, and category
  const filteredVideos = useMemo(() => {
    let list = videos;

    if (currentTab === 'favorites') {
      list = list.filter((v) => favorites.includes(v.id));
    } else if (currentTab === 'watch_later') {
      list = list.filter((v) => watchLater.includes(v.id));
    } else if (currentTab === 'history') {
      list = history
        .map((id) => videos.find((v) => v.id === id))
        .filter((v): v is SafeVideo => v !== undefined);
    }

    if (selectedCategory !== 'সব') {
      list = list.filter((v) => v.category?.trim() === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.channel.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [videos, currentTab, favorites, watchLater, history, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 transition-colors duration-200 dark:bg-[#0f0f0f] dark:text-neutral-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Offline Status Bar */}
      <OfflineIndicator />

      {/* Sleep Timer Toast Banner */}
      {sleepTimerToast && (
        <div className="fixed top-18 right-4 z-50 rounded-2xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl dark:bg-white dark:text-neutral-900 animate-in slide-in-from-top-2 duration-200 border border-neutral-700/50">
          {sleepTimerToast}
        </div>
      )}

      {/* 1. Header Navigation */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isAudioMode={playbackMode === 'audio' || currentTab === 'audio'}
        toggleAudioMode={() => {
          if (playbackMode === 'audio' || currentTab === 'audio') {
            setPlaybackMode('video');
            setCurrentTab('home');
            setIsPlayerMinimized(false);
          } else {
            setPlaybackMode('audio');
            setCurrentTab('audio');
            if (!currentVideo && videos.length > 0) {
              handleSelectVideo(videos[0], 'audio');
            }
          }
        }}
        onOpenInstall={() => setInstallModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        toggleSidebar={() => setSidebarOpen((prev) => !prev)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        sleepTimerMinutes={sleepTimerMinutes}
        sleepTimeRemaining={sleepTimeRemaining}
        onSetSleepTimer={handleSetSleepTimer}
      />

      <div className="flex flex-1 relative">
        {/* 2. Responsive Sidebar (Mobile drawer / Tablet icon-rail / Desktop drawer) */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            if (tab === 'audio') {
              setPlaybackMode('audio');
              if (!currentVideo && videos.length > 0) {
                handleSelectVideo(videos[0], 'audio');
              }
            }
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          totalSafeVideos={videos.length}
          onRefreshVideos={() => loadVideos(true)}
          isRefreshing={isRefreshing}
        />

        {/* 
          3. Main Content Area
          Responsive Padding:
          - Mobile (< 768px): pl-0, pb-24 (space for mobile bottom nav + miniplayer)
          - Tablet (768px - 1024px): md:pl-20, pb-10
          - Desktop (>= 1024px): lg:pl-60, pb-10
        */}
        <main className="flex-1 w-full md:pl-20 lg:pl-60 pb-24 md:pb-10 transition-all overflow-x-hidden">
          {/* 
            CRITICAL FOR SMOOTH 100% UNINTERRUPTED AUDIO:
            SafePlayer (containing YouTube iframe) is ALWAYS MOUNTED whenever currentVideo exists!
            - When on 'audio' tab or player is minimized: it is rendered in an off-screen background slot
              so the browser KEEPS PLAYING AUDIO WITHOUT INTERRUPTION!
            - When on other tabs and not minimized: it is displayed visibly at the top of the feed!
          */}
          {currentVideo && (
            <div
              className={
                currentTab === 'audio' || isPlayerMinimized
                  ? 'fixed -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none overflow-hidden'
                  : 'border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/30 backdrop-blur-sm'
              }
            >
              <div className="max-w-7xl mx-auto px-2 pt-2 pb-1 flex justify-end">
                <button
                  onClick={() => setIsPlayerMinimized(true)}
                  className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium px-2 py-1 cursor-pointer flex items-center gap-1"
                >
                  <span>মিনিমাইজ করে ফিড দেখুন</span>
                  <span>↓</span>
                </button>
              </div>

              <SafePlayer
                currentVideo={currentVideo}
                playlist={videos}
                playbackMode={playbackMode}
                onTogglePlaybackMode={() => {
                  const nextMode = playbackMode === 'video' ? 'audio' : 'video';
                  setPlaybackMode(nextMode);
                  if (nextMode === 'audio') {
                    setCurrentTab('audio');
                  }
                }}
                onSelectVideo={handleSelectVideo}
                onClose={() => setCurrentVideo(null)}
                isFavorite={favorites.includes(currentVideo.id)}
                onToggleFavorite={handleToggleFavorite}
                isWatchLater={watchLater.includes(currentVideo.id)}
                onToggleWatchLater={handleToggleWatchLater}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                sleepTimerMinutes={sleepTimerMinutes}
                setSleepTimerMinutes={handleSetSleepTimer}
                sleepTimeRemaining={sleepTimeRemaining}
                onTimeUpdate={(cur, dur) => {
                  setCurrentTime(cur);
                  setDuration(dur);
                }}
                onMinimize={() => setIsPlayerMinimized(true)}
              />
            </div>
          )}

          {/* If user is in Dedicated Audio Mode Tab */}
          {currentTab === 'audio' ? (
            <AudioPlayerView
              currentVideo={currentVideo}
              playlist={videos}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSeekBackward={handleSeekBackward}
              onSeekForward={handleSeekForward}
              onSelectVideo={handleSelectVideo}
              onSwitchToVideo={() => {
                setPlaybackMode('video');
                setCurrentTab('home');
                setIsPlayerMinimized(false);
              }}
              isFavorite={currentVideo ? favorites.includes(currentVideo.id) : false}
              onToggleFavorite={handleToggleFavorite}
              sleepTimerMinutes={sleepTimerMinutes}
              setSleepTimerMinutes={handleSetSleepTimer}
              sleepTimeRemaining={sleepTimeRemaining}
              currentTime={currentTime}
              duration={duration}
              onSeekTo={handleSeekTo}
            />
          ) : (
            <>
              {/* Category Chips Bar */}
              <CategoryChips
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

              {/* Feed Header for Library Views */}
              {currentTab === 'favorites' && (
                <div className="px-3 sm:px-6 pt-4 pb-1 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-600 fill-current" />
                  <h2 className="text-base sm:text-lg font-bold">পছন্দ ({filteredVideos.length})</h2>
                </div>
              )}

              {currentTab === 'watch_later' && (
                <div className="px-3 sm:px-6 pt-4 pb-1 flex items-center gap-2">
                  <BookmarkCheck className="h-4 w-4 text-amber-500" />
                  <h2 className="text-base sm:text-lg font-bold">পরে দেখুন ({filteredVideos.length})</h2>
                </div>
              )}

              {currentTab === 'history' && (
                <div className="px-3 sm:px-6 pt-4 pb-1 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <h2 className="text-base sm:text-lg font-bold">হিস্ট্রি ({filteredVideos.length})</h2>
                </div>
              )}

              {/* Responsive Video Grid (1-col on mobile, 2-col on tablet, 3-4 col on desktop) */}
              <VideoGrid
                videos={filteredVideos}
                onSelectVideo={handleSelectVideo}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                watchLater={watchLater}
                onToggleWatchLater={handleToggleWatchLater}
                currentPlayingId={currentVideo?.id}
                isLoading={isLoading}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                onClearFilters={() => {
                  setSelectedCategory('সব');
                  setSearchQuery('');
                  setCurrentTab('home');
                }}
              />
            </>
          )}
        </main>
      </div>

      {/* 4. Floating Mini Player (Shown when video is active and user browses feed minimized) */}
      {currentVideo && (isPlayerMinimized || (currentTab !== 'home' && currentTab !== 'audio')) && (
        <MiniPlayer
          video={currentVideo}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onExpand={() => {
            setIsPlayerMinimized(false);
            if (playbackMode === 'audio') {
              setCurrentTab('audio');
            } else {
              setCurrentTab('home');
            }
          }}
          onClose={() => setCurrentVideo(null)}
          playbackMode={playbackMode}
        />
      )}

      {/* 5. Mobile Bottom Navigation (Only visible on screens < 768px) */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'audio') {
            setPlaybackMode('audio');
            if (!currentVideo && videos.length > 0) {
              handleSelectVideo(videos[0], 'audio');
            }
          }
        }}
        favoritesCount={favorites.length}
      />

      {/* 6. Modals */}
      <PWAInstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        onInstall={install}
        isIOS={isIOS}
        isInstallable={isInstallable}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onRefreshFeed={() => loadVideos(true)}
        isRefreshing={isRefreshing}
        totalVideos={videos.length}
      />
    </div>
  );
}
