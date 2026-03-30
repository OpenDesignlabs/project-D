'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Boxes } from 'lucide-react';
import type { PublishComponentPayload, ComponentCategory } from '../../types';

const CATEGORIES: ComponentCategory[] = [
  'basic','layout','forms','media','sections',
  'navigation','marketing','data','feedback','ecommerce'
];

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function PublishPage() {
  const [state, setState] = useState<FormState>('idle');
  const [error, setError] = useState('');
  const [secret, setSecret] = useState('');

  const [form, setForm] = useState<Partial<PublishComponentPayload>>({
    category: 'basic',
    tags: [],
    propsSchema: [],
    defaultProps: {},
    publishedBy: '',
  });

  const [tagsInput, setTagsInput] = useState('');

  function update<K extends keyof PublishComponentPayload>(key: K, value: PublishComponentPayload[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    // Validate required fields
    const required: (keyof PublishComponentPayload)[] = [
      'name','version','slug','label','description','category','sourceCode','publishedBy'
    ];
    for (const field of required) {
      if (!form[field]) {
        setError(`Missing required field: ${field}`);
        return;
      }
    }

    setState('submitting');
    setError('');

    try {
      const payload: PublishComponentPayload = {
        name:        form.name!,
        version:     form.version || '1.0.0',
        slug:        form.slug!,
        label:       form.label!,
        description: form.description!,
        category:    form.category!,
        tags:        tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        importMeta:  form.importMeta ?? { packageName: '', exportName: form.label!, isDefaultExport: true },
        sourceCode:  form.sourceCode!,
        defaultProps: form.defaultProps ?? {},
        propsSchema:  form.propsSchema ?? [],
        publishedBy:  form.publishedBy!,
        previewCode:  form.previewCode,
      };

      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-vectra-publish-secret': secret,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Publish failed');
      }

      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <CheckCircle size={48} className="text-emerald-400" />
          <h1 className="font-display text-3xl text-white">Published!</h1>
          <p className="text-white/50 text-sm">
            Your component is now live in the Marketplace and available in Vectra Studio.
          </p>
          <div className="flex gap-3 mt-2">
            <Link href="/" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm transition-colors">
              Browse Marketplace
            </Link>
            <button
              onClick={() => { setState('idle'); setForm({ category: 'basic', tags: [], propsSchema: [], defaultProps: {}, publishedBy: '' }); }}
              className="px-4 py-2 bg-surface-2 hover:bg-surface-3 text-white/70 rounded-xl text-sm transition-colors border border-white/[0.08]"
            >
              Publish Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Back
          </Link>
          <div className="flex items-center gap-2 ml-2">
            <Boxes size={16} className="text-brand-400" />
            <span className="text-white/70 text-sm font-medium">Publish a Component</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex flex-col gap-8">

          {/* Header */}
          <div>
            <h1 className="font-display text-4xl text-white">Publish a component</h1>
            <p className="text-white/50 mt-2 text-sm leading-relaxed">
              Share your React component with the Vectra community. Once published, it appears
              instantly in the Studio component palette.
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-6">

            {/* Identity */}
            <Section title="Identity">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Component Name *" hint="e.g. vectra:HeroSection or acme:Button">
                  <Input
                    value={form.name ?? ''}
                    onChange={v => update('name', v)}
                    placeholder="vectra:MyComponent"
                    mono
                  />
                </Field>
                <Field label="Slug *" hint="URL-safe, lowercase, hyphens only">
                  <Input
                    value={form.slug ?? ''}
                    onChange={v => update('slug', v.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="my-component"
                    mono
                  />
                </Field>
                <Field label="Label *" hint="Human-readable display name">
                  <Input value={form.label ?? ''} onChange={v => update('label', v)} placeholder="My Component" />
                </Field>
                <Field label="Version" hint="Semver">
                  <Input value={form.version ?? '1.0.0'} onChange={v => update('version', v)} placeholder="1.0.0" mono />
                </Field>
              </div>
              <Field label="Description *">
                <Input value={form.description ?? ''} onChange={v => update('description', v)} placeholder="A short one-line description" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category *">
                  <select
                    value={form.category}
                    onChange={e => update('category', e.target.value as ComponentCategory)}
                    className={selectCls}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Tags" hint="Comma-separated">
                  <Input value={tagsInput} onChange={setTagsInput} placeholder="hero, landing, marketing" />
                </Field>
              </div>
              <Field label="Published by *" hint="Your name or org ID">
                <Input value={form.publishedBy ?? ''} onChange={v => update('publishedBy', v)} placeholder="yourname" mono />
              </Field>
            </Section>

            {/* Import meta */}
            <Section title="Import Identity">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Package Name" hint="npm package or leave empty for native HTML">
                  <Input
                    value={form.importMeta?.packageName ?? ''}
                    onChange={v => update('importMeta', { ...form.importMeta!, packageName: v, exportName: form.importMeta?.exportName ?? '', isDefaultExport: form.importMeta?.isDefaultExport ?? true })}
                    placeholder="@acme/ui"
                    mono
                  />
                </Field>
                <Field label="Export Name *">
                  <Input
                    value={form.importMeta?.exportName ?? ''}
                    onChange={v => update('importMeta', { packageName: form.importMeta?.packageName ?? '', exportName: v, isDefaultExport: form.importMeta?.isDefaultExport ?? true })}
                    placeholder="MyComponent"
                    mono
                  />
                </Field>
              </div>
            </Section>

            {/* Source code */}
            <Section title="Source Code">
              <Field label="TSX Source *" hint="Full component source code">
                <textarea
                  value={form.sourceCode ?? ''}
                  onChange={e => update('sourceCode', e.target.value)}
                  rows={12}
                  placeholder={`export function MyComponent({ children }: { children: React.ReactNode }) {\n  return <div className="p-4">{children}</div>;\n}`}
                  className={`${inputCls} font-mono text-xs resize-y`}
                />
              </Field>
              <Field label="Preview Code" hint="Minimal JSX usage example shown in the catalog">
                <Input
                  value={form.previewCode ?? ''}
                  onChange={v => update('previewCode', v)}
                  placeholder="<MyComponent>Hello</MyComponent>"
                  mono
                />
              </Field>
            </Section>

            {/* Publish secret */}
            <Section title="Authorization">
              <Field label="Publish Secret" hint="Required to publish. Get it from your Vectra admin.">
                <Input
                  value={secret}
                  onChange={setSecret}
                  placeholder="••••••••••••"
                  type="password"
                  mono
                />
              </Field>
            </Section>

            {/* Error */}
            {state === 'error' && (
              <div className="flex items-center gap-2 p-4 bg-rose-950/40 border border-rose-800/40 rounded-xl text-sm text-rose-300">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={state === 'submitting'}
              className="flex items-center justify-center gap-2 w-full py-3 bg-brand-600
                         hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed
                         text-white rounded-xl font-medium transition-colors"
            >
              <Upload size={15} />
              {state === 'submitting' ? 'Publishing...' : 'Publish Component'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Mini form helpers ─────────────────────────────────────────────────────────

const inputCls = `w-full bg-surface-2 border border-white/[0.08] rounded-xl px-3 py-2.5
  text-sm text-white placeholder:text-white/25
  focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20
  transition-colors`;

const selectCls = `${inputCls} cursor-pointer`;

function Input({
  value, onChange, placeholder, mono, type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${inputCls} ${mono ? 'font-mono text-xs' : ''}`}
    />
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div>
        <label className="text-xs font-medium text-white/60">{label}</label>
        {hint && <span className="text-xs text-white/25 ml-2">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 p-6 bg-surface-1 border border-white/[0.06] rounded-2xl">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}
