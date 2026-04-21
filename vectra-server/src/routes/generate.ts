import { Hono } from 'hono';
import { callHFStreaming, callOllamaStreaming, SERVER_AI_CONFIG } from '../lib/hf-client';
import { callGeminiStreaming } from '../lib/gemini-client';
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

function buildSystemPrompt(isPagePrompt: boolean, canvasContext?: string, pages?: Array<{ name: string; slug: string }>): string {
  const pageBlock = [
    '══════════════════════════════════════════════════════════════════════',
    'BLOCK 1 — SECTION CODE (FULL PAGE)',
    '',
    'Each section is a STANDALONE React component. Sections do NOT import each other.',
    'Precede each with // SECTION: ExactName (must match JSON "name" exactly).',
    '',
    '```jsx',
    '// SECTION: Navbar',
    'export default function Navbar(props) {',
    '  const [open, setOpen] = useState(false);',
    '  return (',
    '    <nav className="w-full px-6 py-4 flex items-center justify-between bg-slate-950/90 border-b border-white/10 text-white sticky top-0 z-50 backdrop-blur-md">',
    '      <span className="font-black text-xl tracking-tight">Brand</span>',
    '      <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">',
    '        <a href="#features" className="hover:text-white transition-colors">Features</a>',
    '        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>',
    '        <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-semibold text-sm">Get Started</button>',
    '      </div>',
    '      <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setOpen(o => !o)}>',
    '        <Lucide.Menu size={20} />',
    '      </button>',
    '      {open && (',
    '        <div className="absolute top-full left-0 right-0 bg-slate-950 border-b border-white/10 p-4 flex flex-col gap-3 md:hidden">',
    '          <a href="#features" className="text-slate-400 hover:text-white text-sm">Features</a>',
    '          <button className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold self-start">Get Started</button>',
    '        </div>',
    '      )}',
    '    </nav>',
    '  );',
    '}',
    '',
    '// SECTION: HeroSection',
    'export default function HeroSection(props) {',
    '  return (',
    '    <section className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex flex-col items-center justify-center px-6 py-24 text-white text-center">',
    '      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>',
    '        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">',
    '          <Lucide.Sparkles size={14} /><span>Now in Public Beta</span>',
    '        </div>',
    '        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">',
    '          Build products<br />',
    '          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">10x faster</span>',
    '        </h1>',
    '        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">The visual platform for modern teams.</p>',
    '        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">',
    '          <button className="px-8 py-3.5 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40">Start for free</button>',
    '          <button className="px-8 py-3.5 rounded-xl text-white font-bold border border-white/20 hover:bg-white/5 transition-all flex items-center gap-2"><Lucide.Play size={16} />Watch demo</button>',
    '        </div>',
    '      </motion.div>',
    '    </section>',
    '  );',
    '}',
    '',
    '// SECTION: FeaturesSection',
    'export default function FeaturesSection(props) {',
    "  const features = [",
    "    { icon: 'Zap',      title: 'Instant Deploy',     desc: 'Push to production in one click.' },",
    "    { icon: 'Shield',   title: 'Secure by Default',  desc: 'Enterprise-grade security baked in.' },",
    "    { icon: 'Globe',    title: 'Global Edge',        desc: 'Sub-50ms load times worldwide.' },",
    "    { icon: 'Code',     title: 'Clean Export',       desc: 'Own your code. Export Next.js any time.' },",
    "    { icon: 'Users',    title: 'Team Ready',         desc: 'Unlimited seats, real-time collab.' },",
    "    { icon: 'BarChart3',title: 'Analytics',          desc: 'Built-in insights so you ship smart.' },",
    '  ];',
    '  return (',
    '    <section id="features" className="w-full py-24 bg-slate-950 text-white">',
    '      <div className="max-w-6xl mx-auto px-6">',
    '        <div className="text-center mb-16">',
    '          <h2 className="text-4xl font-black mb-4">Everything you need</h2>',
    '          <p className="text-slate-400 text-lg">From idea to production without leaving your browser.</p>',
    '        </div>',
    '        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">',
    '          {features.map((f, i) => {',
    '            const IC = (typeof Lucide[f.icon] === "function" ? Lucide[f.icon] : null) || Lucide.Star;',
    '            return (',
    '              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} viewport={{ once: true }}',
    '                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">',
    '                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center mb-4">',
    '                  <IC size={18} className="text-blue-400" />',
    '                </div>',
    '                <h3 className="text-base font-bold mb-2">{f.title}</h3>',
    '                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>',
    '              </motion.div>',
    '            );',
    '          })}',
    '        </div>',
    '      </div>',
    '    </section>',
    '  );',
    '}',
    '',
    '// SECTION: CTASection',
    'export default function CTASection(props) {',
    '  return (',
    '    <section className="w-full py-24 bg-gradient-to-br from-blue-950/60 to-slate-950 border-y border-white/10 text-white text-center px-6">',
    '      <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="max-w-2xl mx-auto">',
    '        <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to ship faster?</h2>',
    '        <p className="text-slate-400 text-lg mb-10">Join 10,000+ teams. Free forever.</p>',
    '        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">',
    '          <button className="px-10 py-4 bg-blue-600 rounded-xl text-white font-bold text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40">Start for free</button>',
    '          <button className="px-10 py-4 rounded-xl text-white font-bold text-lg border border-white/20 hover:bg-white/5 transition-all">Talk to sales</button>',
    '        </div>',
    '      </motion.div>',
    '    </section>',
    '  );',
    '}',
    '',
    '// SECTION: Footer',
    'export default function Footer(props) {',
    "  const links = ['Product', 'Docs', 'Blog', 'Careers', 'Privacy', 'Terms'];",
    '  return (',
    '    <footer className="w-full py-12 bg-slate-950 border-t border-white/10 text-slate-500 text-sm">',
    '      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">',
    '        <span className="font-black text-white text-base flex items-center gap-2"><Lucide.Zap size={16} className="text-blue-400" />Brand</span>',
    '        <div className="flex flex-wrap justify-center gap-6">',
    '          {links.map(l => <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>)}',
    '        </div>',
    '        <p>© 2024 Brand Inc.</p>',
    '      </div>',
    '    </footer>',
    '  );',
    '}',
    '```',
    '',
    '══════════════════════════════════════════════════════════════════════',
    'BLOCK 2 — JSON CONFIG (FULL PAGE)',
    '',
    '```json',
    '{',
    '  "rootId": "wp1",',
    '  "elements": {',
    '    "wp1": { "id": "wp1", "type": "container", "name": "PageWrapper", "children": ["sn1","sh1","sf1","sc1","sft"], "props": { "layoutMode": "flex", "style": { "position": "relative", "width": "100%", "display": "flex", "flexDirection": "column" } } },',
    '    "sn1": { "id": "sn1", "type": "custom_code", "name": "Navbar",           "children": [], "props": { "style": { "position": "relative", "width": "100%" } } },',
    '    "sh1": { "id": "sh1", "type": "custom_code", "name": "HeroSection",      "children": [], "props": { "style": { "position": "relative", "width": "100%" } } },',
    '    "sf1": { "id": "sf1", "type": "custom_code", "name": "FeaturesSection",  "children": [], "props": { "style": { "position": "relative", "width": "100%" } } },',
    '    "sc1": { "id": "sc1", "type": "custom_code", "name": "CTASection",       "children": [], "props": { "style": { "position": "relative", "width": "100%" } } },',
    '    "sft": { "id": "sft", "type": "custom_code", "name": "Footer",           "children": [], "props": { "style": { "position": "relative", "width": "100%" } } }',
    '  }',
    '}',
    '```',
  ].join('\n');

  const singleBlock = [
    '══════════════════════════════════════════════════════════════════════',
    'BLOCK 1 — SINGLE COMPONENT',
    '',
    '```jsx',
    '// SECTION: ComponentName',
    'export default function ComponentName(props) {',
    '  return (',
    '    <div className="w-full p-8 bg-slate-950 text-white rounded-2xl border border-white/10">',
    '      {/* component content */}',
    '    </div>',
    '  );',
    '}',
    '```',
    '',
    '══════════════════════════════════════════════════════════════════════',
    'BLOCK 2 — JSON CONFIG (SINGLE)',
    '',
    '```json',
    '{',
    '  "rootId": "wp1",',
    '  "elements": {',
    '    "wp1": { "id": "wp1", "type": "container", "name": "Wrapper", "children": ["sc1"], "props": { "layoutMode": "flex", "style": { "position": "relative", "width": "100%", "display": "flex", "flexDirection": "column" } } },',
    '    "sc1": { "id": "sc1", "type": "custom_code", "name": "ComponentName", "children": [], "props": { "style": { "position": "relative", "width": "100%" } } }',
    '  }',
    '}',
    '```',
  ].join('\n');

  const canvasBlock = canvasContext
    ? '\n══════════════════════════════════════════════════════════════════════\nCURRENT CANVAS STATE\n' +
      canvasContext + '\n- DO NOT duplicate sections already present.\n- Match existing visual style.'
    : '';

  const pagesBlock = pages && pages.length > 1
    ? `\n══════════════════════════════════════════════════════════════════════\nPROJECT PAGES — USE THESE EXACT SLUGS FOR INTERNAL LINKS\n${pages.map(p => `  ${p.name}: href="${p.slug}"`).join('\n')}\nIn Navbar <a href> attributes, use these exact slugs. Example: href="${pages[1]?.slug || '/about'}"`
    : '';

  const rules = [
    '══════════════════════════════════════════════════════════════════════',
    'REACT RULES — ALL REQUIRED',
    '',
    '- Signature: export default function SectionName(props) { ... }',
    '- NO import statements. ALL globals listed below are pre-injected. Using import will crash.',
    '',
    '── GLOBALLY AVAILABLE APIS ────────────────────────────────────────────',
    '',
    'REACT HOOKS (destructured from React):',
    '  useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect,',
    '  useReducer, useContext, createContext, Fragment,',
    '  useId, useTransition, useDeferredValue',
    '',
    'FRAMER MOTION (destructured from Motion):',
    '  motion, AnimatePresence, useAnimation, useInView,',
    '  useMotionValue, useTransform, useSpring, useScroll,',
    '  useMotionTemplate, useMotionValueEvent',
    '  Usage: <motion.div animate={{opacity:1}} /> or useScroll() for parallax',
    '',
    'LUCIDE ICONS:',
    '  Static:  <Lucide.Star size={20} />',
    '  Dynamic: const IC = (typeof Lucide[name]==="function"?Lucide[name]:null)||Lucide.Star; return <IC />;',
    '  FATAL:   <Lucide[name] />  — bracket notation in JSX is a syntax error. NEVER do this.',
    '  FATAL:   <Icon name="..." />  — Icon component is NOT defined.',
    '',
    'CLASS UTILITY:',
    '  cn(...classes) — powered by clsx + tailwind-merge.',
    '  Resolves Tailwind conflicts: cn("p-4", active && "p-8") → "p-8" (NOT "p-4 p-8").',
    '  Use for dynamic/conditional Tailwind classes.',
    '',
    'CHARTS — Recharts:',
    '  Available as Recharts.* — use for data visualizations in dashboard sections.',
    '  Example: <Recharts.BarChart data={data} width={400} height={300}>',
    '    <Recharts.CartesianGrid strokeDasharray="3 3" />',
    '    <Recharts.XAxis dataKey="name" />',
    '    <Recharts.Bar dataKey="value" fill="#3b82f6" />',
    '  </Recharts.BarChart>',
    '  Other components: LineChart, AreaChart, PieChart, RadarChart, Tooltip, Legend',
    '',
    'TYPOGRAPHY:',
    '  Inter font is globally loaded. Use font-sans (already mapped to Inter).',
    '  Prefer font-sans over other font classes.',
    '',
    '── RULES ──────────────────────────────────────────────────────────────',
    '',
    '- Hooks MUST be at the TOP of the function. NEVER inside map/if/callbacks.',
    '- Arrays: ALWAYS guard: (items ?? []).map(...)  — undefined.map() crashes.',
    '- Tailwind gradients: bg-gradient-to-* ONLY. NOT bg-linear-to-* (Tailwind v4 only).',
    '- Framer Motion: animate opacity/scale/x/y/rotate/translateY.',
    '  whileHover={{ scale: 1.02 }} whileInView={{ opacity: 1 }} etc.',
    '  Use useScroll + useTransform for parallax scroll effects.',
    '  Use useSpring for physics-based smooth number interpolation.',
    '- Section roots: w-full. Single root element. NO position:absolute on sections.',
    '- Make it STUNNING: use Inter font, subtle animations, glassmorphism, gradients.',
    canvasBlock,
    pagesBlock,
  ].join('\n');

  return [
    'VECTRA SECTION-FIRST COMPONENT GENERATOR',
    '',
    'OUTPUT FORMAT: Return EXACTLY 2 fenced code blocks — code first, then JSON. Zero text outside them.',
    '',
    isPagePrompt ? pageBlock : singleBlock,
    '',
    rules,
  ].join('\n');
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

  const { prompt, canvasContext, pages } = body;

  if (!prompt?.trim()) {
    return c.json<GenerateResponse>({ action: 'error', message: 'prompt is required' }, 400);
  }



  const isPagePrompt = /page|website|portfolio|landing|blog|store|dashboard/i.test(prompt);
  const systemPrompt = buildSystemPrompt(isPagePrompt, canvasContext, pages);
  // model: studio sends preferred model, or falls back to server default.
  // Prefix 'ollama:' routes to local Ollama; bare names go to HuggingFace Router.
  const model = body.model ?? SERVER_AI_CONFIG.primaryModel;

  let content = '';
  try {
    const isOllama  = model.startsWith('ollama:');
    const isGemini  = model.startsWith('gemini:');
    console.log(`[vectra-server/generate] Provider: ${
      isGemini ? 'gemini' : isOllama ? 'ollama' : 'huggingface'
    } — model: ${model.split('/').pop()} — "${prompt.slice(0, 60)}..."`);

    if (isGemini) {
      // Google Gemini API — requires GEMINI_API_KEY
      if (!process.env.GEMINI_API_KEY) {
        return c.json<GenerateResponse>(
          { action: 'error', message: '🔑 GEMINI_API_KEY not set on server. Add it to vectra-server .env' },
          500
        );
      }
      content = await callGeminiStreaming(systemPrompt, `Generate: ${prompt}`, model, body.temperature ?? 0.65);
    } else if (isOllama) {
      // Ollama: local model via ngrok tunnel, no API key required
      content = await callOllamaStreaming(systemPrompt, `Generate: ${prompt}`, model, body.temperature ?? 0.65);
    } else {
      // HuggingFace Router: requires API key
      if (!SERVER_AI_CONFIG.primaryApiKey) {
        return c.json<GenerateResponse>(
          { action: 'error', message: '🔑 No AI key configured on server. Add AI_PRIMARY_KEY to vectra-server .env' },
          500
        );
      }
      content = await callHFStreaming(systemPrompt, `Generate: ${prompt}`, model, SERVER_AI_CONFIG.primaryApiKey, body.temperature ?? 0.65);
    }
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
