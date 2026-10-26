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
  // Theme state: default dark mode like modern YouTube
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved !== null) return saved === 'dark';
    return true; // default dark
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

  // Sleep timer states
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number>(0);
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState<number | null>(null);
  const [sleepTimerToast, setSleepTimerToast] = useState<string | null>(null);

  // Set sleep timer helper (15, 30, 45, 60 mins or 0 to turn off)
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

  // Fully functional sleep timer countdown logic in App.tsx:
  // Decrements remaining seconds while isPlaying is true.
  // When timer hits 0, it automatically stops playback and sets isPlaying to false.
  useEffect(() => {
    let interval: any = null;

    if (sleepTimerMinutes > 0 && isPlaying) {
      interval = setInterval(() => {
        setSleepTimeRemaining((prev) => {
          if (prev === null) {
            return sleepTimerMinutes * 60;
          }
          if (prev <= 1) {
            // STOP PLAYBACK and set isPlaying to false!
            setIsPlaying(false);
            setSleepTimerMinutes(0);
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
  }, [sleepTimerMinutes, isPlaying]);

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
    loadVideos();
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

    // If audio mode selected, switch tab to audio if user wants or keep focused
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
    setIsPlaying((prev) => !prev);
  };

  // MediaSession API setup for background audio & lock screen controls
  useMediaSession({
    currentVideo,
    isPlaying,
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onNext: handleNext,
    onPrevious: handlePrevious,
  });

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

    // Tab filtering
    if (currentTab === 'favorites') {
      list = list.filter((v) => favorites.includes(v.id));
    } else if (currentTab === 'watch_later') {
      list = list.filter((v) => watchLater.includes(v.id));
    } else if (currentTab === 'history') {
      // Order by history
      list = history
        .map((id) => videos.find((v) => v.id === id))
        .filter((v): v is SafeVideo => !!v);
    }

    // Category filtering
    if (selectedCategory !== 'সব') {
      list = list.filter((v) => v.category === selectedCategory);
    }

    // Search query filtering
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.channel.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          (v.description && v.description.toLowerCase().includes(q))
      );
    }

    return list;
  }, [videos, currentTab, favorites, watchLater, history, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-[#0f0f0f] dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isAudioMode={playbackMode === 'audio'}
        toggleAudioMode={() => {
          if (playbackMode === 'video') {
            setPlaybackMode('audio');
            setCurrentTab('audio');
            if (!currentVideo && videos.length > 0) {
              handleSelectVideo(videos[0], 'audio');
            }
          } else {
            setPlaybackMode('video');
            setCurrentTab('home');
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

      <div className="flex flex-1">
        {/* 2. Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            if (tab === 'audio') {
              setPlaybackMode('audio');
              if (!currentVideo && videos.length > 0) {
                handleSelectVideo(videos[0], 'audio');
              }
            } else if (tab === 'home' && playbackMode === 'audio') {
              // keep playing in background
            }
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          totalSafeVideos={videos.length}
          onRefreshVideos={() => loadVideos(true)}
          isRefreshing={isRefreshing}
        />

        {/* 3. Main Content Area */}
        <main className="flex-1 md:pl-20 lg:pl-60 pb-20 md:pb-8 transition-all overflow-x-hidden">
          {/* A. If user is in Audio Mode Tab */}
          {currentTab === 'audio' ? (
            <AudioPlayerView
              currentVideo={currentVideo}
              playlist={videos}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSeekBackward={() => {}}
              onSeekForward={() => {}}
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
            />
          ) : (
            <>
              {/* B. Active Safe Player (When video is playing and not minimized) */}
              {currentVideo && !isPlayerMinimized && (
                <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/30 backdrop-blur-sm">
                  <div className="max-w-7xl mx-auto px-2 pt-2 pb-1 flex justify-end">
                    <button
                      onClick={() => setIsPlayerMinimized(true)}
                      className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium px-2 py-1 cursor-pointer"
                    >
                      মিনিমাইজ করে ফিড দেখুন ↓
                    </button>
                  </div>
                  <SafePlayer
                    currentVideo={currentVideo}
                    playlist={videos}
                    playbackMode={playbackMode}
                    onTogglePlaybackMode={() =>
                      setPlaybackMode((prev) => (prev === 'video' ? 'audio' : 'video'))
                    }
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
                  />
                </div>
              )}

              {/* C. Category Chips Bar */}
              <CategoryChips
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

              {/* D. Feed Header for Library Views */}
              {currentTab === 'favorites' && (
                <div className="px-4 sm:px-6 pt-5 pb-1 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500 fill-current" />
                  <h2 className="text-lg font-bold">পছন্দের নিরাপদ ভিডিও ({filteredVideos.length})</h2>
                </div>
              )}

              {currentTab === 'watch_later' && (
                <div className="px-4 sm:px-6 pt-5 pb-1 flex items-center gap-2">
                  <BookmarkCheck className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-bold">পরে দেখুন তালিকা ({filteredVideos.length})</h2>
                </div>
              )}

              {currentTab === 'history' && (
                <div className="px-4 sm:px-6 pt-5 pb-1 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-bold">সম্প্রতি দেখা ভিডিওসমূহ ({filteredVideos.length})</h2>
                </div>
              )}

              {/* E. Video Grid */}
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
      {currentVideo && (isPlayerMinimized || currentTab !== 'home') && currentTab !== 'audio' && (
        <MiniPlayer
          video={currentVideo}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onExpand={() => {
            setIsPlayerMinimized(false);
            if (currentTab !== 'home') setCurrentTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onClose={() => setCurrentVideo(null)}
          playbackMode={playbackMode}
        />
      )}

      {/* 5. Mobile Bottom Navigation */}
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

      {/* 6. Offline status indicator */}
      <OfflineIndicator />

      {/* 7. Guided PWA Install Modal */}
      <PWAInstallModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
        isInstallable={isInstallable}
        isIOS={isIOS}
        onInstall={install}
      />

      {/* 8. Settings & Info Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onRefreshFeed={() => loadVideos(true)}
        isRefreshing={isRefreshing}
        totalVideos={videos.length}
      />

      {/* 9. Sleep Timer Notification Toast */}
      {sleepTimerToast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2.5 rounded-2xl bg-neutral-900/95 border border-red-500/50 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span>{sleepTimerToast}</span>
        </div>
      )}
    </div>
  );
}
