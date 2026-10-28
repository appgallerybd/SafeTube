import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Headphones,
  Tv,
  Timer,
  Heart,
  ListMusic,
} from 'lucide-react';
import { SafeVideo, PlaybackMode, SleepTimerOption } from '../types/video';

interface AudioPlayerViewProps {
  currentVideo: SafeVideo | null;
  playlist: SafeVideo[];
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  onSelectVideo: (video: SafeVideo, mode?: PlaybackMode) => void;
  onSwitchToVideo: () => void;
  isFavorite: boolean;
  onToggleFavorite: (video: SafeVideo) => void;
  sleepTimerMinutes: number;
  setSleepTimerMinutes: (m: number) => void;
  sleepTimeRemaining: number | null;
  currentTime?: number;
  duration?: number;
  onSeekTo?: (seconds: number) => void;
}

const SLEEP_OPTIONS: SleepTimerOption[] = [
  { label: 'স্লিপ বন্ধ', minutes: 0 },
  { label: '১৫ মিনিট', minutes: 15 },
  { label: '৩০ মিনিট', minutes: 30 },
  { label: '৪৫ মিনিট', minutes: 45 },
  { label: '৬০ মিনিট', minutes: 60 },
];

export const AudioPlayerView: React.FC<AudioPlayerViewProps> = ({
  currentVideo,
  playlist,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeekBackward,
  onSeekForward,
  onSelectVideo,
  onSwitchToVideo,
  isFavorite,
  onToggleFavorite,
  sleepTimerMinutes,
  setSleepTimerMinutes,
  sleepTimeRemaining,
  currentTime = 0,
  duration = 0,
  onSeekTo,
}) => {
  const activeVideo = currentVideo || playlist[0];
  const [sliderVal, setSliderVal] = useState<number | null>(null);

  useEffect(() => {
    setSliderVal(null);
  }, [activeVideo?.id]);

  if (!activeVideo) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <Headphones className="h-12 w-12 text-neutral-400 mb-3 animate-bounce" />
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          কোনো অডিও নির্বাচন করা নেই
        </h3>
      </div>
    );
  }

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const displayCurrent = sliderVal !== null ? sliderVal : currentTime;

  return (
    <div className="relative w-full min-h-[calc(100vh-8rem)] flex flex-col justify-between overflow-hidden px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
      {/* YouTube Music style subtle ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 filter blur-3xl scale-125 transition-all duration-700"
        style={{
          backgroundImage: `url(${activeVideo.thumbnail})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl space-y-6">
        {/* Top bar: Mode switcher */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-neutral-700 dark:text-neutral-300">
              অডিও মোড
            </span>
          </div>

          <button
            onClick={onSwitchToVideo}
            className="flex items-center gap-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
          >
            <Tv className="h-3.5 w-3.5 text-red-600" />
            <span>ভিডিও মোড</span>
          </button>
        </div>

        {/* Responsive Grid: Left Player & Right Playlist Queue */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Cover, Title, Visualizer, Progress, Controls */}
          <div className="md:col-span-6 lg:col-span-6 flex flex-col items-center text-center">
            {/* Square Album Artwork */}
            <div className="relative h-52 w-52 sm:h-64 sm:w-64 lg:h-72 lg:w-72 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10">
              <img
                src={activeVideo.thumbnail || `https://img.youtube.com/vi/${activeVideo.id}/hqdefault.jpg`}
                alt={activeVideo.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center p-3">
                <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-semibold text-white flex items-center gap-1 shadow-md">
                  <Headphones className="h-3 w-3" />
                  <span>অডিও</span>
                </span>
              </div>
            </div>

            {/* Title & Channel */}
            <div className="mt-4 w-full max-w-sm px-2">
              <h2 className="line-clamp-2 text-base sm:text-xl font-bold text-neutral-900 dark:text-white leading-tight">
                {activeVideo.title}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                {activeVideo.channel} • {activeVideo.category}
              </p>
            </div>

            {/* Sound Wave Frequency Visualizer */}
            <div className="mt-3 flex items-center justify-center gap-1 h-8 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-200/60 dark:border-neutral-800/60">
              {[12, 24, 16, 32, 20, 28, 14, 30, 18, 26, 14, 22].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all ${
                    isPlaying
                      ? 'bg-red-600 animate-pulse'
                      : 'bg-neutral-400 dark:bg-neutral-600 h-2'
                  }`}
                  style={{
                    height: isPlaying ? `${h}px` : '4px',
                    animationDelay: `${i * 90}ms`,
                    animationDuration: '600ms',
                  }}
                />
              ))}
            </div>

            {/* Interactive Progress Bar */}
            {duration > 0 && (
              <div className="mt-4 w-full max-w-sm px-2">
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={displayCurrent}
                  onChange={(e) => setSliderVal(Number(e.target.value))}
                  onMouseUp={(e) => {
                    if (onSeekTo) onSeekTo(Number((e.target as HTMLInputElement).value));
                    setSliderVal(null);
                  }}
                  onTouchEnd={(e) => {
                    if (onSeekTo) onSeekTo(Number((e.target as HTMLInputElement).value));
                    setSliderVal(null);
                  }}
                  className="w-full h-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 appearance-none cursor-pointer accent-red-600 focus:outline-none"
                />
                <div className="mt-1 flex items-center justify-between text-[11px] font-medium text-neutral-500">
                  <span>{formatSeconds(displayCurrent)}</span>
                  <span>{formatSeconds(duration)}</span>
                </div>
              </div>
            )}

            {/* YouTube Music Controls */}
            <div className="mt-4 flex items-center justify-center gap-3 sm:gap-5">
              <button
                onClick={onSeekBackward}
                title="-১০ সেকেন্ড"
                className="rounded-full p-2 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800 transition active:scale-95"
              >
                <RotateCcw className="h-5 w-5" />
              </button>

              <button
                onClick={onPrevious}
                title="পূর্ববর্তী"
                className="rounded-full p-2 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800 transition active:scale-95"
              >
                <SkipBack className="h-6 w-6 fill-current" />
              </button>

              <button
                onClick={onTogglePlay}
                className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-600/30 hover:bg-red-700 active:scale-95 transition"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-7 w-7 fill-current" />
                ) : (
                  <Play className="h-7 w-7 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={onNext}
                title="পরবর্তী"
                className="rounded-full p-2 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800 transition active:scale-95"
              >
                <SkipForward className="h-6 w-6 fill-current" />
              </button>

              <button
                onClick={onSeekForward}
                title="+১০ সেকেন্ড"
                className="rounded-full p-2 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800 transition active:scale-95"
              >
                <RotateCw className="h-5 w-5" />
              </button>
            </div>

            {/* Sleep Timer & Favorite */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="relative">
                <select
                  value={sleepTimerMinutes}
                  onChange={(e) => setSleepTimerMinutes(Number(e.target.value))}
                  className="rounded-full border border-neutral-300 bg-white/90 px-3.5 py-1.5 pl-8 text-xs font-semibold text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 cursor-pointer outline-none"
                >
                  {SLEEP_OPTIONS.map((opt) => (
                    <option key={opt.minutes} value={opt.minutes}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Timer className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-neutral-500" />
                {sleepTimeRemaining !== null && (
                  <span className="absolute -top-2 -right-1 rounded-full bg-red-600 px-1.5 py-0.2 text-[9px] font-bold text-white shadow-xs">
                    {formatSeconds(sleepTimeRemaining)}
                  </span>
                )}
              </div>

              <button
                onClick={() => onToggleFavorite(activeVideo)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition border ${
                  isFavorite
                    ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/60 dark:text-red-400'
                    : 'border-neutral-300 bg-white/90 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{isFavorite ? 'পছন্দ' : 'পছন্দ'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Playlist Queue */}
          <div className="md:col-span-6 lg:col-span-6">
            <div className="rounded-2xl border border-neutral-200 bg-white/90 dark:border-neutral-800 dark:bg-[#181818] p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-1.5">
                  <ListMusic className="h-4 w-4 text-red-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                    পরবর্তী অডিও তালিকা ({playlist.length})
                  </h3>
                </div>
              </div>

              <div className="mt-2.5 space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {playlist.map((item, idx) => {
                  const isActive = item.id === activeVideo.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectVideo(item, 'audio')}
                      className={`flex items-center gap-2.5 rounded-xl p-2 cursor-pointer transition ${
                        isActive
                          ? 'bg-red-50 border border-red-300 dark:bg-red-950/40 dark:border-red-900'
                          : 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border border-transparent'
                      }`}
                    >
                      <span className={`w-4 text-center text-xs font-bold ${isActive ? 'text-red-600' : 'text-neutral-400'}`}>
                        {idx + 1}
                      </span>
                      <img
                        src={item.thumbnail || `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`}
                        alt={item.title}
                        className="h-10 w-14 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`truncate text-xs font-semibold ${
                            isActive
                              ? 'text-red-600 dark:text-red-400 font-bold'
                              : 'text-neutral-900 dark:text-neutral-200'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-neutral-500 truncate">
                          {item.channel}
                        </p>
                      </div>

                      {isActive && (
                        <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
