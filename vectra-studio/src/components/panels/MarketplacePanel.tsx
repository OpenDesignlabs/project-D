'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Store, Search, X, Plus, Check, ExternalLink,
  Loader2, AlertCircle, RefreshCw, ShieldCheck, Tag,
} from 'lucide-react';
import type { ComponentConfig, ComponentImportMeta } from '../../types';

// ─── Types (mirrors @vectra/types StudioComponentEntry) ───────────────────────
interface MarketplaceEntry {
  id: string;
  name: string;
  slug: string;
  label: string;
  category: string;
  tags: string[];
  importMeta: { packageName: string; exportName: string; isDefaultExport: boolean };
  defaultProps: Record<string, unknown>;
  propsSchema: unknown[];
  previewImageUrl?: string;
  isOfficial: boolean;
  downloads: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  basic: 'Basic', layout: 'Layout', forms: 'Forms', media: 'Media',
  sections: 'Sections', navigation: 'Navigation', marketing: 'Marketing',
  data: 'Data', feedback: 'Feedback', ecommerce: 'Ecommerce',
};

const CATEGORY_COLORS: Record<string, string> = {
  basic:      'bg-slate-700/60 text-slate-300',
  layout:     'bg-blue-900/60 text-blue-300',
  forms:      'bg-violet-900/60 text-violet-300',
  media:      'bg-amber-900/60 text-amber-300',
  sections:   'bg-emerald-900/60 text-emerald-300',
  navigation: 'bg-cyan-900/60 text-cyan-300',
  marketing:  'bg-pink-900/60 text-pink-300',
  data:       'bg-orange-900/60 text-orange-300',
  feedback:   'bg-teal-900/60 text-teal-300',
  ecommerce:  'bg-rose-900/60 text-rose-300',
};

interface MarketplacePanelProps {
  onClose: () => void;
  registerComponent: (id: string, config: ComponentConfig) => void;
  /** Set of _marketplaceId values already explicitly imported by user (_userImported === true) */
  registeredIds: Set<string>;
}

