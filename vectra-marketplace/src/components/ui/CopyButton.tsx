'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  size?: 'sm' | 'md';
}

export function CopyButton({ text, size = 'md', className = '', ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent<HTMLButtonElement>) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // Call original onClick if provided through the escape hatch
    if (props.onClick) props.onClick(e);
  }


  const iconSize = size === 'sm' ? 11 : 13;

  return (
    <button
      {...props}
      onClick={handleCopy}
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
      className={`flex items-center gap-1.5 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary
        ${size === 'sm' ? 'px-1.5 py-1 text-[10px]' : 'px-2.5 py-1.5 text-xs'}
        ${copied
          ? 'text-emerald-400 bg-emerald-900/20'
          : 'text-white/30 hover:text-white/60 bg-surface-3/50 hover:bg-surface-3'
        } ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <><Check size={iconSize} aria-hidden="true" /> Copied</>
      ) : (
        <><Copy size={iconSize} aria-hidden="true" /> Copy</>
      )}
    </button>
  );
}
