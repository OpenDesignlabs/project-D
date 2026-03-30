import { Hono } from 'hono';
import { callHFStreaming, SERVER_AI_CONFIG } from '../lib/hf-client';
import type { GenerateRequest, GenerateResponse } from '../types';

export const generateRoute = new Hono();

// ─── extractSections ─────────────────────────────────────────────────────────
// [REMAINING_CODE_FROM_ORIGINAL — extractSections, repairJSON, buildSystemPrompt]
// Exact copy from previous generate/route.ts lines 26-370. Zero changes.

function extractSections(rawCode: string): Map<string, string> {
  const sections = new Map<string, string>();

  const sectionParts = rawCode.split(/\/\/\s*SECTION:\s*(\w+)/);
  if (sectionParts.length >= 3) {
    for (let i = 1; i < sectionParts.length; i += 2) {
      const name = sectionParts[i].trim();
      const code = (sectionParts[i + 1] ?? '').trim();
      if (name && code) sections.set(name, code);
    }
    if (sections.size > 0) { sections.set('default', sections.values().next().value!); return sections; }
  }

  const componentParts = rawCode.split(/\/\/\s*COMPONENT:\s*(\w+)/);
  if (componentParts.length >= 3) {
    for (let i = 1; i < componentParts.length; i += 2) {
      const name = componentParts[i].trim();
      const code = (componentParts[i + 1] ?? '').trim();
      if (name && code) {
        const normalized = code.startsWith('export default function') ? code : code.replace(/^function\s+/, 'export default function ');
        sections.set(name, normalized);
      }
    }
    if (sections.size > 0) { sections.set('default', sections.values().next().value!); return sections; }
  }

  const exportMatches = [...rawCode.matchAll(/export\s+default\s+function\s+(\w+)/g)];
  if (exportMatches.length >= 2) {
    const positions = exportMatches.map(m => ({ name: m[1], start: m.index! }));
    positions.forEach((pos, idx) => {
      const end = positions[idx + 1]?.start ?? rawCode.length;
      const code = rawCode.slice(pos.start, end).trim();
      if (code) sections.set(pos.name, code);
    });
    if (sections.size > 0) { sections.set('default', sections.values().next().value!); return sections; }
  }

  const name = rawCode.match(/export\s+default\s+function\s+(\w+)/)?.[1] ?? 'Component';
  sections.set(name, rawCode.trim());
  sections.set('default', rawCode.trim());
  return sections;
}

function repairJSON(s: string): string {
  let fixed = s.trim();
  fixed = fixed.replace(/,\s*([}\]])/g, '$1');
  fixed = fixed.replace(/[\x00-\x1F\x7F]/g, ' ');
  return fixed;
}

