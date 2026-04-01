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
  const [iframeTheme, setIframeTheme] = useState<'dark'|'light'>('dark');

  // Manual refresh triggers the iframe recreation
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    setStatus('loading');
    setErrorMsg('');

    iframe.srcdoc = buildPreviewShell(compiledCode, label, iframeTheme);

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'vectra-preview-ready') setStatus('ready');
      if (e.data?.type === 'vectra-preview-error') {
        setStatus('error');
        setErrorMsg(e.data.message ?? 'Render error');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [compiledCode, label, refreshKey, iframeTheme]);

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
    <div className="rounded-2xl border border-m3-outlineVariant/30 overflow-hidden bg-m3-surfaceContainerHigh flex flex-col relative shadow-sm">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-m3-surfaceContainer border-b border-m3-outlineVariant/20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-3">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-inner" />
          </div>
          <DeviceButton mode="desktop" icon={Monitor} />
          <DeviceButton mode="tablet" icon={Tablet} />
          <DeviceButton mode="mobile" icon={Smartphone} />
          <div className="w-px h-5 bg-m3-outlineVariant/30 mx-2" />
          <button
            onClick={() => setIframeTheme(t => t === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-md text-m3-onSurfaceVariant/70 hover:text-m3-onSurface hover:bg-m3-surfaceContainerHighest transition-colors"
            title="Toggle Iframe Theme"
          >
             {iframeTheme === 'dark' ? <span className="text-xs font-bold leading-none">☽</span> : <span className="text-xs font-bold leading-none">☀️</span>}
          </button>
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-md text-m3-onSurfaceVariant/70 hover:text-m3-onSurface hover:bg-m3-surfaceContainerHighest transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw size={14} className={status === 'loading' ? 'animate-spin opacity-50' : ''} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-m3-onSurfaceVariant/80 font-mono tracking-tight bg-m3-surfaceContainerHighest px-2 py-0.5 rounded-md truncate max-w-[150px] sm:max-w-none shadow-inner border border-white/5">
            preview.vectra.dev
          </span>
          {status === 'error'   && <span className="text-[10px] text-rose-400 font-medium tracking-wide uppercase">Error</span>}
          {status === 'ready'   && <span className="text-[10px] text-emerald-400 font-medium tracking-wide uppercase">Ready</span>}
        </div>
      </div>

      {status === 'error' && (
        <div className="px-4 py-3 bg-rose-950/30 border-b border-rose-800/30 text-xs text-rose-300 font-mono whitespace-pre-wrap shrink-0">
          {errorMsg}
        </div>
      )}

      {/* ── Resizable area ── */}
      <div className="relative flex-1 bg-zinc-950/70 flex justify-center w-full overflow-hidden bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]">
        {/* The resizable box */}
        <div className={cn(
          "relative min-w-[300px] max-w-full bg-white transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden border-x border-b border-white/10 shadow-2xl rounded-b-xl",
          device === 'desktop' ? 'w-full !transition-none resize-x overflow-auto' : '',
          device === 'tablet'  ? 'w-[768px]' : '',
          device === 'mobile'  ? 'w-[375px]' : ''
        )}>
          {device === 'desktop' && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-12 bg-zinc-800/60 backdrop-blur-md rounded-l items-center justify-center cursor-ew-resize opacity-100 shadow-xl border border-white/10 border-r-0 z-10 hover:bg-zinc-700 transition-colors hidden sm:flex">
              <GripVertical size={14} className="text-zinc-300" />
            </div>
          )}
          <iframe
            key={refreshKey}
            ref={iframeRef}
            title={`Preview: ${label}`}
            className="w-full h-full min-h-[500px] border-0"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}



// ─── Shell builder ────────────────────────────────────────────────────────────
// SWC compiles server-side with module:{type:'commonjs'} so:
//   import { X } from 'lucide-react'  →  var _lucide = require('lucide-react')
//   export default function Foo()     →  exports.default = Foo
// The iframe shell provides a require() shim mapping packages to UMD globals.

