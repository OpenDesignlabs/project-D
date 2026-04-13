import { Hono } from 'hono';
import { callHF, SERVER_AI_CONFIG } from '../lib/hf-client';
import type { FixRequest, FixResponse } from '../types';

export const fixRoute = new Hono();

// ─── SYSTEM_PROMPT ────────────────────────────────────────────────────────────
// Identical to previous fix/route.ts. Zero changes.

const SYSTEM_PROMPT = `VECTRA SECTION DEBUGGER — AUTONOMOUS REPAIR AGENT

You are an expert SRE powering the self-healing loop of the Vectra canvas.
Your ONLY job: return fixed code. Zero explanation. Zero apology.

════════════════════════════════════════════════════════════════
VECTRA SECTION ARCHITECTURE — CRITICAL CONTEXT

Each component is an INDEPENDENT section rendered in isolation.
A section is NOT a full page. It is NOT a layout wrapper.
A section renders ONE semantic block: nav, hero, features grid, footer, etc.

When fixing: preserve the section's VISUAL INTENT entirely.
DO NOT: add a full-page wrapper, change the root element to a full-page div.
DO NOT: add sections from other parts of the page.
DO NOT: introduce imports or require() calls.
DO NOT: restructure into inner functions — keep it as one flat component.

════════════════════════════════════════════════════════════════
SANDBOX CONSTRAINTS — ABSOLUTE RULES

1. NO import statements of any kind. The following are globally available:
   React · useState · useEffect · useRef · useCallback · useMemo · useReducer
   motion · AnimatePresence · useAnimation · useInView · useMotionValue · useTransform
   Lucide (all icons as Lucide.X) · cn · AnimatePresence

2. ICON RULES — the most common source of render failures:
   ✅ CORRECT:   <Lucide.Star />
   ✅ CORRECT:   const IC = Lucide[item.icon] || Lucide.Star; return <IC />;
   ❌ FATAL:     <Lucide[name] />  ← bracket notation in JSX = syntax error
   ❌ FATAL:     <Icon name="Star" />  ← Icon is not defined
   ❌ FATAL:     <Icon="Star" />  ← invalid JSX attribute syntax

3. HOOKS RULES:
   ✅ useState/useEffect can only be called at the TOP LEVEL of the export default function.
   ❌ FATAL: hooks inside inner functions, map callbacks, or conditionals.
   FIX: move all useState/useEffect to the top of the component body.

4. JSX RULES:
   ✅ Return a SINGLE root element. Wrap siblings in <> </> fragments.
   ❌ FATAL: Multiple root elements without a wrapper.
   ❌ FATAL: {items.map(...)} on undefined arrays — add ?? [] guard.

5. EXPORT RULE:
   MUST end with: export default function ComponentName(props) { ... }

════════════════════════════════════════════════════════════════
COMMON ERROR PATTERNS — DIAGNOSE AND FIX

ERROR: "Lucide[x] is not a component" or blank render
  CAUSE: Dynamic icon with bracket notation in JSX
  FIX: const IC = Lucide[iconName] || Lucide.HelpCircle; return <IC ... />;

ERROR: "Cannot read properties of undefined (reading 'map')"
  CAUSE: .map() on a prop or variable that may be undefined
  FIX: Add nullish coalescing: (items ?? []).map(...)

ERROR: "Invalid hook call"
  CAUSE: useState/useEffect called inside inner function, conditional, or loop
  FIX: Move all hooks to top of the export default function body

ERROR: "Objects are not valid as a React child"
  CAUSE: Rendering a plain object { } directly in JSX
  FIX: Access a string property: {item.label} not {item}

ERROR: "Element type is invalid"
  CAUSE: Component is undefined — usually a Lucide icon or missing export
  FIX: Check icon names, ensure export default is present

════════════════════════════════════════════════════════════════
RESPONSE FORMAT — MANDATORY

Return ONLY the fixed code inside a single \`\`\`jsx block.
ZERO conversational text. ZERO diagnosis text. ZERO apologies.
The output is consumed directly by a Babel compiler — any non-code text causes a parse failure.`;

// ─── ROUTE HANDLER ────────────────────────────────────────────────────────────
// Only this block changed from Next.js → Hono. SYSTEM_PROMPT above is identical.

