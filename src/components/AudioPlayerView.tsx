import React from 'react';
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
}) => {
  const activeVideo = currentVideo || playlist[0];

  if (!activeVideo) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <Headphones className="h-16 w-16 text-neutral-400 mb-4 animate-bounce" />
        <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
          কোনো অডিও ট্র্যাক সিলেক্ট করা নেই
        </h3>
        <p className="mt-1 text-sm text-neutral-500">
          হোম ফিড থেকে যেকোনো নিরাপদ ভিডিও বেছে নিয়ে অডিও শুনুন।
        </p>
      </div>
    );
  }

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-8rem)] flex flex-col justify-between overflow-hidden px-4 py-6 md:py-10">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 filter blur-3xl scale-150 transition-all duration-700"
        style={{
          backgroundImage: `url(${activeVideo.thumbnail})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-4xl space-y-8">
        {/* Top bar info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              SafeTube ব্যাকগ্রাউন্ড ও স্ক্রিন-অফ প্লেয়ার
            </span>
          </div>

          <button
            onClick={onSwitchToVideo}
            className="flex items-center gap-1.5 rounded-full bg-neutral-200/80 px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition"
          >
            <Tv className="h-3.5 w-3.5" />
            <span>ভিডিও মোডে দেখুন</span>
          </button>
        </div>

        {/* Center: Album Artwork & Frequency Waves */}
        <div className="flex flex-col items-center text-center">
          {/* Cover Art */}
          <div className="relative h-56 w-56 sm:h-72 sm:w-72 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-red-500/30 transition-transform hover:scale-102">
            <img
              src={activeVideo.thumbnail}
              alt={activeVideo.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center p-4">
              <span className="rounded-full bg-red-600/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white flex items-center gap-1">
                <Headphones className="h-3.5 w-3.5" />
                <span>অডিও স্ট্রিম</span>
              </span>
            </div>
          </div>

          {/* Title & Channel */}
          <div className="mt-6 max-w-lg px-2">
            <h2 className="line-clamp-2 text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              {activeVideo.title}
            </h2>
            <div className="mt-1.5 flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <span>{activeVideo.channel}</span>
              <span>•</span>
              <span className="rounded bg-neutral-200/60 px-2 py-0.5 text-xs font-medium dark:bg-neutral-800">
                {activeVideo.category}
              </span>
            </div>
          </div>

          {/* Sound Wave Frequency Visualizer */}
          <div className="mt-6 flex items-center justify-center gap-1.5 h-10 px-4 py-1 rounded-2xl bg-neutral-100/60 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800">
            {[12, 28, 18, 36, 24, 32, 16, 40, 26, 30, 20, 38, 14, 28, 22].map((height, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isPlaying
                    ? 'bg-gradient-to-t from-red-600 to-rose-400 animate-pulse'
                    : 'bg-neutral-400 dark:bg-neutral-600 h-2'
                }`}
                style={{
                  height: isPlaying ? `${height}px` : '4px',
                  animationDelay: `${i * 90}ms`,
                  animationDuration: '650ms',
                }}
              />
            ))}
          </div>

          {/* Audio Controls Bar */}
          <div className="mt-8 flex items-center gap-4 sm:gap-6">
            <button
              onClick={onSeekBackward}
              title="১০ সেকেন্ড পেছনে"
              className="rounded-full p-2.5 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800 transition"
            >
              <RotateCcw className="h-6 w-6" />
            </button>

            <button
              onClick={onPrevious}
              title="পূর্ববর্তী গান/ট্র্যাক"
              className="rounded-full p-2.5 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800 transition"
            >
              <SkipBack className="h-6 w-6 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-600/40 hover:bg-red-700 hover:scale-105 transition-all"
            >
              {isPlaying ? (
                <Pause className="h-8 w-8 fill-current" />
              ) : (
                <Play className="h-8 w-8 fill-current ml-1" />
              )}
            </button>

            <button
              onClick={onNext}
              title="পরবর্তী গান/ট্র্যাক"
              className="rounded-full p-2.5 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800 transition"
            >
              <SkipForward className="h-6 w-6 fill-current" />
            </button>

            <button
              onClick={onSeekForward}
              title="১০ সেকেন্ড সামনে"
              className="rounded-full p-2.5 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800 transition"
            >
              <RotateCw className="h-6 w-6" />
            </button>
          </div>

          {/* Secondary Actions: Sleep Timer, Favorite */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {/* Sleep Timer button & menu */}
            <div className="relative">
              <select
                value={sleepTimerMinutes}
                onChange={(e) => setSleepTimerMinutes(Number(e.target.value))}
                className="rounded-full border border-neutral-300 bg-white/80 px-4 py-2 pl-9 text-xs font-semibold text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 shadow-sm cursor-pointer outline-none"
              >
                {SLEEP_OPTIONS.map((opt) => (
                  <option key={opt.minutes} value={opt.minutes}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Timer className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              {sleepTimeRemaining !== null && (
                <span className="absolute -top-2 -right-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                  {formatSeconds(sleepTimeRemaining)}
                </span>
              )}
            </div>

            <button
              onClick={() => onToggleFavorite(activeVideo)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition border ${
                isFavorite
                  ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/60 dark:text-red-400'
                  : 'border-neutral-300 bg-white/80 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{isFavorite ? 'পছন্দের তালিকায় সংরক্ষিত' : 'পছন্দের তালিকায় যুক্ত করুন'}</span>
            </button>
          </div>
        </div>

        {/* Feature Banner: Background Play & Screen-Off Guide */}
        <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80 shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                মোবাইল ব্যাকগ্রাউন্ড ও স্ক্রিন-অফ অডিও সাপোর্ট
              </h4>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                এই অডিও মোডে আপনার ফোনের স্ক্রিন বন্ধ করলেও কিংবা অন্য কোনো অ্যাপ বা ব্রাউজার ব্যবহার করলেও অডিও নিরবচ্ছিন্নভাবে চলতে থাকবে। লক স্ক্রিনেও গান পরিবর্তন ও পজ করার সুবিধা পাবেন।
              </p>
            </div>
          </div>
        </div>

        {/* Safe Audio Playlist Queue */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ListMusic className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              নিরাপদ অডিও প্লেলিস্ট ({playlist.length} টি ট্র্যাক)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {playlist.map((item) => {
              const isActive = item.id === activeVideo.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectVideo(item, 'audio')}
                  className={`flex items-center gap-3 rounded-xl p-2.5 cursor-pointer transition ${
                    isActive
                      ? 'bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-900'
                      : 'bg-neutral-100/70 hover:bg-neutral-200/80 dark:bg-neutral-900/60 dark:hover:bg-neutral-800'
                  }`}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-12 w-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5
                      className={`truncate text-xs font-semibold ${
                        isActive
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-neutral-900 dark:text-neutral-200'
                      }`}
                    >
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-neutral-500 truncate">{item.channel}</p>
                  </div>
                  {isActive && <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
