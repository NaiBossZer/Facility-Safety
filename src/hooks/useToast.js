// ============================================================
// useToast.js — จัดการ toast แบบซ้อนหลายอันได้
// ============================================================
import { useState, useCallback, useRef, useEffect } from "react";
import { uid } from "../lib/helpers";

export function useToast(defaultDuration = 3000) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const push = useCallback(
    (message, type = "success", duration = defaultDuration) => {
      const id = uid("toast");
      setToasts((list) => [...list, { id, message, type, createdAt: Date.now() }]);
      if (duration > 0) {
        timers.current[id] = setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [defaultDuration, dismiss]
  );

  const toast = {
    success: (m, d) => push(m, "success", d),
    error:   (m, d) => push(m, "error", d ?? 5000),
    warn:    (m, d) => push(m, "warn", d ?? 4000),
    info:    (m, d) => push(m, "info", d),
  };

  useEffect(() => {
    const t = timers.current;
    return () => Object.values(t).forEach(clearTimeout);
  }, []);

  return { toasts, toast, push, dismiss };
}

export default useToast;