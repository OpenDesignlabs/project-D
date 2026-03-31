'use client';

import { useState } from 'react';
import { Eye, Code2 } from 'lucide-react';
import { LivePreview } from './LivePreview';
import { CopyButton } from './ui/CopyButton';

interface ComponentTabsProps {
  sourceCode: string;
  label: string;
  exportName: string;
}

export function ComponentTabs({ sourceCode, label, exportName }: ComponentTabsProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  return (
    <div className="flex flex-col rounded-2xl border border-m3-outlineVariant/30 bg-m3-surfaceContainer overflow-hidden shadow-sm">
      {/* Tabs Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-m3-surfaceContainerHigh border-b border-m3-outlineVariant/20">
        <div className="flex bg-m3-surfaceContainerHighest/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'preview'
                ? 'bg-m3-surface text-m3-onSurface shadow-sm ring-1 ring-white/10'
                : 'text-m3-onSurfaceVariant/70 hover:text-m3-onSurface hover:bg-white/5'
            }`}
          >
            <Eye size={14} /> Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'code'
                ? 'bg-m3-surface text-m3-onSurface shadow-sm ring-1 ring-white/10'
                : 'text-m3-onSurfaceVariant/70 hover:text-m3-onSurface hover:bg-white/5'
            }`}
          >
            <Code2 size={14} /> Code
          </button>
        </div>
        {activeTab === 'code' && (
          <CopyButton text={sourceCode} />
        )}
      </div>

      {/* Content Area */}
      <div className="bg-m3-background min-h-[400px]">
        {activeTab === 'preview' ? (
          <div className="p-0 h-full">
            <LivePreview sourceCode={sourceCode} label={label} />
          </div>
        ) : (
          <div className="relative w-full h-full max-h-[600px] overflow-auto bg-[#1e1e1e]">
             <pre className="p-5 text-xs font-mono text-[#d4d4d4] leading-relaxed">
              <code>{sourceCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
