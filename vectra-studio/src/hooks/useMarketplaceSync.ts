/**
 * useMarketplaceSync.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches all components from Vectra Marketplace via vectra-server on Studio
 * mount and merges them into UIContext.componentRegistry.
 *
 * ARCHITECTURE NOTES:
 *   - Calls vectra-server /api/marketplace/components?studio=1 (NOT Marketplace directly)
 *   - vectra-server is the authenticated gateway → Supabase
 *   - Studio never holds a Supabase key or Marketplace service credentials
 *   - Maps StudioComponentEntry → ComponentConfig shape Studio already expects
 *   - Calls setComponentRegistry with a SPREAD (C-1 compliant, no mutation)
 *   - Locally-registered components (registerComponent calls) win over Marketplace
 *     entries because the merge order in EditorContext/RenderNode is:
 *     { ...COMPONENT_TYPES, ...rawRegistry }
 *   - Fails silently — Studio works fine with COMPONENT_TYPES baseline alone
 *
 * PERMANENT CONSTRAINTS CHECKED:
 *   C-1   ✅ spread-clones, never mutates
 *   NS-1  ✅ no ID generation here
 *   PERF-2 ✅ registry not in element tree, no structuralKey impact
 *   NM-8  ✅ no event handlers, no zoom refs
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect } from 'react';
import type { ComponentConfig, ComponentImportMeta } from '../types';

type RegistrySetter = React.Dispatch<React.SetStateAction<Record<string, ComponentConfig>>>;

// Studio talks to vectra-server — never directly to Marketplace or Supabase
// Set in Studio .env:
//   VITE_SERVER_URL=http://localhost:3002        (local dev)
//   VITE_SERVER_URL=https://api.vectra.app       (production)
//   VITE_SERVER_SECRET=same_value_as_VECTRA_SERVER_SECRET_in_server_.env
const SERVER_URL    = (import.meta as any).env?.VITE_SERVER_URL    ?? 'http://localhost:3002';
const SERVER_SECRET = (import.meta as any).env?.VITE_SERVER_SECRET ?? '';

// ─── Minimal mirror of @vectra/types StudioComponentEntry ────────────────────
// Avoids adding @vectra/types as a Studio dependency before it's published.
// Keep in sync with vectra-types/src/index.ts → StudioComponentEntry.
interface StudioComponentEntry {
    id: string;
    name: string;
    slug: string;
    label: string;
    category: string;
    tags: string[];
    importMeta: {
        packageName: string;
        exportName: string;
        isDefaultExport: boolean;
    };
    defaultProps: Record<string, unknown>;
    propsSchema: unknown[];
    previewImageUrl?: string;
    isOfficial: boolean;
    downloads: number;
}

/**
 * useMarketplaceSync
 *
 * Call this once inside UIProvider, directly after the componentRegistry useState.
 * It runs once on mount, fetches the Marketplace catalog, and populates the registry.
 *
 * Usage in UIContext.tsx:
 *   const [componentRegistry, setComponentRegistry] = useState<Record<string, any>>({});
 *   useMarketplaceSync(setComponentRegistry);   // ← add this line
 */
export function useMarketplaceSync(setRegistry: RegistrySetter): void {
    useEffect(() => {
        let cancelled = false;

        async function fetchAndMerge() {
            try {
                const res = await fetch(
                    `${SERVER_URL}/api/marketplace/components?studio=1`,
                    {
                        cache: 'default',
                        headers: {
                            'Accept':                   'application/json',
                            'x-vectra-server-secret':   SERVER_SECRET,
                        },
                    }
                );

                if (!res.ok) {
                    console.warn(
                        `[useMarketplaceSync] vectra-server responded ${res.status} — ` +
                        `check VITE_SERVER_URL and VITE_SERVER_SECRET in Studio .env`
                    );
                    return;
                }

                const entries: StudioComponentEntry[] = await res.json();

                if (cancelled) return; // component unmounted before fetch completed

                // ── Map StudioComponentEntry → ComponentConfig ────────────────
                // ComponentConfig fields that Marketplace doesn't have:
                //   icon      → null (Marketplace doesn't ship Lucide refs over the wire)
                //   component → undefined (no React constructor reference)
                // These fields fall back gracefully:
                //   icon=null → RenderNode uses type-based icon fallback
                //   component=undefined → RenderNode uses its existing render chain

                const patch: Record<string, ComponentConfig> = {};

                for (const entry of entries) {
                    // Only add importMeta if the component has a real package
                    // (native HTML elements like 'div', 'p' have empty packageName)
                    const importMeta: ComponentImportMeta | undefined =
                        entry.importMeta.packageName
                            ? {
                                packageName:     entry.importMeta.packageName,
                                exportName:      entry.importMeta.exportName,
                                isDefaultExport: entry.importMeta.isDefaultExport,
                                namedExports:    [],
                            }
                            : undefined;

                    patch[entry.slug] = {
                        // ── Required ComponentConfig fields ──
                        icon:         null as any, // intentional — no Lucide ref over the wire
                        label:        entry.label,
                        category:     entry.category as ComponentConfig['category'],
                        defaultProps: entry.defaultProps,

                        // ── CIS-1: drives import statements in codeGenerator ──
                        importMeta,

                        // ── Marketplace extras ──
                        _marketplaceId:      entry.id,
                        _marketplaceName:    entry.name,
                        _isOfficial:         entry.isOfficial,
                        _previewImageUrl:    entry.previewImageUrl,
                        _propsSchema:        entry.propsSchema,
                        _tags:               entry.tags,
                        // _userImported: false means "auto-synced by useMarketplaceSync, not
                        // explicitly added by the user via MarketplacePanel Add button".
                        // MarketplacePanel.handleAdd sets this to true.
                        // The insert drawer "Imported" tab filters on _userImported === true.
                        _userImported:       false,
                    } as ComponentConfig;
                }

                // ── Merge strategy ────────────────────────────────────────────
                // prev = any components already registered via registerComponent()
                // patch = Marketplace catalog
                // Result: registerComponent() wins (user-registered > Marketplace)
                // C-1: spread-clone, no mutation
                setRegistry(prev => ({ ...patch, ...prev }));

                console.log(
                    `[useMarketplaceSync] ✓ Loaded ${entries.length} components from vectra-server`
                );
            } catch (err) {
                // Non-fatal — vectra-server may be unreachable in offline/dev scenarios.
                // Studio continues with COMPONENT_TYPES baseline.
                console.warn('[useMarketplaceSync] Could not reach vectra-server:', err);
            }
        }

        fetchAndMerge();

        // Cleanup: prevent setState on unmounted component
        return () => { cancelled = true; };

    }, []); // ← intentionally empty — runs once on Studio mount only
}
