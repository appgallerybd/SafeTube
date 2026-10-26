import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Headphones,
  Tv,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Clock,
  Moon,
  ShieldCheck,
  Heart,
  BookmarkCheck,
  Share2,
  Check,
  ChevronDown,
  Sparkles,
  Timer,
  Smartphone,
  Eye,
  Radio,
} from 'lucide-react';
import { SafeVideo, PlaybackMode, SleepTimerOption } from '../types/video';

interface SafePlayerProps {
  currentVideo: SafeVideo;
  playlist: SafeVideo[];
  playbackMode: PlaybackMode;
  onTogglePlaybackMode: () => void;
  onSelectVideo: (video: SafeVideo, mode?: PlaybackMode) => void;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (video: SafeVideo) => void;
  isWatchLater: boolean;
  onToggleWatchLater: (video: SafeVideo) => void;
  isPlaying?: boolean;
  setIsPlaying?: (playing: boolean) => void;
  sleepTimerMinutes?: number;
  setSleepTimerMinutes?: (minutes: number) => void;
  sleepTimeRemaining?: number | null;
}

const SLEEP_TIMER_OPTIONS: SleepTimerOption[] = [
  { label: 'বন্ধ (Off)', minutes: 0 },
  { label: '১৫ মিনিট (15m)', minutes: 15 },
  { label: '৩০ মিনিট (30m)', minutes: 30 },
  { label: '৪৫ মিনিট (45m)', minutes: 45 },
  { label: '৬০ মিনিট (60m)', minutes: 60 },
];

