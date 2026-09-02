// ============================================================
// Toast.jsx — Multi-toast notification renderer
// Reads from useAppData().toasts (queue) + useAppData().dismiss
// ============================================================
import { CheckCircle2, XCircle, Bell, AlertTriangle, X } from "lucide-react";
import { useAppData } from "../../store/AppDataProvider";
import { cx } from "../../lib/helpers";

const MAP = {
  success: { bg: "bg-emerald-600", Icon: CheckCircle2 },
  error:   { bg: "bg-red-600",     Icon: XCircle },
  warn:    { bg: "bg-amber-500",   Icon: AlertTriangle },
  info:    { bg: "bg-indigo-600",  Icon: Bell },
};

function ToastItem({ id, type, message, onClose }) {
  const { bg, Icon } = MAP[type] ?? MAP.info;
  return (
    <div
      className={cx(
        "pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl px-4 py-3 text-white shadow-2xl animate-fade",
        bg
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="text-sm leading-relaxed">
        {title && <p className="font-bold">{title}</p>}
        {message && <p className="text-white/85">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="ml-1 rounded-lg p-1 transition hover:bg-white/20"
        aria-label="ปิด"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toast() {
  const { toasts, dismiss } = useAppData();
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-8">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onClose={dismiss} />
      ))}
    </div>
  );
}

export default Toast;
