'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  size?: 'sm' | 'md';
}

export function CopyButton({ text, size = 'md' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const iconSize = size === 'sm' ? 11 : 13;

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 transition-colors rounded-md
        ${size === 'sm' ? 'px-1.5 py-1 text-[10px]' : 'px-2.5 py-1.5 text-xs'}
        ${copied
          ? 'text-emerald-400 bg-emerald-900/20'
          : 'text-white/30 hover:text-white/60 bg-surface-3/50 hover:bg-surface-3'
        }`}
      title="Copy to clipboard"
    >
      {copied ? (
        <><Check size={iconSize} /> Copied</>
      ) : (
        <><Copy size={iconSize} /> Copy</>
      )}
    </button>
  );
}
