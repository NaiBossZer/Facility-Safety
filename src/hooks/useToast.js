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
    (payload, type = "success", duration = defaultDuration) => {
      const id = uid("toast");
      let entry;
      if (typeof payload === "object" && payload !== null) {
        entry = {
          id,
          type: payload.type ?? type,
          title: payload.title ?? null,
          message: payload.message ?? payload.msg ?? null,
          createdAt: Date.now(),
        };
      } else {
        entry = { id, type, title: null, message: payload, createdAt: Date.now() };
      }
      setToasts((list) => [...list, entry]);
      const dur = typeof payload === "object" && payload.duration != null ? payload.duration : duration;
      if (dur > 0) {
        timers.current[id] = setTimeout(() => dismiss(id), dur);
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