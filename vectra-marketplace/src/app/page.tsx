import { Suspense } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../components/ThemeToggle';
import { Boxes, ArrowRight, Sparkles, ShieldCheck, Zap, Github, Search, Moon, Book, Layers, Blocks, Code2 } from 'lucide-react';

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
              {/* Theme Toggle Component */}
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
            <Link href={"/components" as any} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-m3-primary text-m3-onPrimary rounded-xl font-semibold hover:bg-m3-primary/90 transition-colors shadow-sm">
              Explore <ArrowRight size={16} />
            </Link>
            <a href="https://vectra-docs-pi.vercel.app/" target="_blank" rel="noreferrer" 
               className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-m3-surfaceContainerHigh text-m3-onSurface rounded-xl font-semibold hover:bg-m3-surfaceContainerHighest transition-colors border border-white/5 shadow-sm">
              <Book size={18} className="opacity-80" /> Read Docs
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

      {/* ── Features / Ecosystem ── */}
      <section className="relative w-full max-w-[1400px] mx-auto px-6 py-24 z-10 flex-1">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-m3-onSurface mb-4">
            A native ecosystem
          </h2>
          <p className="text-m3-onSurfaceVariant text-lg leading-relaxed max-w-2xl mx-auto">
            Vectra Marketplace seamlessly integrates with your studio canvas. 
            Everything is built native for modern React and Tailwind CSS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-m3-surfaceContainerLowest/40 backdrop-blur-2xl border border-white/[0.05] p-8 rounded-[32px] flex flex-col items-start hover:bg-m3-surfaceContainerLowest/60 transition-colors shadow-sm">
            <div className="w-14 h-14 rounded-[20px] bg-m3-primary/10 flex items-center justify-center text-m3-primary mb-6 ring-1 ring-m3-primary/20 shadow-inner">
              <Layers size={28} />
            </div>
            <h3 className="text-xl font-bold text-m3-onSurface mb-3">Drag & Drop</h3>
            <p className="text-m3-onSurfaceVariant text-sm leading-relaxed">
              Pull components directly into the local visual builder canvas. Fully responsive, completely fluid.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-m3-surfaceContainerLowest/40 backdrop-blur-2xl border border-white/[0.05] p-8 rounded-[32px] flex flex-col items-start hover:bg-m3-surfaceContainerLowest/60 transition-colors shadow-sm">
            <div className="w-14 h-14 rounded-[20px] bg-m3-secondaryContainer/50 flex items-center justify-center text-m3-onSecondaryContainer mb-6 ring-1 ring-white/10 shadow-inner">
              <Blocks size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-m3-onSurface mb-3">100% Modifiable</h3>
            <p className="text-m3-onSurfaceVariant text-sm leading-relaxed">
              Every component's code is instantly accessible. Edit states, props, and Tailwind classes directly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-m3-surfaceContainerLowest/40 backdrop-blur-2xl border border-white/[0.05] p-8 rounded-[32px] flex flex-col items-start hover:bg-m3-surfaceContainerLowest/60 transition-colors shadow-sm">
            <div className="w-14 h-14 rounded-[20px] bg-m3-tertiaryContainer/50 flex items-center justify-center text-m3-onTertiaryContainer mb-6 ring-1 ring-white/10 shadow-inner">
              <Code2 size={28} />
            </div>
            <h3 className="text-xl font-bold text-m3-onSurface mb-3">Export to Code</h3>
            <p className="text-m3-onSurfaceVariant text-sm leading-relaxed">
              Generated underlying code is pure React with Tailwind v4. No locked-in abstractions or weird wrappers.
            </p>
          </div>
        </div>

        <div className="mt-8 bg-m3-surfaceContainerHighest/30 backdrop-blur-3xl border border-white/[0.05] rounded-[40px] p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-m3-primary/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex-1 relative z-10">
            <h3 className="text-3xl font-display font-semibold text-m3-onSurface mb-3">Sync with Vectra Studio</h3>
            <p className="text-m3-onSurfaceVariant text-base md:text-lg leading-relaxed max-w-xl">
              Publish your own components to the marketplace and have them instantly available across all your team's Studio workspaces.
            </p>
          </div>
          <div className="w-full md:w-auto relative z-10">
             <Link href="/publish" className="inline-flex w-full md:w-auto items-center justify-center gap-2 px-8 py-4 bg-m3-onSurface text-m3-surface rounded-[24px] font-bold hover:bg-m3-onSurface/90 transition-all shadow-xl shadow-m3-onSurface/10">
               Start Publishing Now <ArrowRight size={16} />
             </Link>
          </div>
        </div>
      </section>

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