export function MarketplacePanel({ onClose, registerComponent, registeredIds }: MarketplacePanelProps) {
  const [components, setComponents] = useState<MarketplaceEntry[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  // Session-local tracking of what the user added THIS session
  // Merged with registeredIds (which comes from componentRegistry via _userImported)
  const [sessionAdded, setSessionAdded] = useState<Set<string>>(new Set());

  const SERVER_URL = (import.meta as any).env?.VITE_SERVER_URL ?? 'http://localhost:3002';
  const SERVER_SECRET = (import.meta as any).env?.VITE_SERVER_SECRET ?? '';
  const MARKETPLACE_URL = (import.meta as any).env?.VITE_MARKETPLACE_URL ?? 'http://localhost:3001';

  const fetchComponents = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await fetch(`${SERVER_URL}/api/marketplace/components?studio=1`, {
        headers: {
          'Accept': 'application/json',
          ...(SERVER_SECRET ? { 'x-vectra-server-secret': SERVER_SECRET } : {}),
        },
        cache: 'default',
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data: MarketplaceEntry[] = await res.json();
      setComponents(data);
      setStatus('ready');
    } catch (err) {
      console.error('[MarketplacePanel] fetch failed:', err);
      setStatus('error');
    }
  }, [SERVER_URL, SERVER_SECRET]);

  useEffect(() => { fetchComponents(); }, [fetchComponents]);

  /**
   * isAdded checks ONLY _userImported entries — not auto-synced ones.
   * registeredIds comes from componentRegistry filtered by _userImported === true.
   * sessionAdded tracks what was added this session before componentRegistry updates.
   */
  const isAdded = (entry: MarketplaceEntry) =>
    sessionAdded.has(entry.id) || registeredIds.has(entry.id);

  function handleAdd(entry: MarketplaceEntry) {
    const importMeta: ComponentImportMeta | undefined = entry.importMeta.packageName
      ? {
          packageName:     entry.importMeta.packageName,
          exportName:      entry.importMeta.exportName,
          isDefaultExport: entry.importMeta.isDefaultExport,
          namedExports:    [],
        }
      : undefined;

    /**
     * icon: null — Marketplace doesn't ship Lucide constructor refs over the wire.
     * The insert drawer already handles null icon:
     *   {config.icon ? <config.icon /> : <Store />}
     * All other consumers in LeftSidebar use the same null-guard pattern.
     *
     * _userImported: true — distinguishes this from auto-synced entries.
     * The insert drawer "Imported" tab filters on _userImported === true.
     * useMarketplaceSync sets _userImported: false for its auto-synced entries.
     */
    const config = {
      icon:         null as any,
      label:        entry.label,
      category:     entry.category as ComponentConfig['category'],
      defaultProps: entry.defaultProps,
      importMeta,
      // Marketplace stamps
      _marketplaceId:   entry.id,
      _marketplaceName: entry.name,
      _isOfficial:      entry.isOfficial,
      _previewImageUrl: entry.previewImageUrl,
      _propsSchema:     entry.propsSchema,
      _tags:            entry.tags,
      // ← KEY: marks this as user-explicitly-imported
      _userImported:    true,
    } as ComponentConfig;

    registerComponent(entry.slug, config);

    // Track locally so the Add button updates immediately, before the
    // registeredIds prop re-renders from the parent's componentRegistry update
    setSessionAdded(prev => new Set([...prev, entry.id]));
  }

  const filtered = components.filter(c => {
    const matchSearch = search
      ? c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      : true;
    const matchCat = category === 'all' || c.category === category;
    return matchSearch && matchCat;
  });

  const categories = ['all', ...Array.from(new Set(components.map(c => c.category)))];

  return (
    <div className="absolute left-[60px] top-0 bottom-0 w-[380px] bg-[#1e1e1e] border-r border-[#3f3f46] shadow-2xl z-40 flex flex-col">

      {/* ── Header ── */}
      <div className="px-4 py-3 border-b border-[#3f3f46] bg-[#252526] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Store size={14} className="text-[#007acc]" />
          <h2 className="text-xs font-bold text-[#cccccc] uppercase tracking-wide">Marketplace</h2>
          {status === 'ready' && (
            <span className="text-[10px] text-[#666] bg-[#333] px-1.5 py-0.5 rounded">
              {components.length} components
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={fetchComponents} title="Refresh" className="p-1 text-[#666] hover:text-[#999] transition-colors">
            <RefreshCw size={13} />
          </button>
          <button onClick={onClose} className="p-1 text-[#666] hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="px-3 py-2.5 border-b border-[#3f3f46] shrink-0">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-[#666]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search components..."
            className="w-full pl-8 pr-3 py-2 bg-[#3c3c3c] border border-[#555] rounded text-xs text-white placeholder-[#666] outline-none focus:border-[#007acc]"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-[#666] hover:text-white">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Category pills ── */}
      <div className="px-3 py-2 border-b border-[#3f3f46] flex gap-1.5 flex-wrap shrink-0">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`text-[10px] px-2 py-1 rounded-full font-medium transition-colors ${
              category === cat
                ? 'bg-[#007acc] text-white'
                : 'bg-[#333] text-[#999] hover:text-white hover:bg-[#444]'
            }`}
          >
            {cat === 'all' ? 'All' : (CATEGORY_LABELS[cat] ?? cat)}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-[#555]">
            <Loader2 size={24} className="animate-spin text-[#007acc]" />
            <p className="text-xs">Fetching from Marketplace…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 px-6 text-center">
            <AlertCircle size={24} className="text-rose-400" />
            <p className="text-xs text-[#888]">Could not reach vectra-server.</p>
            <p className="text-[10px] text-[#555]">
              Check <code className="text-[#007acc]">VITE_SERVER_URL</code> in .env
            </p>
            <button onClick={fetchComponents} className="text-xs text-[#007acc] hover:underline flex items-center gap-1 mt-1">
              <RefreshCw size={11} /> Retry
            </button>
          </div>
        )}

        {status === 'ready' && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-[#555]">
            <Search size={20} strokeWidth={1} />
            <p className="text-xs">No components match</p>
            <button onClick={() => { setSearch(''); setCategory('all'); }} className="text-[10px] text-[#007acc] hover:underline">
              Clear filters
            </button>
          </div>
        )}

        {status === 'ready' && filtered.length > 0 && (
          <div className="flex flex-col divide-y divide-[#2d2d2d]">
            {filtered.map(entry => {
              const added = isAdded(entry);
              return (
                <div key={entry.id} className="p-3 hover:bg-[#252526] transition-colors">
                  <div className="flex items-start justify-between gap-3">

                    {/* Thumbnail */}
                    <div className="w-16 h-12 rounded-lg bg-[#2d2d2d] border border-[#3e3e42] shrink-0 overflow-hidden flex items-center justify-center">
                      {entry.previewImageUrl
                        ? <img src={entry.previewImageUrl} alt={entry.label} className="w-full h-full object-cover" />
                        : <Store size={16} className="text-[#444]" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-semibold text-[#cccccc] truncate">{entry.label}</span>
                        {entry.isOfficial && <span title="Official">
                          <ShieldCheck size={10} className="text-[#007acc] shrink-0" />
                        </span>}
                      </div>
                      <p className="text-[10px] font-mono text-[#666] truncate mb-1">{entry.name}</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[entry.category] ?? 'bg-slate-700/60 text-slate-300'}`}>
                          {entry.category}
                        </span>
                        {entry.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] text-[#555] flex items-center gap-0.5">
                            <Tag size={8} />{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        onClick={() => { if (!added) handleAdd(entry); }}
                        disabled={added}
                        className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
                          added
                            ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 cursor-default'
                            : 'bg-[#007acc] hover:bg-[#1d8cd4] text-white cursor-pointer active:scale-95'
                        }`}
                      >
                        {added ? <><Check size={10} /> Added</> : <><Plus size={10} /> Add</>}
                      </button>
                      <a
                        href={`${MARKETPLACE_URL}/components/${entry.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] text-[#555] hover:text-[#999] flex items-center gap-0.5 transition-colors"
                      >
                        <ExternalLink size={9} /> Preview
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-3 border-t border-[#3f3f46] bg-[#1a1a1a] shrink-0">
        <p className="text-[10px] text-[#555] text-center">
          Added components appear in{' '}
          <span className="text-[#007acc]">Insert Drawer → ⬇ Imported</span>
        </p>
      </div>
    </div>
  );
}
