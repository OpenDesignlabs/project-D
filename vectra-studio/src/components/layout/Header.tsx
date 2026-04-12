import { useState, useEffect, useRef, lazy, Suspense } from 'react';

import { useEditor } from '../../context/EditorContext';
import { useContainer } from '../../context/ContainerContext';
import { generateProjectCode, generateNextProjectCode } from '../../utils/codegen/codeGenerator';
import type { GeneratedFileMap } from '../../utils/codegen/codeGenerator';
import {
    Play, Undo, Redo,
    Trash2,
    Home, Wand2, Loader2, Download,
    Cpu, Maximize, ExternalLink, ChevronDown, Plus, FileText,
    Upload, Send, FileArchive, Figma, RotateCcw,
} from 'lucide-react';
// PublishModal: 982-line modal, only needed when user clicks Publish
const PublishModal = lazy(() => import('../modals/PublishModal').then(m => ({ default: m.PublishModal })));

import { cn } from '../../lib/utils';

export const Header = () => {
    const {
        history, previewMode, setPreviewMode, elements,
        setSelectedId, selectedId,
        deleteElement, exitProject, setMagicBarOpen,
        pages, framework, setActivePanel,
        projectId, projectName,
        apiRoutes,          // E1/E5: passed to generateNextProjectCode for API route ZIP export
        realPageId, switchPage, addPage,
    } = useEditor();

    const { status, url: containerUrl } = useContainer();


    // Page switcher dropdown. Uses 50ms setTimeout on the global mousedown listener to prevent the opening click from also triggering the close handler
    const [pageDropOpen, setPageDropOpen] = useState(false);
    const pageDropRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!pageDropOpen) return;
        const close = (e: MouseEvent) => {
            if (pageDropRef.current && !pageDropRef.current.contains(e.target as Node)) {
                setPageDropOpen(false);
            }
        };
        const t = setTimeout(() => window.addEventListener('mousedown', close), 50);
        return () => { clearTimeout(t); window.removeEventListener('mousedown', close); };
    }, [pageDropOpen]);

    // Live save-state indicator.
    // Driven by vectra:save-state events from useFileSync — zero coupling to sync internals.
    const [isSaving, setIsSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const justSavedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        const handle = (e: Event) => {
            const saving = (e as CustomEvent<{ saving: boolean }>).detail.saving;
            setIsSaving(saving);
            if (!saving) {
                if (justSavedTimerRef.current) clearTimeout(justSavedTimerRef.current);
                setJustSaved(true);
                justSavedTimerRef.current = setTimeout(() => setJustSaved(false), 2000);
            }
        };
        window.addEventListener('vectra:save-state', handle);
        return () => {
            window.removeEventListener('vectra:save-state', handle);
            if (justSavedTimerRef.current) clearTimeout(justSavedTimerRef.current);
        };
    }, []);

    // ── Import dropdown ───────────────────────────────────────────────────────
    const [showImportMenu, setShowImportMenu] = useState(false);
    const importMenuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!showImportMenu) return;
        const handler = (e: MouseEvent) => {
            if (importMenuRef.current && !importMenuRef.current.contains(e.target as Node))
                setShowImportMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showImportMenu]);

    // ── Publish modal ─────────────────────────────────────────────────────────
    const [showPublishModal, setShowPublishModal] = useState(false);

    // ── ZIP Download ──────────────────────────────────────────────────────────
    const [isDownloadingZip, setIsDownloadingZip] = useState(false);

    const handleDownloadZip = async () => {
        if (isDownloadingZip) return;
        setIsDownloadingZip(true);
        try {
            // E1 fix: route to the correct generator based on selected framework.
            // Previously always called generateProjectCode() (Vite) regardless of selection.
            let fileMap: GeneratedFileMap;
            if (framework === 'nextjs') {
                fileMap = generateNextProjectCode(elements, pages, [], apiRoutes);
            } else {
                fileMap = generateProjectCode(elements, pages, []);
            }

            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            for (const [path, content] of Object.entries(fileMap.files)) {
                zip.file(path, content);
            }
            // README is added by Header, not the generators, so it's always present.
            const displayName = projectName || projectId || 'vectra-app';
            zip.file('README.md',
                `# ${displayName}\n\nBuilt with [Vectra](https://vectra.dev).\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\nThen open [http://localhost:3000](http://localhost:3000).\n`);

            const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${(displayName).replace(/\s+/g, '-').toLowerCase()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('[Vectra] ZIP export failed:', err);
        } finally {
            setIsDownloadingZip(false);
        }
    };

    const [resetConfirm, setResetConfirm] = useState(false);
    const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleDevReset = async () => {
        if (!resetConfirm) {
            setResetConfirm(true);
            resetTimerRef.current = setTimeout(() => setResetConfirm(false), 3000);
            return;
        }
        // Wipe localStorage
        localStorage.clear();
        // Wipe all IndexedDB databases
        const dbs = await indexedDB.databases?.() ?? [];
        await Promise.allSettled(dbs.map(db => db.name && indexedDB.deleteDatabase(db.name)));
        // Wipe service-worker cache (if any)
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.allSettled(keys.map(k => caches.delete(k)));
        }
        window.location.reload();
    };


    const togglePreview = () => {
        if (!previewMode) setSelectedId(null);
        setPreviewMode(!previewMode);
    };






    return (
        <>
            {/* TOP BAR */}
            <div className="h-[50px] bg-[#333333] border-b border-[#252526] flex items-center justify-between px-4 shrink-0 z-50 text-[#cccccc]">

                {/* LEFT: Branding + Page Switcher */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={exitProject}
                        className="p-2 hover:bg-[#3e3e42] rounded text-[#858585] hover:text-white transition-colors"
                        title="Back to Dashboard"
                    >
                        <Home size={16} />
                    </button>

                    <div className="flex items-center gap-2">
                        <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0" y="0" width="40" height="40" rx="10" fill="#a5b4fc" />
                            <svg x="6" y="6" width="28" height="28" viewBox="0 0 24 24">
                                <path d="M5 6L12 20" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
                                <path d="M12 20L19 6" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
                                <circle cx="5" cy="6" r="1.5" fill="#1e1b4b" />
                                <circle cx="19" cy="6" r="1.5" fill="#1e1b4b" />
                                <rect x="10.5" y="18.5" width="3" height="3" fill="#1e1b4b" />
                            </svg>
                        </svg>
                        <span className="text-sm font-bold text-[#cccccc] hidden md:block">Vectra</span>
                    </div>

                    <div className="h-4 w-px bg-[#3e3e42]" />

                    {/* Framework Badge */}
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-bold ${framework === 'nextjs'
                        ? 'bg-white/5 border-white/10 text-[#999]'
                        : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}>
                        <Cpu size={10} />
                        {framework === 'nextjs' ? 'Next.js 14' : 'Vite + React'}
                    </div>

                    {/* Page Switcher */}
                    <div className="relative" ref={pageDropRef}>
                        <button
                            onClick={() => setPageDropOpen(p => !p)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium border transition-all max-w-[150px]",
                                pageDropOpen
                                    ? "bg-[#007acc]/15 border-[#007acc]/40 text-white"
                                    : "bg-[#252526] border-[#3e3e42] text-[#ccc] hover:text-white hover:border-[#555]"
                            )}
                            title="Switch page"
                        >
                            <FileText size={11} className="text-[#007acc] shrink-0" />
                            <span className="truncate max-w-[90px]">
                                {pages.find(p => p.id === realPageId)?.name ?? 'Page'}
                            </span>
                            <ChevronDown size={10} className={cn("shrink-0 transition-transform duration-150", pageDropOpen && "rotate-180")} />
                        </button>

                        {pageDropOpen && (
                            <div className="absolute top-full left-0 mt-1 z-200 bg-[#252526] border border-[#3f3f46] rounded-xl shadow-2xl py-1 min-w-[190px]">
                                <div className="px-3 py-1.5 text-[9px] font-bold text-[#555] uppercase tracking-widest border-b border-[#2a2a2c] mb-1">Pages</div>
                                {pages.filter(p => !p.hidden).map(page => (
                                    <button
                                        key={page.id}
                                        onClick={() => { switchPage(page.id); setPageDropOpen(false); }}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-left transition-colors",
                                            page.id === realPageId
                                                ? "text-white bg-[#007acc]/15"
                                                : "text-[#aaa] hover:text-white hover:bg-[#2a2a2c]"
                                        )}
                                    >
                                        <span className={cn(
                                            "w-1.5 h-1.5 rounded-full shrink-0",
                                            page.id === realPageId ? "bg-[#007acc]" : "bg-[#444]"
                                        )} />
                                        <span className="flex-1 truncate">{page.name}</span>
                                        <span className="text-[9px] text-[#444] font-mono shrink-0 max-w-[60px] truncate">{page.slug}</span>
                                    </button>
                                ))}
                                <div className="h-px bg-[#2a2a2c] my-1" />
                                <button
                                    onClick={() => { addPage('New Page'); setPageDropOpen(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-[#007acc] hover:bg-[#007acc]/10 transition-colors"
                                >
                                    <Plus size={11} /> New Page
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Actions */}
                <div className="flex items-center gap-2">
                    {/* History & Zoom */}
                    <div className="flex items-center gap-0.5 opacity-80">
                        <button onClick={history.undo} className="p-2 hover:bg-[#3e3e42] hover:text-white rounded text-[#858585] transition-colors" title="Undo"><Undo size={14} /></button>
                        <button onClick={history.redo} className="p-2 hover:bg-[#3e3e42] hover:text-white rounded text-[#858585] transition-colors" title="Redo"><Redo size={14} /></button>
                        <button onClick={() => window.dispatchEvent(new CustomEvent('vectra:zoom-to-fit'))} className="p-2 hover:bg-[#3e3e42] hover:text-white rounded text-[#858585] transition-colors" title="Zoom to Fit (⌘0)"><Maximize size={14} /></button>
                        {/* Save state pill */}
                        {(isSaving || justSaved) && (
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all ml-1 ${
                                isSaving ? 'text-[#888] bg-[#2a2a2d]' : 'text-green-400 bg-green-500/10'
                            }`}>
                                {isSaving
                                    ? <><span className="w-1.5 h-1.5 rounded-full bg-[#666] animate-pulse" />Saving…</>
                                    : <><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Saved</>
                                }
                            </div>
                        )}
                    </div>

                    {/* AI Magic Bar Toggle */}
                    <button
                        onClick={() => setMagicBarOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-[#7c3aed] to-[#2563eb] text-white rounded text-[10px] font-black hover:shadow-lg transition-all border border-white/10 group active:scale-95"
                    >
                        <Wand2 size={12} className="group-hover:rotate-12 transition-transform" />
                        <span className="hidden lg:inline uppercase tracking-tight">Ask AI</span>
                        <span className="text-[8px] opacity-40 font-mono hidden xl:inline border border-white/20 px-1 rounded ml-1 group-hover:opacity-100">⌘K</span>
                    </button>

                    <div className="h-4 w-px bg-[#3e3e42] mx-1" />

                    {/* Delete Button */}
                    <button
                        onClick={() => {
                            if (selectedId && !['application-root', 'page-home', 'main-canvas'].includes(selectedId)) {
                                deleteElement(selectedId);
                            }
                        }}
                        disabled={!selectedId || ['application-root', 'page-home', 'main-canvas'].includes(selectedId)}
                        className={cn(
                            "p-2 rounded transition-colors",
                            (selectedId && !['application-root', 'page-home', 'main-canvas'].includes(selectedId))
                                ? "text-[#858585] hover:text-red-400 hover:bg-[#3e3e42]"
                                : "text-[#555] cursor-not-allowed"
                        )}
                        title="Delete Selected (Del)"
                    >
                        <Trash2 size={14} />
                    </button>

                    <div className="h-4 w-px bg-[#3e3e42] mx-1" />



                    {/* ── Import Dropdown ────────────────────────────── */}
                    <div className="relative" ref={importMenuRef}>
                        <button
                            onClick={() => setShowImportMenu(p => !p)}
                            className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-bold transition-all border',
                                showImportMenu
                                    ? 'bg-[#3e3e42] border-[#5e5e62] text-white'
                                    : 'bg-[#252526] border-[#3e3e42] text-[#858585] hover:text-white hover:border-[#5e5e62]'
                            )}
                            title="Import from Figma or Stitch"
                        >
                            <Upload size={12} />
                            <span>Import</span>
                            <ChevronDown size={10} className={cn('transition-transform', showImportMenu && 'rotate-180')} />
                        </button>

                        {showImportMenu && (
                            <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#1e1e1e] border border-[#3e3e42] rounded-lg shadow-2xl z-300 overflow-hidden py-1">
                                <div className="px-3 py-1.5 text-[9px] font-bold text-[#555] uppercase tracking-wider">Import from</div>

                                <button
                                    onClick={() => { setActivePanel('figma'); setShowImportMenu(false); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#cccccc] hover:bg-[#2a2a2d] hover:text-white transition-colors"
                                >
                                    <Figma size={13} className="text-pink-400 shrink-0" />
                                    <div className="text-left">
                                        <div className="font-semibold">Figma</div>
                                        <div className="text-[10px] text-[#666]">Import frames from Figma</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => { setActivePanel('stitch'); setShowImportMenu(false); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#cccccc] hover:bg-[#2a2a2d] hover:text-white transition-colors"
                                >
                                    <FileArchive size={13} className="text-amber-400 shrink-0" />
                                    <div className="text-left">
                                        <div className="font-semibold">Stitch</div>
                                        <div className="text-[10px] text-[#666]">Import ZIP component bundle</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Download ZIP Button ──────────────────────────── */}
                    <button
                        onClick={handleDownloadZip}
                        disabled={isDownloadingZip}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all border bg-[#252526] border-[#3e3e42] text-[#858585] hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-600/8 disabled:opacity-50 disabled:cursor-wait"
                        title="Download project as ZIP"
                    >
                        {isDownloadingZip
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Download size={12} />}
                        <span>{isDownloadingZip ? 'Zipping…' : 'Download'}</span>
                    </button>

                    {/* ── Publish Button ─────────────────────────────── */}
                    <button
                        onClick={() => setShowPublishModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all border bg-[#252526] border-[#3e3e42] text-[#858585] hover:text-white hover:border-purple-500/60 hover:bg-purple-600/10"
                        title="Publish project"
                    >
                        <Send size={12} />
                        <span>Publish</span>
                    </button>

                    <div className="h-4 w-px bg-[#3e3e42] mx-2" />

                    {/* ── DEV ONLY: Reset all browser state ─────────────────
                        Remove this button before shipping to production.    */}
                    <button
                        id="dev-reset-all-btn"
                        onClick={handleDevReset}
                        title="DEV: Clear localStorage + IndexedDB + Cache then reload"
                        className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-all border',
                            resetConfirm
                                ? 'bg-orange-600 border-orange-500 text-white animate-pulse'
                                : 'bg-[#252526] border-orange-500/30 text-orange-500/70 hover:bg-orange-600/15 hover:border-orange-500 hover:text-orange-400'
                        )}
                    >
                        <RotateCcw size={10} />
                        {resetConfirm ? '⚠ Sure?' : 'Reset All'}
                    </button>

                    {/* WebContainer Status Indicator */}
                    <div className="flex items-center gap-2 mr-2">
                        <span className={`w-2 h-2 rounded-full ${status === 'ready' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 animate-pulse'}`} />
                        <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                            {status === 'ready' ? 'Ready' : 'Building...'}
                        </span>
                    </div>

                    {/* Preview Button (Primary Action) */}
                    <button
                        onClick={togglePreview}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all",
                            previewMode
                                ? 'bg-[#007acc] text-white hover:bg-[#0063a5] shadow-sm'
                                : 'bg-[#252526] text-[#cccccc] border border-[#3e3e42] hover:border-[#007acc] hover:text-[#007acc]'
                        )}
                    >
                        <Play size={10} fill={previewMode ? "currentColor" : "none"} />
                        {previewMode ? 'Running' : 'Preview'}
                    </button>

                    {/* SPRINT-E-FIX-24: Open in Browser — opens the live WebContainer
                        server URL in a new tab so multi-page navigation actually works.
                        The instant preview iframe uses a sandboxed srcdoc that can't
                        follow React Router <Link> navigation between pages.
                        containerUrl comes from the server-ready event (MCP-WC-1) —
                        never a hardcoded localhost port. Only rendered when the dev
                        server is running (containerUrl non-null). */}
                    {containerUrl && (
                        <a
                            href={containerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open live dev server in new tab — supports multi-page navigation"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-bold transition-all bg-[#252526] border border-[#3e3e42] text-[#858585] hover:text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/8 active:scale-95 ml-1"
                        >
                            <ExternalLink size={11} />
                            <span className="hidden xl:inline">Open in Browser</span>
                        </a>
                    )}
                </div>
            </div >




            {/* ── Publish Modal ──────────────────────────────────────────── */}
            {showPublishModal && (
                <Suspense fallback={null}>
                    <PublishModal onClose={() => setShowPublishModal(false)} />
                </Suspense>
            )}
        </>
    );
};