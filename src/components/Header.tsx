import React from 'react';
import {
  Search,
  X,
  Headphones,
  Moon,
  Sun,
  Download,
  ShieldCheck,
  Menu,
  Sliders,
  Timer,
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isAudioMode: boolean;
  toggleAudioMode: () => void;
  onOpenInstall: () => void;
  onOpenSettings: () => void;
  toggleSidebar: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  sleepTimerMinutes?: number;
  sleepTimeRemaining?: number | null;
  onSetSleepTimer?: (minutes: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  isDarkMode,
  toggleDarkMode,
  isAudioMode,
  toggleAudioMode,
  onOpenInstall,
  onOpenSettings,
  toggleSidebar,
  isInstallable,
  isInstalled,
  sleepTimerMinutes,
  sleepTimeRemaining,
  onSetSleepTimer,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b px-3 sm:px-5 backdrop-blur-md transition-colors bg-white/90 border-neutral-200 dark:bg-[#0f0f0f]/95 dark:border-neutral-800">
      {/* Left: Hamburger & Brand Logo */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div
          onClick={() => {
            setSearchQuery('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
            <svg
              className="h-5 w-5 text-white ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-0.5 border-2 border-white dark:border-[#0f0f0f]">
              <ShieldCheck className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white font-sans">
                Safe<span className="text-red-600">Tube</span>
              </span>
              <span className="hidden sm:inline-flex items-center rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-950/80 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                নিরাপদ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Search Bar (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-xl mx-4">
        <div className="relative w-full flex items-center">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নিরাপদ ভিডিও বা বিষয় খুঁজুন..."
              className="w-full rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 pl-10 pr-9 text-sm text-neutral-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-red-500 dark:focus:bg-neutral-950"
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          aria-label="Search"
          className="md:hidden rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Audio Only Mode Toggle */}
        <button
          onClick={toggleAudioMode}
          title={isAudioMode ? 'ভিডিও মোডে ফিরুন' : 'শুধু অডিও শুনুন (স্ক্রিন-অফ ও ব্যাকগ্রাউন্ড)'}
          className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
            isAudioMode
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800'
          }`}
        >
          <Headphones className={`h-4 w-4 ${isAudioMode ? 'animate-pulse' : ''}`} />
          <span className="hidden sm:inline">
            {isAudioMode ? 'অডিও মোড চালু' : 'অডিও মোড'}
          </span>
        </button>

        {/* Active Sleep Timer Indicator */}
        {typeof sleepTimeRemaining === 'number' && sleepTimeRemaining > 0 && (
          <button
            onClick={() => {
              if (onSetSleepTimer) onSetSleepTimer(0);
            }}
            title="স্লিপ টাইমার বন্ধ করতে ট্যাপ করুন"
            className="flex items-center gap-1.5 rounded-full bg-red-100 border border-red-300 px-2.5 py-1 text-xs font-bold text-red-600 dark:bg-red-950/80 dark:border-red-800 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 transition animate-pulse"
          >
            <Timer className="h-3.5 w-3.5" />
            <span>
              {Math.floor(sleepTimeRemaining / 60)}:
              {(sleepTimeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </button>
        )}

        {/* Install PWA Button (if installable or not installed) */}
        {!isInstalled && (
          <button
            onClick={onOpenInstall}
            title="SafeTube অ্যাপ ইনস্টল করুন"
            className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden xs:inline sm:inline">অ্যাপ ইনস্টল</span>
          </button>
        )}

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle theme"
          className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition"
        >
          {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          title="সেটিংস ও তথ্য"
          className="rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition"
        >
          <Sliders className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Search Overlay Bar */}
      {mobileSearchOpen && (
        <div className="absolute inset-x-0 top-0 z-50 flex h-16 items-center bg-white px-4 shadow-md dark:bg-neutral-900 md:hidden">
          <div className="relative flex flex-1 items-center">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ভিডিও বা বিষয় খুঁজুন..."
              className="w-full rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 pl-10 pr-9 text-sm text-neutral-900 outline-none focus:border-red-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-neutral-400"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="ml-3 text-sm font-medium text-neutral-600 dark:text-neutral-300"
          >
            বাতিল
          </button>
        </div>
      )}
    </header>
  );
};
