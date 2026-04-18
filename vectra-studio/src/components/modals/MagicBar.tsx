import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useEditor } from '../../context/EditorContext';
import {
    Sparkles, ArrowRight, Loader2, CheckCircle2, XCircle, Zap,
    CheckCircle, Bot, Cpu, Code2, Brain, Wind, ChevronDown, Layers,
    FileText, Globe, LayoutGrid,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const FALLBACK_HINTS = [
    'Build a full landing page',
    'Create a SaaS hero section',
    'Design a portfolio homepage',
];

const HISTORY_KEY = 'vectra_prompt_history';
const MAX_HISTORY = 12;
const MODEL_KEY   = 'vectra_selected_model';
const SITE_MODE_KEY = 'vectra_site_mode';

// ─── SITE TYPE ────────────────────────────────────────────────────────────────

type SiteMode = 'static' | 'multipage';

const MULTI_PAGE_PRESETS = [
    { name: 'About',     slug: '/about',     icon: '👤', default: true },
    { name: 'Services',  slug: '/services',  icon: '⚡', default: true },
    { name: 'Pricing',   slug: '/pricing',   icon: '💰', default: true },
    { name: 'Contact',   slug: '/contact',   icon: '✉️', default: true },
    { name: 'Blog',      slug: '/blog',      icon: '📝', default: false },
    { name: 'Portfolio',  slug: '/portfolio', icon: '🎨', default: false },
    { name: 'FAQ',       slug: '/faq',       icon: '❓', default: false },
    { name: 'Team',      slug: '/team',       icon: '👥', default: false },
    { name: 'Dashboard', slug: '/dashboard',  icon: '📊', default: false },
] as const;

const getStoredSiteMode = (): SiteMode => {
    try { return (localStorage.getItem(SITE_MODE_KEY) as SiteMode) || 'static'; }
    catch { return 'static'; }
};

/**
 * buildMultiPagePrompt — Creates a page-specific AI prompt that incorporates
 * the user's original description as thematic guidance. This ensures each
 * generated page matches the overall site's style and purpose.
 */
const buildMultiPagePrompt = (pageName: string, userPrompt: string): string => {
    const n = pageName.toLowerCase().trim();

    // Page-specific section guidance
    const pageGuide: Record<string, string> = {
        about:     'Include: hero intro section, team grid (6 cards with photo placeholder/name/role), company values/mission section, and a brief timeline.',
        pricing:   'Include: header, 3-tier pricing cards (Free/Pro/Enterprise) with feature lists and CTA buttons, FAQ accordion section.',
        contact:   'Include: header, contact form (name/email/message + submit), contact info cards (email/phone/address), office map placeholder.',
        blog:      'Include: header, search bar, featured post hero card, grid of 6 post preview cards with image/title/excerpt/date/category badge.',
        faq:       'Include: header, category filter tabs, accordion FAQ list with 8+ questions, contact CTA at bottom.',
        dashboard: 'Include: stats row (4 metric cards), recent activity table, chart placeholder cards (2 side by side), quick actions panel.',
        portfolio: 'Include: hero intro, skills/tech badges, project grid (6 cards with image/title/tech stack), contact CTA.',
        team:      'Include: header, leadership section (3 large cards), full team grid (8 cards with photo/name/role/social), hiring CTA.',
        services:  'Include: header, 6 service cards with icons, process/how-it-works timeline, testimonials, contact CTA.',
    };

    const guide = pageGuide[n] || `Include appropriate sections for a ${pageName} page with hero, main content, and CTA.`;

    return `Build a complete ${pageName} page for this site: "${userPrompt}". ${guide} Use dark theme, modern glassmorphism design, multiple well-styled sections. Match the style and branding of the Home page.`;
};

// Available AI model options
// model: value stored in localStorage and sent to the server.
//   - Bare string (no prefix) → HuggingFace Router
//   - 'ollama:...'            → Local Ollama
const MODEL_OPTIONS = [
    {
        id:       'glm',
        label:    'GLM-5',
        sublabel: 'HuggingFace • Cloud',
        model:    'zai-org/GLM-5:zai-org',
        color:    '#3b82f6',  // blue
        provider: 'cloud',
        icon:     'Bot',
    },
    {
        id:       'gemma4',
        label:    'Gemma 4 31B',
        sublabel: 'Ollama • Local',
        model:    'ollama:gemma4:31b-cloud',
        color:    '#8b5cf6',  // violet
        provider: 'local',
        icon:     'Cpu',
    },
    {
        id:       'qwen-coder',
        label:    'Qwen Coder 480B',
        sublabel: 'Ollama • Local',
        model:    'ollama:qwen3-coder:480b-cloud',
        color:    '#f59e0b',  // amber
        provider: 'local',
        icon:     'Code2',
    },
    {
        id:       'gpt-oss',
        label:    'GPT-OSS 120B',
        sublabel: 'Ollama • Local',
        model:    'ollama:gpt-oss:120b-cloud',
        color:    '#10b981',  // emerald
        provider: 'local',
        icon:     'Brain',
    },
    {
        id:       'kimi',
        label:    'Kimi K2.5',
        sublabel: 'Ollama • Local',
        model:    'ollama:kimi-k2.5:cloud',
        color:    '#ec4899',  // pink
        provider: 'local',
        icon:     'Wind',
    },
    {
        id:       'qwen-next',
        label:    'Qwen Coder Next',
        sublabel: 'Ollama • Local',
        model:    'ollama:qwen3-coder-next:cloud',
        color:    '#fb923c',  // orange
        provider: 'local',
        icon:     'Code2',
    },
    {
        id:       'glm5-cloud',
        label:    'GLM-5 Cloud',
        sublabel: 'Ollama • Local',
        model:    'ollama:glm-5:cloud',
        color:    '#06b6d4',  // cyan
        provider: 'local',
        icon:     'Sparkles',
    },
    {
        id:       'glm5.1-cloud',
        label:    'GLM-5.1 Cloud',
        sublabel: 'Ollama • Local',
        model:    'ollama:glm-5.1:cloud',
        color:    '#0ea5e9',  // light blue
        provider: 'local',
        icon:     'Sparkles',
    },
    {
        id:       'minimax',
        label:    'MiniMax M2.7',
        sublabel: 'Ollama • Local',
        model:    'ollama:minimax-m2.7:cloud',
        color:    '#a78bfa',  // light violet
        provider: 'local',
        icon:     'Layers',
    },
] as const;

type ModelId = typeof MODEL_OPTIONS[number]['id'];

const getStoredModelId = (): ModelId => {
    try {
        const stored = localStorage.getItem(MODEL_KEY);
        if (stored) {
            const match = MODEL_OPTIONS.find(m => m.model === stored);
            if (match) return match.id;
        }
    } catch { /* storage unavailable */ }
    return 'glm'; // default
};

// ─── TYPES ────────────────────────────────────────────────────────────────────

type StageId = 'analyze' | 'sending' | 'parsing' | 'injecting';
type StageStatus = 'pending' | 'active' | 'done';

interface GenerationStage {
    id: StageId;
    label: string;
    status: StageStatus;
    ms?: number;
    model?: string;
    sections?: string[];
    count?: number;
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const SectionChip: React.FC<{ name: string }> = ({ name }) => (
    <span
        style={{
            background: 'rgba(109,40,217,0.2)',
            border: '1px solid rgba(109,40,217,0.4)',
            color: '#a78bfa',
            fontSize: '9px',
            fontFamily: 'monospace',
            padding: '1px 5px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
        }}
    >
        {name}
    </span>
);

const StageRow: React.FC<{ stage: GenerationStage; streamChars?: number }> = ({ stage, streamChars }) => {
    const isDone    = stage.status === 'done';
    const isActive  = stage.status === 'active';
    const isPending = stage.status === 'pending';

    return (
        <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: isPending ? 0.35 : 1, x: 0 }}
            className="flex items-center gap-2.5 min-h-[28px]"
        >
            {/* Status icon */}
            <div className="shrink-0 w-[18px] h-[18px] flex items-center justify-center">
                {isDone && (
                    <div className="w-[18px] h-[18px] rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                        <CheckCircle size={10} className="text-emerald-400" />
                    </div>
                )}
                {isActive && (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-blue-500 flex items-center justify-center">
                        <div className="w-[6px] h-[6px] rounded-full bg-blue-500 animate-pulse" />
                    </div>
                )}
                {isPending && (
                    <div className="w-[18px] h-[18px] rounded-full border border-zinc-700" />
                )}
            </div>

            {/* Label */}
            <span
                className="text-[11px] font-medium"
                style={{ color: isDone ? '#52525b' : isActive ? '#e4e4e7' : '#3f3f46' }}
            >
                {stage.label}
            </span>

            {/* Active-stage extras */}
            {isActive && stage.id === 'sending' && !!streamChars && streamChars > 0 && (
                <span className="text-[9px] font-mono text-zinc-600 ml-auto">
                    {streamChars.toLocaleString()} chars
                </span>
            )}
            {isActive && stage.id === 'parsing' && (
                <span className="text-[9px] text-zinc-600 ml-auto animate-pulse">extracting…</span>
            )}
            {isActive && stage.id === 'injecting' && (
                <span className="text-[9px] text-zinc-600 ml-auto animate-pulse">updating canvas…</span>
            )}

            {/* Done-stage extras */}
            {isDone && stage.id === 'parsing' && stage.sections && stage.sections.length > 0 && (
                <div className="flex items-center gap-1 ml-auto flex-wrap">
                    {stage.sections.slice(0, 4).map(s => <SectionChip key={s} name={s} />)}
                    {stage.sections.length > 4 && (
                        <span className="text-[9px] text-zinc-600">+{stage.sections.length - 4}</span>
                    )}
                </div>
            )}
            {isDone && stage.id === 'injecting' && stage.count !== undefined && (
                <span className="text-[9px] font-mono text-emerald-600 ml-auto">
                    {stage.count} section{stage.count !== 1 ? 's' : ''}
                </span>
            )}
            {isDone && stage.ms !== undefined && (
                <span className="text-[9px] font-mono text-zinc-700 ml-1 tabular-nums">
                    {stage.ms}ms
                </span>
            )}
        </motion.div>
    );
};

