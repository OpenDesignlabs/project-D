/**
 * @vectra/types
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared contract between Marketplace, Studio, and Server.
 * This file is the single source of truth for all cross-system interfaces.
 * NEVER add runtime code here — types only.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── COMPONENT CATEGORIES ────────────────────────────────────────────────────

export type ComponentCategory =
  | 'basic'
  | 'layout'
  | 'forms'
  | 'media'
  | 'sections'
  | 'navigation'
  | 'marketing'
  | 'data'
  | 'feedback'
  | 'ecommerce';

// ─── PROP SCHEMA ─────────────────────────────────────────────────────────────

export type PropType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'ReactNode'
  | 'object'
  | 'array'
  | 'enum'
  | 'color'
  | 'url'
  | 'function';

export interface PropDefinition {
  name: string;
  type: PropType;
  required: boolean;
  defaultValue?: unknown;
  description: string;
  /** For type: 'enum' — list of allowed string values */
  enumValues?: string[];
}

// ─── IMPORT IDENTITY ─────────────────────────────────────────────────────────
// CIS-1 compatible — maps 1:1 to Studio's ComponentImportMeta.
// This is the source of truth for import statement generation in the export ZIP.

export interface ImportMeta {
  /**
   * npm package name or project-relative path.
   * npm:      '@vectra/ui' | 'framer-motion'
   * relative: './components/HeroSection'
   * official: '@vectra/marketplace'
   */
  packageName: string;

  /**
   * The exported identifier used verbatim as the JSX tag name.
   * Default export: local binding name → 'HeroSection'
   * Named export:   exact export name  → 'Button'
   */
  exportName: string;

  isDefaultExport: boolean;
}

// ─── COMPONENT REGISTRY ENTRY ────────────────────────────────────────────────
// The core Marketplace record. Superset of Studio's ComponentConfig.
// Stored in Supabase `components` table — every field is a column.

export interface ComponentRegistryEntry {
  // ── Identity ──
  id: string;                        // crypto.randomUUID()
  name: string;                      // 'vectra:HeroSection' | 'acme:PaymentForm'
  version: string;                   // semver '1.0.0'
  slug: string;                      // url-safe 'hero-section' (unique)

  // ── Display ──
  label: string;                     // Human readable 'Hero Section'
  description: string;               // One-line description
  category: ComponentCategory;
  tags: string[];                    // ['hero', 'landing', 'marketing']
  previewImageUrl?: string;          // Stored in Supabase Storage
  previewCode?: string;              // Minimal usage example for live preview

  // ── Import identity (CIS-1 compliant) ──
  importMeta: ImportMeta;

  // ── Component source ──
  sourceCode: string;                // Full TSX source
  defaultProps: Record<string, unknown>;
  propsSchema: PropDefinition[];

  // ── Authorship ──
  publishedBy: string;               // User ID or 'vectra' for official
  isOfficial: boolean;               // vectra-authored vs community
  isVerified: boolean;               // passed automated quality checks

  // ── Timestamps ──
  createdAt: string;                 // ISO 8601
  updatedAt: string;

  // ── Analytics ──
  downloads: number;
  stars: number;
}

// ─── API PAYLOADS ────────────────────────────────────────────────────────────

/** Studio → Marketplace: fetch component list */
export interface GetComponentsQuery {
  search?: string;
  category?: ComponentCategory;
  sort?: 'popular' | 'newest' | 'official' | 'stars';
  page?: number;
  limit?: number;
  tags?: string[];
  officialOnly?: boolean;
}

/** Marketplace → Studio: paginated component list response */
export interface GetComponentsResponse {
  components: ComponentRegistryEntry[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/** Server/Studio → Marketplace: publish a new component */
export interface PublishComponentPayload {
  name: string;
  version: string;
  slug: string;
  label: string;
  description: string;
  category: ComponentCategory;
  tags: string[];
  importMeta: ImportMeta;
  sourceCode: string;
  defaultProps: Record<string, unknown>;
  propsSchema: PropDefinition[];
  publishedBy: string;
  previewCode?: string;
}

/** Marketplace → caller: publish result */
export interface PublishComponentResponse {
  success: boolean;
  component?: ComponentRegistryEntry;
  error?: string;
}

// ─── STUDIO INTEGRATION ──────────────────────────────────────────────────────
// Minimal shape Studio needs to hydrate its componentRegistry from Marketplace.
// A subset of ComponentRegistryEntry — Studio doesn't need sourceCode on list.

export interface StudioComponentEntry {
  id: string;
  name: string;
  slug: string;
  label: string;
  category: ComponentCategory;
  tags: string[];
  importMeta: ImportMeta;
  defaultProps: Record<string, unknown>;
  propsSchema: PropDefinition[];
  previewImageUrl?: string;
  isOfficial: boolean;
  downloads: number;
}
