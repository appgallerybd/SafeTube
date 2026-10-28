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
  Volume2,
  VolumeX,
  Timer,
  Smartphone,
  ShieldCheck,
  Heart,
  ListMusic,
  Moon,
  Sparkles,
  Music,
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
  { label: 'স্লিপ টাইমার বন্ধ', minutes: 0 },
  { label: '১৫ মিনিট পর বন্ধ', minutes: 15 },
  { label: '৩০ মিনিট পর বন্ধ', minutes: 30 },
  { label: '৪৫ মিনিট পর বন্ধ', minutes: 45 },
  { label: '১ ঘন্টা পর বন্ধ', minutes: 60 },
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
        <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-4">
          <Headphones className="h-8 w-8 animate-bounce" />
        </div>
        <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
          কোনো অডিও ট্র্যাক নির্বাচন করা নেই
        </h3>
        <p className="mt-1 text-sm text-neutral-500 max-w-sm">
          আপনার গুগল শীট থেকে যেকোনো সুরার অডিও শুনতে প্লেলিস্টের ভিডিও নির্বাচন করুন।
        </p>
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
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (displayCurrent / duration) * 100)) : 0;

  return (
    <div className="relative w-full min-h-[calc(100vh-7rem)] flex flex-col justify-between overflow-hidden px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Ambient Background Glow matching thumbnail */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15 filter blur-3xl scale-125 transition-all duration-700"
        style={{
          backgroundImage: `url(${activeVideo.thumbnail})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              SafeTube ব্যাকগ্রাউন্ড ও স্ক্রিন-অফ অডিও
            </span>
          </div>

          <button
            onClick={onSwitchToVideo}
            className="flex items-center gap-1.5 rounded-full bg-neutral-200/90 px-3.5 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition shadow-xs"
          >
            <Tv className="h-3.5 w-3.5 text-red-500" />
            <span>ভিডিও মোডে দেখুন</span>
          </button>
        </div>

        {/* 
          RESPONSIVE GRID LAYOUT:
          - Mobile (< 768px): Single column stacked, thumb-friendly
          - Tablet (768px - 1024px): 2 balanced columns (Left: Player, Right: Queue)
          - Desktop (>= 1024px): Wide 2 columns with rich cards
        */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* LEFT COLUMN: Cover Artwork, Title, Soundwaves, Controls, Progress */}
          <div className="md:col-span-6 lg:col-span-6 flex flex-col items-center text-center">
            {/* Artwork Container */}
            <div className="relative h-48 w-48 sm:h-64 sm:w-64 lg:h-72 lg:w-72 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-red-500/30 transition-transform hover:scale-102">
              <img
                src={activeVideo.thumbnail || `https://img.youtube.com/vi/${activeVideo.id}/hqdefault.jpg`}
                alt={activeVideo.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center p-3 sm:p-4">
                <span className="rounded-full bg-red-600/95 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md">
                  <Headphones className="h-3.5 w-3.5 animate-pulse" />
                  <span>অডিও স্ট্রিম চলছে</span>
                </span>
              </div>
            </div>

            {/* Title & Category */}
            <div className="mt-4 sm:mt-6 w-full max-w-md px-2">
              <h2 className="line-clamp-2 text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                {activeVideo.title}
              </h2>
              <div className="mt-1.5 flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                <span className="font-medium">{activeVideo.channel}</span>
                <span>•</span>
                <span className="rounded-md bg-neutral-200/70 px-2 py-0.5 text-xs font-semibold dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {activeVideo.category}
                </span>
              </div>
            </div>

            {/* Sound Wave Frequency Visualizer */}
            <div className="mt-4 sm:mt-5 flex items-center justify-center gap-1 sm:gap-1.5 h-10 px-4 py-1.5 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/70 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800/60">
              {[14, 28, 18, 36, 22, 32, 16, 38, 24, 30, 18, 34, 16, 26, 20].map((h, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlaying
                      ? 'bg-gradient-to-t from-red-600 to-rose-400 animate-pulse'
                      : 'bg-neutral-400 dark:bg-neutral-600 h-2'
                  }`}
                  style={{
                    height: isPlaying ? `${h}px` : '4px',
                    animationDelay: `${i * 80}ms`,
                    animationDuration: '650ms',
                  }}
                />
              ))}
            </div>

            {/* Interactive Progress Bar Slider */}
            {duration > 0 && (
              <div className="mt-5 w-full max-w-md px-2">
                <div className="relative flex items-center group">
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
                    className="w-full h-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 appearance-none cursor-pointer accent-red-600 focus:outline-none"
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                  <span>{formatSeconds(displayCurrent)}</span>
                  <span>{formatSeconds(duration)}</span>
                </div>
              </div>
            )}

            {/* Audio Controls Bar */}
            <div className="mt-5 sm:mt-6 flex items-center justify-center gap-3 sm:gap-6">
              <button
                onClick={onSeekBackward}
                title="১০ সেকেন্ড পেছনে (Rewind 10s)"
                className="rounded-full p-2.5 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800 transition active:scale-95"
              >
                <RotateCcw className="h-6 w-6" />
              </button>

              <button
                onClick={onPrevious}
                title="পূর্ববর্তী সুরা / ট্র্যাক"
                className="rounded-full p-2.5 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800 transition active:scale-95"
              >
                <SkipBack className="h-6 w-6 fill-current" />
              </button>

              <button
                onClick={onTogglePlay}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-600/40 hover:bg-red-700 hover:scale-105 active:scale-95 transition-all"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8 fill-current" />
                ) : (
                  <Play className="h-8 w-8 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={onNext}
                title="পরবর্তী সুরা / ট্র্যাক"
                className="rounded-full p-2.5 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800 transition active:scale-95"
              >
                <SkipForward className="h-6 w-6 fill-current" />
              </button>

              <button
                onClick={onSeekForward}
                title="১০ সেকেন্ড সামনে (Forward 10s)"
                className="rounded-full p-2.5 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800 transition active:scale-95"
              >
                <RotateCw className="h-6 w-6" />
              </button>
            </div>

            {/* Secondary Actions: Sleep Timer, Favorite */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {/* Sleep Timer */}
              <div className="relative">
                <select
                  value={sleepTimerMinutes}
                  onChange={(e) => setSleepTimerMinutes(Number(e.target.value))}
                  className="rounded-full border border-neutral-300 bg-white/90 px-4 py-2 pl-9 text-xs font-semibold text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 shadow-sm cursor-pointer outline-none hover:border-red-500 transition"
                >
                  {SLEEP_OPTIONS.map((opt) => (
                    <option key={opt.minutes} value={opt.minutes}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Timer className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                {sleepTimeRemaining !== null && (
                  <span className="absolute -top-2 -right-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md animate-pulse">
                    {formatSeconds(sleepTimeRemaining)}
                  </span>
                )}
              </div>

              {/* Favorite Button */}
              <button
                onClick={() => onToggleFavorite(activeVideo)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition border ${
                  isFavorite
                    ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/60 dark:text-red-400'
                    : 'border-neutral-300 bg-white/90 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
                }`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{isFavorite ? 'পছন্দের তালিকায় সংরক্ষিত' : 'পছন্দে রাখুন'}</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Mobile Background Play Guide + Dedicated Playlist Queue */}
          <div className="md:col-span-6 lg:col-span-6 space-y-4">
            {/* Background Play Feature Banner */}
            <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-4 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/80 shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <span>১০০% ব্যাকগ্রাউন্ড ও স্ক্রিন-অফ অডিও</span>
                    <span className="rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] px-1.5 py-0.5">অ্যাক্টিভ</span>
                  </h4>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    এই মোডে ফোনের স্ক্রিন অফ করলেও বা ব্রাউজার মিনিমাইজ করে অন্য অ্যাপ চালালেও অডিও চলতে থাকবে। ফোনের লক-স্ক্রিন থেকেও প্লে/পজ নিয়ন্ত্রণ করা যায়।
                  </p>
                </div>
              </div>
            </div>

            {/* Playlist Queue Header */}
            <div className="rounded-2xl border border-neutral-200 bg-white/90 dark:border-neutral-800 dark:bg-[#151515] p-4 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <ListMusic className="h-4 w-4 text-red-500" />
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    অডিও প্লেলিস্ট কিউ ({playlist.length} টি সুরা)
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-neutral-500">
                  ট্যাপ করে চালান
                </span>
              </div>

              {/* Scrollable Track Queue */}
              <div className="mt-3 space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {playlist.map((item, idx) => {
                  const isActive = item.id === activeVideo.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectVideo(item, 'audio')}
                      className={`flex items-center gap-3 rounded-xl p-2.5 cursor-pointer transition ${
                        isActive
                          ? 'bg-red-50 border border-red-300 dark:bg-red-950/50 dark:border-red-900'
                          : 'bg-neutral-50/70 hover:bg-neutral-100 dark:bg-neutral-900/60 dark:hover:bg-neutral-800/80 border border-transparent'
                      }`}
                    >
                      <span className={`w-5 text-center text-xs font-bold ${isActive ? 'text-red-600' : 'text-neutral-400'}`}>
                        {idx + 1}
                      </span>
                      <img
                        src={item.thumbnail || `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`}
                        alt={item.title}
                        className="h-11 w-16 rounded-lg object-cover shrink-0 shadow-xs"
                      />
                      <div className="flex-1 min-w-0">
                        <h5
                          className={`truncate text-xs font-semibold ${
                            isActive
                              ? 'text-red-600 dark:text-red-400 font-bold'
                              : 'text-neutral-900 dark:text-neutral-200'
                          }`}
                        >
                          {item.title}
                        </h5>
                        <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                          {item.channel} • {item.category}
                        </p>
                      </div>

                      {isActive ? (
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                          <span className="text-[10px] font-bold text-red-600 dark:text-red-400">চলছে</span>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectVideo(item, 'audio');
                          }}
                          className="h-7 w-7 rounded-full bg-neutral-200 dark:bg-neutral-800 hover:bg-red-600 hover:text-white flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition"
                          title="প্লে করুন"
                        >
                          <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                        </button>
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
