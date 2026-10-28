import React from 'react';
import { Home, Headphones, Heart, BookmarkCheck } from 'lucide-react';
import { NavTab } from '../types/video';

interface MobileBottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  favoritesCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  favoritesCount,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'home',
      label: 'হোম',
      icon: <Home className="h-5 w-5" />,
    },
    {
      id: 'audio',
      label: 'অডিও মোড',
      icon: <Headphones className="h-5 w-5" />,
    },
    {
      id: 'favorites',
      label: 'পছন্দ',
      icon: <Heart className="h-5 w-5" />,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
    },
    {
      id: 'watch_later',
      label: 'পরে দেখুন',
      icon: <BookmarkCheck className="h-5 w-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex h-16 items-center justify-around border-t bg-white/95 backdrop-blur-md px-2 border-neutral-200 dark:bg-[#0f0f0f]/95 dark:border-neutral-800 md:hidden shadow-lg pb-[env(safe-area-inset-bottom)]">
      {tabs.map((tab) => {
        const active = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              onSelectTab(tab.id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all active:scale-95 ${
              active
                ? 'text-red-600 dark:text-red-500 font-bold'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge !== undefined && (
                <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white shadow-xs">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="mt-1 text-[11px] tracking-tight">{tab.label}</span>
            {active && (
              <span className="absolute top-0 inset-x-6 h-0.5 rounded-full bg-red-600 dark:bg-red-500" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
