'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Monitor, Tablet, Smartphone, RefreshCw, GripVertical } from 'lucide-react';
import { cn } from '../lib/utils';

interface LivePreviewProps {
  compiledCode: string;
  label: string;
}

/**
 * Renders a Vectra marketplace component live in a sandboxed iframe.
 *
 * ROOT CAUSES FIXED (vs previous version):
 *
 * BUG 1 — `lucideReact is not defined`
 *   The previous shell referenced `lucideReact` at top-level script scope.
 *   If the UMD CDN script took any time or used a different global name,
 *   the assignment blew up immediately — before renderComponent was even defined.
 *   Fix: detect the global defensively inside renderComponent (after load event).
 *
 * BUG 2 — Named icon imports were undefined after stripping
 *   Components have `import { ChevronRight } from 'lucide-react'`.
 *   Previous code stripped the import entirely → ChevronRight undefined.
 *   Fix: TRANSFORM imports, don't strip them:
 *     `import { ChevronRight, ArrowRight } from 'lucide-react'`
 *     → `const { ChevronRight, ArrowRight } = window.__LucideIcons || {};`
 *   React/framer-motion imports are stripped (they're global stubs).
 *
 * BUG 3 — Module export extraction was fragile
 *   The `moduleFactory` approach with `exports`/`module` objects required
 *   CommonJS interop that Babel's UMD output doesn't cleanly provide.
 *   Fix: strip `export default`, capture the function name, return it directly
 *   from a `new Function(...)` call.
 */
export function LivePreview({ compiledCode, label }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Manual refresh triggers the iframe recreation
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    setStatus('loading');
    setErrorMsg('');

    iframe.srcdoc = buildPreviewShell(compiledCode, label);

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'vectra-preview-ready') setStatus('ready');
      if (e.data?.type === 'vectra-preview-error') {
        setStatus('error');
        setErrorMsg(e.data.message ?? 'Render error');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [compiledCode, label, refreshKey]);

  const DeviceButton = ({ mode, icon: Icon }: { mode: 'desktop'|'tablet'|'mobile', icon: any }) => (
    <button
      onClick={() => setDevice(mode)}
      className={cn(
        "p-1.5 rounded-md transition-colors text-m3-onSurfaceVariant/70 hover:text-m3-onSurface hover:bg-m3-surfaceContainerHighest",
        device === mode && "text-m3-primary bg-m3-primaryContainer/30"
      )}
      title={mode}
    >
      <Icon size={14} />
    </button>
  );

  return (
    <div className="rounded-2xl border border-m3-outlineVariant/30 overflow-hidden bg-m3-surfaceContainerHigh flex flex-col">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-m3-surfaceContainer border-b border-m3-outlineVariant/20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <DeviceButton mode="desktop" icon={Monitor} />
          <DeviceButton mode="tablet" icon={Tablet} />
          <DeviceButton mode="mobile" icon={Smartphone} />
          <div className="w-px h-4 bg-m3-outlineVariant/30 mx-1" />
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-md text-m3-onSurfaceVariant/70 hover:text-m3-onSurface hover:bg-m3-surfaceContainerHighest transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw size={14} className={status === 'loading' ? 'animate-spin opacity-50' : ''} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-m3-onSurfaceVariant font-mono max-w-[120px] sm:max-w-none truncate">
            preview.vectra.dev
          </span>
          {status === 'error'   && <span className="text-[10px] text-rose-400 font-medium">Error</span>}
          {status === 'ready'   && <span className="text-[10px] text-emerald-400 font-medium">Ready</span>}
        </div>
      </div>

      {status === 'error' && (
        <div className="px-4 py-3 bg-rose-950/30 border-b border-rose-800/30 text-xs text-rose-300 font-mono whitespace-pre-wrap shrink-0">
          {errorMsg}
        </div>
      )}

      {/* ── Resizable area ── */}
      <div className="relative flex-1 bg-zinc-950/50 flex justify-center w-full overflow-hidden">
        {/* The resizable box */}
        <div className={cn(
          "relative min-w-[320px] max-w-full bg-white transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden border-x border-white/5",
          device === 'desktop' ? 'w-full !transition-none resize-x' : '',
          device === 'tablet'  ? 'w-[768px]' : '',
          device === 'mobile'  ? 'w-[375px]' : ''
        )}>
          {device === 'desktop' && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-zinc-800/80 rounded-l flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-10">
              <GripVertical size={12} className="text-zinc-400" />
            </div>
          )}
          <iframe
            key={refreshKey}
            ref={iframeRef}
            title={`Preview: ${label}`}
            className="w-full h-full min-h-[480px] border-0"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Shell builder ────────────────────────────────────────────────────────────

