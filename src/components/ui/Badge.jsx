// ============================================================
// Badge.jsx — Pill / Tag component (shared UI atom)
// ============================================================
import { cx } from "../../lib/helpers";

/**
 * @param {string}  className  — Tailwind classes for colour variant
 * @param {boolean} pulse      — show animated dot before children
 */
export function Badge({ children, className = "", pulse = false }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        className
      )}
    >
      {pulse && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </span>
  );
}

export default Badge;
