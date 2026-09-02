// ============================================================
// EmptyState.jsx — Illustrated empty / zero-data placeholder
// ============================================================

/**
 * @param {React.ComponentType} icon
 * @param {string} title
 * @param {string} [desc]
 * @param {React.ReactNode} [action] — optional CTA button/link
 */
export function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
      <div className="rounded-2xl bg-slate-100 p-4">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <p className="mt-3 font-semibold text-slate-600">{title}</p>
      {desc && <p className="mt-1 max-w-sm text-sm text-slate-400">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
