import React from 'react';
import {
  X,
  ShieldCheck,
  Headphones,
  Smartphone,
  RefreshCw,
  Sparkles,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#161616] text-neutral-900 dark:text-white max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold">SafeTube তথ্য</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              প্রিমিয়াম ডিস্ট্র্যাকশন-মুক্ত ভিডিও ও অডিও প্লেয়ার
            </p>
          </div>
        </div>

        {/* Features Info */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <Headphones className="h-4 w-4 text-red-500" />
              <span>ব্যাকগ্রাউন্ড ও স্ক্রিন-অফ অডিও</span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              মোবাইলে যেকোনো ভিডিওকে 'অডিও মোড'-এ চালালে স্ক্রিন লক থাকা অবস্থাতেও বা অন্য অ্যাপ ব্যবহারের সময়ও অডিও নিরবচ্ছিন্নভাবে চলতে থাকবে।
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>সম্পূর্ণ নিয়ন্ত্রিত পরিবেশ</span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              ভিডিও চলাকালীন বা শেষ হওয়ার পরও কোনো অবাঞ্ছিত এক্সটার্নাল ভিডিও বা অ্যালগরিদম সাজেশন আসবে না।
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <Smartphone className="h-4 w-4 text-indigo-500" />
              <span>PWA মোবাইল অ্যাপ সাপোর্ট</span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              মোবাইল ও কম্পিউটারে হোম স্ক্রিনে ইনস্টল করে ফুলস্ক্রিন নেটিভ অ্যাপের মতো সহজে চালানো যায়।
            </p>
          </div>
        </div>

        {/* Bottom Actions: Total count & Feed Refresh */}
        <div className="mt-5 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="text-xs text-neutral-500">
            মোট ভিডিও: <span className="font-bold text-neutral-900 dark:text-white">{totalVideos}</span> টি
          </div>
          <button
            onClick={() => {
              onRefreshFeed();
            }}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'রিফ্রেশ হচ্ছে...' : 'ভিডিও রিফ্রেশ করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
