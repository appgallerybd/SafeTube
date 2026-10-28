import React from 'react';
import {
  Search,
  X,
  Headphones,
  Moon,
  Sun,
  Download,
  Menu,
  Sliders,
  Timer,
  Play,
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
    <header className="sticky top-0 z-40 flex h-14 sm:h-16 w-full items-center justify-between border-b px-2.5 sm:px-4 backdrop-blur-md transition-colors bg-white/95 border-neutral-200 dark:bg-[#0f0f0f]/95 dark:border-neutral-800">
      {/* Left: Menu & Authentic YouTube style Logo */}
      <div className="flex items-center gap-1 sm:gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Menu"
          className="rounded-full p-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 transition"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div
          onClick={() => {
            setSearchQuery('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-1.5 cursor-pointer select-none group"
        >
          {/* YouTube red badge icon */}
          <div className="flex h-7 w-9 sm:h-8 sm:w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs group-hover:scale-105 transition-transform">
            <Play className="h-4 w-4 sm:h-4.5 sm:w-4.5 fill-current ml-0.5" />
          </div>

          <span className="text-base sm:text-xl font-bold tracking-tighter text-neutral-900 dark:text-white font-sans">
            Safe<span className="text-red-600">Tube</span>
          </span>
        </div>
      </div>

      {/* Center: YouTube Search Bar (Tablet & Desktop) */}
      <div className="hidden md:flex flex-1 max-w-xl mx-4">
        <div className="relative w-full flex items-center">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="অনুসন্ধান করুন..."
              className="w-full rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 pl-10 pr-9 text-sm text-neutral-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 dark:border-neutral-700 dark:bg-[#121212] dark:text-white dark:focus:border-red-500"
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

      {/* Right Actions: Minimal Icons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          aria-label="Search"
          className="md:hidden rounded-full p-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 transition"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Audio Mode Toggle Pill */}
        <button
          onClick={toggleAudioMode}
          title={isAudioMode ? 'ভিডিও মোড' : 'অডিও মোড'}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            isAudioMode
              ? 'bg-red-600 text-white shadow-xs'
              : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800'
          }`}
        >
          <Headphones className={`h-3.5 w-3.5 ${isAudioMode ? 'animate-pulse' : ''}`} />
          <span className="hidden sm:inline">অডিও</span>
        </button>

        {/* Active Sleep Timer Indicator */}
        {typeof sleepTimeRemaining === 'number' && sleepTimeRemaining > 0 && (
          <button
            onClick={() => {
              if (onSetSleepTimer) onSetSleepTimer(0);
            }}
            title="স্লিপ টাইমার বন্ধ"
            className="flex items-center gap-1 rounded-full bg-red-100 border border-red-300 px-2 py-1 text-xs font-bold text-red-600 dark:bg-red-950/80 dark:border-red-800 dark:text-red-400 animate-pulse"
          >
            <Timer className="h-3 w-3" />
            <span>
              {Math.floor(sleepTimeRemaining / 60)}:
              {(sleepTimeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </button>
        )}

        {/* PWA Install Button */}
        {!isInstalled && (
          <button
            onClick={onOpenInstall}
            title="অ্যাপ ইনস্টল"
            className="flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 transition shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">ইনস্টল</span>
          </button>
        )}

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleDarkMode}
          aria-label="Theme"
          title="থিম পরিবর্তন"
          className="rounded-full p-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 transition"
        >
          {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          title="সেটিংস"
          className="rounded-full p-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 transition"
        >
          <Sliders className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Search Overlay Bar */}
      {mobileSearchOpen && (
        <div className="absolute inset-x-0 top-0 z-50 flex h-14 sm:h-16 items-center bg-white px-3 shadow-md dark:bg-[#0f0f0f] md:hidden">
          <div className="relative flex flex-1 items-center">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="অনুসন্ধান করুন..."
              className="w-full rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 pl-9 pr-8 text-sm text-neutral-900 outline-none focus:border-red-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-neutral-400"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setMobileSearchOpen(false)}
            className="ml-2.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300"
          >
            বাতিল
          </button>
        </div>
      )}
    </header>
  );
};
