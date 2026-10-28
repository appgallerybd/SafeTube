import React from 'react';
import {
  Home,
  Headphones,
  Heart,
  Clock,
  BookmarkCheck,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  FolderLock,
  X,
} from 'lucide-react';
import { NavTab } from '../types/video';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
  totalSafeVideos: number;
  onRefreshVideos: () => void;
  isRefreshing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  totalSafeVideos,
  onRefreshVideos,
  isRefreshing,
}) => {
  const navItems: { tab: NavTab; label: string; shortLabel: string; icon: React.ReactNode; badge?: string }[] = [
    {
      tab: 'home',
      label: 'নিরাপদ হোম',
      shortLabel: 'হোম',
      icon: <Home className="h-5 w-5" />,
    },
    {
      tab: 'audio',
      label: 'অডিও মোড',
      shortLabel: 'অডিও',
      icon: <Headphones className="h-5 w-5" />,
      badge: 'ব্যাকগ্রাউন্ড',
    },
    {
      tab: 'favorites',
      label: 'পছন্দের সুরা',
      shortLabel: 'পছন্দ',
      icon: <Heart className="h-5 w-5" />,
    },
    {
      tab: 'watch_later',
      label: 'পরে শুনুন / দেখুন',
      shortLabel: 'পরে দেখুন',
      icon: <BookmarkCheck className="h-5 w-5" />,
    },
    {
      tab: 'history',
      label: 'হিস্ট্রি',
      shortLabel: 'হিস্ট্রি',
      icon: <Clock className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 
        RESPONSIVE SIDEBAR:
        - Mobile: Hidden by default, drawer slides in when isOpen is true (w-64)
        - Tablet (md:): Compact icon-rail (w-20) with icon + mini label underneath
        - Desktop (lg:): Full expanded sidebar (w-60)
      */}
      <aside
        className={`fixed top-14 sm:top-16 bottom-0 left-0 z-40 flex flex-col justify-between border-r transition-all duration-300 ease-in-out bg-white border-neutral-200 dark:bg-[#0f0f0f] dark:border-neutral-800 ${
          isOpen ? 'w-64 translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0 md:w-20 lg:w-60'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-2 lg:px-3 py-3 sm:py-4 space-y-4 sm:space-y-6">
          {/* Mobile Drawer Top Close Header */}
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800 md:hidden">
            <span className="text-xs font-bold text-neutral-500 uppercase">মেনু তালিকা</span>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav Items */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    onSelectTab(item.tab);
                    onClose();
                  }}
                  className={`group relative flex w-full items-center rounded-xl transition ${
                    // Tablet icon rail styling: center aligned with text under
                    !isOpen
                      ? 'md:flex-col md:justify-center md:py-2.5 md:px-1 lg:flex-row lg:justify-start lg:px-3 lg:py-2.5 lg:gap-3.5'
                      : 'flex-row gap-3 px-3 py-2.5'
                  } ${
                    active
                      ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 font-bold'
                      : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60 font-medium'
                  }`}
                >
                  <span
                    className={`${
                      active
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white'
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* Tablet mini-label (underneath icon) */}
                  {!isOpen && (
                    <span
                      className={`text-[10px] mt-1 font-medium truncate max-w-[64px] md:block lg:hidden ${
                        active ? 'text-red-600 dark:text-red-400' : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {item.shortLabel}
                    </span>
                  )}

                  {/* Full label on Desktop & Mobile drawer */}
                  <span
                    className={`truncate text-left text-xs ${
                      !isOpen ? 'hidden lg:inline' : 'inline'
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Desktop badge */}
                  {item.badge && (
                    <span
                      className={`ml-auto rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700 dark:bg-red-950/70 dark:text-red-400 ${
                        !isOpen ? 'hidden lg:inline' : 'inline'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <hr className="border-neutral-200 dark:border-neutral-800" />

          {/* Safe Shield Notice Box (Desktop expanded) */}
          <div
            className={`rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-3.5 dark:bg-emerald-950/20 dark:border-emerald-800/40 ${
              !isOpen ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold">১০০% নিরাপদ কন্টেন্ট</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-emerald-900/80 dark:text-emerald-300/80">
              শুধুমাত্র আপনার গুগল শীটের অনুমোদিত ভিডিও ও সুরা চলবে। কোনো অবাঞ্ছিত সাজেশন নেই।
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <span>মোট সুরা/ভিডিও:</span>
              <span className="rounded-md bg-emerald-200/60 px-1.5 py-0.5 font-bold dark:bg-emerald-900/60">
                {totalSafeVideos} টি
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Refresh Button */}
        <div className="p-2 sm:p-3 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={onRefreshVideos}
            disabled={isRefreshing}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition active:scale-98"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
            <span className={`${!isOpen ? 'hidden lg:inline' : 'inline'}`}>
              {isRefreshing ? 'রিফ্রেশ হচ্ছে...' : 'ভিডিও রিফ্রেশ'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