function buildSystemPrompt(isPagePrompt: boolean, canvasContext?: string): string {
  const pageBlock = `
══════════════════════════════════════════════════════════════════════
BLOCK 1 — SECTION CODE (FULL PAGE)

Each section is a STANDALONE React component. Sections do NOT reference each other.
Precede each section with // SECTION: ExactName (MUST match the JSON "name" field exactly).
Generate sections: Navbar, HeroSection, then 2-3 content sections, Footer.

\`\`\`jsx
// SECTION: Navbar
export default function Navbar(props) {
  return (
    <nav className="w-full px-8 py-5 flex items-center justify-between bg-slate-950 border-b border-white/10 text-white sticky top-0 z-50 backdrop-blur-md">
      <span className="font-black text-xl tracking-tight">Brand</span>
      <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
        <a href="#" className="hover:text-white transition-colors">Product</a>
        <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-semibold">Get Started</button>
      </div>
    </nav>
  );
}

// SECTION: HeroSection
export default function HeroSection(props) {
  return (
    <section className="w-full min-h-[700px] bg-gradient-to-br from-slate-950 via-indigo-950/20 to-black flex flex-col items-center justify-center px-8 py-24 text-white">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">
        <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6">Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">Faster.</span></h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">The visual platform for teams who ship quality products.</p>
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <button className="px-8 py-4 bg-blue-600 rounded-xl text-white font-bold text-lg hover:bg-blue-500 transition-all">Start Free Trial</button>
          <button className="px-8 py-4 rounded-xl text-white font-bold text-lg border border-white/20 hover:bg-white/5 transition-all">Watch Demo →</button>
        </div>
      </motion.div>
    </section>
  );
}
\`\`\`

══════════════════════════════════════════════════════════════════════
BLOCK 2 — JSON CONFIG (FULL PAGE)

RULES: wrapper has layoutMode:flex + position:relative + width:100%. Each section: position:relative + width:100%.

\`\`\`json
{
  "rootId": "wp1",
  "elements": {
    "wp1": { "id": "wp1", "type": "container", "name": "PageWrapper", "children": ["sn1","sh1","sf1","sc1","sft"], "props": { "layoutMode": "flex", "style": { "position": "relative", "width": "100%", "display": "flex", "flexDirection": "column" } } },
    "sn1": { "id": "sn1", "type": "custom_code", "name": "Navbar", "children": [], "props": { "style": { "position": "relative", "width": "100%" } } },
    "sh1": { "id": "sh1", "type": "custom_code", "name": "HeroSection", "children": [], "props": { "style": { "position": "relative", "width": "100%" } } },
    "sf1": { "id": "sf1", "type": "custom_code", "name": "FeaturesSection", "children": [], "props": { "style": { "position": "relative", "width": "100%" } } },
    "sc1": { "id": "sc1", "type": "custom_code", "name": "CTASection", "children": [], "props": { "style": { "position": "relative", "width": "100%" } } },
    "sft": { "id": "sft", "type": "custom_code", "name": "Footer", "children": [], "props": { "style": { "position": "relative", "width": "100%" } } }
  }
}
\`\`\`
`;

  const singleBlock = `
══════════════════════════════════════════════════════════════════════
BLOCK 1 — SINGLE COMPONENT

\`\`\`jsx
// SECTION: ComponentName
export default function ComponentName(props) {
  return (
    <div className="w-full p-8 bg-slate-950 text-white rounded-2xl border border-white/10">
      {/* component content */}
    </div>
  );
}
\`\`\`

══════════════════════════════════════════════════════════════════════
BLOCK 2 — JSON CONFIG (SINGLE)

\`\`\`json
{
  "rootId": "wp1",
  "elements": {
    "wp1": { "id": "wp1", "type": "container", "name": "Wrapper", "children": ["sc1"], "props": { "layoutMode": "flex", "style": { "position": "relative", "width": "100%", "display": "flex", "flexDirection": "column" } } },
    "sc1": { "id": "sc1", "type": "custom_code", "name": "ComponentName", "children": [], "props": { "style": { "position": "relative", "width": "100%" } } }
  }
}
\`\`\`
`;

  const canvasBlock = canvasContext ? `
══════════════════════════════════════════════════════════════════════
CURRENT CANVAS STATE
${canvasContext}
- DO NOT duplicate sections already present.
- Match existing visual style.
` : '';

  return `VECTRA SECTION-FIRST COMPONENT GENERATOR

OUTPUT FORMAT: Return EXACTLY 2 fenced code blocks — code first, then JSON. Zero text outside them.

${isPagePrompt ? pageBlock : singleBlock}

══════════════════════════════════════════════════════════════════════
REACT RULES — ALL REQUIRED

- Signature: export default function SectionName(props) { ... }
- NO import statements. React, motion, Lucide, cn are globally injected.
- Icons — dot notation ONLY: <Lucide.Sparkles />
  FATAL: NEVER <Icon="Name" /> or <Lucide[name] /> in JSX.
  Dynamic icons: const IC = Lucide[item.icon] || Lucide.Star; return <IC />;
- Tailwind: standard utilities or arbitrary values bg-[#0f172a]. NEVER bg-primary.
- Framer Motion: animate ONLY opacity/scale/x/y/rotate. Glow: whileHover={{ boxShadow: '0 0 32px #3b82f6' }}
- Section roots MUST use w-full. NEVER position:absolute on section roots.
- Make it STUNNING: dark glassmorphism, gradient text, micro-animations, fully responsive.
${canvasBlock}`;
}

// ─── ROUTE HANDLER ────────────────────────────────────────────────────────────
// Only this block changed from Next.js → Hono. Everything above is identical.

