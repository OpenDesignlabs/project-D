/**
 * vectra-server/src/types/index.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Request/response contracts between Studio and Server.
 * These mirror the internal types in aiAgent.ts so the Server
 * returns data the Studio's existing mergeAIContent pipeline can consume
 * without modification.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── AI GENERATE ─────────────────────────────────────────────────────────────

/** Studio → Server: POST /api/ai/generate */
export interface GenerateRequest {
  prompt: string;
  /** Serialized subset of VectraProject — only the current page tree */
  canvasContext?: string;
  pageRootId?: string;
  pageName?: string;
  /** Which model to use — Server picks default if omitted */
  model?: string;
  temperature?: number;
}

/**
 * Server → Studio: response shape.
 * Intentionally mirrors aiAgent.ts AIResponse so Studio's existing
 * mergeAIContent() pipeline works with zero changes.
 */
export interface GenerateResponse {
  elements?: Record<string, unknown>;
  rootId?: string;
  action: 'create' | 'update' | 'error';
  message: string;
  aiMeta?: {
    prompt: string;
    model: string;
  };
}

// ─── AI FIX ──────────────────────────────────────────────────────────────────

/** Studio → Server: POST /api/ai/fix */
export interface FixRequest {
  brokenCode: string;
  errorMessage: string;
}

/** Server → Studio */
export interface FixResponse {
  fixedCode?: string;
  error?: string;
}

// ─── HEALTH ──────────────────────────────────────────────────────────────────

export interface HealthResponse {
  ok: boolean;
  version: string;
  models: {
    primary: string;
    debugger: string;
  };
}