export const SafePlayer: React.FC<SafePlayerProps> = ({
  currentVideo,
  playlist,
  playbackMode,
  onTogglePlaybackMode,
  onSelectVideo,
  onClose,
  isFavorite,
  onToggleFavorite,
  isWatchLater,
  onToggleWatchLater,
  isPlaying: externalIsPlaying,
  setIsPlaying: externalSetIsPlaying,
  sleepTimerMinutes = 0,
  setSleepTimerMinutes,
  sleepTimeRemaining = null,
}) => {
  const [internalIsPlaying, setInternalIsPlaying] = useState(true);
  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalIsPlaying;
  const setIsPlaying = (val: boolean) => {
    setInternalIsPlaying(val);
    if (externalSetIsPlaying) externalSetIsPlaying(val);
  };

  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const sleepTimerIntervalRef = useRef<any>(null);
  const wakeLockSentinelRef = useRef<any>(null);

  // Find next video in the safe playlist
  const currentIndex = playlist.findIndex((v) => v.id === currentVideo.id);
  const nextVideo =
    currentIndex !== -1 && currentIndex < playlist.length - 1
      ? playlist[currentIndex + 1]
      : playlist[0] || null;

  // Function to play next video safely
  const playNextVideo = useCallback(() => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdown(null);
    setIsVideoEnded(false);
    if (nextVideo) {
      onSelectVideo(nextVideo, playbackMode);
    }
  }, [nextVideo, onSelectVideo, playbackMode]);

  // Handle when video ends: intercept and display SafeTube End Screen
  const handleVideoEnded = useCallback(() => {
    setIsVideoEnded(true);
    setIsPlaying(false);

    // Start 5 second countdown to auto-play next safe video
    if (nextVideo && nextVideo.id !== currentVideo.id) {
      setCountdown(5);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      let timeLeft = 5;
      countdownIntervalRef.current = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft <= 0) {
          clearInterval(countdownIntervalRef.current);
          playNextVideo();
        } else {
          setCountdown(timeLeft);
        }
      }, 1000);
    }
  }, [nextVideo, currentVideo.id, playNextVideo]);

  // Replay current video
  const replayCurrentVideo = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdown(null);
    setIsVideoEnded(false);
    setIsPlaying(true);

    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      ytPlayerRef.current.seekTo(0, true);
      ytPlayerRef.current.playVideo();
    } else if (iframeRef.current) {
      // Reload iframe src
      iframeRef.current.src = `https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&controls=1&origin=${encodeURIComponent(
        window.location.origin
      )}`;
    }
  };

  // Cancel autoplay countdown
  const cancelCountdown = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdown(null);
  };

  // Setup YouTube IFrame API to catch end events reliably
  useEffect(() => {
    setIsVideoEnded(false);
    setIsPlaying(true);
    cancelCountdown();

    const loadYTAPI = () => {
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
    };

    loadYTAPI();

    const onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    const initPlayer = () => {
      try {
        if ((window as any).YT && (window as any).YT.Player) {
          ytPlayerRef.current = new (window as any).YT.Player(`safetube-player-${currentVideo.id}`, {
            events: {
              onStateChange: (event: any) => {
                // 0 = YT.PlayerState.ENDED
                if (event.data === 0) {
                  handleVideoEnded();
                } else if (event.data === 1) {
                  setIsPlaying(true);
                  setIsVideoEnded(false);
                } else if (event.data === 2) {
                  setIsPlaying(false);
                }
              },
            },
          });
        }
      } catch (e) {
        console.warn('YT Player init warning:', e);
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    // Window message listener as robust fallback for iframe events
    const messageListener = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data.event === 'onStateChange' && data.info === 0) {
            handleVideoEnded();
          }
        }
      } catch {
        // ignore non-json messages
      }
    };

    window.addEventListener('message', messageListener);

    return () => {
      window.removeEventListener('message', messageListener);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [currentVideo.id, handleVideoEnded]);

  // Synchronize YouTube Iframe player with isPlaying
  useEffect(() => {
    if (!ytPlayerRef.current) return;
    try {
      if (isPlaying) {
        if (typeof ytPlayerRef.current.getPlayerState === 'function') {
          const state = ytPlayerRef.current.getPlayerState();
          if (state !== 1 && state !== 3) {
            ytPlayerRef.current.playVideo();
          }
        }
      } else {
        if (typeof ytPlayerRef.current.pauseVideo === 'function') {
          ytPlayerRef.current.pauseVideo();
        }
      }
    } catch {
      // ignore
    }
  }, [isPlaying]);

  // Request WakeLock to keep screen on if enabled
  const toggleWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        if (!wakeLockActive) {
          wakeLockSentinelRef.current = await (navigator as any).wakeLock.request('screen');
          setWakeLockActive(true);
        } else {
          if (wakeLockSentinelRef.current) {
            await wakeLockSentinelRef.current.release();
          }
          setWakeLockActive(false);
        }
      } catch (err) {
        console.warn('Wake Lock error:', err);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentVideo.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Player & Video Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Media Player Container */}
          <div
            ref={playerContainerRef}
            className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl border border-neutral-800"
          >
            {/* 1. YouTube Iframe Player */}
            <div
              className={`h-full w-full ${
                playbackMode === 'audio' ? 'opacity-0 pointer-events-none absolute inset-0' : 'relative'
              }`}
            >
              <iframe
                id={`safetube-player-${currentVideo.id}`}
                ref={iframeRef}
                title={currentVideo.title}
                src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&controls=1&origin=${encodeURIComponent(
                  window.location.origin
                )}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>

            {/* 2. Dedicated Audio Mode Visualizer View (When audio mode is active) */}
            {playbackMode === 'audio' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-white overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-black">
                {/* Ambient Blurred Artwork Glow */}
                <div
                  className="absolute inset-0 opacity-25 filter blur-3xl scale-125"
                  style={{
                    backgroundImage: `url(${currentVideo.thumbnail})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                  }}
                />

                <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
                  {/* Glowing Album Thumbnail */}
                  <div className="relative mb-5 h-36 w-36 sm:h-44 sm:w-44 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-red-500/50">
                    <img
                      src={currentVideo.thumbnail}
                      alt={currentVideo.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Headphones className="h-10 w-10 text-white/90 drop-shadow-md animate-pulse" />
                    </div>
                  </div>

                  {/* Title & Artist */}
                  <h3 className="line-clamp-2 text-base sm:text-lg font-bold text-white px-2">
                    {currentVideo.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-400 font-medium">
                    {currentVideo.channel}
                  </p>

                  {/* Animated Sound Wave Frequency Bars */}
                  <div className="mt-4 flex items-center justify-center gap-1.5 h-8">
                    {[16, 28, 20, 36, 18, 30, 24, 38, 14, 32, 22, 18].map((height, i) => (
                      <span
                        key={i}
                        className="w-1 rounded-full bg-gradient-to-t from-red-600 to-rose-400 animate-pulse"
                        style={{
                          height: `${height}px`,
                          animationDelay: `${i * 120}ms`,
                          animationDuration: '800ms',
                        }}
                      />
                    ))}
                  </div>

                  {/* Background Playback Notice Badge */}
                  <div className="mt-5 flex items-center gap-2 rounded-full bg-neutral-800/80 backdrop-blur-md px-3.5 py-1 text-[11px] text-neutral-300 border border-neutral-700/60">
                    <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                    <span>স্ক্রিন অফ করে বা ব্যাকগ্রাউন্ডে অডিও শুনতে থাকুন</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SafeTube End Screen (Replaces YouTube's external recommendations completely!) */}
            {isVideoEnded && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a0a0c]/98 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/20 text-red-500 mb-3 border border-red-500/30">
                  <Check className="h-6 w-6" />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white">
                  ভিডিও সমাপ্ত হয়েছে
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-neutral-400 max-w-sm">
                  SafeTube এ কোনো বাহ্যিক ইউটিউব সাজেশন প্রদর্শিত হয় না।
                </p>

                {/* Next Safe Video Preview Card */}
                {nextVideo && (
                  <div className="mt-4 w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900/90 p-3 text-left shadow-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={nextVideo.thumbnail}
                        alt={nextVideo.title}
                        className="h-16 w-24 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-400">
                          <Sparkles className="h-3 w-3" />
                          <span>
                            {countdown !== null
                              ? `পরবর্তী নিরাপদ ভিডিও প্লে হচ্ছে (${countdown} সে.)`
                              : 'পরবর্তী ভিডিও:'}
                          </span>
                        </div>
                        <h4 className="mt-0.5 line-clamp-1 text-xs sm:text-sm font-semibold text-white">
                          {nextVideo.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400">{nextVideo.channel}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={replayCurrentVideo}
                    className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-700 transition"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>আবার দেখুন</span>
                  </button>

                  {nextVideo && (
                    <button
                      onClick={playNextVideo}
                      className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-red-600/40 hover:bg-red-700 transition"
                    >
                      <SkipForward className="h-4 w-4" />
                      <span>এখনই চালান</span>
                    </button>
                  )}

                  {countdown !== null && (
                    <button
                      onClick={cancelCountdown}
                      className="rounded-xl border border-neutral-800 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white transition"
                    >
                      কাউন্টডাউন বন্ধ
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Toolbar below player */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-neutral-100 p-2.5 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            {/* Mode Toggle (Video vs Audio) */}
            <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 p-1 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => {
                  if (playbackMode !== 'video') onTogglePlaybackMode();
                }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  playbackMode === 'video'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white'
                }`}
              >
                <Tv className="h-3.5 w-3.5" />
                <span>ভিডিও মোড</span>
              </button>

              <button
                onClick={() => {
                  if (playbackMode !== 'audio') onTogglePlaybackMode();
                }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  playbackMode === 'audio'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white'
                }`}
              >
                <Headphones className="h-3.5 w-3.5" />
                <span>শুধু অডিও মোড</span>
              </button>
            </div>

            {/* Utility actions: Sleep Timer & Wake Lock */}
            <div className="flex items-center gap-2">
              {/* Sleep Timer Selector */}
              <div className="relative">
                <select
                  value={sleepTimerMinutes}
                  onChange={(e) => {
                    const mins = Number(e.target.value);
                    if (setSleepTimerMinutes) setSleepTimerMinutes(mins);
                  }}
                  aria-label="Sleep Timer"
                  className="appearance-none rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 pl-7 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 cursor-pointer outline-none"
                >
                  {SLEEP_TIMER_OPTIONS.map((opt) => (
                    <option key={opt.minutes} value={opt.minutes}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Timer className="pointer-events-none absolute left-2 top-2 h-3.5 w-3.5 text-neutral-500" />
                {sleepTimeRemaining !== null && (
                  <span className="absolute -top-2 -right-1 rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                    {formatSeconds(sleepTimeRemaining)}
                  </span>
                )}
              </div>

              {/* Keep Screen On WakeLock Toggle */}
              <button
                onClick={toggleWakeLock}
                title={wakeLockActive ? 'স্ক্রিন অন সক্রিয়' : 'স্ক্রিন স্লিপ প্রতিরোধ করুন'}
                className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                  wakeLockActive
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {wakeLockActive ? 'স্ক্রিন অন' : 'স্ক্রিন অন রাখুন'}
                </span>
              </button>
            </div>
          </div>

          {/* Video Metadata & Creator Info */}
          <div className="space-y-3">
            <h1 className="text-lg sm:text-xl font-bold leading-tight text-neutral-900 dark:text-white">
              {currentVideo.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-3 dark:border-neutral-800">
              {/* Channel */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 to-rose-500 font-bold text-white shadow-sm">
                  {currentVideo.channel ? currentVideo.channel.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                      {currentVideo.channel}
                    </span>
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {currentVideo.category}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Favorite, Watch Later, Share */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleFavorite(currentVideo)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    isFavorite
                      ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  <span>{isFavorite ? 'পছন্দ করা হয়েছে' : 'পছন্দ'}</span>
                </button>

                <button
                  onClick={() => onToggleWatchLater(currentVideo)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    isWatchLater
                      ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                  }`}
                >
                  <BookmarkCheck
                    className={`h-4 w-4 ${isWatchLater ? 'text-amber-500' : ''}`}
                  />
                  <span>{isWatchLater ? 'তালিকায় আছে' : 'পরে দেখুন'}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 transition"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                  <span>{copied ? 'কপি হয়েছে' : 'শেয়ার'}</span>
                </button>
              </div>
            </div>

            {/* Description accordion */}
            <div
              onClick={() => setShowDesc(!showDesc)}
              className="rounded-xl bg-neutral-100 p-3 text-xs leading-relaxed text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 cursor-pointer hover:bg-neutral-200/70 dark:hover:bg-neutral-850 transition"
            >
              <div className="flex items-center justify-between font-semibold text-neutral-900 dark:text-white mb-1">
                <span>{currentVideo.views || 'নিরাপদ স্ট্রিম'}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showDesc ? 'rotate-180' : ''}`}
                />
              </div>
              <p className={showDesc ? '' : 'line-clamp-2'}>
                {currentVideo.description || 'SafeTube প্লেয়ারে কোনো অবাঞ্ছিত এক্সটার্নাল ভিডিও দেখানো হয় না। সম্পূর্ণ নিরাপদ কন্টেন্ট।'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Safe Playlist Queue (Only videos from your approved list) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                অনুমোদিত নিরাপদ তালিকা
              </h3>
            </div>
            <span className="text-xs text-neutral-500">
              {currentIndex + 1} / {playlist.length}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {playlist.map((video, idx) => {
              const isCurrent = video.id === currentVideo.id;
              return (
                <div
                  key={video.id}
                  onClick={() => onSelectVideo(video, playbackMode)}
                  className={`group flex items-start gap-3 rounded-xl p-2 cursor-pointer transition ${
                    isCurrent
                      ? 'bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-900/50'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-neutral-900">
                    <img
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                        <span className="flex h-2 w-2 rounded-full bg-white animate-ping" />
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[9px] font-semibold text-white">
                      {video.duration || 'HD'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className={`line-clamp-2 text-xs font-semibold leading-snug ${
                        isCurrent
                          ? 'text-red-600 dark:text-red-400 font-bold'
                          : 'text-neutral-900 group-hover:text-red-600 dark:text-neutral-200 dark:group-hover:text-red-400'
                      }`}
                    >
                      {video.title}
                    </h4>
                    <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      {video.channel}
                    </p>
                    <span className="inline-block mt-0.5 rounded bg-neutral-100 px-1.5 py-0.2 text-[9px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      {video.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
