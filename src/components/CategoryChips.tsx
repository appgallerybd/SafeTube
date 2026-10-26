import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryChipsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative sticky top-16 z-20 flex w-full items-center border-b bg-white/95 px-3 py-2.5 backdrop-blur-sm border-neutral-200 dark:bg-[#0f0f0f]/95 dark:border-neutral-800">
      {/* Scroll Left Button */}
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow-xs border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900/80 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 mr-1 shrink-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Chips Container */}
      <div
        ref={scrollRef}
        className="flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer select-none whitespace-nowrap ${
                isSelected
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs font-semibold'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow-xs border border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900/80 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 ml-1 shrink-0"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
