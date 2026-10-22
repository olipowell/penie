// Local-only document storage with rotating backups for recovery.
import type { JSONContent } from "@tiptap/react";

const KEY = "penie.doc.v1";
const BACKUPS = 3;

export type SavedDoc = { content: JSONContent; savedAt: number };

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

export function loadDoc(): SavedDoc | null {
  const main = valid(localStorage.getItem(KEY));
  if (main) return main;
  for (let i = 0; i < BACKUPS; i++) {
    const b = valid(localStorage.getItem(`${KEY}.backup${i}`));
    if (b) return b;
  }
  return null;
}

let lastBackupAt = 0;

export function saveDoc(content: JSONContent): number {
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
  return savedAt;
}

const CONSENT = "penie.privacyConsent.v1";
export const hasConsent = () => localStorage.getItem(CONSENT) === "yes";
export const giveConsent = () => localStorage.setItem(CONSENT, "yes");