function buildPreviewShell(compiledCode: string, label: string): string {
  // Use JSON.stringify for safe embedding — handles all escaping automatically.
  // The shell will JSON.parse it back.
  const jsonSource = JSON.stringify(compiledCode);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview: ${label}</title>

  <!-- Tailwind CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- React 18 UMD (sync, blocking — available immediately after) -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

  <!-- IMPORTANT: lucide-react UMD bundle expects global "react" (lowercase) instead of "React" -->
  <script>window.react = window.React;</script>

  <!-- Lucide React UMD — pinned to 0.383.0 to match marketplace package.json and prevent unpkg latest 404s -->
  <script src="https://unpkg.com/lucide-react@0.383.0/dist/umd/lucide-react.js"></script>

  <style>
    * { box-sizing: border-box; margin: 0; }
    body { padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    #root { min-height: 100%; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    // ─── Source (embedded via JSON.stringify — no escaping issues) ────────────
    var __SOURCE__ = ${jsonSource};

    // ─── Import transformer ───────────────────────────────────────────────────
    // Transforms import statements into forms the sandbox can execute.
    // Runs inside renderComponent (after load) so all CDN globals are ready.
    function transformImports(src) {
      // 1. lucide-react named imports → destructure from __LucideIcons
      //    import { X, Y } from 'lucide-react'
      //    → const { X, Y } = window.__LucideIcons || {};
      src = src.replace(
        /import\\s*\\{([^}]+)\\}\\s*from\\s*['"]lucide-react['"]\\s*;?/g,
        function(_, names) {
          // Handle "X as Y" aliases — keep original name for destructuring
          var cleaned = names.replace(/\\w+\\s+as\\s+(\\w+)/g, '$1').trim();
          return 'var { ' + cleaned + ' } = (window.__LucideIcons || {});';
        }
      );

      // 2. React default import → remove (React is already global)
      src = src.replace(/import\\s+React\\s*,?\\s*\\{[^}]*\\}\\s*from\\s*['"]react['"]\\s*;?[\\r\\n]?/g, '');
      src = src.replace(/import\\s+React\\s+from\\s*['"]react['"]\\s*;?[\\r\\n]?/g, '');

      // 3. React named imports → remove (useState etc. are global stubs)
      src = src.replace(/import\\s*\\{[^}]*\\}\\s*from\\s*['"]react['"]\\s*;?[\\r\\n]?/g, '');

      // 4. framer-motion → remove (motion stub is global)
      src = src.replace(/import\\s+.*?\\s+from\\s*['"]framer-motion['"]\\s*;?[\\r\\n]?/g, '');
      src = src.replace(/import\\s*\\{[^}]*\\}\\s*from\\s*['"]framer-motion['"]\\s*;?[\\r\\n]?/g, '');

      // 5. Any remaining import statements → remove
      src = src.replace(/^import\\s+[^\\n]*\\n?/gm, '');

      return src.trim();
    }

    // ─── Main renderer ────────────────────────────────────────────────────────
    function renderComponent() {
      try {
        // Detect Lucide global — UMD bundle registers as lucideReact
        // Defensive: try all known global names
        window.__LucideIcons = (
          typeof lucideReact !== 'undefined' ? lucideReact :
          typeof LucideReact !== 'undefined' ? LucideReact :
          {}
        );

        // Global stubs — React hooks
        window.useState      = React.useState;
        window.useEffect     = React.useEffect;
        window.useRef        = React.useRef;
        window.useCallback   = React.useCallback;
        window.useMemo       = React.useMemo;
        window.useReducer    = React.useReducer;

        // cn helper
        window.cn = function() {
          return Array.prototype.slice.call(arguments).filter(Boolean).join(' ');
        };

        // Framer Motion stub — renders as plain HTML elements, no animation
        window.motion = new Proxy({}, {
          get: function(_, tag) {
            return React.forwardRef(function(_ref, ref) {
              var children = _ref.children;
              var initial = _ref.initial, animate = _ref.animate, exit = _ref.exit,
                  transition = _ref.transition, variants = _ref.variants,
                  whileHover = _ref.whileHover, whileTap = _ref.whileTap,
                  whileInView = _ref.whileInView, viewport = _ref.viewport;
              var rest = Object.assign({}, _ref);
              ['children','initial','animate','exit','transition','variants',
               'whileHover','whileTap','whileInView','viewport'].forEach(function(k) { delete rest[k]; });
              return React.createElement(tag, Object.assign({ ref: ref }, rest), children);
            });
          }
        });
        window.AnimatePresence = function(_ref) { return _ref.children || null; };

        // ── Transform source ──
        var transformed = transformImports(__SOURCE__);

        // ── Find exported component name ──
        var nameMatch = transformed.match(/export\\s+default\\s+function\\s+(\\w+)/);
        var componentName = nameMatch ? nameMatch[1] : null;

        // ── Strip export keywords so it's plain JS ──
        // (SWC compiles to ES5 React.createElement, but keeps 'export default function')
        var execSource = transformed
          .replace(/export\\s+default\\s+function\\s+(\\w+)/g, 'function $1')
          .replace(/export\\s+default\\s+/g, '');

        var compiled = execSource;

        // ── Execute and extract component ──
        var Component = null;

        if (componentName) {
          // Direct approach: name is known, return it explicitly
          var fn = new Function(
            'React', 'useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useReducer',
            'motion', 'AnimatePresence', 'cn',
            compiled + '\\nreturn typeof ' + componentName + ' !== "undefined" ? ' + componentName + ' : null;'
          );
          Component = fn(
            React,
            React.useState, React.useEffect, React.useRef,
            React.useCallback, React.useMemo, React.useReducer,
            window.motion, window.AnimatePresence, window.cn
          );
        }

        // Fallback: scan compiled code for any function that looks like a component
        if (typeof Component !== 'function') {
          var funcMatch = compiled.match(/function\\s+(\\w+)\\s*\\(/);
          if (funcMatch) {
            componentName = funcMatch[1];
            var fn2 = new Function(
              'React', 'useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useReducer',
              'motion', 'AnimatePresence', 'cn',
              compiled + '\\nreturn typeof ' + componentName + ' !== "undefined" ? ' + componentName + ' : null;'
            );
            Component = fn2(
              React,
              React.useState, React.useEffect, React.useRef,
              React.useCallback, React.useMemo, React.useReducer,
              window.motion, window.AnimatePresence, window.cn
            );
          }
        }

        if (typeof Component !== 'function') {
          throw new Error('No valid React component found in source. Looked for: ' + componentName);
        }

        // ── Render ──
        var root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(Component));

        window.parent.postMessage({ type: 'vectra-preview-ready' }, '*');

      } catch (err) {
        console.error('[LivePreview] Render error:', err);
        var msg = err && err.message ? err.message : String(err);
        document.getElementById('root').innerHTML =
          '<div style="padding:20px;color:#ef4444;font-family:monospace;font-size:11px;line-height:1.6;">' +
          '<strong style="font-size:13px;">⚠ Preview error</strong><br><br>' +
          msg.replace(/</g,'&lt;').replace(/>/g,'&gt;') +
          '</div>';
        window.parent.postMessage({ type: 'vectra-preview-error', message: msg }, '*');
      }
    }

    // Run after all CDN scripts are fully loaded
    window.addEventListener('load', renderComponent);
  </script>
</body>
</html>`;
}
