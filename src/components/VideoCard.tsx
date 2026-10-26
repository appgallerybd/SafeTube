import React, { useState } from 'react';
import {
  Play,
  Headphones,
  Heart,
  BookmarkCheck,
  MoreVertical,
  Check,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { SafeVideo } from '../types/video';

interface VideoCardProps {
  video: SafeVideo;
  onSelectVideo: (video: SafeVideo, mode?: 'video' | 'audio') => void;
  isFavorite: boolean;
  onToggleFavorite: (video: SafeVideo) => void;
  isWatchLater: boolean;
  onToggleWatchLater: (video: SafeVideo) => void;
  currentPlayingId?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelectVideo,
  isFavorite,
  onToggleFavorite,
  isWatchLater,
  onToggleWatchLater,
  currentPlayingId,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const isCurrentlyPlaying = currentPlayingId === video.id;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(video.url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setMenuOpen(false);
    }, 1500);
  };

  // Get first letter of channel for avatar
  const channelInitial = video.channel ? video.channel.charAt(0).toUpperCase() : 'S';

  return (
    <div
      onClick={() => onSelectVideo(video, 'video')}
      className={`group relative flex flex-col cursor-pointer transition-all duration-200 ${
        isCurrentlyPlaying ? 'ring-2 ring-red-500/80 rounded-2xl p-1 bg-red-500/5' : ''
      }`}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-900 shadow-sm">
        <img
          src={video.thumbnail || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
          alt={video.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // fallback to mqdefault if hqdefault fails
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
          }}
        />

        {/* Hover play gradient overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90 text-white shadow-lg backdrop-blur-xs transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </div>
        </div>

        {/* Currently Playing indicator badge */}
        {isCurrentlyPlaying && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            চলছে
          </div>
        )}

        {/* Safe Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-xs px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
          <ShieldCheck className="h-3 w-3" />
          <span>নিরাপদ</span>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 rounded-md bg-black/80 backdrop-blur-xs px-1.5 py-0.5 text-[11px] font-semibold text-white">
          {video.duration || 'HD'}
        </div>

        {/* Quick Audio Play Button on thumbnail */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectVideo(video, 'audio');
          }}
          title="শুধুমাত্র অডিও শুনুন"
          className="absolute bottom-2 left-2 flex h-7 items-center gap-1 rounded-md bg-black/75 backdrop-blur-xs px-2 text-[11px] font-medium text-neutral-200 hover:bg-red-600 hover:text-white transition opacity-90 group-hover:opacity-100"
        >
          <Headphones className="h-3.5 w-3.5" />
          <span className="hidden group-hover:inline text-[10px]">অডিও</span>
        </button>
      </div>

      {/* Video Details */}
      <div className="mt-2.5 flex items-start gap-2.5 px-0.5">
        {/* Channel Avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 text-xs font-bold text-white shadow-xs">
          {channelInitial}
        </div>

        {/* Title, Channel & Meta */}
        <div className="flex-1 min-w-0">
          <h3
            title={video.title}
            className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 group-hover:text-red-600 dark:text-neutral-100 dark:group-hover:text-red-400 transition-colors"
          >
            {video.title}
          </h3>

          <div className="mt-1 flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="truncate max-w-[150px]">{video.channel}</span>
            <Check className="h-3 w-3 text-neutral-400 shrink-0" />
          </div>

          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>{video.views || 'নিরাপদ স্ট্রিম'}</span>
            <span>•</span>
            <span className="rounded bg-neutral-100 px-1.5 py-0.2 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
              {video.category}
            </span>
          </div>
        </div>

        {/* 3-dots Menu Button */}
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            aria-label="Options"
            className="rounded-full p-1 text-neutral-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800 transition"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-6 z-30 w-48 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 animate-in fade-in zoom-in-95 duration-100"
              >
                <button
                  onClick={() => {
                    onSelectVideo(video, 'audio');
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  <Headphones className="h-4 w-4 text-red-500" />
                  <span>শুধু অডিও শুনুন</span>
                </button>

                <button
                  onClick={() => {
                    onToggleFavorite(video);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  <Heart
                    className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-500'}`}
                  />
                  <span>{isFavorite ? 'পছন্দ থেকে মুছুন' : 'পছন্দের তালিকায় যুক্ত করুন'}</span>
                </button>

                <button
                  onClick={() => {
                    onToggleWatchLater(video);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  <BookmarkCheck
                    className={`h-4 w-4 ${isWatchLater ? 'text-amber-500' : 'text-neutral-500'}`}
                  />
                  <span>{isWatchLater ? 'পরে দেখুন থেকে সরান' : 'পরে দেখুন তালিকায় রাখুন'}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Share2 className="h-4 w-4 text-neutral-500" />
                  )}
                  <span>{copied ? 'লিঙ্ক কপি হয়েছে!' : 'ভিডিও লিঙ্ক কপি করুন'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
