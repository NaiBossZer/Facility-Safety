// Browser notification queue with retry/backoff. Email delivery is handled by
// the Supabase notification_jobs table/Edge Function, never from a client key.
import { readJSON, writeJSON } from "./storage";
import { nowISO } from "./helpers";

const KEY = "fsa:v2:notificationOutbox";

export function enqueueNotification(notification) {
  const current = readJSON(KEY, []);
  const entry = { id: notification.id || `${Date.now()}-${Math.random()}`, attempts: 0, ...notification, createdAt: nowISO() };
  writeJSON(KEY, [...current.filter((x) => x.id !== entry.id), entry]);
}

export async function flushNotifications() {
  if (!("Notification" in window) || Notification.permission !== "granted") return { pending: readJSON(KEY, []).length };
  const pending = [];
  for (const item of readJSON(KEY, [])) {
    if (item.nextAttemptAt && new Date(item.nextAttemptAt).getTime() > Date.now()) {
      pending.push(item);
      continue;
    }
    try {
      new Notification(item.title, { body: item.body, tag: item.id });
    } catch (error) {
      const attempts = (item.attempts || 0) + 1;
      pending.push({ ...item, attempts, lastError: error.message, nextAttemptAt: new Date(Date.now() + Math.min(300000, 1000 * 2 ** attempts)).toISOString() });
    }
  }
  writeJSON(KEY, pending);
  return { pending: pending.length };
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.requestPermission();
}
