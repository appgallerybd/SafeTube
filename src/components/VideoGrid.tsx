import React from 'react';
import { VideoCard } from './VideoCard';
import { SafeVideo } from '../types/video';
import { Film, SearchX, CheckCircle } from 'lucide-react';

interface VideoGridProps {
  videos: SafeVideo[];
  onSelectVideo: (video: SafeVideo, mode?: 'video' | 'audio') => void;
  favorites: string[];
  onToggleFavorite: (video: SafeVideo) => void;
  watchLater: string[];
  onToggleWatchLater: (video: SafeVideo) => void;
  currentPlayingId?: string;
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string;
  onClearFilters: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  onSelectVideo,
  favorites,
  onToggleFavorite,
  watchLater,
  onToggleWatchLater,
  currentPlayingId,
  isLoading,
  searchQuery,
  selectedCategory,
  onClearFilters,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col animate-pulse">
            <div className="aspect-video w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="mt-3 flex gap-3">
              <div className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3.5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mb-4">
          <SearchX className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
          কোনো ভিডিও পাওয়া যায়নি
        </h3>
        <p className="mt-1 text-sm text-neutral-500 max-w-sm">
          {searchQuery
            ? `"${searchQuery}" এর সাথে মিলে এমন কোনো নিরাপদ ভিডিও তালিকায় নেই।`
            : 'এই ক্যাটাগরিতে বর্তমানে কোনো ভিডিও নেই।'}
        </p>
        <button
          onClick={onClearFilters}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition"
        >
          সব ভিডিও দেখুন
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5">
      {/* Context heading / status bar */}
      {(searchQuery || selectedCategory !== 'সব') && (
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {searchQuery ? (
              <span>
                খোঁজা হয়েছে: <span className="font-semibold text-red-600 dark:text-red-400">"{searchQuery}"</span>
              </span>
            ) : (
              <span>
                ক্যাটাগরি: <span className="font-semibold text-neutral-900 dark:text-white">{selectedCategory}</span>
              </span>
            )}
            <span className="ml-2 text-xs text-neutral-400">({videos.length}টি ভিডিও)</span>
          </div>
          <button
            onClick={onClearFilters}
            className="text-xs text-red-600 hover:underline dark:text-red-400 font-medium"
          >
            ফিল্টার রিসেট
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onSelectVideo={onSelectVideo}
            isFavorite={favorites.includes(video.id)}
            onToggleFavorite={onToggleFavorite}
            isWatchLater={watchLater.includes(video.id)}
            onToggleWatchLater={onToggleWatchLater}
            currentPlayingId={currentPlayingId}
          />
        ))}
      </div>
    </div>
  );
};
