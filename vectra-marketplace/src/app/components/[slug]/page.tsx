import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Download, Star, ShieldCheck, Sparkles,
  Copy, ExternalLink, Package, Tag, Clock
} from 'lucide-react';
import { getComponentBySlug } from '../../../lib/registry';
import { PropsTable } from '../../../components/PropsTable';
import { CopyButton } from '../../../components/ui/CopyButton';
import type { Metadata } from 'next';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const component = await getComponentBySlug(params.slug);
  if (!component) return { title: 'Not Found — Vectra Marketplace' };
  return {
    title: `${component.label} — Vectra Marketplace`,
    description: component.description,
  };
}

export const revalidate = 300;

export default async function ComponentDetailPage({ params }: PageProps) {
  const component = await getComponentBySlug(params.slug);
  if (!component) notFound();

  const installSnippet = `// In Vectra Studio → Insert Panel → Marketplace
// Search: "${component.label}"
// Or drop directly from the component palette

// Import in your project:
import { ${component.importMeta.exportName} } from '${component.importMeta.packageName || '@vectra/ui'}';`;

  const usageSnippet = component.previewCode
    ?? `<${component.importMeta.exportName} />`;

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <span className="text-white/10">/</span>
          <span className="text-sm text-white/40">{component.category}</span>
          <span className="text-white/10">/</span>
          <span className="text-sm text-white/70">{component.label}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: main content ── */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Header */}
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {component.isOfficial && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5
                                       bg-brand-600/20 text-brand-300 border border-brand-800/40 rounded-full">
                        <ShieldCheck size={10} /> Official
                      </span>
                    )}
                    {component.isVerified && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5
                                       bg-emerald-900/30 text-emerald-300 border border-emerald-800/30 rounded-full">
                        <Sparkles size={10} /> Verified
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 bg-surface-3 text-white/40 rounded-full">
                      v{component.version}
                    </span>
                  </div>
                  <h1 className="font-display text-4xl text-white">{component.label}</h1>
                  <p className="text-white/50 mt-1 font-mono text-sm">{component.name}</p>
                </div>

                <div className="flex items-center gap-3 text-sm text-white/30">
                  <span className="flex items-center gap-1">
                    <Download size={13} />
                    {component.downloads.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={13} />
                    {component.stars}
                  </span>
                </div>
              </div>

              <p className="text-white/60 text-base leading-relaxed">{component.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {component.tags.map(tag => (
                  <span key={tag}
                    className="flex items-center gap-1 text-xs px-2 py-0.5
                               bg-surface-2 text-white/40 border border-white/[0.06] rounded-full">
                    <Tag size={9} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Preview area */}
            <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-surface-2 border-b border-white/[0.06]">
                <span className="text-xs text-white/30 font-mono">Preview</span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
              </div>
              <div className="min-h-48 bg-grid-pattern bg-grid bg-surface-1 flex items-center justify-center p-8">
                {component.previewImageUrl ? (
                  <img
                    src={component.previewImageUrl}
                    alt={component.label}
                    className="max-w-full rounded-xl shadow-2xl"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-white/20">
                    <div className="w-16 h-2 bg-white/10 rounded-full" />
                    <div className="w-24 h-2 bg-white/10 rounded-full" />
                    <div className="w-10 h-2 bg-white/10 rounded-full" />
                    <p className="text-xs mt-2">No preview image</p>
                  </div>
                )}
              </div>
            </div>

            {/* Usage snippet */}
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Usage</h2>
              <div className="relative rounded-xl border border-white/[0.07] bg-surface-1 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-surface-2 border-b border-white/[0.06]">
                  <span className="text-xs text-white/30 font-mono">JSX</span>
                  <CopyButton text={usageSnippet} />
                </div>
                <pre className="p-4 text-sm font-mono text-white/70 overflow-x-auto leading-relaxed">
                  <code>{usageSnippet}</code>
                </pre>
              </div>
            </div>

            {/* Props table */}
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Props</h2>
              <PropsTable props={component.propsSchema} />
            </div>

            {/* Source code */}
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Source</h2>
              <div className="relative rounded-xl border border-white/[0.07] bg-surface-1 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-surface-2 border-b border-white/[0.06]">
                  <span className="text-xs text-white/30 font-mono">{component.importMeta.exportName}.tsx</span>
                  <CopyButton text={component.sourceCode} />
                </div>
                <pre className="p-4 text-sm font-mono text-white/60 overflow-x-auto leading-relaxed max-h-96">
                  <code>{component.sourceCode}</code>
                </pre>
              </div>
            </div>

          </div>

          {/* ── Right: sidebar ── */}
          <div className="flex flex-col gap-4">

            {/* Install in Studio CTA */}
            <div className="rounded-2xl border border-brand-800/40 bg-brand-950/40 p-5 flex flex-col gap-4">
              <div>
                <h3 className="font-semibold text-white text-sm">Use in Studio</h3>
                <p className="text-xs text-white/40 mt-1 leading-relaxed">
                  Open Vectra Studio, go to Insert → Marketplace, and search for this component.
                </p>
              </div>
              <a
                href="https://app.vectra.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-brand-600
                           hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Open Studio <ExternalLink size={13} />
              </a>
            </div>

            {/* Install snippet */}
            <div className="rounded-2xl border border-white/[0.07] bg-surface-1 p-5 flex flex-col gap-3">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Package size={13} className="text-white/40" />
                Install manually
              </h3>
              <div className="relative">
                <pre className="text-xs font-mono text-white/50 leading-relaxed bg-surface-2
                                rounded-lg p-3 overflow-x-auto">
                  <code>{installSnippet}</code>
                </pre>
                <div className="absolute top-2 right-2">
                  <CopyButton text={installSnippet} size="sm" />
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="rounded-2xl border border-white/[0.07] bg-surface-1 p-5 flex flex-col gap-3">
              <h3 className="font-semibold text-white text-sm">Details</h3>
              <dl className="flex flex-col gap-2.5 text-xs">
                {[
                  { label: 'Category',    value: component.category },
                  { label: 'Version',     value: `v${component.version}` },
                  { label: 'Published by', value: component.publishedBy },
                  {
                    label: 'Added',
                    value: new Date(component.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })
                  },
                  { label: 'Downloads',   value: component.downloads.toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <dt className="text-white/30">{label}</dt>
                    <dd className="text-white/70 font-mono">{value}</dd>
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
