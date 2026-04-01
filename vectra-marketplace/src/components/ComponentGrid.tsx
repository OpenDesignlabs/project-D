'use client';

import { useState, useMemo, useTransition } from 'react';
import { Search, SlidersHorizontal, X, Compass, ChevronRight } from 'lucide-react';
import { ComponentCard } from './ComponentCard';
import type { ComponentRegistryEntry, ComponentCategory } from '../types';

const CATEGORIES: { value: ComponentCategory | 'all'; label: string }[] = [
  { value: 'all',         label: 'All Components' },
  { value: 'hero',        label: 'Hero Sections' },
  { value: 'navigation',  label: 'Navigation' },
  { value: 'feature',     label: 'Features' },
  { value: 'pricing',     label: 'Pricing' },
  { value: 'footer',      label: 'Footers' },
  { value: 'cta',         label: 'Call to Actions' },
  { value: 'testimonials',label: 'Testimonials' },
  { value: 'forms',       label: 'Forms' },
  { value: 'stats',       label: 'Stats' },
  { value: 'layout',      label: 'Layout' },
  { value: 'basic',       label: 'Basic' },
];

const SORTS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest',  label: 'Newest' },
  { value: 'stars',   label: 'Top Starred' },
  { value: 'official',label: 'Official First' },
];

interface ComponentGridProps {
  initialComponents: ComponentRegistryEntry[];
  totalCount?: number;
}

export function ComponentGrid({ initialComponents, totalCount }: ComponentGridProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ComponentCategory | 'all'>('all');
  const [sort, setSort] = useState('popular');
  const [, startTransition] = useTransition();

  // Client-side filter/sort over the initial server-fetched list
  const filtered = useMemo(() => {
    let list = [...initialComponents];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.label.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some(t => t.includes(q))
      );
    }

    if (category !== 'all') {
      list = list.filter(c => c.category === category);
    }

    switch (sort) {
      case 'popular':  list.sort((a, b) => b.downloads - a.downloads); break;
      case 'newest':   list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'stars':    list.sort((a, b) => b.stars - a.stars); break;
      case 'official': list.sort((a, b) => (b.isOfficial ? 1 : 0) - (a.isOfficial ? 1 : 0)); break;
    }

    return list;
  }, [initialComponents, search, category, sort]);

  const hasFilters = search || category !== 'all';

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full">
      {/* ── Sidebar (Control Panel) ── */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <nav aria-label="Filters and Categories" className="sticky top-28 flex flex-col gap-6 max-h-[calc(100vh-140px)] overflow-y-auto 
                        scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-4">
          
          {/* Search Box */}
          <div className="relative group w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-m3-onSurfaceVariant group-focus-within:text-m3-primary transition-colors" aria-hidden="true" />
            <input
              type="text"
              aria-label="Search components..."
              value={search}
              onChange={e => startTransition(() => setSearch(e.target.value))}
              placeholder="Search components..."
              className="w-full bg-m3-surfaceContainerLowest/30 backdrop-blur-3xl border border-white/10 rounded-2xl pl-10 pr-10 py-3
                         text-[13px] text-m3-onSurface placeholder:text-m3-onSurfaceVariant/50
                         focus:outline-none focus:ring-1 focus:ring-m3-primary focus:border-m3-primary
                         transition-all shadow-xl"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-m3-onSurfaceVariant hover:text-m3-onSurface"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Sort Menu */}
          <div>
            <div className="px-2 mb-3 text-m3-onSurfaceVariant font-bold text-[10px] tracking-[0.2em] uppercase opacity-60">
              Sort By
            </div>
            <div className="flex flex-col gap-1">
              {SORTS.map(s => (
                <button
                  key={s.value}
                  onClick={() => setSort(s.value)}
                  className={`text-left px-3 py-2 text-[13px] font-medium rounded-lg transition-colors ${
                    sort === s.value 
                      ? 'bg-m3-primary/10 text-m3-primary' 
                      : 'text-m3-onSurfaceVariant/80 hover:text-m3-onSurface hover:bg-white/[0.02]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="px-2 mb-3 text-m3-onSurfaceVariant font-bold text-[10px] tracking-[0.2em] uppercase opacity-60">
              Categories
            </div>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  aria-pressed={category === cat.value}
                  onClick={() => startTransition(() => setCategory(cat.value as ComponentCategory | 'all'))}
                  className={`flex items-center justify-between px-3 py-2 text-[13px] font-medium transition-all duration-200 ease-out focus-visible:outline-none rounded-xl
                    ${category === cat.value
                      ? 'text-m3-primary bg-m3-primary/10 backdrop-blur-md border border-m3-primary/20 shadow-[0_0_15px_-3px_rgba(var(--m3-primary),0.2)]'
                      : 'text-m3-onSurfaceVariant/80 hover:text-m3-onSurface hover:bg-white/[0.04] border border-transparent'
                    }`}
                >
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Page Header (React Bits Inspired) */}
        <div className="flex flex-col mb-10 pb-8 border-b border-white/[0.04]">
          <h1 className="text-5xl md:text-6xl font-display font-semibold tracking-[-0.03em] mb-4 bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent">
            {category === 'all' ? 'All Components' : CATEGORIES.find(c => c.value === category)?.label}
          </h1>
          <p className="text-lg text-m3-onSurfaceVariant/70 max-w-2xl leading-relaxed font-light">
            Beautifully designed, accessible, and customizable React components. Copy and paste into your apps to ship products faster.
          </p>
        </div>

        {hasFilters && (
          <div className="flex mb-6 mt-[-1rem]">
            <button
              onClick={() => { setSearch(''); setCategory('all'); }}
              aria-label="Clear all filters"
              className="text-[13px] font-medium text-m3-primary hover:text-m3-primary/80 flex items-center gap-1.5 transition-colors bg-m3-primary/10 px-3 py-1.5 rounded-full"
            >
              <X size={14} aria-hidden="true" /> Clear active filters
            </button>
          </div>
        )}

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((component, i) => (
              <div
                key={component.id}
                style={{ animationDelay: `${Math.min(i * 25, 200)}ms` }}
                className="animate-fade-up opacity-0 [animation-fill-mode:forwards]"
              >
                <ComponentCard component={component} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 px-4 gap-4 text-center rounded-3xl bg-m3-surfaceContainer border border-dashed border-m3-outlineVariant/50">
            <Search size={48} strokeWidth={1} className="text-m3-outlineVariant opacity-50" />
            <div>
              <p className="text-lg font-semibold text-m3-onSurface">No components found</p>
              <p className="text-sm text-m3-onSurfaceVariant mt-1">We couldn't find anything matching your filters.</p>
            </div>
            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setCategory('all'); }}
                className="mt-4 text-sm font-semibold rounded-full px-6 py-2.5 bg-m3-primary text-m3-onPrimary hover:bg-m3-primary/90 transition-all shadow-md"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
