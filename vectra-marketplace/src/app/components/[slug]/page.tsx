import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Download, Star, ShieldCheck, Sparkles,
  ExternalLink, Package, Tag,
} from 'lucide-react';
import { getComponentBySlug } from '../../../lib/registry';
import { PropsTable } from '../../../components/PropsTable';
import { CopyButton } from '../../../components/ui/CopyButton';
import { ComponentTabs } from '../../../components/ComponentTabs';
import type { Metadata } from 'next';
import { transform } from '@swc/core';

/**
 * Next.js 15+ — params is now a Promise.
 * Must be awaited before accessing any property.
 * See: https://nextjs.org/docs/messages/sync-dynamic-apis
 */
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const component = await getComponentBySlug(slug);
  if (!component) return { title: 'Not Found — Vectra Marketplace' };
  return {
    title: `${component.label} — Vectra Marketplace`,
    description: component.description,
  };
}

export const revalidate = 300;

export default async function ComponentDetailPage({ params }: PageProps) {
  // ← CRITICAL FIX: await params before destructuring (Next.js 15+)
  const { slug } = await params;
  const component = await getComponentBySlug(slug);
  if (!component) notFound();

  const installSnippet = `// In Vectra Studio → Insert Panel → Marketplace
// Search: "${component.label}"

// Import in your project:
import { ${component.importMeta.exportName} } from '${component.importMeta.packageName || '@vectra/ui'}';`;

  const usageSnippet = component.previewCode ?? `<${component.importMeta.exportName} />`;

  // --- SERVER SIDE COMPILATION WITH SWC (Omit 'export default' and jsx) ---
  const swcCodeResult = await transform(component.sourceCode, {
    jsc: {
      parser: { syntax: 'typescript', tsx: true },
      transform: { react: { runtime: 'classic' } },
      target: 'es2015',
    },
    // CommonJS output converts:
    //   import { X } from 'lucide-react'  →  var { X } = require('lucide-react')
    //   import React from 'react'         →  var _react = require('react')
    //   export default function Foo()     →  exports.default = Foo
    // The iframe shell provides a require() shim that maps these to globals.
    module: { type: 'commonjs' },
    isModule: true,
  });
  
  // SWC might leave 'export default' inside. The preview iframe needs to extract it,
  // or we can just pass the compiled JS bundle down to the client.
  const compiledCode = swcCodeResult.code;

  return (
    <div className="min-h-screen bg-m3-background">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-m3-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-m3-onSurfaceVariant hover:text-m3-onSurface transition-colors">
            <ArrowLeft size={14} /> Back
          </Link>
          <span className="text-m3-outlineVariant">/</span>
          <span className="text-sm text-m3-onSurfaceVariant">{component.category}</span>
          <span className="text-m3-outlineVariant">/</span>
          <span className="text-sm text-m3-onSurface">{component.label}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left ── */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Header */}
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {component.isOfficial && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-m3-primaryContainer text-m3-onPrimaryContainer rounded-full">
                        <ShieldCheck size={10} /> Official
                      </span>
                    )}
                    {component.isVerified && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-m3-secondaryContainer text-m3-onSecondaryContainer rounded-full">
                        <Sparkles size={10} /> Verified
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 bg-m3-surfaceContainerHighest text-m3-onSurfaceVariant rounded-full">
                      v{component.version}
                    </span>
                  </div>
                  <h1 className="font-display text-4xl text-m3-onSurface">{component.label}</h1>
                  <p className="text-m3-onSurfaceVariant mt-1 font-mono text-sm">{component.name}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-m3-onSurfaceVariant/60">
                  <span className="flex items-center gap-1"><Download size={13} />{component.downloads.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Star size={13} />{component.stars}</span>
                </div>
              </div>
              <p className="text-m3-onSurfaceVariant leading-relaxed">{component.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {component.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-m3-surfaceContainer text-m3-onSurfaceVariant rounded-full">
                    <Tag size={9} />{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Component Playground ── */}
            <div className="flex flex-col gap-3 mt-4">
              <h2 className="text-xl font-bold text-m3-onSurface">Interactive Preview</h2>
              <p className="text-sm text-m3-onSurfaceVariant/80 leading-relaxed mb-1">
                This is a live, functional sandbox rendering <code className="font-mono text-xs bg-m3-surfaceContainerHighest px-1.5 py-0.5 rounded text-m3-onSurface">{component.importMeta.exportName}</code> locally. Verify animations and logic before installing.
              </p>
              <ComponentTabs sourceCode={component.sourceCode} compiledCode={compiledCode} label={component.label} exportName={component.importMeta.exportName} />
            </div>

            <hr className="border-m3-outlineVariant/20 my-2" />

            {/* Usage */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-bold text-m3-onSurface">Installation & Usage</h2>
              <p className="text-sm text-m3-onSurfaceVariant/80 leading-relaxed mb-1">
                Install the required dependencies, then paste the snippet below into your workflow to start using <code className="font-mono text-xs bg-m3-surfaceContainerHighest px-1.5 py-0.5 rounded text-m3-onSurface">&lt;{component.importMeta.exportName} /&gt;</code>.
              </p>
              <div className="relative rounded-xl border border-m3-outlineVariant/30 bg-m3-surfaceContainer overflow-hidden mt-1 shadow-sm">
                <div className="flex items-center justify-between px-4 py-2 bg-m3-surfaceContainerHigh border-b border-m3-outlineVariant/20">
                  <span className="text-xs text-m3-onSurfaceVariant font-mono">Terminal & JSX</span>
                  <CopyButton text={usageSnippet} />
                </div>
                <pre className="p-5 text-[#d4d4d4] bg-[#1e1e1e] text-sm font-mono overflow-x-auto leading-relaxed">
                  <code>{usageSnippet}</code>
                </pre>
              </div>
            </div>

            <hr className="border-m3-outlineVariant/20 my-2" />

            {/* Props */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-bold text-m3-onSurface">API Reference</h2>
              <p className="text-sm text-m3-onSurfaceVariant/80 leading-relaxed mb-1">
                Below is the standard properties interface for configuring the <code className="font-mono text-xs bg-m3-surfaceContainerHighest px-1.5 py-0.5 rounded text-m3-onSurface">{component.importMeta.exportName}</code>.
              </p>
              <PropsTable props={component.propsSchema} />
            </div>


          </div>

          {/* ── Right sidebar ── */}
          <div className="flex flex-col gap-4">

            <div className="rounded-2xl border border-m3-primary/30 bg-m3-primaryContainer/10 p-5 flex flex-col gap-4">
              <div>
                <h3 className="font-semibold text-m3-onSurface text-sm">Use in Studio</h3>
                <p className="text-xs text-m3-onSurfaceVariant mt-2 leading-relaxed">
                  Open <strong className="text-m3-onSurface">Vectra Studio</strong> → <code className="font-mono text-[10px] bg-m3-surface px-1 py-0.5 rounded text-m3-onSurface">Marketplace panel</code> → click <strong className="text-m3-onSurface">Add</strong> on this component.
                </p>
              </div>
              <a href="https://app.vectra.dev" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-m3-primary hover:opacity-90 text-m3-onPrimary rounded-xl text-sm font-medium transition-opacity">
                Open Studio <ExternalLink size={13} />
              </a>
            </div>

            <div className="rounded-2xl border border-m3-outlineVariant/30 bg-m3-surfaceContainer p-5 flex flex-col gap-3">
              <h3 className="font-semibold text-m3-onSurface text-sm flex items-center gap-2">
                <Package size={13} className="text-m3-onSurfaceVariant" /> Install manually
              </h3>
              <div className="relative mt-1">
                <pre className="text-[11px] font-mono text-m3-onSurfaceVariant/80 leading-relaxed bg-[#1e1e1e] rounded-lg p-4 overflow-x-auto shadow-inner">
                  <code>{installSnippet}</code>
                </pre>
                <div className="absolute top-2 right-2"><CopyButton text={installSnippet} size="sm" /></div>
              </div>
            </div>

            <div className="rounded-2xl border border-m3-outlineVariant/30 bg-m3-surfaceContainer p-5 flex flex-col gap-3">
              <h3 className="font-semibold text-m3-onSurface text-sm">Details</h3>
              <dl className="flex flex-col gap-2.5 text-xs">
                {[
                  { label: 'Category',    value: component.category },
                  { label: 'Version',     value: `v${component.version}` },
                  { label: 'Published by', value: component.publishedBy },
                  { label: 'Added',       value: new Date(component.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) },
                  { label: 'Downloads',   value: component.downloads.toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <dt className="text-m3-onSurfaceVariant/60">{label}</dt>
                    <dd className="text-m3-onSurface font-mono">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