const GenerationPipeline: React.FC<{
    stages: GenerationStage[];
    streamChars: number;
    model: string;
}> = ({ stages, streamChars, model }) => (
    <div className="px-4 py-3 border-t border-white/5">
        {/* Model badge */}
        <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] font-mono text-zinc-600 truncate">
                {model.split('/').pop() ?? model}
            </span>
        </div>
        {/* Stage rows */}
        <div className="flex flex-col gap-1">
            {stages.map(stage => (
                <StageRow key={stage.id} stage={stage} streamChars={streamChars} />
            ))}
        </div>
    </div>
);

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const loadHistory = (): string[] => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]'); }
    catch { return []; }
};

const saveHistory = (prompt: string) => {
    try {
        const prev = loadHistory().filter(p => p !== prompt);
        localStorage.setItem(HISTORY_KEY, JSON.stringify([prompt, ...prev].slice(0, MAX_HISTORY)));
    } catch { /* storage unavailable */ }
};

const makeInitialStages = (): GenerationStage[] => [
    { id: 'analyze',   label: 'Analyzed prompt',      status: 'pending' },
    { id: 'sending',   label: 'Calling AI model',     status: 'pending' },
    { id: 'parsing',   label: 'Extracted sections',   status: 'pending' },
    { id: 'injecting', label: 'Injected into canvas', status: 'pending' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export const MagicBar = () => {
    const {
        isMagicBarOpen, setMagicBarOpen, runAI,
        elements, pages, activePageId,
        addPage, switchPage,
    } = useEditor();

    const [input, setInput]   = useState('');
    const [status, setStatus] = useState<'idle' | 'thinking' | 'generating' | 'done' | 'error'>('idle');
    const [feedback, setFeedback]         = useState('');
    const [streamCharCount, setStreamCharCount] = useState(0);
    // Stage pipeline state
    const [stages, setStages]       = useState<GenerationStage[]>(makeInitialStages);
    const [activeModel, setActiveModel] = useState('');
    // Prompt history navigation
    const [promptHistory]   = useState<string[]>(loadHistory);
    const [historyIdx, setHistoryIdx] = useState(-1);
    // Model selector
    const [selectedModelId, setSelectedModelId] = useState<ModelId>(getStoredModelId);
    const [modelPickerOpen, setModelPickerOpen] = useState(false);
    // Site type selector
    const [siteMode, setSiteMode] = useState<SiteMode>(getStoredSiteMode);
    const [selectedPages, setSelectedPages] = useState<Set<string>>(
        () => new Set(MULTI_PAGE_PRESETS.filter(p => p.default).map(p => p.name))
    );
    // Multi-page generation progress
    const [multiPageProgress, setMultiPageProgress] = useState<{ current: number; total: number; pageName: string } | null>(null);
    // Per-stage timing
    const stageStartRef = useRef<number>(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // ── Stable refs for async multi-page loop ─────────────────────────────────
    // After addPage() changes activePageId, React creates a NEW runAI callback.
    // The async handleSubmit still holds the OLD one (stale closure). Using refs
    // ensures we always call the latest version of each function.
    const runAIRef = useRef(runAI);
    useEffect(() => { runAIRef.current = runAI; }, [runAI]);
    const addPageRef = useRef(addPage);
    useEffect(() => { addPageRef.current = addPage; }, [addPage]);
    const switchPageRef = useRef(switchPage);
    useEffect(() => { switchPageRef.current = switchPage; }, [switchPage]);
    const pagesRef = useRef(pages);
    useEffect(() => { pagesRef.current = pages; }, [pages]);

    // Focus / reset on open/close
    useEffect(() => {
        if (isMagicBarOpen && inputRef.current) inputRef.current.focus();
        if (!isMagicBarOpen) {
            setStatus('idle');
            setFeedback('');
            setStreamCharCount(0);
            setStages(makeInitialStages());
            setHistoryIdx(-1);
            setModelPickerOpen(false);
            setMultiPageProgress(null);
        }
    }, [isMagicBarOpen]);

    // Toggle a page preset on/off
    const togglePagePreset = useCallback((name: string) => {
        setSelectedPages(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    }, []);

    // Persist site mode
    const handleSiteModeChange = useCallback((mode: SiteMode) => {
        setSiteMode(mode);
        try { localStorage.setItem(SITE_MODE_KEY, mode); } catch { /* ignore */ }
    }, []);

    // Contextual hints (unchanged canvas-aware logic)
    const contextualHints = useMemo((): string[] => {
        if (!isMagicBarOpen) return FALLBACK_HINTS;
        const pageMeta = pages.find(p => p.id === activePageId);
        if (!pageMeta) return FALLBACK_HINTS;
        const pageNode = elements[pageMeta.rootId];
        const artboardId = pageNode?.children?.find((cid: string) => {
            const t = elements[cid]?.type;
            return t === 'webpage' || t === 'artboard' || t === 'canvas';
        });
        if (!artboardId) return FALLBACK_HINTS;
        const artboard = elements[artboardId];
        const artboardChildren: string[] = artboard?.children ?? [];
        if (artboardChildren.length === 0) return FALLBACK_HINTS;
        const childTypes = new Set<string>();
        const childNames = new Set<string>();
        artboardChildren.forEach((cid: string) => {
            const el = elements[cid];
            if (!el) return;
            childTypes.add(el.type);
            if (el.name) childNames.add(el.name.toLowerCase());
        });
        const has = (t: string, n: string) =>
            childTypes.has(t) || [...childNames].some(name => name.includes(n));
        const suggestions: string[] = [];
        if (!has('navbar', 'nav'))              suggestions.push('Add a sticky navigation bar');
        if (!has('hero', 'hero'))               suggestions.push('Add a hero section with gradient CTA');
        if (!has('features_section', 'feature') && has('hero', 'hero')) suggestions.push('Add a features bento grid');
        if (!has('pricing', 'pric'))            suggestions.push('Add a pricing comparison table');
        if (!has('', 'testimonial'))            suggestions.push('Add a testimonials carousel');
        if (!has('', 'contact') && !has('', 'cta')) suggestions.push('Add a contact / CTA section');
        if (!has('', 'footer'))                 suggestions.push('Add a footer with links');
        if (!has('', 'faq'))                    suggestions.push('Add a FAQ accordion');
        const extras = [
            'Add animated stats counter section', 'Add a team members grid',
            'Redesign page with glassmorphism style', 'Add a dark-mode hero with particle effects',
            'Add a comparison section with checkmarks',
        ];
        for (const e of extras) {
            if (suggestions.length >= 5) break;
            if (!suggestions.includes(e)) suggestions.push(e);
        }
        return suggestions.slice(0, 5);
    }, [isMagicBarOpen, elements, pages, activePageId]);

    // ── Stage event listener — attached only during 'generating' (zero cost at idle)
    useEffect(() => {
        if (status !== 'generating') return;

        const handleStage = (e: Event) => {
            const detail = (e as CustomEvent).detail as {
                stage: 'sending' | 'parsing' | 'injecting';
                model?: string;
                sections?: string[];
                count?: number;
            };
            const now     = Date.now();
            const elapsed = now - stageStartRef.current;
            stageStartRef.current = now;

            setStages(prev => prev.map(s => {
                // Mark the just-completed predecessor as done
                if (detail.stage === 'sending'   && s.id === 'analyze')   return { ...s, status: 'done', ms: elapsed };
                if (detail.stage === 'parsing'   && s.id === 'sending')   return { ...s, status: 'done', ms: elapsed };
                if (detail.stage === 'injecting' && s.id === 'parsing')   return { ...s, status: 'done', ms: elapsed, sections: detail.sections };
                // Mark the current stage as active
                if (s.id === detail.stage) {
                    if (detail.stage === 'sending')   { setActiveModel(detail.model ?? ''); return { ...s, status: 'active' }; }
                    if (detail.stage === 'parsing')   return { ...s, status: 'active' };
                    if (detail.stage === 'injecting') return { ...s, status: 'active', count: detail.count };
                }
                return s;
            }));
        };

        window.addEventListener('vectra:ai-stage', handleStage);
        return () => window.removeEventListener('vectra:ai-stage', handleStage);
    }, [status]);

    // ── Stream chunk listener (char count)
    useEffect(() => {
        if (status !== 'generating') { setStreamCharCount(0); return; }
        const handleChunk = (e: Event) => {
            const { accumulated } = (e as CustomEvent<{ text: string; accumulated: string }>).detail;
            setStreamCharCount(accumulated.length);
        };
        window.addEventListener('vectra:ai-stream-chunk', handleChunk);
        return () => window.removeEventListener('vectra:ai-stream-chunk', handleChunk);
    }, [status]);

    // STRICT-MODE-DOUBLE-INVOKE [PERMANENT]: isRunning ref — never setTimeout
    const isRunning = useRef(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        if (isRunning.current) return;
        isRunning.current = true;

        // ── Multi-page mode ──────────────────────────────────────────────────
        if (siteMode === 'multipage' && selectedPages.size > 0) {
            try {
                setStatus('thinking');
                await new Promise(r => setTimeout(r, 120));

                // Build the page list: Home (current page) + selected additional pages
                const pagesToGenerate = ['Home', ...Array.from(selectedPages)];
                const totalPages = pagesToGenerate.length;

                setStatus('generating');
                setStreamCharCount(0);

                for (let i = 0; i < pagesToGenerate.length; i++) {
                    const pageName = pagesToGenerate[i];
                    setMultiPageProgress({ current: i + 1, total: totalPages, pageName });

                    // Reset pipeline stages for each page
                    const freshStages = makeInitialStages();
                    freshStages[0] = { ...freshStages[0], status: 'done', ms: 80 };
                    setStages(freshStages);
                    stageStartRef.current = Date.now();

                    if (i === 0) {
                        // First page (Home) — generate on current active page
                        const homePrompt = input.trim();
                        await runAIRef.current(homePrompt);
                    } else {
                        // Additional pages — create, switch, wait for mount, then AI
                        addPageRef.current(pageName);
                        // Wait for page mount + canvas ready
                        await new Promise(r => setTimeout(r, 600));

                        // Build a context-aware prompt for this page type
                        const pagePrompt = buildMultiPagePrompt(pageName, input.trim());
                        await runAIRef.current(pagePrompt);
                    }

                    // Mark remaining stages done after each page completes
                    setStages(prev => prev.map(s =>
                        s.status === 'active' ? { ...s, status: 'done' } : s
                    ));

                    // Small cooldown between pages
                    if (i < pagesToGenerate.length - 1) {
                        await new Promise(r => setTimeout(r, 300));
                    }
                }

                saveHistory(input);
                setStatus('done');
                setFeedback(`✅ Generated ${totalPages} pages successfully`);
                setMultiPageProgress(null);

                // Switch back to Home page so user sees the full site
                const homePage = pagesRef.current.find(p => p.slug === '/');
                if (homePage) switchPageRef.current(homePage.id);

                setTimeout(() => {
                    setMagicBarOpen(false);
                    setInput('');
                    isRunning.current = false;
                }, 1800);
            } catch (err: any) {
                const msg = err?.message ?? 'Multi-page generation failed.';
                setFeedback(msg);
                setStatus('error');
                setMultiPageProgress(null);
                setTimeout(() => {
                    setStatus('idle');
                    setFeedback('');
                    setStages(makeInitialStages());
                    isRunning.current = false;
                }, 3500);
            }
            return;
        }

        // ── Static (single-page) mode — original flow ────────────────────────
        try {
            setStatus('thinking');
            await new Promise(r => setTimeout(r, 120));

            // Reset pipeline + mark analyze as instantly done + record start time
            const freshStages = makeInitialStages();
            freshStages[0] = { ...freshStages[0], status: 'done', ms: 120 };
            setStages(freshStages);
            stageStartRef.current = Date.now();
            setStreamCharCount(0);
            setStatus('generating');

            const resultMessage = await runAIRef.current(input);

            // Mark any still-active stages as done
            setStages(prev => prev.map(s =>
                s.status === 'active' ? { ...s, status: 'done' } : s
            ));

            saveHistory(input);
            setStatus('done');
            setFeedback(resultMessage || 'Done');

            setTimeout(() => {
                setMagicBarOpen(false);
                setInput('');
                isRunning.current = false;
            }, 1200);
        } catch (err: any) {
            const msg = err?.message ?? 'Something went wrong. Please try again.';
            setFeedback(msg);
            setStatus('error');
            setTimeout(() => {
                setStatus('idle');
                setFeedback('');
                setStages(makeInitialStages());
                isRunning.current = false;
            }, 3500);
        }
    };

    // ── Prompt history keyboard navigation (↑ / ↓)
    const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (status !== 'idle') return;
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const nextIdx = Math.min(historyIdx + 1, promptHistory.length - 1);
            setHistoryIdx(nextIdx);
            if (promptHistory[nextIdx]) setInput(promptHistory[nextIdx]);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIdx = Math.max(historyIdx - 1, -1);
            setHistoryIdx(nextIdx);
            setInput(nextIdx === -1 ? '' : (promptHistory[nextIdx] ?? ''));
        }
    }, [status, historyIdx, promptHistory]);

    if (!isMagicBarOpen) return null;

    const streamProgress = siteMode === 'multipage' && multiPageProgress
        ? Math.round((multiPageProgress.current / multiPageProgress.total) * 100)
        : Math.min(100, Math.round((streamCharCount / 4000) * 100));

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => { if (status === 'idle') setMagicBarOpen(false); }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-2xl bg-[#09090b] border border-white/10 rounded-xl shadow-2xl"
                >
                    {/* Progress bar */}
                    {status === 'generating' && (
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-zinc-800/80 overflow-hidden rounded-t-xl">
                            <motion.div
                                className="h-full bg-linear-to-r from-blue-500 to-violet-500"
                                initial={{ width: '0%' }}
                                animate={{ width: `${streamProgress}%` }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                            />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="relative">
                        {/* Header */}
                        <div className={`absolute top-4 left-4 flex items-center gap-2 select-none pointer-events-none ${
                            siteMode === 'multipage' && status !== 'idle' ? 'text-violet-400' : 'text-blue-400'
                        }`}>
                            <Sparkles
                                size={16}
                                className={status === 'thinking' || status === 'generating' ? 'animate-spin' : ''}
                            />
                            <span className="text-xs font-bold tracking-wider uppercase">
                                {status === 'idle'       && (siteMode === 'multipage' ? 'Vectra AI · Multi-page' : 'Vectra AI')}
                                {status === 'thinking'   && 'Analyzing…'}
                                {status === 'generating' && (multiPageProgress ? `Building Site… ${multiPageProgress.current}/${multiPageProgress.total}` : 'Generating…')}
                                {status === 'done'       && 'Done'}
                                {status === 'error'      && 'Failed'}
                            </span>
                            {/* History hint */}
                            {status === 'idle' && promptHistory.length > 0 && !input && (
                                <span className="text-[9px] text-zinc-700 font-mono">↑ history</span>
                            )}
                        </div>

                        {/* Input */}
                        {/* ── Site Type Toggle ────────────────────────────── */}
                        {status === 'idle' && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#111113] border border-white/8 rounded-lg p-0.5">
                                <button
                                    type="button"
                                    onClick={() => handleSiteModeChange('static')}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                        siteMode === 'static'
                                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    <Globe size={10} />
                                    Static Site
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSiteModeChange('multipage')}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                        siteMode === 'multipage'
                                            ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                                            : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    <LayoutGrid size={10} />
                                    Multi-page
                                </button>
                            </div>
                        )}

                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => { setInput(e.target.value); setHistoryIdx(-1); }}
                            onKeyDown={handleInputKeyDown}
                            placeholder={siteMode === 'multipage'
                                ? 'Describe your site (e.g., SaaS landing page for a CRM tool)…'
                                : 'Describe what to build or add…'
                            }
                            className="w-full bg-transparent text-lg text-white placeholder-zinc-500 px-4 pt-12 pb-16 outline-none"
                            disabled={status !== 'idle'}
                        />

                        {/* Done / error overlay */}
                        {(status === 'done' || status === 'error') && (
                            <div className={`absolute inset-0 bg-[#09090b]/90 flex items-center justify-center gap-2 font-medium px-6 text-center ${
                                status === 'error' ? 'text-red-400' : 'text-green-400'
                            }`}>
                                {status === 'error'
                                    ? <XCircle size={20} className="shrink-0" />
                                    : <CheckCircle2 size={20} className="shrink-0" />}
                                <span className="text-sm">{feedback}</span>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setMagicBarOpen(false)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={status !== 'idle' || !input.trim() || (siteMode === 'multipage' && selectedPages.size === 0)}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all ${
                                    status !== 'idle' || !input.trim() || (siteMode === 'multipage' && selectedPages.size === 0)
                                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                        : siteMode === 'multipage'
                                            ? 'bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-900/20'
                                            : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20'
                                }`}
                            >
                                {status === 'idle'
                                    ? siteMode === 'multipage'
                                        ? <><LayoutGrid size={12} /><span>Generate {selectedPages.size + 1} Pages</span><ArrowRight size={14} /></>
                                        : <><span>Generate</span><ArrowRight size={14} /></>
                                    : multiPageProgress
                                        ? <><Loader2 size={14} className="animate-spin" /><span>{multiPageProgress.pageName}… {multiPageProgress.current}/{multiPageProgress.total}</span></>
                                        : <><Loader2 size={14} className="animate-spin" /><span>Working…</span></>
                                }
                            </button>
                        </div>

                        {/* Model picker — bottom-left, collapsible */}
                        {status === 'idle' && (() => {
                            const iconMap: Record<string, React.ElementType> = { Bot, Cpu, Code2, Brain, Wind, Layers, Sparkles };
                            const activeOpt = MODEL_OPTIONS.find(m => m.id === selectedModelId) ?? MODEL_OPTIONS[0];
                            const ActiveIcon = iconMap[activeOpt.icon] ?? Cpu;
                            return (
                                <div className="absolute bottom-3 left-3">
                                    {/* Picker panel — opens upward */}
                                    {modelPickerOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 6, scale: 0.97 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute bottom-full left-0 mb-2 w-[280px] bg-[#111113] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
                                        >
                                            {/* Header */}
                                            <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles size={10} className="text-zinc-500" />
                                                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Select AI Model</span>
                                                </div>
                                                <span className="text-[9px] text-zinc-500 font-mono">{MODEL_OPTIONS.length} Models</span>
                                            </div>
                                            {/* Vertical Model List */}
                                            <div className="flex flex-col gap-1 p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                {MODEL_OPTIONS.map(opt => {
                                                    const isActive = opt.id === selectedModelId;
                                                    const Icon = iconMap[opt.icon] ?? Cpu;
                                                    return (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedModelId(opt.id);
                                                                setModelPickerOpen(false);
                                                                try { localStorage.setItem(MODEL_KEY, opt.model); } catch { /* ignore */ }
                                                            }}
                                                            style={isActive ? {
                                                                borderColor: opt.color + '55',
                                                                background:  opt.color + '15',
                                                            } : {}}
                                                            className={`relative flex items-center gap-3 p-2 rounded-lg border text-left transition-all ${
                                                                isActive
                                                                    ? 'shadow-sm border-transparent'
                                                                    : 'border-transparent hover:border-white/10 hover:bg-white/5'
                                                            }`}
                                                        >
                                                            {/* Icon */}
                                                            <div
                                                                style={{ background: opt.color + '20', color: opt.color }}
                                                                className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                                                            >
                                                                <Icon size={14} />
                                                            </div>
                                                            {/* Details */}
                                                            <div className="flex flex-col flex-1 overflow-hidden">
                                                                <span
                                                                    style={isActive ? { color: opt.color } : {}}
                                                                    className={`text-[11px] font-bold leading-tight truncate ${isActive ? '' : 'text-zinc-300'}`}
                                                                >
                                                                    {opt.label}
                                                                </span>
                                                                <span className="text-[9px] text-zinc-500 font-mono truncate">
                                                                    {opt.sublabel}
                                                                </span>
                                                            </div>
                                                            {/* Active dot */}
                                                            {isActive && (
                                                                <span
                                                                    style={{ background: opt.color }}
                                                                    className="w-1.5 h-1.5 rounded-full ml-auto shrink-0"
                                                                />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Toggle button */}
                                    <button
                                        type="button"
                                        onClick={() => setModelPickerOpen(p => !p)}
                                        style={modelPickerOpen ? {
                                            borderColor: activeOpt.color + '50',
                                            background:  activeOpt.color + '12',
                                            color: activeOpt.color,
                                        } : {}}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                            modelPickerOpen
                                                ? ''
                                                : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                                        }`}
                                    >
                                        <ActiveIcon size={9} />
                                        <span>{activeOpt.label}</span>
                                        <ChevronDown
                                            size={9}
                                            className={`transition-transform duration-150 ${ modelPickerOpen ? 'rotate-180' : '' }`}
                                        />
                                    </button>
                                </div>
                            );
                        })()}
                    </form>

                    {/* Live stage pipeline — shown during generation */}
                    {(status === 'generating' || status === 'thinking') && (
                        <>
                            {/* Multi-page progress bar */}
                            {multiPageProgress && (
                                <div className="px-4 pt-3 pb-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <LayoutGrid size={11} className="text-violet-400" />
                                            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                                                Multi-page Generation
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-mono text-zinc-500">
                                            {multiPageProgress.current} / {multiPageProgress.total}
                                        </span>
                                    </div>
                                    {/* Page progress dots */}
                                    <div className="flex items-center gap-1.5 mb-2">
                                        {Array.from({ length: multiPageProgress.total }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                                    i < multiPageProgress.current
                                                        ? 'bg-violet-500'
                                                        : i === multiPageProgress.current
                                                            ? 'bg-violet-500/40 animate-pulse'
                                                            : 'bg-zinc-800'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    {/* Current page name */}
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileText size={10} className="text-zinc-500" />
                                        <span className="text-[11px] text-zinc-400">
                                            Generating <span className="text-white font-semibold">{multiPageProgress.pageName}</span> page…
                                        </span>
                                    </div>
                                </div>
                            )}
                            <GenerationPipeline
                                stages={stages}
                                streamChars={streamCharCount}
                                model={activeModel}
                            />
                        </>
                    )}

                    {/* ── Multi-page presets — shown when multipage mode + idle ──── */}
                    {siteMode === 'multipage' && status === 'idle' && (
                        <div className="px-4 pb-3 border-t border-white/5">
                            <div className="flex items-center justify-between mt-2.5 mb-2">
                                <div className="flex items-center gap-2">
                                    <LayoutGrid size={10} className="text-violet-400" />
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Pages to Generate</span>
                                </div>
                                <span className="text-[9px] text-zinc-600 font-mono">
                                    {selectedPages.size + 1} pages (Home + {selectedPages.size})
                                </span>
                            </div>

                            {/* Home — always included, non-removable */}
                            <div className="flex flex-wrap gap-1.5">
                                <div
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold
                                               bg-blue-600/15 text-blue-400 border border-blue-500/25 cursor-default"
                                >
                                    <span>🏠</span>
                                    <span>Home</span>
                                    <span className="text-[8px] text-blue-500/60 font-mono ml-0.5">/</span>
                                </div>

                                {MULTI_PAGE_PRESETS.map(preset => {
                                    const isActive = selectedPages.has(preset.name);
                                    return (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => togglePagePreset(preset.name)}
                                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                                isActive
                                                    ? 'bg-violet-600/15 text-violet-400 border-violet-500/25 hover:bg-violet-600/25'
                                                    : 'bg-white/3 text-zinc-600 border-zinc-800 hover:text-zinc-400 hover:border-zinc-700'
                                            }`}
                                        >
                                            <span>{preset.icon}</span>
                                            <span>{preset.name}</span>
                                            {isActive && (
                                                <span className="text-[8px] text-violet-500/60 font-mono ml-0.5">{preset.slug}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedPages.size === 0 && (
                                <p className="text-[9px] text-amber-500/60 mt-1.5">Select at least one additional page</p>
                            )}
                        </div>
                    )}

                    {/* Hint chips — idle + empty + static mode only */}
                    {!input && status === 'idle' && siteMode === 'static' && (
                        <div className="px-4 pb-4 flex flex-wrap gap-2">
                            {contextualHints.map(hint => (
                                <button
                                    key={hint}
                                    onClick={() => setInput(hint)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-zinc-400 hover:text-white hover:border-white/10 transition-all"
                                >
                                    <Zap size={9} className="text-violet-400 shrink-0" />
                                    {hint}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Recent prompts — idle + empty + history exists */}
                    {!input && status === 'idle' && promptHistory.length > 0 && (
                        <div className="px-4 pb-3 border-t border-white/4">
                            <p className="text-[9px] text-zinc-700 uppercase tracking-wider mb-1.5 mt-2">Recent</p>
                            <div className="flex flex-wrap gap-1.5">
                                {promptHistory.slice(0, 4).map((p, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(p)}
                                        className="text-[10px] text-zinc-600 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-600 px-2 py-0.5 rounded transition-all truncate max-w-[200px]"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
