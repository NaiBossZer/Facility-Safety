// Encrypted storage adapter for Supabase Auth.
// The AES-GCM key is a non-exportable CryptoKey kept in IndexedDB; ciphertext
// remains in localStorage so browser restarts retain the session without
// exposing the access/refresh token as readable JSON.
const DB_NAME = "fsa-secure-v1";
const STORE = "keys";
const KEY_ID = "supabase-auth";

function openDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error("IndexedDB is unavailable"));
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Cannot open secure storage"));
  });
}

async function getKey() {
  const db = await openDb();
  const existing = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(KEY_ID);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  if (existing) return existing;
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
  );
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(key, KEY_ID);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  return key;
}

function toBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

export const encryptedAuthStorage = {
  async getItem(key) {
    const raw = window.localStorage.getItem(`fsa:secure:${key}`);
    if (!raw) return null;
    try {
      const [ivText, dataText] = raw.split(".");
      const plain = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: fromBase64(ivText) },
        await getKey(),
        fromBase64(dataText)
      );
      return new TextDecoder().decode(plain);
    } catch {
      // Do not return undeciphered auth material.
      window.localStorage.removeItem(`fsa:secure:${key}`);
      return null;
    }
  },
  async setItem(key, value) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const cipher = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv }, await getKey(), new TextEncoder().encode(value)
    );
    window.localStorage.setItem(
      `fsa:secure:${key}`,
      `${toBase64(iv)}.${toBase64(new Uint8Array(cipher))}`
    );
  },
  async removeItem(key) {
    window.localStorage.removeItem(`fsa:secure:${key}`);
  },
};

