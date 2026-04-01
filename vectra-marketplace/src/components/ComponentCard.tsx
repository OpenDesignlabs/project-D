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
      className="group relative flex flex-col bg-m3-surfaceContainerLowest/20 backdrop-blur-3xl border border-white/5 rounded-2xl overflow-hidden
                 transition-all duration-500 ease-out hover:-translate-y-1
                 shadow-lg hover:shadow-[0_0_40px_-10px_rgba(var(--m3-primary),0.2)] hover:bg-m3-surfaceContainerLowest/60
                 hover:border-m3-primary/30
                 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-m3-primary focus-visible:ring-offset-2 focus-visible:ring-offset-m3-background"
    >

      {/* Preview area */}
      <div className="relative h-60 bg-transparent overflow-hidden
                      bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] flex items-center justify-center p-4">
        {component.previewImageUrl ? (
          <div className="relative w-full h-full rounded-xl border border-m3-outlineVariant/20 overflow-hidden shadow-sm">
            <img
              src={component.previewImageUrl}
              alt={component.label}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            />
            {/* 21st.dev / Magic UI style hover overlay */}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
              <div className="px-4 py-2 bg-m3-surface/90 text-m3-onSurface text-xs font-semibold tracking-wide rounded-full shadow-xl border border-white/10 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                View Component
              </div>
            </div>
          </div>
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
      <div className="flex flex-col gap-2.5 p-5 border-t border-white/[0.02]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-medium text-m3-onSurface text-base tracking-tight group-hover:text-m3-primary transition-colors">
              {component.label}
            </h3>
          </div>
          <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-white/10 text-m3-onSurfaceVariant/80 uppercase tracking-wider`}>
            {component.category}
          </span>
        </div>

        <p className="text-sm text-m3-onSurfaceVariant/70 line-clamp-2 leading-relaxed font-light">
          {component.description}
        </p>

        {/* Footer stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.02]">
          <div className="flex items-center gap-4 text-m3-onSurfaceVariant/60 font-medium">
            <span className="flex items-center gap-1.5 text-[11px]" aria-label={`${component.downloads} downloads`}>
              <Download size={13} aria-hidden="true" />
              {component.downloads.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5 text-[11px]" aria-label={`${component.stars} stars`}>
              <Star size={13} aria-hidden="true" />
              {component.stars}
            </span>
          </div>
          {component.isVerified && (
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-[#A8C7FA]" title="Verified Publisher">
              <Sparkles size={11} aria-hidden="true" />
              Official
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
