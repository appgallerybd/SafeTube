import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Headphones,
  Tv,
  Heart,
  BookmarkCheck,
  Share2,
  Check,
  ChevronDown,
  Sparkles,
  Timer,
  RotateCw,
  ListMusic,
  Minimize2,
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
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [durationSec, setDurationSec] = useState<number>(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const lastLoadedIdRef = useRef<string>(currentVideo.id);

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

    if (nextVideo && nextVideo.id !== currentVideo.id) {
      setCountdown(3);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      let timeLeft = 3;
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

  // Instant track switching (like local audio) using loadVideoById without re-mounting iframe
  useEffect(() => {
    setIsVideoEnded(false);
    setIsPlaying(true);
    cancelCountdown();

    if (lastLoadedIdRef.current !== currentVideo.id) {
      lastLoadedIdRef.current = currentVideo.id;

      // 1. Direct instantaneous load via YT Player API
      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        try {
          ytPlayerRef.current.loadVideoById(currentVideo.id, 0);
          return;
        } catch {}
      }

      // 2. Direct instantaneous postMessage load
      if (iframeRef.current?.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'loadVideoById', args: [currentVideo.id, 0] }),
            '*'
          );
        } catch {}
      }
    }
  }, [currentVideo.id]);

  // Setup YouTube IFrame API once
  useEffect(() => {
    const loadYTAPI = () => {
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
    };
    loadYTAPI();

    const onYouTubeIframeAPIReady = () => {
      try {
        if ((window as any).YT && (window as any).YT.Player && !ytPlayerRef.current) {
          ytPlayerRef.current = new (window as any).YT.Player('safetube-player-iframe', {
            events: {
              onStateChange: (event: any) => {
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
      onYouTubeIframeAPIReady();
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
  }, [handleVideoEnded]);

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

  // Time tracker loop for live seekbar
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
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Left Column: 16:9 Video Player & YouTube Action Pills */}
        <div className="md:col-span-7 lg:col-span-8 space-y-3">
          {/* Main Media Player Container */}
          <div className="relative aspect-video w-full overflow-hidden rounded-xl sm:rounded-2xl bg-black shadow-xl border border-neutral-800">
            {/* 1. YouTube Iframe */}
            <div
              className={`h-full w-full ${
                playbackMode === 'audio' ? 'opacity-0 pointer-events-none absolute inset-0' : 'relative'
              }`}
            >
              <iframe
                id="safetube-player-iframe"
                ref={iframeRef}
                title={currentVideo.title}
                src={`https://www.youtube-nocookie.com/embed/${currentVideo.id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&controls=1&origin=${encodeURIComponent(
                  window.location.origin
                )}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>

            {/* 2. Audio Mode Visualizer Inside Player when in Audio Mode */}
            {playbackMode === 'audio' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-white overflow-hidden bg-gradient-to-b from-neutral-900 via-[#121212] to-black">
                <div
                  className="absolute inset-0 opacity-20 filter blur-3xl scale-125"
                  style={{
                    backgroundImage: `url(${currentVideo.thumbnail})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                  }}
                />

                <div className="relative z-10 flex flex-col items-center max-w-md w-full text-center">
                  <div className="relative mb-3 h-28 w-28 sm:h-36 sm:w-36 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-red-600/40">
                    <img
                      src={currentVideo.thumbnail}
                      alt={currentVideo.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <Headphones className="h-8 w-8 text-white animate-pulse" />
                    </div>
                  </div>

                  <h3 className="line-clamp-2 text-sm sm:text-base font-bold text-white px-2">
                    {currentVideo.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {currentVideo.channel}
                  </p>

                  <div className="mt-3 flex items-center justify-center gap-1 h-6">
                    {[14, 26, 18, 32, 16, 28, 22, 34, 14, 28].map((h, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full ${
                          isPlaying ? 'bg-red-600 animate-pulse' : 'bg-neutral-600 h-2'
                        }`}
                        style={{
                          height: isPlaying ? `${h}px` : '4px',
                          animationDelay: `${i * 100}ms`,
                          animationDuration: '650ms',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. End Screen */}
            {isVideoEnded && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a0a0c]/98 p-4 text-center animate-in fade-in duration-150">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  ভিডিও সমাপ্ত
                </h3>

                {nextVideo && (
                  <div className="mt-3 w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900/90 p-2 text-left">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={nextVideo.thumbnail}
                        alt={nextVideo.title}
                        className="h-12 w-18 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold text-red-500">
                          {countdown !== null ? `পরবর্তী ভিডিও (${countdown} সে.)` : 'পরবর্তী ভিডিও'}
                        </div>
                        <h4 className="line-clamp-1 text-xs font-semibold text-white">
                          {nextVideo.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    onClick={replayCurrentVideo}
                    className="flex items-center gap-1 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700 transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>আবার দেখুন</span>
                  </button>

                  {nextVideo && (
                    <button
                      onClick={playNextVideo}
                      className="flex items-center gap-1 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                    >
                      <SkipForward className="h-3.5 w-3.5" />
                      <span>চালান</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* YouTube Action Pills Bar */}
          <div className="space-y-2">
            <h1 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white leading-snug">
              {currentVideo.title}
            </h1>

            {/* Row of Action Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 font-bold text-white text-xs">
                  {currentVideo.channel ? currentVideo.channel.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <span className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-white">
                    {currentVideo.channel}
                  </span>
                </div>
              </div>

              {/* YouTube Style Action Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {/* Mode Switcher */}
                <button
                  onClick={onTogglePlaybackMode}
                  className="flex items-center gap-1 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition"
                >
                  {playbackMode === 'video' ? (
                    <>
                      <Headphones className="h-3.5 w-3.5 text-red-600" />
                      <span>অডিও মোড</span>
                    </>
                  ) : (
                    <>
                      <Tv className="h-3.5 w-3.5 text-red-600" />
                      <span>ভিডিও মোড</span>
                    </>
                  )}
                </button>

                {/* 10s Seek */}
                <button
                  onClick={() => handleSeek(-10)}
                  className="flex items-center gap-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 px-2.5 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition"
                  title="-১০ সেকেন্ড"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>১০s</span>
                </button>

                <button
                  onClick={() => handleSeek(10)}
                  className="flex items-center gap-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 px-2.5 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition"
                  title="+১০ সেকেন্ড"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>১০s</span>
                </button>

                {/* Favorite */}
                <button
                  onClick={() => onToggleFavorite(currentVideo)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    isFavorite
                      ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                      : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-red-600 text-red-600' : ''}`} />
                  <span>{isFavorite ? 'পছন্দ' : 'পছন্দ'}</span>
                </button>

                {/* Watch Later */}
                <button
                  onClick={() => onToggleWatchLater(currentVideo)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    isWatchLater
                      ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                      : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <BookmarkCheck className={`h-3.5 w-3.5 ${isWatchLater ? 'text-amber-500' : ''}`} />
                  <span>পরে দেখুন</span>
                </button>

                {/* Share */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                  <span>{copied ? 'কপি হয়েছে' : 'শেয়ার'}</span>
                </button>

                {/* Sleep Timer Selector */}
                {setSleepTimerMinutes && (
                  <div className="relative">
                    <select
                      value={sleepTimerMinutes}
                      onChange={(e) => setSleepTimerMinutes(Number(e.target.value))}
                      className="rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none cursor-pointer"
                    >
                      {SLEEP_TIMER_OPTIONS.map((opt) => (
                        <option key={opt.minutes} value={opt.minutes}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Minimize */}
                {onMinimize && (
                  <button
                    onClick={onMinimize}
                    title="মিনিমাইজ"
                    className="flex items-center rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 p-2 text-neutral-600 dark:text-neutral-300 transition"
                  >
                    <Minimize2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Description Dropdown */}
            <div
              onClick={() => setShowDesc(!showDesc)}
              className="rounded-xl bg-neutral-100 p-2.5 text-xs leading-relaxed text-neutral-800 dark:bg-[#1f1f1f] dark:text-neutral-200 cursor-pointer hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition"
            >
              <div className="flex items-center justify-between font-semibold mb-0.5">
                <span>{currentVideo.views || 'নিরাপদ স্ট্রিম'} • {currentVideo.category}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showDesc ? 'rotate-180' : ''}`} />
              </div>
              <p className={showDesc ? '' : 'line-clamp-2 text-neutral-600 dark:text-neutral-400'}>
                {currentVideo.description || currentVideo.title}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Up-Next Queue */}
        <div className="md:col-span-5 lg:col-span-4 space-y-2">
          <div className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#181818] p-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-1.5">
                <ListMusic className="h-4 w-4 text-red-600" />
                <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                  পরবর্তী তালিকা ({playlist.length})
                </h3>
              </div>
            </div>

            <div className="mt-2 space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
              {playlist.map((video, idx) => {
                const isCurrent = video.id === currentVideo.id;
                return (
                  <div
                    key={video.id}
                    onClick={() => onSelectVideo(video, playbackMode)}
                    className={`flex items-center gap-2 rounded-xl p-1.5 cursor-pointer transition ${
                      isCurrent
                        ? 'bg-red-50 border border-red-300 dark:bg-red-950/40 dark:border-red-900'
                        : 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/60 border border-transparent'
                    }`}
                  >
                    <span className={`w-3.5 text-center text-[11px] font-bold ${isCurrent ? 'text-red-600' : 'text-neutral-400'}`}>
                      {idx + 1}
                    </span>
                    <div className="relative aspect-video h-10 w-16 rounded-lg overflow-hidden bg-neutral-900 shrink-0">
                      <img
                        src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`line-clamp-1 text-xs font-semibold ${
                          isCurrent ? 'text-red-600 dark:text-red-400 font-bold' : 'text-neutral-900 dark:text-neutral-200'
                        }`}
                      >
                        {video.title}
                      </h4>
                      <p className="line-clamp-1 text-[10px] text-neutral-500">
                        {video.channel}
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
