'use client';

import { useEffect, useRef, useState } from 'react';

interface LivePreviewProps {
  sourceCode: string;
  label: string;
}

/**
 * Renders a Vectra marketplace component live in a sandboxed iframe.
 * Uses the same approach as Studio's ContainerPreview:
 *   - Injects React, ReactDOM, Lucide, Tailwind CDN into the iframe
 *   - Compiles the TSX source via Babel standalone
 *   - Renders the default export
 *
 * Constraints (matching Studio sandbox rules):
 *   - No import statements in component source (globally injected)
 *   - React, useState, useEffect, motion, Lucide, cn available globally
 */
export function LivePreview({ sourceCode, label }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    setStatus('loading');
    setErrorMsg('');

    // Build the full HTML shell for the iframe
    const html = buildPreviewShell(sourceCode, label);

    // Write into iframe via srcdoc — no cross-origin issues
    iframe.srcdoc = html;

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'vectra-preview-ready') setStatus('ready');
      if (e.data?.type === 'vectra-preview-error') {
        setStatus('error');
        setErrorMsg(e.data.message ?? 'Render error');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sourceCode, label]);

  return (
    <div className="rounded-2xl border border-m3-outlineVariant/30 overflow-hidden bg-m3-surfaceContainerHigh">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-m3-surfaceContainer border-b border-m3-outlineVariant/20">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-xs text-m3-onSurfaceVariant font-mono ml-1">Live Preview — {label}</span>
        </div>
        <div className="flex items-center gap-2">
          {status === 'loading' && (
            <span className="text-[10px] text-m3-onSurfaceVariant/50 animate-pulse">Compiling…</span>
          )}
          {status === 'error' && (
            <span className="text-[10px] text-rose-400">Render error</span>
          )}
          {status === 'ready' && (
            <span className="text-[10px] text-emerald-400">Live</span>
          )}
        </div>
      </div>

      {/* Error overlay */}
      {status === 'error' && (
        <div className="px-4 py-3 bg-rose-950/30 border-b border-rose-800/30 text-xs text-rose-300 font-mono">
          {errorMsg}
        </div>
      )}

      {/* iframe */}
      <iframe
        ref={iframeRef}
        title={`Preview: ${label}`}
        className="w-full border-0 bg-white"
        style={{ height: '480px' }}
        sandbox="allow-scripts"
      />
    </div>
  );
}

// ─── Shell builder ────────────────────────────────────────────────────────────

function buildPreviewShell(sourceCode: string, label: string): string {
  // Escape backticks and template literals in source for safe JS string embedding
  const escapedSource = sourceCode
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview: ${label}</title>

  <!-- Tailwind CDN for styling -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- React 18 -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

  <!-- Babel standalone for TSX/JSX compilation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- Lucide React (UMD) -->
  <script src="https://unpkg.com/lucide-react/dist/umd/lucide-react.js"></script>

  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: transparent; font-family: system-ui, sans-serif; }
    #root { min-height: 100%; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    // Set up globals matching the Studio sandbox environment
    window.React = React;
    window.useState = React.useState;
    window.useEffect = React.useEffect;
    window.useRef = React.useRef;
    window.useCallback = React.useCallback;
    window.useMemo = React.useMemo;
    window.useReducer = React.useReducer;

    // Lucide icons — all available as Lucide.X
    window.Lucide = lucideReact;

    // cn helper (simple version)
    window.cn = (...args) => args.filter(Boolean).join(' ');

    // Framer Motion stub — prevents crashes if component uses motion.*
    window.motion = new Proxy({}, {
      get: (_, tag) => {
        return React.forwardRef(({ children, ...props }, ref) => {
          // Strip motion-specific props
          const { initial, animate, exit, transition, variants,
                  whileHover, whileTap, whileInView, viewport, ...rest } = props;
          return React.createElement(tag, { ...rest, ref }, children);
        });
      }
    });
    window.AnimatePresence = ({ children }) => children;

    function renderComponent() {
      try {
        const source = \`${escapedSource}\`;

        // Strip import statements — everything is globally available
        const stripped = source
          .replace(/^import\\s+.*?;?\\s*$/gm, '')
          .trim();

        // Compile TSX → JS via Babel
        const compiled = Babel.transform(stripped, {
          presets: ['react'],
          filename: 'component.tsx',
        }).code;

        // Execute to get the default export
        const moduleFactory = new Function(
          'React','useState','useEffect','useRef','useCallback','useMemo','useReducer',
          'Lucide','motion','AnimatePresence','cn',
          compiled + '\\n; return typeof exports !== "undefined" ? exports : module?.exports;'
        );

        // Build a require-like environment
        let exports = {};
        let module = { exports };
        const result = moduleFactory(
          React, React.useState, React.useEffect, React.useRef,
          React.useCallback, React.useMemo, React.useReducer,
          lucideReact, window.motion, window.AnimatePresence, window.cn
        );

        // Extract default export
        let Component = result?.default ?? result;

        // If still not found, try eval approach
        if (typeof Component !== 'function') {
          const fnMatch = stripped.match(/export\\s+default\\s+function\\s+(\\w+)/);
          if (fnMatch) {
            const cleanedForEval = stripped
              .replace('export default function', 'function')
              .replace(/export\\s+default\\s+/g, '');
            // eslint-disable-next-line no-new-func
            const evalFn = new Function(
              'React','useState','useEffect','useRef','useCallback','useMemo',
              'Lucide','motion','AnimatePresence','cn',
              cleanedForEval + '\\nreturn ' + fnMatch[1] + ';'
            );
            Component = evalFn(
              React, React.useState, React.useEffect, React.useRef,
              React.useCallback, React.useMemo,
              lucideReact, window.motion, window.AnimatePresence, window.cn
            );
          }
        }

        if (typeof Component !== 'function') {
          throw new Error('Could not extract a React component from source.');
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(Component));

        window.parent.postMessage({ type: 'vectra-preview-ready' }, '*');
      } catch (err) {
        console.error('Preview error:', err);
        document.getElementById('root').innerHTML =
          '<div style="padding:16px;color:#f87171;font-family:monospace;font-size:12px;">' +
          '<strong>Preview error:</strong><br>' + err.message + '</div>';
        window.parent.postMessage({ type: 'vectra-preview-error', message: err.message }, '*');
      }
    }

    // Wait for all scripts to load before rendering
    window.addEventListener('load', renderComponent);
  </script>
</body>
</html>`;
}
