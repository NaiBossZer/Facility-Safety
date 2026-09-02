// ============================================================
// SectionTitle.jsx — Page/section heading with optional icon + right slot
// ============================================================

/**
 * @param {React.ComponentType} [icon]
 * @param {string} title
 * @param {string} [desc]
 * @param {React.ReactNode} [right] — right-aligned slot (e.g. Badge, button)
 */
export function SectionTitle({ icon: Icon, title, desc, right }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="rounded-lg bg-slate-800 p-2 text-white shadow-sm">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          {desc && <p className="text-xs text-slate-500">{desc}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export default SectionTitle;
