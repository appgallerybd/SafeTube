import React from 'react';
import {
  Home,
  Headphones,
  Heart,
  Clock,
  BookmarkCheck,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  FolderLock,
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
  const navItems: { tab: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      tab: 'home',
      label: 'নিরাপদ হোম',
      icon: <Home className="h-5 w-5" />,
    },
    {
      tab: 'audio',
      label: 'অডিও মোড',
      icon: <Headphones className="h-5 w-5" />,
      badge: 'ব্যাকগ্রাউন্ড',
    },
    {
      tab: 'favorites',
      label: 'পছন্দের ভিডিও',
      icon: <Heart className="h-5 w-5" />,
    },
    {
      tab: 'history',
      label: 'ওয়াচ হিস্ট্রি',
      icon: <Clock className="h-5 w-5" />,
    },
    {
      tab: 'watch_later',
      label: 'পরে দেখুন',
      icon: <BookmarkCheck className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex flex-col justify-between border-r transition-all duration-300 ease-in-out bg-white border-neutral-200 dark:bg-[#0f0f0f] dark:border-neutral-800 ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20 lg:w-60'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Navigation */}
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
                  className={`group relative flex w-full items-center gap-4 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'bg-neutral-100 text-red-600 dark:bg-neutral-800/90 dark:text-red-500 font-semibold'
                      : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <span className={`${active ? 'text-red-600 dark:text-red-500' : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white'}`}>
                    {item.icon}
                  </span>
                  <span className={`truncate text-left ${!isOpen ? 'hidden lg:inline' : 'inline'}`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`ml-auto rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-950/70 dark:text-red-400 ${
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

          {/* Safe Shield Info Box (Desktop expanded) */}
          <div className={`rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-3.5 dark:bg-emerald-950/20 dark:border-emerald-800/40 ${!isOpen ? 'hidden lg:block' : 'block'}`}>
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
              <FolderLock className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold">১০০% নিয়ন্ত্রিত পরিবেশ</span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-emerald-900/80 dark:text-emerald-300/80">
              এখানে কোনো অনাকাঙ্ক্ষিত বা এক্সটার্নাল ইউটিউব ভিডিও আসবে না। শুধুমাত্র অনুমোদিত ভিডিও চলবে।
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <span>মোট নিরাপদ ভিডিও:</span>
              <span className="rounded bg-emerald-200/60 px-1.5 py-0.5 font-bold dark:bg-emerald-900/60">
                {totalSafeVideos} টি
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Refresh Control */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={onRefreshVideos}
            disabled={isRefreshing}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition"
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
