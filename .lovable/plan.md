# Bug 01 — Writing appeared to disappear overnight

## What the code does today
- **Writing** is saved in this browser only, about 0.8s after typing pauses (at least every 4s while typing), and again when the tab is hidden or closed. Up to 3 older copies are kept as backups. On opening, Penie loads the main copy, or the newest good backup if that fails.
- **Conversation with Penie** is held in memory only. It is never saved, so any reload clears it. This is how Milestone 1 was built, not a fault.

## Confirmed findings
1. Losing the conversation after a reload is expected with the current design.
2. When the app loads and finds no saved writing, it shows an empty page with no message. A blank page because nothing was saved and a blank page because the saved copy couldn't be reached look exactly the same. The "Saved at…" label only appears once something has been restored.
3. Saving never checks that the browser actually kept the text. It only catches outright errors.
4. Writing is stored per web address and per browser. The Lovable preview runs Penie inside a frame on Lovable's page, so the browser files that storage under the Lovable site. The Lovable desktop app, a normal browser tab and the published site each have **separate** storage.
5. I found no code path that deletes or overwrites saved writing with an empty page on load.

## Possible explanations (not confirmed)
- **Most likely: the preview's storage was not the same overnight.** Overnight the laptop slept and the preview probably reloaded (after sleep, a reconnect or a rebuild). If the desktop app or the browser treats storage inside the preview frame as temporary or partitioned, the reload would start from empty storage. I can't inspect your machine's storage to prove this.
- The morning session was opened in a different place (desktop app vs browser, or another preview link), which has its own empty storage.
- Less likely: the browser cleared site data or limited storage for embedded frames.
- Unlikely: a fault in Penie's save code. The save and restore order looked correct, and a reload test passed in the earlier build.

Lost **document content** points to storage or environment. Lost **conversation** is expected behaviour either way.

## Smallest reliable fix
No changes to how things look beyond a short status line. No new features.
1. **Ask the browser to keep storage permanently** (the "persistent storage" request) so it is less likely to be cleared.
2. **Check every save:** read the saved copy back. If it doesn't match, show "Couldn't save — your writing is only in this tab" and keep retrying.
3. **Make restoring visible:** on opening, briefly show either "Restored your writing from [date, time]" or "No saved writing found in this browser". An unexpected empty page can then be told apart from a real loss.
4. **Warn about temporary storage:** if the browser says storage may be temporary, show a quiet note suggesting .txt export or opening Penie in its own tab.
5. **Never replace a saved non-empty copy with an empty page** unless you cleared it yourself. Existing backups stay as a safety net.
6. Conversation: no change now, and it stays unsaved for privacy. Saving it can be its own decision later.

## Acceptance criteria
- **Saving:** after typing, the status shows "Saved at…" within 1s of a pause. If the browser stops saving, a clear warning appears.
- **Refreshing:** reloading shows the same text and "Restored your writing from…".
- **Reopening:** closing and reopening the tab or window (same browser, same address) restores the text.
- **Recovering:** if the main copy is damaged, the newest backup loads and the status says so.
- **Empty start:** a first visit, or storage that can't be reached, shows "No saved writing found in this browser" rather than a silent blank page.
- **Overnight check (manual):** open Penie in its own browser tab, write, let the laptop sleep, then reopen. The text is there. Repeat inside the Lovable preview and note any difference.
- Conversation clears on reload, as expected.

## Technical details
- `src/lib/autosave.ts`: `navigator.storage.persist()` / `persisted()`; read-back check in `saveDoc`; `loadDoc` returns its source (main/backup/none); refuse to overwrite a non-empty main copy with an empty doc on first load.
- `src/components/WritingSpace.tsx`: use the load result and persistence state in the existing status text only.
- Add vitest tests for backup fallback, read-back failure and the empty-overwrite guard.
