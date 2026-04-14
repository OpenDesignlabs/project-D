/* tslint:disable */
/* eslint-disable */

export class ColorEngine {
    free(): void;
    [Symbol.dispose](): void;
    adjust_lightness(hex: string, delta: number): string;
    adjust_saturation(hex: string, delta: number): string;
    complement(hex: string): string;
    generate_scale(hex: string, steps: number): string;
    get_contrast_ratio(fg: string, bg: string): number;
    hex_to_hsl(hex: string): string;
    hsl_to_hex(h: number, s: number, l: number): string;
    is_accessible(fg: string, bg: string): boolean;
    mix_colors(hex1: string, hex2: string, t: number): string;
    constructor();
    suggest_accessible_fg(bg: string): string;
}

export class HistoryManager {
    free(): void;
    [Symbol.dispose](): void;
    can_redo(): boolean;
    can_undo(): boolean;
    clear_future(): void;
    get_memory_usage(): number;
    get_stats(): string;
    constructor(initial: string);
    push_state(state: string): void;
    redo(): string | undefined;
    set_max_history(n: number): void;
    undo(): string | undefined;
    undo_steps(steps: number): string | undefined;
}

export class LayoutEngine {
    free(): void;
    [Symbol.dispose](): void;
    compute_selection_bbox(indices_json: string): string;
    find_overlapping_pairs(): string;
    get_rect_count(): number;
    constructor();
    query_snapping(cx: number, cy: number, w: number, h: number, threshold: number): any;
    update_rects(rects_val: any): void;
}

export class SwcCompiler {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Full TSX → ES5/CJS compilation. Used by compiler.worker.ts.
     */
    compile(code: string): string;
    /**
     * Minified TSX → ES5/CJS. ~35% smaller output for ZIP export.
     */
    compile_minified(code: string): string;
    constructor();
    /**
     * Parse-only validation. Returns "" if clean or "line:col — parse error".
     */
    validate_jsx(code: string): string;
}

export function absolute_to_grid(nodes_json: string, canvas_width: number): string;

/**
 * Generate @media breakpoint CSS for tablet + mobile overrides.
 * Mirrors: `codeGenerator.buildBreakpointCSS(project, nodeIds)`
 */
export function build_breakpoint_css(project_json: string, node_ids_json: string): string;

/**
 * Generate canvas-frame + stack-on-mobile media query block.
 * Mirrors: `codeGenerator.buildMobileCSS(hasMobileNodes)`
 */
export function build_mobile_css(has_mobile_nodes: boolean): string;

/**
 * Build full parent map: { childId → parentId } for every node.
 * Mirrors: `parentMap` useMemo in ProjectContext
 */
export function build_parent_map(project_json: string): string;

/**
 * Check for browser-unsafe patterns. Returns first violation name or "".
 * Mirrors: `SANDBOX_BLOCKED_PATTERNS.find(p => p.test(code))`
 */
export function check_sandbox_violations(code: string): string;

/**
 * Deep-clone a subtree with fresh UUIDs.
 * Returns `{ newNodes: {...}, rootId: "new-root-id" }` as JSON.
 * Mirrors: `templateUtils.instantiateTemplate(rootId, elements)`
 */
export function clone_subtree(project_json: string, root_id: string): string;

/**
 * Walk project subtree, return IDs where props.stackOnMobile === true.
 * Mirrors: `codeGenerator.collectStackOnMobileIds(project, nodeId)`
 */
export function collect_stack_on_mobile_ids(project_json: string, root_id: string): string;

/**
 * Collect all descendant IDs of a node (excluding root itself).
 * Mirrors: `treeUtils.getAllDescendants(elements, nodeId)`
 */
export function collect_subtree_ids(project_json: string, root_id: string): string;

/**
 * Free-function alias used by legacy call sites.
 */
export function compile_component(code: string): string;

/**
 * Compute a deterministic topology fingerprint of the element tree.
 * Only changes when nodes are added/removed/reparented — NOT on style edits.
 * Mirrors: `structuralKey` useMemo in ProjectContext.tsx
 */
export function compute_structural_key(project_json: string): string;

export function deduplicate_classes(classes: string): string;

/**
 * Delete a node and its entire subtree. Returns updated project JSON.
 * Mirrors: `treeUtils.deleteNodeRecursive(elements, id)`
 */
export function delete_subtree(project_json: string, node_id: string): string;

