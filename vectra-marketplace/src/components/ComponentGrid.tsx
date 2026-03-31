'use client';

import { useState, useMemo, useTransition } from 'react';
import { Search, SlidersHorizontal, X, Compass, ChevronRight } from 'lucide-react';
import { ComponentCard } from './ComponentCard';
import type { ComponentRegistryEntry, ComponentCategory } from '../types';

const CATEGORIES: { value: ComponentCategory | 'all'; label: string }[] = [
  { value: 'all',        label: 'All Components' },
  { value: 'basic',      label: 'Basic' },
  { value: 'layout',     label: 'Layout' },
  { value: 'forms',      label: 'Forms' },
  { value: 'media',      label: 'Media' },
  { value: 'sections',   label: 'Sections' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'marketing',  label: 'Marketing' },
  { value: 'data',       label: 'Data' },
  { value: 'feedback',   label: 'Feedback' },
  { value: 'ecommerce',  label: 'Ecommerce' },
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
      {/* ── Sidebar (Categories) ── */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <nav aria-label="Component categories" className="sticky top-28 flex flex-col gap-1.5 p-1 max-h-[calc(100vh-140px)] overflow-y-auto 
                        scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
          <div className="flex items-center gap-2 px-4 mb-3 text-m3-onSurfaceVariant font-bold text-xs tracking-widest uppercase">
            <Compass size={14} className="text-m3-primary" aria-hidden="true" />
            Explore
          </div>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              aria-pressed={category === cat.value}
              onClick={() => startTransition(() => setCategory(cat.value as ComponentCategory | 'all'))}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-full text-sm font-semibold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary
                ${category === cat.value
                  ? 'bg-m3-secondaryContainer text-m3-onSecondaryContainer shadow-sm ring-1 ring-white/[0.05]'
                  : 'bg-transparent text-m3-onSurfaceVariant hover:bg-white/[0.03] hover:text-m3-onSurface'
                }`}
            >
              <span className="truncate">{cat.label}</span>
              {category === cat.value && <ChevronRight size={14} className="opacity-70 flex-shrink-0" aria-hidden="true" />}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="relative flex-1 group">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-m3-onSurfaceVariant group-focus-within:text-m3-primary transition-colors" aria-hidden="true" />
            <input
              type="text"
              aria-label="Search components or tags"
              value={search}
              onChange={e => startTransition(() => setSearch(e.target.value))}
              placeholder="Search components or tags..."
              className="w-full bg-m3-surfaceContainerHigh/40 backdrop-blur-xl rounded-full pl-14 pr-12 py-3.5
                         text-base text-m3-onSurface placeholder:text-m3-onSurfaceVariant/60
                         focus:outline-none focus:ring-2 focus:ring-m3-primary focus:bg-m3-surfaceContainerHighest/60
                         transition-all shadow-sm ring-1 ring-white/[0.05]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-5 top-1/2 -translate-y-1/2 text-m3-onSurfaceVariant hover:text-m3-onSurface transition-colors bg-white/5 rounded-full p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary"
                title="Clear search"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <SlidersHorizontal size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-m3-onSurfaceVariant pointer-events-none group-hover:text-m3-onSurface transition-colors" aria-hidden="true" />
              <select
                aria-label="Sort components"
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="appearance-none bg-m3-surfaceContainerHigh/40 backdrop-blur-xl rounded-full pl-12 pr-10 py-3.5 text-sm text-m3-onSurface font-semibold
                           focus:outline-none focus:ring-2 focus:ring-m3-primary cursor-pointer shadow-sm ring-1 ring-white/[0.05]
                           hover:bg-m3-surfaceContainerHighest/60 transition-all min-w-[160px]"
              >
                {SORTS.map(s => (
                  <option key={s.value} value={s.value} className="bg-m3-surfaceContainerHigh">{s.label}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight size={14} className="text-m3-onSurfaceVariant rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between px-2 mb-2">
          <h2 className="text-2xl font-display font-medium text-m3-onSurface flex items-baseline gap-3">
            {category === 'all' ? 'All Components' : CATEGORIES.find(c => c.value === category)?.label}
            <span className="text-sm font-body font-normal text-m3-onSurfaceVariant/60">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </h2>

          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setCategory('all'); }}
              aria-label="Clear all filters"
              className="text-sm font-medium text-m3-primary hover:text-m3-primary/80 flex items-center gap-1.5 transition-colors bg-m3-primary/10 px-3 py-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary"
            >
              <X size={14} aria-hidden="true" /> Clear all
            </button>
          )}
        </div>

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
