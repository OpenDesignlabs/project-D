'use client';

import { useState } from 'react';
import { Eye, Code2 } from 'lucide-react';
import { LivePreview } from './LivePreview';
import { CopyButton } from './ui/CopyButton';

interface ComponentTabsProps {
  sourceCode: string;
  compiledCode: string;
  label: string;
  exportName: string;
}

export function ComponentTabs({ sourceCode, compiledCode, label, exportName }: ComponentTabsProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  return (
    <div className="flex flex-col w-full">
      {/* Tabs Header (Magic UI Style) */}
      <div className="flex items-center justify-between border-b border-white/[0.08] mb-6 px-1">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'preview'
                ? 'border-m3-primary text-m3-onSurface'
                : 'border-transparent text-m3-onSurfaceVariant hover:text-m3-onSurface'
            }`}
          >
            <Eye size={16} /> Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'code'
                ? 'border-m3-primary text-m3-onSurface'
                : 'border-transparent text-m3-onSurfaceVariant hover:text-m3-onSurface'
            }`}
          >
            <Code2 size={16} /> Code
          </button>
        </div>
        {activeTab === 'code' && (
          <div className="pb-2">
            <CopyButton text={sourceCode} />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="relative w-full">
        {activeTab === 'preview' ? (
          <LivePreview compiledCode={compiledCode} label={label} />
        ) : (
          <div className="relative w-full max-h-[600px] overflow-auto rounded-2xl bg-[#0d0d0d] border border-white/[0.05] shadow-sm">
             <pre className="p-6 text-[13px] font-mono text-[#e5e5e5] leading-relaxed">
              <code>{sourceCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
