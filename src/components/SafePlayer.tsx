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
  RotateCw,
  ListMusic,
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
  onTimeUpdate?: (current: number, duration: number) => void;
  onMinimize?: () => void;
}

const SLEEP_TIMER_OPTIONS: SleepTimerOption[] = [
  { label: 'স্লিপ বন্ধ', minutes: 0 },
  { label: '১৫ মিনিট', minutes: 15 },
  { label: '৩০ মিনিট', minutes: 30 },
  { label: '৪৫ মিনিট', minutes: 45 },
  { label: '৬০ মিনিট', minutes: 60 },
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
  onTimeUpdate,
  onMinimize,
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
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [durationSec, setDurationSec] = useState<number>(0);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const wakeLockSentinelRef = useRef<any>(null);

  // Find next video in playlist
  const currentIndex = playlist.findIndex((v) => v.id === currentVideo.id);
  const nextVideo =
    currentIndex !== -1 && currentIndex < playlist.length - 1
      ? playlist[currentIndex + 1]
      : playlist[0] || null;

  // Autoplay next video safely
  const playNextVideo = useCallback(() => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdown(null);
    setIsVideoEnded(false);
    if (nextVideo) {
      onSelectVideo(nextVideo, playbackMode);
    }
  }, [nextVideo, onSelectVideo, playbackMode]);

  // Handle video ended
  const handleVideoEnded = useCallback(() => {
    setIsVideoEnded(true);
    setIsPlaying(false);

    // Auto-play next Surah/video after 4 seconds
    if (nextVideo && nextVideo.id !== currentVideo.id) {
      setCountdown(4);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      let timeLeft = 4;
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

  // Replay
  const replayCurrentVideo = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdown(null);
    setIsVideoEnded(false);
    setIsPlaying(true);

    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      ytPlayerRef.current.seekTo(0, true);
      ytPlayerRef.current.playVideo();
    } else if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }),
        '*'
      );
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
        '*'
      );
    }
  };

  const cancelCountdown = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCountdown(null);
  };

  // Setup YouTube IFrame API and message listeners
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
        console.warn('YT Player init:', e);
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    const messageListener = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data.event === 'onStateChange' && data.info === 0) {
            handleVideoEnded();
          } else if (data.event === 'onStateChange' && data.info === 1) {
            setIsPlaying(true);
            setIsVideoEnded(false);
          } else if (data.event === 'onStateChange' && data.info === 2) {
            setIsPlaying(false);
          }
        }
      } catch {}
    };

    window.addEventListener('message', messageListener);

    return () => {
      window.removeEventListener('message', messageListener);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [currentVideo.id, handleVideoEnded]);

  // Synchronize play state smoothly with both YT API and postMessage
  useEffect(() => {
    if (ytPlayerRef.current) {
      try {
        if (isPlaying) {
          ytPlayerRef.current.playVideo();
        } else {
          ytPlayerRef.current.pauseVideo();
        }
      } catch {}
    }

    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: isPlaying ? 'playVideo' : 'pauseVideo',
            args: '',
          }),
          '*'
        );
      } catch {}
    }
  }, [isPlaying]);

  // Time tracker loop for seekbar synchronization
  useEffect(() => {
    const timer = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const cur = ytPlayerRef.current.getCurrentTime() || 0;
          const dur = ytPlayerRef.current.getDuration() || 0;
          setCurrentTimeSec(cur);
          setDurationSec(dur);
          if (onTimeUpdate) {
            onTimeUpdate(cur, dur);
          }
        } catch {}
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [onTimeUpdate]);

  // Seek +/- 10s
  const handleSeek = (offset: number) => {
    const target = Math.max(0, currentTimeSec + offset);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      ytPlayerRef.current.seekTo(target, true);
    } else if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [target, true] }),
        '*'
      );
    }
    setCurrentTimeSec(target);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentVideo.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4 animate-in fade-in duration-200">
      {/* 
        RESPONSIVE THEATER GRID:
        - Mobile: 1 column full width, thumb-friendly buttons, stacked playlist below
        - Tablet: 12-column grid (8 cols player, 4 cols playlist) or wide cinema
        - Desktop: 12-column grid (8 cols player, 4 cols sticky playlist queue)
      */}
      <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Left Column (Player, Controls, Meta): Mobile: 12/12, Tablet: 7/12 or 8/12, Desktop: 8/12 */}
        <div className="md:col-span-7 lg:col-span-8 space-y-3 sm:space-y-4">
          {/* Main Media Player Container */}
          <div
            ref={playerContainerRef}
            className="relative aspect-video w-full overflow-hidden rounded-xl sm:rounded-2xl bg-black shadow-2xl border border-neutral-800"
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

            {/* 2. Audio Mode Visualizer Inside Player when in Audio Mode */}
            {playbackMode === 'audio' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 sm:p-6 text-white overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-black">
                <div
                  className="absolute inset-0 opacity-25 filter blur-3xl scale-125"
                  style={{
                    backgroundImage: `url(${currentVideo.thumbnail})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                  }}
                />

                <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
                  <div className="relative mb-3 sm:mb-4 h-28 w-28 sm:h-40 sm:w-40 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-red-500/50">
                    <img
                      src={currentVideo.thumbnail}
                      alt={currentVideo.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <Headphones className="h-8 w-8 sm:h-10 sm:w-10 text-white/95 drop-shadow-md animate-pulse" />
                    </div>
                  </div>

                  <h3 className="line-clamp-2 text-sm sm:text-lg font-bold text-white px-2">
                    {currentVideo.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-400 font-medium">
                    {currentVideo.channel} • {currentVideo.category}
                  </p>

                  {/* Frequency Equalizer */}
                  <div className="mt-3 flex items-center justify-center gap-1 sm:gap-1.5 h-6 sm:h-8">
                    {[16, 28, 20, 36, 18, 30, 24, 38, 14, 32, 22, 18].map((h, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full transition-all ${
                          isPlaying
                            ? 'bg-gradient-to-t from-red-600 to-rose-400 animate-pulse'
                            : 'bg-neutral-600 h-2'
                        }`}
                        style={{
                          height: isPlaying ? `${h}px` : '4px',
                          animationDelay: `${i * 100}ms`,
                          animationDuration: '700ms',
                        }}
                      />
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 rounded-full bg-neutral-800/80 px-3 py-1 text-[11px] text-neutral-300 border border-neutral-700/60">
                    <Smartphone className="h-3 w-3 text-emerald-400" />
                    <span>ব্যাকগ্রাউন্ড ও স্ক্রিন-অফ অডিও চালু আছে</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SafeTube End Screen (No External Recommendations) */}
            {isVideoEnded && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a0a0c]/98 p-4 sm:p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600/20 text-red-500 mb-2 border border-red-500/30">
                  <Check className="h-6 w-6" />
                </div>

                <h3 className="text-base sm:text-xl font-bold text-white">
                  তেলাওয়াত সম্পন্ন হয়েছে
                </h3>
                <p className="mt-0.5 text-xs text-neutral-400 max-w-sm">
                  SafeTube এ কোনো বিজ্ঞাপন বা বিভ্রান্তিকর বাহ্যিক ভিডিও আসে না।
                </p>

                {nextVideo && (
                  <div className="mt-3 w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900/90 p-2.5 text-left shadow-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={nextVideo.thumbnail}
                        alt={nextVideo.title}
                        className="h-14 w-20 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-red-400">
                          <Sparkles className="h-3 w-3" />
                          <span>
                            {countdown !== null
                              ? `পরবর্তী সুরা শুরু হচ্ছে (${countdown} সে.)`
                              : 'পরবর্তী সুরা:'}
                          </span>
                        </div>
                        <h4 className="mt-0.5 line-clamp-1 text-xs sm:text-sm font-semibold text-white">
                          {nextVideo.title}
                        </h4>
                        <p className="text-[10px] text-neutral-400">{nextVideo.channel}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <button
                    onClick={replayCurrentVideo}
                    className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700 transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>আবার শুনুন</span>
                  </button>

                  {nextVideo && (
                    <button
                      onClick={playNextVideo}
                      className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-red-600/40 hover:bg-red-700 transition"
                    >
                      <SkipForward className="h-3.5 w-3.5" />
                      <span>এখনই চালান</span>
                    </button>
                  )}

                  {countdown !== null && (
                    <button
                      onClick={cancelCountdown}
                      className="rounded-xl border border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white transition"
                    >
                      কাউন্টডাউন বন্ধ
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Toolbar below player */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-neutral-100 p-2 sm:p-2.5 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            {/* Mode Toggle (Video vs Audio) */}
            <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 p-0.5 sm:p-1 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-xs">
              <button
                onClick={() => {
                  if (playbackMode !== 'video') onTogglePlaybackMode();
                }}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  playbackMode === 'video'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                <Tv className="h-3.5 w-3.5" />
                <span>ভিডিও মোড</span>
              </button>

              <button
                onClick={() => {
                  if (playbackMode !== 'audio') onTogglePlaybackMode();
                }}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  playbackMode === 'audio'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                <Headphones className="h-3.5 w-3.5" />
                <span>অডিও মোড</span>
              </button>
            </div>

            {/* Quick Seek 10s back and 10s forward */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleSeek(-10)}
                title="১০ সেকেন্ড পেছনে"
                className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>-১০s</span>
              </button>

              <button
                onClick={() => handleSeek(10)}
                title="১০ সেকেন্ড সামনে"
                className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 transition"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>+১০s</span>
              </button>
            </div>

            {/* Sleep Timer in player toolbar */}
            {setSleepTimerMinutes && (
              <div className="flex items-center gap-1.5">
                <Timer className="h-4 w-4 text-neutral-500" />
                <select
                  value={sleepTimerMinutes}
                  onChange={(e) => setSleepTimerMinutes(Number(e.target.value))}
                  className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 outline-none cursor-pointer"
                >
                  {SLEEP_TIMER_OPTIONS.map((opt) => (
                    <option key={opt.minutes} value={opt.minutes}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {sleepTimeRemaining !== null && (
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white animate-pulse">
                    {formatSeconds(sleepTimeRemaining)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Video Title & Actions */}
          <div className="space-y-3 pt-1">
            <h1 className="text-base sm:text-xl font-bold text-neutral-900 dark:text-white leading-snug">
              {currentVideo.title}
            </h1>

            {/* Channel, Favorite, Watch Later, Share Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 to-rose-500 font-bold text-white text-xs shadow-xs">
                  {currentVideo.channel ? currentVideo.channel.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-white">
                      {currentVideo.channel}
                    </span>
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {currentVideo.category}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onToggleFavorite(currentVideo)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition border ${
                    isFavorite
                      ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 border-transparent'
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  <span className="hidden xs:inline">{isFavorite ? 'পছন্দ' : 'পছন্দ'}</span>
                </button>

                <button
                  onClick={() => onToggleWatchLater(currentVideo)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition border ${
                    isWatchLater
                      ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 border-transparent'
                  }`}
                >
                  <BookmarkCheck className={`h-3.5 w-3.5 ${isWatchLater ? 'text-amber-500' : ''}`} />
                  <span className="hidden xs:inline">পরে দেখুন</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 transition"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                  <span>{copied ? 'কপি হয়েছে' : 'শেয়ার'}</span>
                </button>

                {onMinimize && (
                  <button
                    onClick={onMinimize}
                    title="মিনিমাইজ করুন"
                    className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 transition"
                  >
                    <Minimize2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Description Dropdown */}
            <div
              onClick={() => setShowDesc(!showDesc)}
              className="rounded-xl bg-neutral-100 p-2.5 sm:p-3 text-xs leading-relaxed text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 cursor-pointer hover:bg-neutral-200/60 dark:hover:bg-neutral-850 transition"
            >
              <div className="flex items-center justify-between font-semibold text-neutral-900 dark:text-white mb-1">
                <span>{currentVideo.views || 'নিরাপদ অডিও/ভিডিও স্ট্রিম'}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showDesc ? 'rotate-180' : ''}`} />
              </div>
              <p className={showDesc ? '' : 'line-clamp-2'}>
                {currentVideo.description || 'SafeTube প্লেয়ারে কোনো অবাঞ্ছিত এক্সটার্নাল ভিডিও বা বিজ্ঞাপন দেখানো হয় না। সম্পূর্ণ নিরাপদ কন্টেন্ট।'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Safe Up-Next Playlist Queue (Tablet: 5/12, Desktop: 4/12, Mobile: 12/12) */}
        <div className="md:col-span-5 lg:col-span-4 space-y-3">
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-3 sm:p-4 shadow-sm dark:border-neutral-800 dark:bg-[#151515]">
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <ListMusic className="h-4 w-4 text-red-500" />
                <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                  পরবর্তী তালিকা ({playlist.length} টি সুরা)
                </h3>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                অটোপ্লে চালু
              </span>
            </div>

            {/* Up Next List */}
            <div className="mt-2.5 space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {playlist.map((video, idx) => {
                const isCurrent = video.id === currentVideo.id;
                return (
                  <div
                    key={video.id}
                    onClick={() => onSelectVideo(video, playbackMode)}
                    className={`flex items-center gap-2.5 rounded-xl p-2 cursor-pointer transition ${
                      isCurrent
                        ? 'bg-red-50 border border-red-300 dark:bg-red-950/40 dark:border-red-900'
                        : 'bg-neutral-50/80 hover:bg-neutral-100 dark:bg-neutral-900/60 dark:hover:bg-neutral-800/80 border border-transparent'
                    }`}
                  >
                    <span className={`w-4 text-center text-[11px] font-bold ${isCurrent ? 'text-red-600' : 'text-neutral-400'}`}>
                      {idx + 1}
                    </span>
                    <div className="relative aspect-video h-12 w-20 rounded-lg overflow-hidden bg-neutral-900 shrink-0">
                      <img
                        src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                      {isCurrent && (
                        <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                          <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`line-clamp-1 text-xs font-semibold ${
                          isCurrent ? 'text-red-600 dark:text-red-400 font-bold' : 'text-neutral-900 dark:text-neutral-200'
                        }`}
                      >
                        {video.title}
                      </h4>
                      <p className="line-clamp-1 text-[10px] text-neutral-500 mt-0.5">
                        {video.channel} • {video.category}
                      </p>
                    </div>

                    {isCurrent && (
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 shrink-0">
                        চলছে
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