function buildPreviewShell(compiledCode: string, label: string, theme: 'dark'|'light'): string {
  const jsonSource = JSON.stringify(compiledCode);

  return `<!DOCTYPE html>
<html lang="en" class="${theme}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview: ${label}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: { extend: {} }
    }
  </script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script>window.react = window.React;</script>
  <script src="https://unpkg.com/lucide-react@0.383.0/dist/umd/lucide-react.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; }
    body { padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    #root { min-height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
    html.dark body { background: #000; color: #fff; }
    html.light body { background: #fff; color: #000; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    var __SOURCE__ = ${jsonSource};

    function renderComponent() {
      try {
        // Detect lucide UMD global (pinned version exposes lucideReact)
        var __lucide = (
          typeof lucideReact !== 'undefined' ? lucideReact :
          typeof LucideReact !== 'undefined' ? LucideReact :
          {}
        );

        // React hook stubs
        window.useState    = React.useState;
        window.useEffect   = React.useEffect;
        window.useRef      = React.useRef;
        window.useCallback = React.useCallback;
        window.useMemo     = React.useMemo;
        window.useReducer  = React.useReducer;
        window.cn = function() {
          return Array.prototype.slice.call(arguments).filter(Boolean).join(' ');
        };

        // Framer Motion stub
        window.motion = new Proxy({}, {
          get: function(_, tag) {
            return React.forwardRef(function(_ref, ref) {
              var rest = Object.assign({}, _ref);
              ['initial','animate','exit','transition','variants',
               'whileHover','whileTap','whileInView','viewport'].forEach(function(k){ delete rest[k]; });
              return React.createElement(tag, Object.assign({ ref: ref }, rest));
            });
          }
        });
        window.AnimatePresence = function(p) { return p.children || null; };

        // require() shim — maps CJS require() calls to UMD globals
        // SWC CommonJS output: import { X } from 'lucide-react' → require('lucide-react')
        function require(mod) {
          if (mod === 'react')         return React;
          if (mod === 'react-dom')     return ReactDOM;
          if (mod === 'lucide-react')  return __lucide;
          if (mod === 'framer-motion') return { motion: window.motion, AnimatePresence: window.AnimatePresence };
          console.warn('[preview] Unknown require:', mod);
          return {};
        }

        // Execute CJS module — SWC writes exports.default = Component
        var exports = {};
        var module  = { exports: exports };

        var factory = new Function(
          'require', 'exports', 'module',
          'React', 'useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'useReducer',
          'motion', 'AnimatePresence', 'cn',
          __SOURCE__
        );

        factory(
          require, exports, module,
          React,
          React.useState, React.useEffect, React.useRef,
          React.useCallback, React.useMemo, React.useReducer,
          window.motion, window.AnimatePresence, window.cn
        );

        // Extract default export (SWC CJS sets exports.default = Foo)
        var Component = exports['default'] || module.exports['default'] || module.exports;

        // Fallback: any exported function
        if (typeof Component !== 'function') {
          var keys = Object.keys(exports);
          for (var i = 0; i < keys.length; i++) {
            if (typeof exports[keys[i]] === 'function') { Component = exports[keys[i]]; break; }
          }
        }

        if (typeof Component !== 'function') {
          throw new Error('No React component found. exports: ' + JSON.stringify(Object.keys(exports)));
        }

        ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Component));
        window.parent.postMessage({ type: 'vectra-preview-ready' }, '*');

      } catch (err) {
        var msg = err && err.message ? err.message : String(err);
        console.error('[LivePreview]', msg);
        document.getElementById('root').innerHTML =
          '<div style="padding:20px;color:#ef4444;font-family:monospace;font-size:11px;line-height:1.6;">' +
          '<strong>⚠ Preview error</strong><br><br>' + msg.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>';
        window.parent.postMessage({ type: 'vectra-preview-error', message: msg }, '*');
      }
    }

    window.addEventListener('load', renderComponent);
  </script>
</body>
</html>`;
}
