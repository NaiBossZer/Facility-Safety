import { cx } from "../../lib/helpers";

export function Card({ children, className, noPadding = false }) {
  return (
    <div className={cx("rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      <div className={cx(!noPadding && "p-6")}>{children}</div>
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}