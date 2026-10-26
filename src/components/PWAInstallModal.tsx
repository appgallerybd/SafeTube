import React from 'react';
import {
  Download,
  X,
  Share,
  PlusSquare,
  Smartphone,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isIOS: boolean;
  onInstall: () => Promise<boolean>;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isIOS,
  onInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#161616] text-neutral-900 dark:text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 shadow-xl shadow-red-600/30 mb-3">
            <svg
              className="h-8 w-8 text-white ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          <h3 className="text-xl font-bold">SafeTube অ্যাপ ইনস্টল করুন</h3>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
            মোবাইল বা কম্পিউটারে অ্যাপের মত সরাসরি ব্যবহার করতে হোম স্ক্রিনে যুক্ত করুন।
          </p>
        </div>

        {/* Key Features List */}
        <div className="mt-5 space-y-2.5 rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
          <div className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>স্ক্রিন অফ করে ব্যাকগ্রাউন্ডে অডিও শোনা যাবে</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>কোনো বাহ্যিক ইউটিউব সাজেশন বা অ্যালগরিদম নেই</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>সম্পূর্ণ ফুল-স্ক্রিন ও ফাস্ট রেসপন্সিভ পারফর্মেন্স</span>
          </div>
        </div>

        {/* Action based on platform */}
        <div className="mt-6">
          {isInstallable ? (
            <button
              onClick={async () => {
                await onInstall();
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/30 hover:bg-red-700 transition"
            >
              <Download className="h-4 w-4" />
              <span>এখনই ইনস্টল করুন (Install Now)</span>
            </button>
          ) : isIOS ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-left text-xs leading-relaxed text-amber-900 dark:text-amber-200">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4" />
                  <span>iPhone / iPad এ যেভাবে ইনস্টল করবেন:</span>
                </p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>সাফারি ব্রাউজারের নিচে <strong>Share (শেয়ার)</strong> বাটনে চাপুন।</li>
                  <li>মেনু স্ক্রোল করে <strong>Add to Home Screen (হোম স্ক্রিনে যোগ করুন)</strong> বেছে নিন।</li>
                  <li>উপরে ডানদিকের <strong>Add</strong> চাপলেই SafeTube অ্যাপ প্রস্তুত!</li>
                </ol>
              </div>

              <button
                onClick={onClose}
                className="w-full rounded-2xl border border-neutral-300 bg-neutral-100 py-2.5 text-xs font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                বুঝেছি, বন্ধ করুন
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                আপনার ব্রাউজার মেনুর ৩-ডটে গিয়ে "Install app" অথবা "Add to Home Screen" অপশন সিলেক্ট করুন।
              </p>
              <button
                onClick={onClose}
                className="w-full rounded-2xl bg-neutral-900 py-2.5 text-xs font-semibold text-white dark:bg-neutral-800"
              >
                ঠিক আছে
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
