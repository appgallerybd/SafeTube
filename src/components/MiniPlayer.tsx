import React from 'react';
import { Play, Pause, X, Maximize2, Headphones, Tv } from 'lucide-react';
import { SafeVideo, PlaybackMode } from '../types/video';

interface MiniPlayerProps {
  video: SafeVideo;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onExpand: () => void;
  onClose: () => void;
  playbackMode: PlaybackMode;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  video,
  isPlaying,
  onTogglePlay,
  onExpand,
  onClose,
  playbackMode,
}) => {
  return (
    <div className="fixed bottom-16 md:bottom-5 right-0 md:right-5 z-40 w-full md:w-96 px-2 sm:px-3 md:px-0 animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center gap-3 rounded-2xl border border-neutral-300 bg-white/95 p-2 sm:p-2.5 shadow-2xl backdrop-blur-md dark:border-neutral-800 dark:bg-[#181818]/95">
        {/* Clickable Area to Expand */}
        <div
          onClick={onExpand}
          className="relative aspect-video h-11 sm:h-12 rounded-xl overflow-hidden bg-neutral-900 shrink-0 cursor-pointer group"
        >
          <img
            src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
            alt={video.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
            {playbackMode === 'audio' ? (
              <Headphones className="h-4 w-4 text-white animate-pulse" />
            ) : (
              <Tv className="h-4 w-4 text-white" />
            )}
          </div>
        </div>

        {/* Title and details */}
        <div onClick={onExpand} className="flex-1 min-w-0 cursor-pointer">
          <h4 className="line-clamp-1 text-xs font-bold text-neutral-900 dark:text-white">
            {video.title}
          </h4>
          <p className="line-clamp-1 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {video.channel} • {video.category}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 active:scale-95 transition shadow-sm"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onExpand}
            aria-label="Expand"
            title="বড় করে দেখুন"
            className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          <button
            onClick={onClose}
            aria-label="Close player"
            title="বন্ধ করুন"
            className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