/**
 * Detect the exported component name from React source code.
 * Mirrors: `detectComponentName(code, filename)` in importHelpers.ts
 */
export function detect_component_name(code: string, filename: string): string;

/**
 * Returns true if the code uses a default export.
 * Mirrors: `detectDefaultExport(code)` in importHelpers.ts
 */
export function detect_default_export(code: string): boolean;

/**
 * Find the parent ID of a node in O(N).
 * Mirrors: `parentMap.get(id)` in ProjectContext
 */
export function find_parent(project_json: string, node_id: string): string;

/**
 * Generate a collision-proof registry ID: "custom-{kebab}-{8hex}".
 * Mirrors: `generateComponentId(name)` in importHelpers.ts
 */
export function generate_component_id(name: string): string;

export function generate_react_code(project_val: any, root_id: string): string;

/**
 * Generate a 300×180 SVG wireframe thumbnail string.
 * `project_json`: full VectraProject
 * `pages_json`:   Page[] array (needs `[{id, rootId}]`)
 */
export function generate_thumbnail(project_json: string, pages_json: string): string;

/**
 * Build detection preview JSON for ImportModal.
 * Returns `{ name, isDefaultExport, importStatement, importPath }` or "".
 * Mirrors: `getDetectionPreview(code, filename)` in importHelpers.ts
 */
export function get_detection_preview(code: string, filename: string): string;

/**
 * Returns true if the code looks like a valid React component.
 * Mirrors: `isValidReactComponent(code)` in importHelpers.ts
 */
export function is_valid_react_component(code: string): boolean;

export function main_js(): void;

/**
 * Full merge: sanitize AI elements then attach to project.
 * Mirrors: `aiHelpers.mergeAIContent(project, pageRootId, aiElements, aiRootId, isFullPage, aiMeta)`
 */
export function merge_ai_content(project_json: string, page_root_id: string, ai_elements_json: string, ai_root_id: string, is_full_page: boolean, ai_meta_json: string): string;

/**
 * Fix malformed / truncated AI JSON. 4-stage pipeline.
 * Mirrors: `aiHelpers.repairJSON(jsonStr)`
 */
export function repair_json(json_str: string): string;

/**
 * Sanitize AI-generated elements: remap IDs + stamp aiSource.
 * Mirrors: `aiHelpers.sanitizeAIElements(elements, rootId, aiMeta)`
 */
export function sanitize_ai_elements(elements_json: string, root_id: string, ai_meta_json: string): string;

/**
 * Clean AI-generated component code before compilation or embedding.
 * Stages: strip imports → normalise quotes → fix Icon JSX → remove </Icon>.
 * Mirrors: `codeSanitizer.sanitizeCode(code)`
 */
export function sanitize_code(code: string): string;

/**
 * Serialize React style object { camelCase: value } → CSS declaration string.
 * Mirrors: `codeGenerator.serializeStyle(styleObj)`
 */
export function serialize_style_object(style_json: string): string;

/**
 * Convert URL slug → Next.js App Router file path.
 * "/" → "app/page.tsx", "/about" → "app/about/page.tsx"
 * Mirrors: `codeGenerator.slugToNextPath(slug)`
 */
export function slug_to_next_path(slug: string): string;

export function sort_tailwind_classes(classes: string): string;

/**
 * Convert a raw name to PascalCase component name.
 * Mirrors: `toPascalCase` in useFileSync.ts AND `toPascalCaseGen` in codeGenerator.ts
 */
export function to_pascal_case(raw: string): string;

/**
 * Transform a Figma frame → VectraProject element map.
 * `frame_json`: JSON of a single Figma FRAME node.
 * `import_mode`: "page" | "component"
 * Returns JSON: { nodes, rootId, imageFillNodeIds, imageFillMap, warnings }
 * Mirrors: `transformFigmaFrame(frame, importMode)` in figmaImporter.ts
 */
export function transform_figma_frame(frame_json: string, import_mode: string): string;

/**
 * Wrap for Next.js App Router: 'use client' + React/Lucide/Motion imports.
 * Mirrors: `wrapWithImportsNext(rawCode)` in useFileSync.ts
 */
export function wrap_component_next(raw_code: string): string;

/**
 * Wrap for Vite/React: React/Lucide/Motion imports, no 'use client'.
 * Mirrors: `wrapWithImportsVite(rawCode)` in useFileSync.ts
 */