generateRoute.post('/', async (c) => {
  let body: GenerateRequest;
  try {
    body = await c.req.json<GenerateRequest>();
  } catch {
    return c.json<GenerateResponse>({ action: 'error', message: 'Invalid request body' }, 400);
  }

  const { prompt, canvasContext } = body;

  if (!prompt?.trim()) {
    return c.json<GenerateResponse>({ action: 'error', message: 'prompt is required' }, 400);
  }

  if (!SERVER_AI_CONFIG.primaryApiKey) {
    return c.json<GenerateResponse>(
      { action: 'error', message: '🔑 No AI key configured on server. Add AI_PRIMARY_KEY to vectra-server .env' },
      500
    );
  }

  const isPagePrompt = /page|website|portfolio|landing|blog|store|dashboard/i.test(prompt);
  const systemPrompt = buildSystemPrompt(isPagePrompt, canvasContext);
  const model = body.model ?? SERVER_AI_CONFIG.primaryModel;

  let content = '';
  try {
    console.log(`[vectra-server/generate] Calling ${model.split('/').pop()} — "${prompt.slice(0, 60)}..."`);
    content = await callHFStreaming(systemPrompt, `Generate: ${prompt}`, model, SERVER_AI_CONFIG.primaryApiKey, body.temperature ?? 0.65);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[vectra-server/generate] HF call failed:', msg);
    return c.json<GenerateResponse>({ action: 'error', message: msg }, 502);
  }

  try {
    const jsxMatch = content.match(/```(?:jsx?|tsx?|javascript|react)?\s*\n([\s\S]*?)\n```/i);
    const rawReactCode = jsxMatch?.[1]?.trim() ?? '';
    if (!rawReactCode) throw new Error('No JSX code block found in AI response');

    const sectionMap = extractSections(rawReactCode);

    const jsonMatch = content.match(/```json\s*\n([\s\S]*?)\n```/i);
    let rawJson = jsonMatch?.[1]?.trim() ?? '';
    if (!rawJson) {
      const firstOpen = content.indexOf('{');
      const lastClose = content.lastIndexOf('}');
      if (firstOpen !== -1 && lastClose !== -1) rawJson = content.substring(firstOpen, lastClose + 1);
    }
    if (!rawJson) throw new Error('No JSON block found in AI response');

    let parsed: { elements: Record<string, unknown>; rootId: string };
    try { parsed = JSON.parse(rawJson); }
    catch { console.warn('[vectra-server/generate] JSON malformed — repairing...'); parsed = JSON.parse(repairJSON(rawJson)); }

    if (!parsed?.elements || !parsed?.rootId) throw new Error('Invalid JSON structure');

    // Deep-clone before mutation (C-1)
    const clonedElements: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(parsed.elements)) {
      const el = v as Record<string, unknown>;
      clonedElements[k] = { ...el, props: { ...((el.props as object) ?? {}) } };
    }
    parsed.elements = clonedElements as typeof parsed.elements;

    const hasMultipleSections = sectionMap.size > 2;
    let injectedCount = 0;

    for (const el of Object.values(parsed.elements) as Record<string, unknown>[]) {
      if (el['type'] !== 'custom_code') continue;
      const elName = (el['name'] as string) ?? '';
      const code = hasMultipleSections
        ? (sectionMap.get(elName) ?? sectionMap.get([...sectionMap.keys()].find(k => k.toLowerCase() === elName.toLowerCase()) ?? '') ?? sectionMap.get('default'))
        : (sectionMap.get('default') ?? rawReactCode);
      if (code) { el['code'] = code; injectedCount++; }
    }

    if (injectedCount === 0) throw new Error('No custom_code elements received code injection');

    // Guard rail: AI-SECTION-1
    for (const el of Object.values(parsed.elements) as Record<string, unknown>[]) {
      const props = (el['props'] as Record<string, unknown>) ?? {};
      const style = (props['style'] as Record<string, unknown>) ?? {};
      if (el['type'] === 'custom_code') {
        props['style'] = { ...style, position: 'relative', width: '100%' };
        el['props'] = props;
      }
      if (el['type'] === 'container' && (el['name'] === 'PageWrapper' || el['name'] === 'Wrapper')) {
        props['layoutMode'] = 'flex';
        props['style'] = { display: 'flex', flexDirection: 'column', ...style, position: 'relative', width: '100%' };
        el['props'] = props;
      }
    }

    console.log(`[vectra-server/generate] ✓ ${Object.keys(parsed.elements).length} nodes, ${injectedCount} sections`);

    return c.json<GenerateResponse>({
      action: 'create',
      elements: { ...parsed.elements },
      rootId: parsed.rootId,
      message: `Generated ${injectedCount} section${injectedCount > 1 ? 's' : ''} ✨`,
      aiMeta: { prompt, model },
    });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Parse failed';
    console.error('[vectra-server/generate] Parse error:', msg);
    console.error('Raw output (400 chars):', content.substring(0, 400));
    return c.json<GenerateResponse>({ action: 'error', message: 'Failed to parse AI response. Please try again.' }, 500);
  }
});
