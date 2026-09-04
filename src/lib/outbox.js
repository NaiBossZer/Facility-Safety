// Offline outbox: durable retry queue for writes that could not reach Supabase.
import { KEYS, readJSON, writeJSON } from "./storage";
import { saveInspection, saveWorkOrder, fetchWorkOrderById, reserveWorkOrderNumber } from "./supabaseData";
import { nowISO } from "./helpers";

const OUTBOX_KEY = "fsa:v2:outbox";
const MAX_ATTEMPTS = 12;

export function readOutbox() {
  return readJSON(OUTBOX_KEY, []);
}

export function enqueueOutbox(kind, data) {
  const current = readOutbox();
  const entry = {
    id: `${kind}:${data.id}`,
    kind,
    data,
    attempts: 0,
    createdAt: nowISO(),
    nextAttemptAt: nowISO(),
  };
  const next = [...current.filter((item) => item.id !== entry.id), entry];
  writeJSON(OUTBOX_KEY, next);
  return entry;
}

export function removeOutbox(kind, id) {
  writeJSON(OUTBOX_KEY, readOutbox().filter((item) => item.id !== `${kind}:${id}`));
}

function backoff(attempts) {
  return Math.min(30 * 60 * 1000, 1000 * (2 ** Math.min(attempts, 10)));
}

async function saveWorkOrderWithConflictResolution(local) {
  // Read-before-write handles edits made on another device while this device
  // was offline. A newer server timestamp wins; local edits are retried only
  // when they are genuinely newer.
  const remote = await fetchWorkOrderById(local.id);
  if (remote && remote.updatedAt && local.updatedAt && new Date(remote.updatedAt) > new Date(local.updatedAt)) {
    return { ok: true, conflict: "server-wins", data: remote };
  }
  try {
    return await saveWorkOrder(local);
  } catch (error) {
    // A duplicate WO number created while offline is repaired with a server
    // allocation before retrying. The row id remains stable for references.
    if (error?.code === "23505" || /duplicate|unique/i.test(error?.message || "")) {
      const reserved = await reserveWorkOrderNumber(local.date);
      const saved = await saveWorkOrder({ ...local, number: reserved.number, updatedAt: nowISO() });
      return { ...saved, replacement: { ...local, number: reserved.number, updatedAt: nowISO() } };
    }
    throw error;
  }
}

/**
 * Retry queued writes. On update conflicts the server row is authoritative
 * unless the local edit is newer; this avoids silently overwriting a newer
 * operator change from another device.
 */
export async function flushOutbox() {
  const current = readOutbox();
  const now = Date.now();
  const pending = [];
  const results = [];
  for (const item of current) {
    if (item.nextAttemptAt && new Date(item.nextAttemptAt).getTime() > now) {
      pending.push(item);
      continue;
    }
    try {
      let synced;
      if (item.kind === "inspection") synced = await saveInspection(item.data);
      else if (item.kind === "work_order") synced = await saveWorkOrderWithConflictResolution(item.data);
      else throw new Error(`Unknown outbox operation: ${item.kind}`);
      if (synced?.conflict === "server-wins" && synced.data) {
        const localOrders = readJSON(KEYS.workOrders, []);
        writeJSON(KEYS.workOrders, [synced.data, ...localOrders.filter((x) => x.id !== synced.data.id)]);
      }
      if (synced?.replacement) {
        const localOrders = readJSON(KEYS.workOrders, []);
        writeJSON(KEYS.workOrders, [synced.replacement, ...localOrders.filter((x) => x.id !== synced.replacement.id)]);
      }
      results.push({ id: item.id, ok: true });
    } catch (error) {
      const attempts = item.attempts + 1;
      if (attempts < MAX_ATTEMPTS) {
        pending.push({
          ...item,
          attempts,
          lastError: error?.message || "network error",
          nextAttemptAt: new Date(Date.now() + backoff(attempts)).toISOString(),
        });
      } else {
        pending.push({ ...item, attempts, deadLetter: true, lastError: error?.message || "failed" });
      }
      results.push({ id: item.id, ok: false, error });
    }
  }
  writeJSON(OUTBOX_KEY, pending);
  return { pending, results };
}

export function outboxStatus() {
  const items = readOutbox();
  return { pending: items.filter((x) => !x.deadLetter).length, failed: items.filter((x) => x.deadLetter).length };
}

export { OUTBOX_KEY };