export function wrap_component_vite(raw_code: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_colorengine_free: (a: number, b: number) => void;
    readonly __wbg_historymanager_free: (a: number, b: number) => void;
    readonly __wbg_layoutengine_free: (a: number, b: number) => void;
    readonly absolute_to_grid: (a: number, b: number, c: number) => [number, number, number, number];
    readonly build_breakpoint_css: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly build_mobile_css: (a: number) => [number, number];
    readonly build_parent_map: (a: number, b: number) => [number, number, number, number];
    readonly check_sandbox_violations: (a: number, b: number) => [number, number];
    readonly clone_subtree: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly collect_stack_on_mobile_ids: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly collect_subtree_ids: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly colorengine_adjust_lightness: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly colorengine_adjust_saturation: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly colorengine_complement: (a: number, b: number, c: number) => [number, number, number, number];
    readonly colorengine_generate_scale: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly colorengine_get_contrast_ratio: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly colorengine_hex_to_hsl: (a: number, b: number, c: number) => [number, number, number, number];
    readonly colorengine_hsl_to_hex: (a: number, b: number, c: number, d: number) => [number, number];
    readonly colorengine_is_accessible: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly colorengine_mix_colors: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly colorengine_new: () => number;
    readonly colorengine_suggest_accessible_fg: (a: number, b: number, c: number) => [number, number, number, number];
    readonly compile_component: (a: number, b: number) => [number, number, number, number];
    readonly compute_structural_key: (a: number, b: number) => [number, number, number, number];
    readonly deduplicate_classes: (a: number, b: number) => [number, number];
    readonly delete_subtree: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly detect_component_name: (a: number, b: number, c: number, d: number) => [number, number];
    readonly detect_default_export: (a: number, b: number) => number;
    readonly find_parent: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly generate_component_id: (a: number, b: number) => [number, number];
    readonly generate_react_code: (a: any, b: number, c: number) => [number, number, number, number];
    readonly generate_thumbnail: (a: number, b: number, c: number, d: number) => [number, number];
    readonly get_detection_preview: (a: number, b: number, c: number, d: number) => [number, number];
    readonly historymanager_can_redo: (a: number) => number;
    readonly historymanager_can_undo: (a: number) => number;
    readonly historymanager_clear_future: (a: number) => void;
    readonly historymanager_get_memory_usage: (a: number) => number;
    readonly historymanager_get_stats: (a: number) => [number, number];
    readonly historymanager_new: (a: number, b: number) => number;
    readonly historymanager_push_state: (a: number, b: number, c: number) => void;
    readonly historymanager_redo: (a: number) => [number, number];
    readonly historymanager_set_max_history: (a: number, b: number) => void;
    readonly historymanager_undo: (a: number) => [number, number];
    readonly historymanager_undo_steps: (a: number, b: number) => [number, number];
    readonly is_valid_react_component: (a: number, b: number) => number;
    readonly layoutengine_compute_selection_bbox: (a: number, b: number, c: number) => [number, number, number, number];
    readonly layoutengine_find_overlapping_pairs: (a: number) => [number, number, number, number];
    readonly layoutengine_get_rect_count: (a: number) => number;
    readonly layoutengine_new: () => number;
    readonly layoutengine_query_snapping: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly layoutengine_update_rects: (a: number, b: any) => [number, number];
    readonly main_js: () => void;
    readonly merge_ai_content: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => [number, number, number, number];
    readonly repair_json: (a: number, b: number) => [number, number];
    readonly sanitize_ai_elements: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly sanitize_code: (a: number, b: number) => [number, number];
    readonly serialize_style_object: (a: number, b: number) => [number, number, number, number];
    readonly slug_to_next_path: (a: number, b: number) => [number, number];
    readonly sort_tailwind_classes: (a: number, b: number) => [number, number];
    readonly swccompiler_compile: (a: number, b: number, c: number) => [number, number, number, number];
    readonly swccompiler_compile_minified: (a: number, b: number, c: number) => [number, number, number, number];
    readonly swccompiler_validate_jsx: (a: number, b: number, c: number) => [number, number];
    readonly to_pascal_case: (a: number, b: number) => [number, number];
    readonly transform_figma_frame: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly wrap_component_next: (a: number, b: number) => [number, number];
    readonly wrap_component_vite: (a: number, b: number) => [number, number];
    readonly swccompiler_new: () => number;
    readonly __wbg_swccompiler_free: (a: number, b: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
