'use client';

import Link from 'next/link';
import { Download, Star, ShieldCheck, Sparkles } from 'lucide-react';
import type { ComponentRegistryEntry } from '../types';

interface ComponentCardProps {
  component: ComponentRegistryEntry;
}

const CATEGORY_COLORS: Record<string, string> = {
  hero:         'bg-purple-900/60 text-purple-300 ring-1 ring-purple-500/20',
  navigation:   'bg-cyan-900/60 text-cyan-300 ring-1 ring-cyan-500/20',
  footer:       'bg-emerald-900/60 text-emerald-300 ring-1 ring-emerald-500/20',
  pricing:      'bg-amber-900/60 text-amber-300 ring-1 ring-amber-500/20',
  feature:      'bg-blue-900/60 text-blue-300 ring-1 ring-blue-500/20',
  cta:          'bg-rose-900/60 text-rose-300 ring-1 ring-rose-500/20',
  testimonials: 'bg-teal-900/60 text-teal-300 ring-1 ring-teal-500/20',
  forms:        'bg-violet-900/60 text-violet-300 ring-1 ring-violet-500/20',
  stats:        'bg-orange-900/60 text-orange-300 ring-1 ring-orange-500/20',
  layout:       'bg-slate-700/60 text-slate-200 ring-1 ring-slate-500/20',
  basic:        'bg-slate-800/80 text-slate-300 ring-1 ring-slate-500/20',
};

export function ComponentCard({ component }: ComponentCardProps) {
  const categoryColor = CATEGORY_COLORS[component.category] ?? CATEGORY_COLORS.basic;

  return (
    <Link
      href={`/components/${component.slug}`}
      aria-label={`View component: ${component.label}`}
      className="group relative flex flex-col bg-m3-surfaceContainerLowest/40 backdrop-blur-2xl border border-white/[0.05] rounded-[32px] overflow-hidden
                 transition-all duration-500 ease-out hover:-translate-y-2
                 shadow-lg hover:shadow-2xl hover:shadow-m3-primary/10 hover:bg-m3-surfaceContainerLowest/70
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-background"
    >

      {/* Preview area */}
      <div className="relative h-56 bg-transparent border-b border-white/[0.05] overflow-hidden
                      bg-grid-pattern bg-grid flex items-center justify-center p-6">
        {component.previewImageUrl ? (
          <img
            src={component.previewImageUrl}
            alt={component.label}
            className="w-full h-full object-cover rounded-xl border border-m3-outlineVariant/20 group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Abstract Wireframe Composition */}
            <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-[0.15] group-hover:opacity-[0.25] transition-opacity duration-500 scale-90 group-hover:scale-100 ease-out">
              <div className="w-24 h-32 rounded-2xl border border-m3-outlineVariant border-dashed" />
              <div className="flex flex-col gap-4">
                 <div className="w-32 h-16 rounded-2xl bg-m3-outlineVariant/20" />
                 <div className="w-32 h-12 rounded-full border border-m3-outlineVariant" />
              </div>
            </div>
            <div className="flex flex-col items-center z-10 opacity-40 group-hover:opacity-60 transition-opacity">
              <div className="w-10 h-1 rounded-full bg-m3-outlineVariant shadow-[0_0_15px_rgba(255,255,255,0.2)] mb-2" />
              <div className="w-20 h-1 rounded-full bg-m3-outlineVariant/60" />
            </div>
          </div>
        )}

        {/* Official badge */}
        {component.isOfficial && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 z-10
                          bg-m3-primary rounded-full text-[10px] font-bold tracking-widest text-m3-onPrimary shadow-sm"
               title="Official Component">
            <ShieldCheck size={12} className="opacity-90" aria-hidden="true" />
            OFFICIAL
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-m3-onSurface text-base leading-tight group-hover:text-m3-primary transition-colors">
              {component.label}
            </h3>
            <p className="text-xs text-m3-onSurfaceVariant mt-1 font-mono">{component.name}</p>
          </div>
          <span className={`flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${categoryColor}`}>
            {component.category}
          </span>
        </div>

        <p className="text-sm text-m3-onSurfaceVariant line-clamp-2 leading-relaxed">
          {component.description}
        </p>

        {/* Tags */}
        {component.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {component.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[11px] font-medium px-2 py-0.5 bg-m3-surfaceContainerHighest text-m3-onSurfaceVariant rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-4 text-m3-onSurfaceVariant/80 font-medium">
            <span className="flex items-center gap-1.5 text-[11px] tracking-wide" aria-label={`${component.downloads} downloads`}>
              <Download size={12} className="text-m3-outline/60" aria-hidden="true" />
              {component.downloads.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] tracking-wide" aria-label={`${component.stars} stars`}>
              <Star size={12} className="text-m3-outline/60" aria-hidden="true" />
              {component.stars}
            </span>
          </div>
          {component.isVerified && (
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-m3-tertiary bg-m3-tertiary/10 px-2 py-0.5 rounded-sm" title="Verified Publisher">
              <Sparkles size={10} aria-hidden="true" />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Hover accent line */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-m3-primary
                      group-hover:w-full transition-all duration-300 ease-out" />
    </Link>
  );
}
