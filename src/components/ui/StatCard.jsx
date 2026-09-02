// ============================================================
// StatCard.jsx — KPI / metric card with icon + footer slot
// ============================================================
import { cx } from "../../lib/helpers";

const TONES = {
  indigo:  { bg: "bg-indigo-50",  fg: "text-indigo-600",  ring: "ring-indigo-100" },
  red:     { bg: "bg-red-50",     fg: "text-red-600",     ring: "ring-red-100" },
  amber:   { bg: "bg-amber-50",   fg: "text-amber-600",   ring: "ring-amber-100" },
  emerald: { bg: "bg-emerald-50", fg: "text-emerald-600", ring: "ring-emerald-100" },
  sky:     { bg: "bg-sky-50",     fg: "text-sky-600",     ring: "ring-sky-100" },
  violet:  { bg: "bg-violet-50",  fg: "text-violet-600",  ring: "ring-violet-100" },
};

/**
 * @param {React.ComponentType} icon
 * @param {string}  label
 * @param {string|number} value
 * @param {string}  [sub]    — secondary text below value
 * @param {string}  [tone]   — colour key: indigo | red | amber | emerald | sky | violet
 * @param {React.ReactNode} [footer] — content below divider
 */
export function StatCard({ icon: Icon, label, value, sub, tone = "indigo", footer }) {
  const t = TONES[tone] ?? TONES.indigo;
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold leading-none text-slate-800">{value}</p>
          {sub && <p className="mt-1.5 text-xs text-slate-400">{sub}</p>}
        </div>
        <div
          className={cx(
            "shrink-0 rounded-xl p-3 ring-8 transition-transform duration-300 group-hover:scale-110",
            t.bg, t.ring
          )}
        >
          <Icon className={cx("h-5 w-5", t.fg)} />
        </div>
      </div>
      {footer && (
        <div className="mt-4 border-t border-dashed border-slate-200 pt-3">{footer}</div>
      )}
    </div>
  );
}

export default StatCard;
