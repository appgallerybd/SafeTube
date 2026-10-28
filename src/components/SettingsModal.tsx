import React from 'react';
import {
  X,
  RefreshCw,
  Sliders,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshFeed: () => void;
  isRefreshing: boolean;
  totalVideos: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onRefreshFeed,
  isRefreshing,
  totalVideos,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-800 dark:bg-[#181818] text-neutral-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-bold">সেটিংস</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Clean Settings List */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900">
            <span className="text-xs font-semibold">সংরক্ষিত ভিডিও সংখ্যা</span>
            <span className="text-xs font-bold text-red-600 dark:text-red-500">{totalVideos} টি</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900">
            <span className="text-xs font-semibold">ক্যাশ ও ডাটা রিফ্রেশ</span>
            <button
              onClick={onRefreshFeed}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'রিফ্রেশ...' : 'রিফ্রেশ'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900">
            <span className="text-xs font-semibold">ভার্সন</span>
            <span className="text-xs text-neutral-500 font-mono">v3.2.0 (SafeTube)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
