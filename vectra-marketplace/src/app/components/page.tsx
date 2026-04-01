import { Suspense } from 'react';
import Link from 'next/link';
import { Boxes, Search, Github, Moon, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { getComponents } from '../../lib/registry';
import { ComponentGrid } from '../../components/ComponentGrid';

export const revalidate = 60;

async function ComponentsData() {
  try {
    const { components, total } = await getComponents({ limit: 100, sort: 'official' });
    return <ComponentGrid initialComponents={components} totalCount={total} />;
  } catch (error) {
    console.warn('⚠️ Dev/Build Server offline: Skipping prerender component fetch.');
    return <ComponentGrid initialComponents={[]} totalCount={0} />;
  }
}

export default function ComponentsLibraryPage() {
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
            <Link href="/" className="hover:text-m3-onSurface transition-colors">Home</Link>
            <Link href={"/components" as any} className="text-m3-onSurface transition-colors">Browse</Link>
            <Link href="/publish" className="hover:text-m3-onSurface transition-colors">Publish</Link>
            <div className="w-px h-4 bg-white/10 mx-2" />
            <div className="flex items-center gap-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-m3-onSurface transition-colors" aria-label="GitHub">
                <Github size={18} />
              </a>
              <ThemeToggle />
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

      {/* ── Main catalog ── */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 md:py-12">
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
