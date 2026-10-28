import React from 'react';
import {
  Home,
  Headphones,
  Heart,
  Clock,
  BookmarkCheck,
  RefreshCw,
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
  const navItems: { tab: NavTab; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    {
      tab: 'home',
      label: 'হোম',
      shortLabel: 'হোম',
      icon: <Home className="h-5 w-5" />,
    },
    {
      tab: 'audio',
      label: 'অডিও',
      shortLabel: 'অডিও',
      icon: <Headphones className="h-5 w-5" />,
    },
    {
      tab: 'favorites',
      label: 'পছন্দ',
      shortLabel: 'পছন্দ',
      icon: <Heart className="h-5 w-5" />,
    },
    {
      tab: 'watch_later',
      label: 'পরে দেখুন',
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
        AUTHENTIC YOUTUBE SIDEBAR:
        - Mobile: Drawer (w-64)
        - Tablet: Mini rail (w-20)
        - Desktop: Full sidebar (w-60)
        - NO instructions, NO explanatory paragraphs, only clean interface navigation!
      */}
      <aside
        className={`fixed top-14 sm:top-16 bottom-0 left-0 z-40 flex flex-col justify-between border-r transition-all duration-300 ease-in-out bg-white border-neutral-200 dark:bg-[#0f0f0f] dark:border-neutral-800 ${
          isOpen ? 'w-64 translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0 md:w-20 lg:w-60'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-2 lg:px-3 py-3 space-y-2">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between pb-2 px-2 border-b border-neutral-200 dark:border-neutral-800 md:hidden">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">মেনু</span>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Items */}
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
                    !isOpen
                      ? 'md:flex-col md:justify-center md:py-3 md:px-1 lg:flex-row lg:justify-start lg:px-3.5 lg:py-2.5 lg:gap-4'
                      : 'flex-row gap-4 px-3.5 py-2.5'
                  } ${
                    active
                      ? 'bg-neutral-100 dark:bg-neutral-800/90 text-neutral-900 dark:text-white font-bold'
                      : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/50 font-normal'
                  }`}
                >
                  <span
                    className={`${
                      active
                        ? 'text-red-600 dark:text-red-500'
                        : 'text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white'
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* Tablet mini label underneath icon */}
                  {!isOpen && (
                    <span
                      className={`text-[10px] mt-1 truncate max-w-[64px] md:block lg:hidden ${
                        active ? 'font-bold text-red-600 dark:text-red-500' : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {item.shortLabel}
                    </span>
                  )}

                  {/* Full label on Desktop & Mobile */}
                  <span
                    className={`truncate text-left text-sm ${
                      !isOpen ? 'hidden lg:inline' : 'inline'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Refresh Action */}
        <div className="p-2 sm:p-3 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={onRefreshVideos}
            disabled={isRefreshing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition active:scale-98"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
            <span className={`${!isOpen ? 'hidden lg:inline' : 'inline'}`}>
              {isRefreshing ? 'রিফ্রেশ হচ্ছে...' : 'রিফ্রেশ'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};
