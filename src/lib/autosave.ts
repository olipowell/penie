// Local-only document storage with rotating backups for recovery.
import type { JSONContent } from "@tiptap/react";

const KEY = "penie.doc.v1";
const BACKUPS = 3;

export type SavedDoc = { content: JSONContent; savedAt: number };
export type LoadResult =
  | { kind: "main" | "backup"; doc: SavedDoc }
  | { kind: "none" }
  | { kind: "unavailable" };

function valid(raw: string | null): SavedDoc | null {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as SavedDoc;
    if (d && typeof d.savedAt === "number" && d.content?.type === "doc") return d;
  } catch {
    /* corrupted copy */
  }
  return null;
}

/** True only if the browser lets us write and read back a value. */
export function storageWorks(): boolean {
  try {
    const k = "penie.probe";
    localStorage.setItem(k, "1");
    const ok = localStorage.getItem(k) === "1";
    localStorage.removeItem(k);
    return ok;
  } catch {
    return false;
  }
}

export function loadDoc(): LoadResult {
  if (!storageWorks()) return { kind: "unavailable" };
  const main = valid(localStorage.getItem(KEY));
  if (main) return { kind: "main", doc: main };
  for (let i = 0; i < BACKUPS; i++) {
    const b = valid(localStorage.getItem(`${KEY}.backup${i}`));
    if (b) return { kind: "backup", doc: b };
  }
  return { kind: "none" };
}

export function isEmptyDoc(content: JSONContent | undefined): boolean {
  const walk = (n: JSONContent | undefined): boolean =>
    !n || (!(n.text && n.text.trim()) && (n.content ?? []).every(walk));
  return walk(content);
}

let lastBackupAt = 0;
export const _resetBackupClock = () => { lastBackupAt = 0; };

/**
 * Saves and verifies by reading back. Throws if the browser didn't keep it.
 * When `restoring` is true, an empty doc never overwrites a non-empty saved copy
 * (returns null instead). Intentional clears happen with restoring=false.
 */
export function saveDoc(content: JSONContent, opts: { restoring?: boolean } = {}): number | null {
  if (opts.restoring && isEmptyDoc(content)) {
    const existing = valid(localStorage.getItem(KEY));
    if (existing && !isEmptyDoc(existing.content)) return null;
  }
  const savedAt = Date.now();
  const payload = JSON.stringify({ content, savedAt } satisfies SavedDoc);
  // Rotate a backup at most once a minute so older good copies survive.
  if (savedAt - lastBackupAt > 60_000) {
    for (let i = BACKUPS - 1; i > 0; i--) {
      const prev = localStorage.getItem(`${KEY}.backup${i - 1}`);
      if (prev) localStorage.setItem(`${KEY}.backup${i}`, prev);
    }
    const current = localStorage.getItem(KEY);
    if (current) localStorage.setItem(`${KEY}.backup0`, current);
    lastBackupAt = savedAt;
  }
  localStorage.setItem(KEY, payload);
  if (localStorage.getItem(KEY) !== payload) throw new Error("Save verification failed");
  return savedAt;
}

/** Best effort: browsers may refuse, and even "persisted" is not a guarantee. */
export async function requestPersistence(): Promise<"persisted" | "temporary" | "unsupported"> {
  try {
    if (!navigator.storage?.persist) return "unsupported";
    if (await navigator.storage.persisted()) return "persisted";
    return (await navigator.storage.persist()) ? "persisted" : "temporary";
  } catch {
    return "unsupported";
  }
}

const CONSENT = "penie.privacyConsent.v1";
export const hasConsent = () => localStorage.getItem(CONSENT) === "yes";
export const giveConsent = () => localStorage.setItem(CONSENT, "yes");