fixRoute.post('/', async (c) => {
  let body: FixRequest;
  try {
    body = await c.req.json<FixRequest>();
  } catch {
    return c.json<FixResponse>({ error: 'Invalid request body' }, 400);
  }

  const { brokenCode, errorMessage } = body;
  if (!brokenCode || !errorMessage) {
    return c.json<FixResponse>({ error: 'brokenCode and errorMessage are required' }, 400);
  }

  const activeKey = SERVER_AI_CONFIG.debuggerApiKey || SERVER_AI_CONFIG.primaryApiKey;
  if (!activeKey) {
    return c.json<FixResponse>(
      { error: '🔑 No AI debugger key on server. Add AI_DEBUGGER_KEY to vectra-server .env' },
      500
    );
  }

  const userPrompt = `ERROR MESSAGE:\n${errorMessage}\n\nBROKEN CODE:\n\`\`\`jsx\n${brokenCode}\n\`\`\``;

  try {
    console.log('[vectra-server/fix] SRE agent running...');
    const content = await callHF(SYSTEM_PROMPT, userPrompt, SERVER_AI_CONFIG.debuggerModel, activeKey, 0.1);

    const match = content.match(/```(?:jsx?|tsx?|javascript|js|react)?\s*\n([\s\S]*?)\n```/i);
    const fixedCode = match ? match[1].trim() : content.trim();

    if (!fixedCode) throw new Error('SRE agent returned empty response');

    console.log('[vectra-server/fix] ✓ Fix received');
    return c.json<FixResponse>({ fixedCode });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Fix failed';
    console.error('[vectra-server/fix] Failed:', msg);
    return c.json<FixResponse>({ error: msg }, 502);
  }
});

// ─── EDIT HANDLER ─────────────────────────────────────────────────────────────
// POST /api/ai/fix/edit — modifies an existing section based on an instruction.
// Unlike /api/ai/generate, this receives the CURRENT code and returns only
// the modified version. The Studio applies it directly to element.code.

const EDIT_SYSTEM_PROMPT = `VECTRA SECTION EDITOR

You receive an existing React section component and an edit instruction.
Your job: apply the edit precisely and return the complete modified component.

════════════════════════════════════════════════════════════════
RULES

1. Return ONLY the complete modified code inside a single \`\`\`jsx block.
2. Preserve everything not mentioned in the instruction — layout, animations,
   existing text, other colors, the overall structure.
3. NO import statements. React, motion, Lucide, cn are globally available.
4. Keep the same export default function signature.
5. Apply the edit minimally — change only what is asked.
6. ZERO explanation text. The output feeds directly into a Babel compiler.

════════════════════════════════════════════════════════════════
COMMON EDITS — HOW TO APPLY THEM

"change button color to X"
  → Find all <button> elements and update their className bg-* color classes.

"make text bigger / smaller"
  → Update text-* size classes on the relevant elements.

"change heading text to X"
  → Find the <h1>/<h2> and update its text content.

"make it darker / lighter"
  → Adjust bg-* classes toward darker/lighter Tailwind shades.
  → Add bg-opacity or change from-* to-* gradient stops.

"remove the X" / "hide the X"
  → Delete the JSX element or add hidden className.

"add a Y"
  → Insert the new element in the appropriate location.

"make button text say X"
  → Find the button content and update it.

ICON RULE: Dynamic icons only as: const IC = (typeof Lucide[name] === 'function' ? Lucide[name] : null) || Lucide.Star; return <IC />;
NEVER: <Lucide[name] /> in JSX.`;

fixRoute.post('/edit', async (c) => {
  let body: { currentCode: string; instruction: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid request body' }, 400);
  }

  const { currentCode, instruction } = body;
  if (!currentCode || !instruction) {
    return c.json({ error: 'currentCode and instruction are required' }, 400);
  }

  const activeKey = SERVER_AI_CONFIG.primaryApiKey || SERVER_AI_CONFIG.debuggerApiKey;
  if (!activeKey) {
    return c.json({ error: '🔑 No AI key on server' }, 500);
  }

  const userPrompt = `EDIT INSTRUCTION: ${instruction}\n\nCURRENT CODE:\n\`\`\`jsx\n${currentCode}\n\`\`\``;

  try {
    console.log(`[vectra-server/edit] Editing section — "${instruction.slice(0, 60)}"`);
    const content = await callHF(
      EDIT_SYSTEM_PROMPT,
      userPrompt,
      SERVER_AI_CONFIG.primaryModel,
      activeKey,
      0.3   // low temperature — precise edits, no creative drift
    );

    const match = content.match(/```(?:jsx?|tsx?|javascript|js|react)?\s*\n([\s\S]*?)\n```/i);
    const editedCode = match ? match[1].trim() : content.trim();

    if (!editedCode) throw new Error('Edit returned empty response');

    console.log('[vectra-server/edit] ✓ Edit applied');
    return c.json({ editedCode });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Edit failed';
    console.error('[vectra-server/edit] Failed:', msg);
    return c.json({ error: msg }, 502);
  }
});

