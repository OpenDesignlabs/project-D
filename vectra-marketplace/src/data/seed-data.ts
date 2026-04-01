/**
 * seed-data.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Official Vectra Marketplace components — production-ready UI blocks.
 * 20 real components across navigation, hero, footer, pricing categories.
 * 25 stubs from Gemini batch excluded (empty shells — not seeded).
 * Run: npm run seed
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { PublishComponentPayload } from '../types';

export const SEED_COMPONENTS: PublishComponentPayload[] = [

  // ─── NAVIGATION ──────────────────────────────────────────────────────────

  {
    name: 'vectra:FloatingPillNav', version: '1.0.0', slug: 'floating-pill-nav',
    label: 'Floating Pill Nav', description: 'A floating glassmorphism pill navigation bar with backdrop blur.',
    category: 'navigation', tags: ['nav', 'floating', 'pill', 'glassmorphism'],
    importMeta: { packageName: '', exportName: 'FloatingPillNav', isDefaultExport: true },
    sourceCode: `import React from 'react';
import { ChevronRight } from 'lucide-react';
export default function FloatingPillNav() {
  return (
    <div className="w-full px-4 pt-4 pb-2 bg-transparent">
      <header className="max-w-5xl mx-auto rounded-full border border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-lg font-extrabold tracking-tighter text-zinc-900 dark:text-white">VECTRA</span>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Product</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Solutions</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Pricing</a>
          </nav>
        </div>
        <button className="flex items-center gap-1 text-sm font-semibold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 px-4 py-2 rounded-full hover:scale-105 transition-transform">
          Start Building <ChevronRight className="w-4 h-4" />
        </button>
      </header>
    </div>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  {
    name: 'vectra:MinimalSplitNav', version: '1.0.0', slug: 'minimal-split-nav',
    label: 'Minimal Split Nav', description: 'A centered-logo navigation with links split left and right.',
    category: 'navigation', tags: ['nav', 'minimal', 'centered', 'split'],
    importMeta: { packageName: '', exportName: 'MinimalSplitNav', isDefaultExport: true },
    sourceCode: `import React from 'react';
export default function MinimalSplitNav() {
  return (
    <header className="w-full px-6 py-5 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Studio</a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Journal</a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">About</a>
        </nav>
        <div className="col-span-3 md:col-span-1 flex justify-center">
          <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-sm rotate-45 flex items-center justify-center">
            <div className="w-4 h-4 bg-white dark:bg-zinc-900 rounded-sm -rotate-45"></div>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-end gap-6 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Contact</a>
          <a href="#" className="text-zinc-900 dark:text-white underline decoration-2 decoration-indigo-500 underline-offset-4">Book Demo</a>
        </div>
      </div>
    </header>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  {
    name: 'vectra:MegaMenuHeader', version: '1.0.0', slug: 'mega-menu-header',
    label: 'Mega Menu Header', description: 'Enterprise-style header with dropdown mega menu navigation.',
    category: 'navigation', tags: ['nav', 'mega-menu', 'enterprise', 'header'],
    importMeta: { packageName: '', exportName: 'MegaMenuHeader', isDefaultExport: true },
    sourceCode: `import React from 'react';
import { ChevronDown, Globe } from 'lucide-react';
export default function MegaMenuHeader() {
  return (
    <header className="w-full bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 md:px-8 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <Globe className="w-6 h-6" /> Nexus
          </div>
          <nav className="hidden lg:flex items-center gap-1">
            {['Products', 'Developers', 'Company', 'Resources'].map((item) => (
              <button key={item} className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-md transition-colors">
                {item}<ChevronDown className="w-4 h-4 text-zinc-400" />
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden md:block px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Log in</button>
          <button className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors">Contact Sales</button>
        </div>
      </div>
    </header>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  {
    name: 'vectra:DashboardHeader', version: '1.0.0', slug: 'dashboard-header',
    label: 'Dashboard Header', description: 'App header with breadcrumbs, notifications, and avatar.',
    category: 'navigation', tags: ['nav', 'dashboard', 'breadcrumb', 'app'],
    importMeta: { packageName: '', exportName: 'DashboardHeader', isDefaultExport: true },
    sourceCode: `import React from 'react';
import { Bell, ChevronRight, HelpCircle } from 'lucide-react';
export default function DashboardHeader() {
  return (
    <header className="w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center text-sm font-medium text-zinc-500 dark:text-zinc-400">
        <span className="hover:text-zinc-900 dark:hover:text-white cursor-pointer">Acme Corp</span>
        <ChevronRight className="w-4 h-4 mx-2 text-zinc-300 dark:text-zinc-700" />
        <span className="hover:text-zinc-900 dark:hover:text-white cursor-pointer">Projects</span>
        <ChevronRight className="w-4 h-4 mx-2 text-zinc-300 dark:text-zinc-700" />
        <span className="text-zinc-900 dark:text-white">Vectra Migration</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"><HelpCircle className="w-5 h-5" /></button>
        <button className="relative text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
        </button>
        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
        <button className="flex items-center gap-2">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User avatar" className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
        </button>
      </div>
    </header>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  {
    name: 'vectra:EcommerceHeader', version: '1.0.0', slug: 'ecommerce-header',
    label: 'E-commerce Header', description: 'Store header with promo bar, search, cart, and user account.',
    category: 'navigation', tags: ['nav', 'ecommerce', 'store', 'cart', 'search'],
    importMeta: { packageName: '', exportName: 'EcommerceHeader', isDefaultExport: true },
    sourceCode: `import React from 'react';
import { Search, ShoppingCart, User, Menu } from 'lucide-react';
export default function EcommerceHeader() {
  return (
    <div className="w-full flex flex-col">
      <div className="w-full bg-indigo-600 text-white text-xs font-medium py-2 text-center">
        Free shipping on all orders over $50. <a href="#" className="underline hover:text-indigo-200">Shop now</a>
      </div>
      <header className="w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-zinc-600 dark:text-zinc-400"><Menu className="w-6 h-6" /></button>
            <span className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-widest">Store</span>
          </div>
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <input type="text" placeholder="Search products..." className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-lg py-2.5 pl-4 pr-10 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-zinc-400" />
          </div>
          <div className="flex items-center gap-5 text-zinc-600 dark:text-zinc-400">
            <button className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><User className="w-5 h-5" /></button>
            <button className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  // ─── HERO ─────────────────────────────────────────────────────────────────

  {
    name: 'vectra:CenteredHero', version: '1.0.0', slug: 'centered-hero',
    label: 'Centered Hero', description: 'Full-width dark hero with gradient text, glow effect, and centered CTA.',
    category: 'hero', tags: ['hero', 'centered', 'dark', 'gradient', 'glow'],
    importMeta: { packageName: '', exportName: 'CenteredHero', isDefaultExport: true },
    sourceCode: `import React from 'react';
export default function CenteredHero() {
  return (
    <section className="w-full py-32 bg-black flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/30 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="relative z-10 max-w-5xl flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-8">
          The next evolution of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">interface design.</span>
        </h1>
        <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl font-medium">
          Pro-level tools for pro-level teams. Vectra is the only visual builder powered by a native Rust engine.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <button className="px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:scale-105 transition-transform">Buy Now</button>
          <a href="#" className="text-lg font-semibold text-white hover:text-indigo-400 transition-colors flex items-center gap-2">Watch the keynote <span className="text-xl">›</span></a>
        </div>
      </div>
    </section>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  {
    name: 'vectra:SplitHero', version: '1.0.0', slug: 'split-hero',
    label: 'Split Hero', description: 'Two-column hero with animated badge, trust signals, and app preview mockup.',
    category: 'hero', tags: ['hero', 'split', 'two-column', 'saas'],
    importMeta: { packageName: '', exportName: 'SplitHero', isDefaultExport: true },
    sourceCode: `import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
export default function SplitHero() {
  return (
    <section className="w-full py-20 lg:py-32 bg-white dark:bg-zinc-950 overflow-hidden px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            v2.0 is now available
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-900 dark:text-white leading-tight mb-6 tracking-tight">
            Build software <br/><span className="text-indigo-600 dark:text-indigo-400">at the speed of thought.</span>
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-lg leading-relaxed">
            Visually design your Next.js and Tailwind applications without writing a single line of boilerplate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-8">
            <button className="flex items-center justify-center gap-2 px-8 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
              Start Building Free <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-3.5 bg-transparent border-2 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-semibold rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">Book a Demo</button>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 14-day trial</span>
          </div>
        </div>
        <div className="w-full h-[400px] lg:h-[500px] bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-8 left-8 right-8 bottom-8 bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 p-4">
            <div className="w-full h-8 bg-zinc-100 dark:bg-zinc-900 rounded-md mb-4 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="w-3/4 h-4 bg-zinc-100 dark:bg-zinc-900 rounded mb-2"></div>
            <div className="w-1/2 h-4 bg-zinc-100 dark:bg-zinc-900 rounded mb-8"></div>
            <div className="w-full h-32 bg-indigo-50 dark:bg-indigo-500/10 rounded border border-indigo-100 dark:border-indigo-500/20"></div>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  {
    name: 'vectra:BentoHero', version: '1.0.0', slug: 'bento-hero',
    label: 'Bento Hero', description: 'Bento-grid hero layout with feature cards and social proof.',
    category: 'hero', tags: ['hero', 'bento', 'grid', 'cards'],
    importMeta: { packageName: '', exportName: 'BentoHero', isDefaultExport: true },
    sourceCode: `import React from 'react';
import { Star, Zap } from 'lucide-react';
export default function BentoHero() {
  return (
    <section className="w-full py-20 bg-zinc-100 dark:bg-zinc-900 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-auto md:h-[500px]">
        <div className="md:col-span-2 md:row-span-2 bg-white dark:bg-zinc-950 rounded-3xl p-8 md:p-12 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white leading-tight mb-6">The all-in-one <br /> toolkit for creators.</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-8 max-w-md">Everything you need to plan, shoot, edit, and publish your content across every platform.</p>
          <button className="self-start px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">Get Started Free</button>
        </div>
        <div className="bg-amber-100 dark:bg-amber-500/10 rounded-3xl p-6 border border-amber-200 dark:border-amber-500/20 flex flex-col justify-center">
          <Star className="w-8 h-8 text-amber-500 mb-4" />
          <h3 className="text-xl font-bold text-amber-900 dark:text-amber-500 mb-2">Loved by 10k+</h3>
          <p className="text-amber-700/80 dark:text-amber-500/80 text-sm">Join a community of top-tier creators building their brands.</p>
        </div>
        <div className="bg-emerald-100 dark:bg-emerald-500/10 rounded-3xl p-6 border border-emerald-200 dark:border-emerald-500/20 flex flex-col justify-center">
          <Zap className="w-8 h-8 text-emerald-500 mb-4" />
          <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-500 mb-2">Lightning Fast</h3>
          <p className="text-emerald-700/80 dark:text-emerald-500/80 text-sm">Hardware-accelerated rendering powered by WebGPU.</p>
        </div>
      </div>
    </section>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  {
    name: 'vectra:DevToolHero', version: '1.0.0', slug: 'dev-tool-hero',
    label: 'Dev Tool Hero', description: 'Developer-focused dark hero with animated terminal code block.',
    category: 'hero', tags: ['hero', 'developer', 'terminal', 'cli', 'dark'],
    importMeta: { packageName: '', exportName: 'DevToolHero', isDefaultExport: true },
    sourceCode: `import React from 'react';
import { Terminal, Copy } from 'lucide-react';
export default function DevToolHero() {
  return (
    <section className="w-full py-24 bg-[#0a0a0a] text-white px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-mono font-bold text-zinc-100 mb-6 leading-tight">
            Deploy your code <br /><span className="text-emerald-400">in milliseconds.</span>
          </h1>
          <p className="text-zinc-400 text-lg mb-8 font-mono">Push to main and let our globally distributed edge network handle the rest. Zero config required.</p>
          <div className="flex gap-4 font-mono text-sm">
            <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded">Read Docs</button>
            <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded">View GitHub</button>
          </div>
        </div>
        <div className="w-full bg-[#111] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden font-mono text-sm">
          <div className="bg-[#1a1a1a] px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400"><Terminal className="w-4 h-4" /> <span>bash</span></div>
            <Copy className="w-4 h-4 text-zinc-500 hover:text-white cursor-pointer" />
          </div>
          <div className="p-6 text-zinc-300 leading-relaxed overflow-x-auto">
            <p className="text-zinc-500 mb-2"># Install the CLI globally</p>
            <p className="mb-4"><span className="text-pink-400">npm</span> install -g vectra-cli</p>
            <p className="text-zinc-500 mb-2"># Initialize a new project</p>
            <p className="mb-4"><span className="text-emerald-400">vectra</span> init my-app</p>
            <p className="text-zinc-500 mb-2"># Deploy to edge</p>
            <p><span className="text-emerald-400">vectra</span> deploy --production</p>
            <p className="text-blue-400 mt-4">✔ Deployment successful!</p>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  {
    name: 'vectra:DashboardRevealHero', version: '1.0.0', slug: 'dashboard-reveal-hero',
    label: 'Dashboard Reveal Hero', description: 'Hero with an app dashboard mockup bleeding off the bottom edge.',
    category: 'hero', tags: ['hero', 'dashboard', 'mockup', 'saas', 'reveal'],
    importMeta: { packageName: '', exportName: 'DashboardRevealHero', isDefaultExport: true },
    sourceCode: `import React from 'react';
export default function DashboardRevealHero() {
  return (
    <section className="w-full pt-24 pb-12 bg-zinc-50 dark:bg-zinc-950 px-4 flex flex-col items-center overflow-hidden">
      <div className="text-center max-w-3xl mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white mb-6 tracking-tight">Manage your infrastructure with zero friction.</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">Connect your AWS, GCP, and Azure accounts in one place. Monitor costs, deploy updates, and manage access rules without opening the terminal.</p>
        <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/30 transition-all">Connect your first cluster</button>
      </div>
      <div className="w-full max-w-6xl relative">
        <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500/20 to-transparent rounded-t-[2.5rem] blur-xl"></div>
        <div className="relative w-full h-[500px] bg-white dark:bg-zinc-900 rounded-t-3xl border-t border-l border-r border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
          <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center px-6 gap-4">
            <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="flex-1"></div>
            <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
          </div>
          <div className="flex-1 p-6 grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="w-1/3 h-6 bg-zinc-200 dark:bg-zinc-800 rounded mb-6"></div>
              <div className="w-full h-48 bg-indigo-50 dark:bg-indigo-500/10 rounded border border-indigo-100 dark:border-indigo-500/20"></div>
            </div>
            <div className="col-span-1 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4">
              <div className="w-1/2 h-6 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
              <div className="w-full h-12 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="w-full h-12 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              <div className="w-full h-12 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  // ─── PRICING ──────────────────────────────────────────────────────────────

  {
    name: 'vectra:SaasClassicPricing', version: '1.0.0', slug: 'saas-classic-pricing',
    label: 'SaaS Classic Pricing', description: 'Three-tier pricing cards with highlighted middle plan and feature lists.',
    category: 'pricing', tags: ['pricing', 'saas', 'tiers', 'cards'],
    importMeta: { packageName: '', exportName: 'SaasClassicPricing', isDefaultExport: true },
    sourceCode: `import React from 'react';
import { Check, Zap } from 'lucide-react';
export default function SaasClassicPricing() {
  const tiers = [
    { name: 'Hobby', price: '$0', desc: 'Perfect for side projects and learning.', features: ['1 Project', 'Basic Analytics', 'Community Support', '1GB Storage'], cta: 'Start Free', highlighted: false },
    { name: 'Pro', price: '$29', desc: 'For professional developers and small teams.', features: ['Unlimited Projects', 'Advanced Analytics', 'Priority Support', '50GB Storage', 'Custom Domains'], cta: 'Get Pro', highlighted: true },
    { name: 'Enterprise', price: '$99', desc: 'For scaling companies with complex needs.', features: ['Everything in Pro', 'Custom Contracts', '24/7 Phone Support', 'Unlimited Storage', 'SSO & Advanced Security'], cta: 'Contact Sales', highlighted: false },
  ];
  return (
    <section className="w-full py-24 bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">No hidden fees. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div key={tier.name} className={\`relative p-8 rounded-3xl border \${tier.highlighted ? 'bg-indigo-600 border-indigo-500 shadow-2xl md:-translate-y-4' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm'}\`}>
              {tier.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Most Popular
                </div>
              )}
              <h3 className={\`text-xl font-semibold mb-2 \${tier.highlighted ? 'text-white' : 'text-zinc-900 dark:text-white'}\`}>{tier.name}</h3>
              <p className={\`text-sm mb-6 h-10 \${tier.highlighted ? 'text-indigo-100' : 'text-zinc-500 dark:text-zinc-400'}\`}>{tier.desc}</p>
              <div className="mb-6">
                <span className={\`text-4xl font-extrabold \${tier.highlighted ? 'text-white' : 'text-zinc-900 dark:text-white'}\`}>{tier.price}</span>
                <span className={\`text-sm \${tier.highlighted ? 'text-indigo-200' : 'text-zinc-500'}\`}>/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={\`w-5 h-5 shrink-0 \${tier.highlighted ? 'text-indigo-200' : 'text-indigo-500'}\`} />
                    <span className={\`text-sm \${tier.highlighted ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}\`}>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={\`w-full py-3 px-4 rounded-xl font-semibold transition-colors \${tier.highlighted ? 'bg-white text-indigo-600 hover:bg-zinc-100' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700'}\`}>{tier.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  {
    name: 'vectra:TogglePricing', version: '1.0.0', slug: 'toggle-pricing',
    label: 'Toggle Pricing', description: 'Monthly/annual pricing toggle with live price switch and savings badge.',
    category: 'pricing', tags: ['pricing', 'toggle', 'annual', 'monthly', 'interactive'],
    importMeta: { packageName: '', exportName: 'TogglePricing', isDefaultExport: true },
    sourceCode: `import React, { useState } from 'react';
import { Check } from 'lucide-react';
export default function TogglePricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  return (
    <section className="w-full py-24 bg-white dark:bg-zinc-900 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-6">Choose your plan</h2>
          <div className="flex items-center justify-center gap-4">
            <span className={\`text-sm font-medium \${!isAnnual ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}\`}>Monthly</span>
            <button onClick={() => setIsAnnual(!isAnnual)} className="relative w-14 h-8 bg-indigo-600 rounded-full p-1 transition-colors focus:outline-none">
              <div className={\`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform \${isAnnual ? 'translate-x-6' : 'translate-x-0'}\`}></div>
            </button>
            <span className={\`text-sm font-medium flex items-center gap-2 \${isAnnual ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}\`}>
              Annually <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">Save 20%</span>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Starter</h3>
            <p className="text-zinc-500 mb-6">For individuals and freelancers.</p>
            <div className="mb-6"><span className="text-5xl font-black text-zinc-900 dark:text-white">\${isAnnual ? '12' : '15'}</span><span className="text-zinc-500">/mo</span></div>
            <button className="w-full py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg font-bold mb-8 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">Get Started</button>
            <ul className="space-y-4">
              {['Up to 5 projects', 'Basic support', 'Analytics dashboard', '1 Custom domain'].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300"><Check className="w-5 h-5 text-indigo-500" /> {f}</li>
              ))}
            </ul>
          </div>
          <div className="p-8 rounded-3xl border-2 border-indigo-500 bg-white dark:bg-zinc-900 relative shadow-xl">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Business</h3>
            <p className="text-zinc-500 mb-6">For growing teams and startups.</p>
            <div className="mb-6"><span className="text-5xl font-black text-zinc-900 dark:text-white">\${isAnnual ? '49' : '59'}</span><span className="text-zinc-500">/mo</span></div>
            <button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold mb-8 hover:bg-indigo-700 transition-colors">Upgrade to Business</button>
            <ul className="space-y-4">
              {['Unlimited projects', '24/7 Priority support', 'Advanced team analytics', 'Unlimited custom domains', 'Role-based access control'].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300"><Check className="w-5 h-5 text-indigo-500" /> {f}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  {
    name: 'vectra:FeatureMatrixPricing', version: '1.0.0', slug: 'feature-matrix-pricing',
    label: 'Feature Matrix Pricing', description: 'Enterprise comparison table with check/cross feature matrix across plans.',
    category: 'pricing', tags: ['pricing', 'comparison', 'matrix', 'enterprise', 'table'],
    importMeta: { packageName: '', exportName: 'FeatureMatrixPricing', isDefaultExport: true },
    sourceCode: `import React from 'react';
import { Check, X } from 'lucide-react';
export default function FeatureMatrixPricing() {
  const features = [
    { name: 'Number of Users', basic: '1 User', pro: '5 Users', enterprise: 'Unlimited' },
    { name: 'Storage Limit', basic: '5 GB', pro: '100 GB', enterprise: 'Unlimited' },
    { name: 'Custom Domains', basic: false, pro: true, enterprise: true },
    { name: 'Priority Support', basic: false, pro: false, enterprise: true },
    { name: 'API Access', basic: false, pro: true, enterprise: true },
    { name: 'SSO Integration', basic: false, pro: false, enterprise: true },
  ];
  return (
    <section className="w-full py-20 bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">Compare Plans</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Find the perfect plan for your specific needs.</p>
        </div>
        <div className="hidden md:block w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-4 bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 p-6">
            <div className="font-bold text-zinc-900 dark:text-white text-lg">Features</div>
            <div className="font-bold text-center text-zinc-900 dark:text-white text-lg">Basic<br/><span className="text-sm font-normal text-zinc-500">Free</span></div>
            <div className="font-bold text-center text-indigo-600 dark:text-indigo-400 text-lg">Pro<br/><span className="text-sm font-normal text-zinc-500">$29/mo</span></div>
            <div className="font-bold text-center text-zinc-900 dark:text-white text-lg">Enterprise<br/><span className="text-sm font-normal text-zinc-500">Custom</span></div>
          </div>
          {features.map((feat, idx) => (
            <div key={idx} className="grid grid-cols-4 p-6 border-b border-zinc-100 dark:border-zinc-800/50 items-center last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{feat.name}</div>
              <div className="flex justify-center text-sm text-zinc-600 dark:text-zinc-400">{typeof feat.basic === 'boolean' ? (feat.basic ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />) : feat.basic}</div>
              <div className="flex justify-center text-sm text-zinc-900 dark:text-white font-semibold">{typeof feat.pro === 'boolean' ? (feat.pro ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />) : feat.pro}</div>
              <div className="flex justify-center text-sm text-zinc-600 dark:text-zinc-400">{typeof feat.enterprise === 'boolean' ? (feat.enterprise ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />) : feat.enterprise}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  {
    name: 'vectra:LifetimeDealPricing', version: '1.0.0', slug: 'lifetime-deal-pricing',
    label: 'Lifetime Deal Pricing', description: 'AppSumo-style one-time payment card with urgency countdown and strikethrough price.',
    category: 'pricing', tags: ['pricing', 'lifetime', 'one-time', 'deal', 'urgency'],
    importMeta: { packageName: '', exportName: 'LifetimeDealPricing', isDefaultExport: true },
    sourceCode: `import React from 'react';
import { Star, Shield, Clock } from 'lucide-react';
export default function LifetimeDealPricing() {
  return (
    <section className="w-full py-20 bg-zinc-950 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Pay once. <br/><span className="text-emerald-400">Use forever.</span></h2>
          <p className="text-lg text-zinc-400 mb-8">Stop renting your tools. Get a lifetime license and receive all future updates for free.</p>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0"><Star className="w-5 h-5 text-emerald-400" /></div>
              <div><h4 className="text-white font-bold mb-1">Lifetime Updates</h4><p className="text-sm text-zinc-500">Every new component we build gets added automatically.</p></div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0"><Shield className="w-5 h-5 text-blue-400" /></div>
              <div><h4 className="text-white font-bold mb-1">Commercial License</h4><p className="text-sm text-zinc-500">Use in unlimited client projects without attribution.</p></div>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-3xl p-8 md:p-10 border border-zinc-800 shadow-2xl relative">
          <div className="absolute -top-4 right-8 bg-emerald-500 text-zinc-950 px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20">
            <Clock className="w-4 h-4" /> 48 Hours Left
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Lifetime Access</h3>
          <p className="text-zinc-400 mb-6">One-time payment. No subscriptions.</p>
          <div className="flex items-end gap-3 mb-8">
            <span className="text-6xl font-black text-white">$149</span>
            <span className="text-xl text-zinc-500 line-through mb-2">$299</span>
          </div>
          <button className="w-full py-4 bg-white text-zinc-950 font-black rounded-xl hover:bg-zinc-200 transition-transform hover:scale-[1.02] mb-4">Get Instant Access</button>
          <p className="text-center text-xs text-zinc-500">14-day money-back guarantee. Secure payment via Stripe.</p>
        </div>
      </div>
    </section>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  {
    name: 'vectra:UsageBasedPricing', version: '1.0.0', slug: 'usage-based-pricing',
    label: 'Usage-Based Pricing', description: 'Pay-as-you-go pricing table with per-unit rates and enterprise CTA.',
    category: 'pricing', tags: ['pricing', 'usage', 'api', 'metered', 'developer'],
    importMeta: { packageName: '', exportName: 'UsageBasedPricing', isDefaultExport: true },
    sourceCode: `import React from 'react';
import { Server, Activity, ArrowRight } from 'lucide-react';
export default function UsageBasedPricing() {
  return (
    <section className="w-full py-24 bg-white dark:bg-zinc-900 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">Scale infinitely. Pay only for what you use.</h2>
          <p className="text-zinc-600 dark:text-zinc-400">Transparent usage-based pricing designed for developers.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6"><Activity className="w-6 h-6 text-indigo-500" /><h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Pay as you go</h3></div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8">No minimums. Start for free, then pay per compute hour and gigabyte of bandwidth.</p>
            <div className="space-y-4 mb-8">
              {[['Compute (vCPU)', '$0.005 / hr'], ['Edge Bandwidth', '$0.08 / GB'], ['Database Reads', '$0.25 / 1M']].map(([label, price]) => (
                <div key={label} className="flex justify-between items-center py-3 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">{label}</span>
                  <span className="text-zinc-900 dark:text-white font-mono bg-white dark:bg-zinc-900 px-2 py-1 rounded text-sm">{price}</span>
                </div>
              ))}
            </div>
            <button className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">Create Free Account</button>
          </div>
          <div className="md:col-span-2 bg-indigo-600 rounded-3xl p-8 md:p-10 text-white flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-3 mb-6"><Server className="w-6 h-6 text-indigo-300" /><h3 className="text-2xl font-bold">Enterprise</h3></div>
              <p className="text-indigo-100 mb-8 leading-relaxed">For massive workloads requiring predictable billing and compliance certifications.</p>
              <ul className="space-y-3 mb-8">
                {['Volume Discounts', 'Dedicated Account Manager', 'Custom SLAs'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-indigo-100"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> {item}</li>
                ))}
              </ul>
            </div>
            <button className="w-full px-6 py-3 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 border border-indigo-500">Contact Sales <ArrowRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  // ─── FOOTER ───────────────────────────────────────────────────────────────

  {
    name: 'vectra:MinimalFooter', version: '1.0.0', slug: 'minimal-footer',
    label: 'Minimal Footer', description: 'Clean centered footer with logo, nav links, and social icons.',
    category: 'footer', tags: ['footer', 'minimal', 'centered', 'social'],
    importMeta: { packageName: '', exportName: 'MinimalFooter', isDefaultExport: true },
    sourceCode: `import React from 'react';
import { Twitter, Github, Linkedin } from 'lucide-react';
export default function MinimalFooter() {
  return (
    <footer className="w-full bg-white dark:bg-zinc-950 py-12 px-4 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Vectra</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <a href="#">Features</a><a href="#">Pricing</a><a href="#">About Us</a><a href="#">Contact</a><a href="#">Privacy</a>
        </nav>
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex items-center gap-5 text-zinc-400">
            <Twitter className="w-5 h-5" /><Github className="w-5 h-5" /><Linkedin className="w-5 h-5" />
          </div>
          <p className="text-zinc-500 text-sm text-center">&copy; {new Date().getFullYear()} Vectra Inc.</p>
        </div>
      </div>
    </footer>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  {
    name: 'vectra:MegaFooter', version: '1.0.0', slug: 'mega-footer',
    label: 'Mega Footer', description: 'Full-width multi-column footer with newsletter signup and social links.',
    category: 'footer', tags: ['footer', 'mega', 'newsletter', 'multi-column'],
    importMeta: { packageName: '', exportName: 'MegaFooter', isDefaultExport: true },
    sourceCode: `import React from 'react';
import { ArrowRight, Twitter, Github, Youtube } from 'lucide-react';
export default function MegaFooter() {
  const cols = [
    { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
    { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
    { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
  ];
  return (
    <footer className="w-full bg-zinc-50 dark:bg-zinc-950 pt-20 pb-10 px-4 border-t border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-16">
        <div className="lg:col-span-2">
          <span className="text-2xl font-bold text-zinc-900 dark:text-white mb-4 block">Vectra</span>
          <p className="text-zinc-500 text-sm mb-6 leading-relaxed">The visual builder for teams who care about code quality.</p>
          <form className="flex gap-2">
            <input type="email" placeholder="your@email.com" className="flex-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white" />
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"><ArrowRight className="w-4 h-4" /></button>
          </form>
        </div>
        {cols.map(col => (
          <div key={col.title} className="lg:col-span-1">
            <h4 className="font-bold text-zinc-900 dark:text-white text-sm mb-4 uppercase tracking-wider">{col.title}</h4>
            <ul className="space-y-3">{col.links.map(l => <li key={l}><a href="#" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">{l}</a></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-zinc-400 text-sm">&copy; {new Date().getFullYear()} Vectra Inc. All rights reserved.</p>
        <div className="flex items-center gap-5 text-zinc-400">
          <Twitter className="w-5 h-5 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors" />
          <Github className="w-5 h-5 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors" />
          <Youtube className="w-5 h-5 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
    </footer>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  {
    name: 'vectra:SplitCTAFooter', version: '1.0.0', slug: 'split-cta-footer',
    label: 'Split CTA Footer', description: 'Footer with a full-width CTA band above the dark copyright bar.',
    category: 'footer', tags: ['footer', 'cta', 'split', 'conversion'],
    importMeta: { packageName: '', exportName: 'SplitCTAFooter', isDefaultExport: true },
    sourceCode: `import React from 'react';
export default function SplitCTAFooter() {
  return (
    <footer className="w-full">
      <div className="bg-indigo-600 py-20 text-center text-white px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to ship faster?</h2>
        <p className="text-indigo-100 mb-8 max-w-md mx-auto">Join 10,000+ teams already building with Vectra.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-full hover:bg-indigo-50 transition-colors">Start for Free</button>
          <button className="px-8 py-3 bg-indigo-700 text-white font-bold rounded-full hover:bg-indigo-800 transition-colors border border-indigo-500">Talk to Sales</button>
        </div>
      </div>
      <div className="bg-zinc-950 py-8 text-center px-4">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto gap-4">
          <span className="text-zinc-500 text-sm">&copy; {new Date().getFullYear()} Vectra. All rights reserved.</span>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },

  {
    name: 'vectra:AppSlimFooter', version: '1.0.0', slug: 'app-slim-footer',
    label: 'App Slim Footer', description: 'Minimal one-line app footer with copyright and system status.',
    category: 'footer', tags: ['footer', 'slim', 'app', 'minimal', 'status'],
    importMeta: { packageName: '', exportName: 'AppSlimFooter', isDefaultExport: true },
    sourceCode: `import React from 'react';
export default function AppSlimFooter() {
  return (
    <footer className="w-full py-4 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>&copy; {new Date().getFullYear()} Vectra</span>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Docs</a>
          <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Support</a>
          <span className="flex items-center gap-1.5 text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}`,
    defaultProps: {}, propsSchema: [], publishedBy: 'vectra',
  },
];
