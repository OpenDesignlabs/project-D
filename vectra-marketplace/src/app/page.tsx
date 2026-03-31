import { Suspense } from 'react';
import Link from 'next/link';
import { Boxes, ArrowRight, Sparkles, ShieldCheck, Zap, Github, Search, Moon, Star } from 'lucide-react';
import { getComponents } from '../lib/registry';
import { ComponentGrid } from '../components/ComponentGrid';

// Revalidate every 60 seconds — fresh enough, cheap enough
export const revalidate = 60;

async function ComponentsData() {
  const { components, total } = await getComponents({ limit: 100, sort: 'official' });
  return <ComponentGrid initialComponents={components} totalCount={total} />;
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-m3-background selection:bg-m3-primaryContainer selection:text-m3-onPrimaryContainer relative">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-m3-background/70 backdrop-blur-2xl">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-m3-primary text-m3-onPrimary transition-all">
              <Boxes size={20} className="group-hover:scale-110 transition-transform duration-500 ease-out" />
            </div>
            <span className="font-display font-semibold text-m3-onSurface text-xl leading-none tracking-tight">Vectra</span>
            <span className="text-m3-onSurfaceVariant/80 text-sm ml-0.5 tracking-wide uppercase font-medium text-[10px]">Marketplace</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <button className="flex items-center justify-between w-full px-4 py-2 bg-m3-surfaceContainerHighest/40 hover:bg-m3-surfaceContainerHighest/80 
                               border border-white/5 rounded-full text-sm text-m3-onSurfaceVariant transition-all">
              <span className="flex items-center gap-2"><Search size={14} /> Search documentation...</span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono font-medium opacity-70">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-m3-onSurfaceVariant font-medium">
            <Link href="/" className="hover:text-m3-onSurface transition-colors">Browse</Link>
            <Link href="/publish" className="hover:text-m3-onSurface transition-colors">Publish</Link>
            <div className="w-px h-4 bg-white/10 mx-2" />
            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-m3-onSurface transition-colors" aria-label="GitHub">
                <Github size={18} />
              </a>
              <button aria-label="Toggle Dark Mode" className="hover:text-m3-onSurface transition-colors">
                <Moon size={18} />
              </button>
            </div>
            <a
              href="https://app.vectra.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-2 px-5 py-2 bg-m3-onSurface text-m3-surface hover:bg-m3-onSurface/90
                         rounded-full text-sm font-semibold transition-all duration-300 ml-2"
            >
               <span className="relative z-10 flex items-center gap-2">
                  Launch Studio 
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
               </span>
            </a>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-white/[0.04]">
        {/* Background grid */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        
        <div className="relative max-w-[1400px] mx-auto px-6 py-24 lg:py-32 flex flex-col items-center text-center gap-6 z-10">
          <div className="flex items-center gap-2.5 px-5 py-2 bg-m3-surfaceContainerLowest/60 backdrop-blur-xl text-m3-onSurfaceVariant
                          rounded-full text-xs font-semibold tracking-widest uppercase ring-1 ring-white/10">
             <Sparkles size={12} className="text-m3-primary" />
             <span>
                Production-ready components
             </span>
          </div>

          <h1 className="font-display font-medium text-6xl md:text-7xl lg:text-[5.5rem] tracking-tight text-m3-onSurface leading-[1.05] max-w-4xl mt-4">
            The ultimate library
            <br />
            <span className="text-m3-primary relative inline-block mt-2">
               built for Vectra Studio
            </span>
          </h1>

          <p className="text-m3-onSurfaceVariant text-lg md:text-xl max-w-2xl leading-relaxed mt-2 font-light">
            Browse, preview, and drop high-quality React components directly
            onto your canvas. No copy-paste. No setup.
          </p>

          <div className="flex items-center justify-center gap-4 mt-8 w-full max-w-md">
            <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-m3-primary text-m3-onPrimary rounded-xl font-semibold hover:bg-m3-primary/90 transition-colors shadow-sm">
              Get Started <ArrowRight size={16} />
            </button>
            <a href="https://github.com/OpenDesignlabs/project-D" target="_blank" rel="noreferrer" 
               className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-m3-surfaceContainerHigh text-m3-onSurface rounded-xl font-semibold hover:bg-m3-surfaceContainerHighest transition-colors border border-white/5 shadow-sm">
              <Github size={18} className="opacity-80" /> GitHub
              <span className="flex items-center gap-1 text-[11px] bg-black/20 px-1.5 py-0.5 rounded-md ml-1 opacity-80 font-mono">
                <Star size={10} className="fill-current" /> 12k
              </span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
            {[
              { icon: ShieldCheck, text: 'Official component specs' },
              { icon: Zap,         text: 'Zero-config canvas drop' },
              { icon: Sparkles,    text: 'AI-generated primitive blocks' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-2 text-sm font-medium text-m3-onSurfaceVariant/90 bg-white/[0.03] px-3.5 py-1.5 rounded-full ring-1 ring-white/[0.05]">
                <Icon size={14} className="text-m3-primary" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main catalog ── */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-12 md:py-16">
        <Suspense fallback={<CatalogSkeleton />}>
          <ComponentsData />
        </Suspense>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-m3-background border-t border-white/[0.04] py-12 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col sm:flex-row items-center
                        justify-between gap-6 text-sm text-m3-onSurfaceVariant font-medium">
          <span className="opacity-70">© 2026 Vectra Studio. All components are MIT licensed.</span>
          <div className="flex items-center gap-8">
            <a href="https://docs.vectra.dev" className="hover:text-m3-onSurface transition-colors">Documentation</a>
            <a href="https://app.vectra.dev"   className="hover:text-m3-onSurface transition-colors">Launch Studio</a>
            <a href="/publish"                  className="hover:text-m3-onSurface transition-colors">Publish</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function CatalogSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full">
      <aside className="w-full lg:w-64 flex-shrink-0">
         <div className="flex flex-col gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
               <div key={i} className={`h-11 rounded-full animate-pulse bg-m3-surfaceContainerHigh ${i === 0 ? 'w-3/4 mb-4' : 'w-full'}`} />
            ))}
         </div>
      </aside>
      <div className="flex-1 flex flex-col gap-8">
         {/* Search bar skeleton */}
         <div className="flex gap-4">
            <div className="flex-1 h-14 bg-m3-surfaceContainerHigh rounded-full animate-pulse ring-1 ring-white/[0.04]" />
            <div className="w-40 h-14 bg-m3-surfaceContainerHigh rounded-full animate-pulse ring-1 ring-white/[0.04]" />
         </div>
         {/* Grid skeleton */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-80 bg-m3-surfaceContainer rounded-[24px] border border-white/[0.04] animate-pulse" />
            ))}
         </div>
      </div>
    </div>
  );
}
