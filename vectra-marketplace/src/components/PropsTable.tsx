import type { PropDefinition } from '../types';

interface PropsTableProps {
  props: PropDefinition[];
}

const TYPE_COLORS: Record<string, string> = {
  string:    'text-emerald-400',
  number:    'text-blue-400',
  boolean:   'text-amber-400',
  ReactNode: 'text-violet-400',
  object:    'text-orange-400',
  array:     'text-cyan-400',
  enum:      'text-pink-400',
  color:     'text-rose-400',
  url:       'text-teal-400',
  function:  'text-slate-400',
};

export function PropsTable({ props }: PropsTableProps) {
  if (props.length === 0) {
    return (
      <p className="text-sm text-white/30 italic py-4">
        No props documented for this component.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.07]" role="region" aria-label="Component properties table" tabIndex={0}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.07] bg-surface-2">
            <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Prop</th>
            <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Type</th>
            <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Required</th>
            <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Default</th>
            <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {props.map(prop => (
            <tr key={prop.name} className="hover:bg-surface-2/50 transition-colors">
              <td className="px-4 py-3">
                <code className="font-mono text-xs text-white/80 bg-white/[0.06] px-1.5 py-0.5 rounded">
                  {prop.name}
                </code>
              </td>
              <td className="px-4 py-3">
                <span className={`font-mono text-xs ${TYPE_COLORS[prop.type] ?? 'text-white/50'}`}>
                  {prop.type}
                  {prop.enumValues && (
                    <span className="text-white/30 ml-1">
                      ({prop.enumValues.join(' | ')})
                    </span>
                  )}
                </span>
              </td>
              <td className="px-4 py-3">
                {prop.required ? (
                  <span className="text-xs text-rose-400 font-medium">required</span>
                ) : (
                  <span className="text-xs text-white/20">optional</span>
                )}
              </td>
              <td className="px-4 py-3">
                {prop.defaultValue !== undefined ? (
                  <code className="font-mono text-xs text-amber-300/70">
                    {JSON.stringify(prop.defaultValue)}
                  </code>
                ) : (
                  <span className="text-white/20 text-xs">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-white/50">
                {prop.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
