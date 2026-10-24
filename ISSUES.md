# Penie Issue Register

Organisational document only — not part of the app. Created 23 Oct 2026.

## Rules
- PEN IDs are permanent: never reused, renumbered or deleted.
- Adding an issue never triggers work. Investigate and resolve one focused issue at a time.
- Preserve existing working functionality.
- Update this register after each investigation, build and verification (add a dated History line).
- Completed issues stay here, marked Verified or Closed.
- Possible duplicates are linked, not merged; both entries are kept.
- Bug Report numbers refer to testing sessions, not issues. Original reports stay unchanged and are referenced as sources.

## Key
- **Type:** Confirmed bug · Usability observation · Enhancement · Verification task
- **Priority:** P1 data loss, privacy or blocks use · P2 accessibility, comprehension or overload · P3 polish · P4 later
- **Status:** Reported → Investigating → Fix proposed → Fixed – awaiting verification → Verified → Closed. Also: Deferred · Won't fix · Possible duplicate of PEN-x
- **Sources:** BR01 = Bug Report 01 · BR02 = Bug Report 02 · BR03 = Bug Report 03 (testing sessions) · M1 = Milestone 1 build review · BUG01-BUILD / BUG02-BUILD = fix builds

## Summary

| ID | Title | Type | Category | Pri | Status | Source | Related |
|---|---|---|---|---|---|---|---|
| PEN-001 | Writing disappeared after leaving Penie open overnight | Confirmed bug (cause unconfirmed) | Saving & recovery | P1 | Verified in own browser (BR02); Lovable preview/app still differs | BR01, BR02 | PEN-003, PEN-004, PEN-018 |
| PEN-002 | Conversation clears on reload | Usability observation | Companion / privacy | P2 | Reopened (BR03) | BR01, BR03 | PEN-024, PEN-014 |
| PEN-003 | Blank start looked the same as storage failure | Confirmed bug | Saving & recovery | P1 | Fixed – awaiting verification | BR01 investigation | PEN-001 |
| PEN-004 | Saves not checked by reading back | Confirmed bug | Saving & recovery | P1 | Fixed – awaiting verification | BR01 investigation | PEN-001 |
| PEN-005 | Selection highlight vanishes when clicking into Penie | Confirmed bug | Selection & sharing | P2 | Reopened (BR02) | BR01, BR02 | PEN-006, PEN-019, PEN-020 |
| PEN-006 | Unclear which text is being shared | Usability observation | Selection & sharing | P2 | Fixed – awaiting verification | BR01 | PEN-005, PEN-007, PEN-014, PEN-021 |
| PEN-007 | Share switch on with nothing selected; 4,000-char limit not stated | Usability observation | Selection & sharing | P2 | Fixed – awaiting verification | BR01 investigation | PEN-006, PEN-021 |
| PEN-008 | Kept-selection outline subtle in neutral colours | Usability observation | Visual | P3 | Deferred until branding; see PEN-019 | BUG02-BUILD | PEN-005, PEN-019, PEN-020 |
| PEN-009 | Sharing preview not tested with a screen reader | Verification task | Accessibility | P2 | Outstanding | BUG02-BUILD | PEN-006 |
| PEN-010 | AI content logging / retention | Verification task | Privacy | P1 | AI app context disabled (done); provider retention question open | M1 | PEN-017 |
| PEN-011 | AI usage safeguards are best effort only | Enhancement | Reliability / cost | P2 | Outstanding (set workspace spending cap) | M1 | — |
| PEN-012 | Penie's replies too long, prescriptive, repetitive; cognitive overload | Usability observation | Companion voice | P2 | Reported (updated BR03) — next milestone | BR01, BR03 | PEN-013, PEN-024, PEN-029 |
| PEN-013 | Formal language; third person; implies the writer is wrong | Usability observation | Companion voice | P2 | Reported (updated BR03) — next milestone | BR01, BR03 | PEN-012, PEN-029 |
| PEN-014 | Repetitive privacy and permission messaging | Usability observation | Privacy / comprehension | P2 | Reported (updated BR03) | BR01, BR03 | PEN-006, PEN-024 |
| PEN-015 | Typography and line spacing for comfortable reading | Usability observation | Editor / accessibility | P2 | Reported | BR01 | PEN-016 |
| PEN-016 | Saved writing preferences (font, spacing, size) | Enhancement | Accessibility | P3 | Reported | BR01 | PEN-015 |
| PEN-017 | Optional writing context and personalisation | Enhancement | Companion | P3 | Reported (needs privacy review) | BR01 | PEN-010 |
| PEN-018 | Browser writing not shared with Lovable app, other browsers or phones | Usability observation (expected; sync needs accounts) | Saving & recovery | P3 | Deferred (Future Roadmap) | BR02 | PEN-001 |
| PEN-019 | Highlight changes style (fill plus outline) when clicking into Penie | Confirmed bug | Selection & sharing | P2 | Reported | BR02 | PEN-005, PEN-008 |
| PEN-020 | Highlight disappears when Penie closes; should belong to the writer, one pale red style | Confirmed bug / behaviour change | Selection & sharing | P2 | Reported | BR02 | PEN-005, PEN-019 |
| PEN-021 | Sharing preview card is clutter; keep only a simple "Share selected text" switch | Usability observation | Selection & sharing | P2 | Reported | BR02 | PEN-006, PEN-007 |
| PEN-022 | Selection count in top bar ("19 characters, 5 words selected") fading in over word count | Enhancement | Editor | P3 | Reported | BR02 | PEN-021, PEN-027 |
| PEN-023 | Remove "Penie" title in panel; show welcome text only once | Usability observation | Companion | P3 | Reported | BR02 | PEN-014 |
| PEN-024 | Penie asks you to paste text instead of looking at your writing; too many options | Confirmed bug | Companion voice / privacy | P1 | Fixed – awaiting your check | BR02 | PEN-012, PEN-013, PEN-010 |
| PEN-025 | Not clear how to leave focus mode; worry about losing writing | Usability observation | Accessibility | P2 | Reported | BR02 | PEN-026 |
| PEN-026 | Focus mode button: moon icon + "Focus mode", aligned to writing-area edge, visible in focus mode | Enhancement | Editor | P3 | Reported | BR02 | PEN-025 |
| PEN-027 | Move Export left of "Ask Penie"; "Download selection" vs "Download page" | Enhancement | Editor | P3 | Reported | BR02 | PEN-022 |
| PEN-028 | Suggestions can't be applied; add Accept / Still thinking | Enhancement | Companion / editor | P2 | Reported | BR03 | Roadmap item 2, PEN-012 |
| PEN-029 | Response quality differs between browser and Lovable app; one rewrite had a grammar error | Confirmed bug (quality) | Companion voice | P2 | Reported | BR03 | PEN-012, PEN-013 |

**Recommended next order (24 Oct, after BR03):** PEN-012 + PEN-013 (voice, next milestone, kept separate) → PEN-029 (response-quality checks) → PEN-028 (Accept / Still thinking) → PEN-014 (permission messaging) → PEN-002 (conversation persistence + Clear conversation) → PEN-019 + PEN-020 → PEN-021/022/023 → PEN-025/026 → PEN-027 → PEN-015, PEN-009. Enhancements follow the matching roadmap milestones.

---

## Issue details

### PEN-001 — Writing disappeared after leaving Penie open overnight
- **Source:** BR01. **Type:** Confirmed bug (cause unconfirmed). **P1**
- **Description:** Writing was missing after Penie was left open overnight in the Lovable preview.
- **Findings:** No code path found that wipes saved writing. The most likely cause is that the preview's browser storage was temporary or separate (desktop app vs browser, sleep or reload). Not proven.
- **Fix (safeguards):** best-effort persistent-storage request, read-back check on every save, three distinct restore statuses, empty-page overwrite guard during restoration only.
- **Tests:** autosave unit tests pass.
- **Outstanding:** manual overnight check in its own browser tab and in the Lovable preview/desktop app; note whether "Storage may be temporary" appears.
- **History:** 23 Oct — investigated; safeguards built (BUG01-BUILD). 24 Oct — BR02: survived refresh, tab close and overnight in own browser tab. Browser and Lovable app versions differ (see PEN-018).

### PEN-002 — Conversation clears on reload
- **Source:** BR01. **Type:** Usability observation. **P3**
- **Description:** The chat with Penie is lost after a reload.
- **Findings:** By design. The conversation is held in memory only, for privacy.
- **Status:** Reopened (BR03). Oli now wants the conversation to survive refreshing or reopening Penie in the same browser, cleared only when asked.
- **Requirements (for later build):**
  - Keep saved history shown to the writer separate from the context sent to the AI.
  - Restoring history must never grant page access or resend stored writing automatically.
  - After permission is revoked (or expires on reload), don't resend earlier shared writing, including passages quoted in earlier messages.
  - A working **Clear conversation** control ships in the same milestone.
  - Page-reading permission stays temporary and is never saved.
- **History:** 23 Oct — confirmed expected behaviour. 24 Oct — reopened by BR03; requirements recorded.

### PEN-003 — Blank start looked the same as storage failure
- **Source:** BR01 investigation. **Type:** Confirmed bug. **P1**
- **Fix:** distinct statuses: "Restored your writing from…" (incl. backup), "No saved writing found in this browser", "Browser storage isn't available…".
- **Tests:** unit tests pass.
- **Outstanding:** the backup-restore message has not been seen on screen; manual check of each status.
- **History:** 23 Oct — fixed (BUG01-BUILD).

### PEN-004 — Saves not checked by reading back
- **Source:** BR01 investigation. **Type:** Confirmed bug. **P1**
- **Fix:** each save is read back; on mismatch: "Couldn't save — your writing is only in this tab", with retries.
- **Tests:** read-back failure unit test passes.
- **Outstanding:** manual confirmation of "Saved at…" timing.
- **History:** 23 Oct — fixed (BUG01-BUILD).

### PEN-005 — Selection highlight vanishes when clicking into Penie
- **Source:** BR01 (Bug 02 investigation). **Type:** Confirmed bug. **P2**
- **Fix:** the passage stays outlined in the editor while focus is in Penie's panel. The outline is display-only and never saved.
- **Tests:** browser check showed the outline persists and clears on return.
- **Outstanding:** your manual verification.
- **History:** 23 Oct — fixed (BUG02-BUILD). 24 Oct — reopened by BR02: style changes on clicking into Penie and highlight vanishes on close (PEN-019, PEN-020).

### PEN-006 — Unclear which text is being shared
- **Source:** BR01. **Type:** Usability observation. **P2**
- **Fix:** preview card in the panel ("Sharing X characters" plus a quote of the start and end).
- **Tests:** preview/truncation unit tests pass.
- **Outstanding:** your manual verification; a real send has not been checked on screen.
- **History:** 23 Oct — fixed (BUG02-BUILD). 24 Oct — BR02 finds the preview card cluttered (PEN-021).

### PEN-007 — Share switch on with nothing selected; 4,000-char limit not stated
- **Source:** BR01 investigation. **Type:** Usability observation. **P2**
- **Fix:** the switch is disabled with no selection ("Select some writing to share it"); a limit notice appears over 4,000 characters.
- **Tests:** unit tests pass (nothing shared when off or empty; 4,000 cap).
- **Outstanding:** your manual verification; the 4,000+ case has not been checked on screen.
- **History:** 23 Oct — fixed (BUG02-BUILD).

### PEN-008 — Kept-selection outline subtle in neutral colours
- **Source:** BUG02-BUILD. **Type:** Usability observation. **P3**
- **Status:** Deferred until brand colours are applied.

### PEN-009 — Sharing preview not tested with a screen reader
- **Source:** BUG02-BUILD. **Type:** Verification task. **P2**
- **Outstanding:** test with VoiceOver/NVDA: the preview is announced and linked to the switch.

### PEN-010 — AI content logging / retention
- **Source:** M1. **Type:** Verification task. **P1**
- **Done:** AI app context disabled in Lovable by Oli (23 Oct). The app never logs writing or chat server-side.
- **Still open:** what the AI provider retains, and for how long (usage/billing request logs). Keep visible until answered.

### PEN-011 — AI usage safeguards are best effort only
- **Source:** M1. **Type:** Enhancement. **P2**
- **Description:** in-app limits can't guarantee a cost cap.
- **Outstanding:** set a spending limit on Lovable AI in workspace settings (Oli's action).

### PEN-012 — Penie's replies too long; cognitive overload
- **Source:** BR01. **Type:** Usability observation. **P2**
- **Description:** replies are lengthy and overwhelming, especially for neurodivergent writers.
- **Note:** wording to be confirmed against the original report.
- **BR03 findings:** replies are prescriptive, over-detailed and repetitive. Simple tasks should be done without repeatedly offering more help (e.g. "If you want, I can also help make it sound more natural…").
- **History:** 23 Oct — registered. 24 Oct — BR03 findings added; chosen as next milestone with PEN-013.

### PEN-013 — Formal language; third-person self-references
- **Source:** BR01. **Type:** Usability observation. **P2**
- **Description:** Penie should sound conversational and speak as "I", not refer to herself as "Penie".
- **Note:** likely shares a fix with PEN-012 (Penie's guidelines) but is kept separate. Wording to be confirmed against the original report.
- **BR03 findings:** "bob should be Bob" implies the writer is wrong. Penie should separate creative choices from conventional rules and offer guidance without making the writer feel wrong ("nothing is a mistake, but creative interpretation with guidance").
- **History:** 24 Oct — BR03 findings added; next milestone with PEN-012.

### PEN-014 — Repetitive privacy messaging
- **Source:** BR01. **Type:** Usability observation. **P2**
- **Description:** privacy notices and labels repeat too often and add noise.
- **Note:** must keep showing clearly when writing leaves the browser. Related to the PEN-006 preview card. Wording to be confirmed.
- **History:** 24 Oct — PEN-024 reworded the first-send notice and the line under the message box; repetition itself not yet addressed. 24 Oct — BR03: permission state should be clear but unobtrusive, e.g. "Permission to read your writing" with a "Granted" control instead of "Stop"; remove the redundant "This message will be sent. Penie can read this page." line.

### PEN-015 — Typography and line spacing
- **Source:** BR01. **Type:** Usability observation. **P2**
- **Description:** the default type and line spacing aren't comfortable for long writing or reading.
- **Note:** wording to be confirmed.

### PEN-016 — Saved writing preferences
- **Source:** BR01. **Type:** Enhancement. **P3**
- **Description:** let writers choose and keep font, size and spacing preferences.
- **Depends on:** PEN-015.

### PEN-017 — Optional writing context and personalisation
- **Source:** BR01. **Type:** Enhancement. **P3**
- **Description:** writers can optionally tell Penie about their project, goals or needs.
- **Note:** needs a privacy review (what is sent, where it's stored). Related to PEN-010.

### PEN-018 — Writing not shared across the Lovable app, browsers or phones
- **Source:** BR02. **Type:** Usability observation. **P3**
- **Findings:** expected. Writing is stored per browser; the Lovable app and the browser are separate. Syncing across devices would need accounts, outside the prototype.
- **Status:** Deferred (Future Roadmap). **History:** 24 Oct — registered.

### PEN-019 — Highlight changes style when clicking into Penie
- **Source:** BR02. **Type:** Confirmed bug. **P2**
- **Description:** the selection switches to a different fill plus outline when focus moves to Penie. There should be one highlight style (pale red for now) with no other changes.
- **History:** 24 Oct — registered.

### PEN-020 — Highlight disappears when Penie closes
- **Source:** BR02. **Type:** Confirmed bug / behaviour change. **P2**
- **Description:** the highlight belongs to the writer; it should stay whether Penie is open or closed. Penie must not override it.
- **History:** 24 Oct — registered.

### PEN-021 — Sharing preview card is clutter
- **Source:** BR02. **Type:** Usability observation. **P2**
- **Description:** remove "Sharing X characters" and the quote above the message box; keep only a "Share selected text" switch. Count moves to the writing space (PEN-022).
- **Note:** must still show clearly when writing leaves the browser.
- **History:** 24 Oct — registered.

### PEN-022 — Selection details in the top bar
- **Source:** BR02. **Type:** Enhancement. **P3**
- **Description:** when text is selected, the word count fades out and "19 characters, 5 words selected" fades in.
- **History:** 24 Oct — registered.

### PEN-023 — Remove panel title; welcome text once
- **Source:** BR02. **Type:** Usability observation. **P3**
- **Description:** "Ask Penie" already names her, so drop the "Penie" heading in the panel (no branding there for now). Show the welcome text only the first time.
- **History:** 24 Oct — registered.

### PEN-024 — Penie asks you to paste text instead of reading your writing
- **Source:** BR02. **Type:** Confirmed bug. **P1**
- **Description:** "check my punctuation" and "check the text on the left" got replies asking to paste text, plus a list of options. Simple tasks should feel utilitarian, with no extra questions.
- **Findings:** Penie only receives selected text, so she can't see the page.
- **Decision (24 Oct):** Penie may read the page, but only after asking: Allow once / Allow for this page / Not now.
- **Fix:** Penie asks to read the page when a message is about the writing and nothing is selected. A selection always comes first; if text is selected but sharing is off, nothing is shared and Penie doesn't fall back to the page. "Allow for this page" lasts until reload and shows "Penie can read this page" with a Stop button. Pages over 12,000 characters aren't sent. Earlier page reads and selections aren't resent with later messages. Privacy notice reworded (saved locally; sent to the AI provider only when you allow). Short instruction added for simple checks to get direct answers.
- **Tests:** 7 new automated checks (selection beats page, share-off has no fallback, size limit, no resending). Preview run: "hi" didn't ask; "check my punctuation" asked; Allow once sent the page once; the next request asked again; Not now sent nothing; Allow for this page read without asking; Stop made Penie ask again; after reload permission was gone and she asked again; selection with sharing off sent nothing.
- **Outstanding:** your own check. Penie's decision to ask is made by the AI: on early runs she sometimes asked you to paste on a follow-up; after an instruction fix she asked 4 out of 4 times, but it isn't guaranteed. Asking for the page also uses an extra request against the 8-a-minute limit.
- **History:** 24 Oct — registered. 24 Oct — decision recorded, built and tested.

### PEN-025 — Not clear how to leave focus mode
- **Source:** BR02. **Type:** Usability observation (accessibility). **P2**
- **Description:** with focus mode on, there is no visible way out, which caused worry about losing writing. One exit button should stay visible.
- **History:** 24 Oct — registered.

### PEN-026 — Focus mode button placement and icon
- **Source:** BR02. **Type:** Enhancement. **P3**
- **Description:** moon icon with "Focus mode" label, kept in the top bar, moon aligned to the edge of the writing area (not the padding) so it's not left floating.
- **History:** 24 Oct — registered.

### PEN-027 — Export placement and selection download
- **Source:** BR02. **Type:** Enhancement. **P3**
- **Description:** move Export left of "Ask Penie", fixed in place even when selection details fade in. With a selection its label becomes "Download selection", otherwise "Download page" / "Export .txt".
- **History:** 24 Oct — registered.

### PEN-028 — Suggestions can't be applied; add Accept / Still thinking
- **Source:** BR03. **Type:** Enhancement. **P2**
- **Description:** asking Penie to apply changes only produced another chat reply; the page stayed the same. Under a suggested change, show **Accept** (applies only that change, with Undo) and **Still thinking** (changes nothing; message box returns to "When you're ready"). Wording to be decided.
- **Requirements:**
  - Before applying, check the original passage still matches what the suggestion was based on.
  - Apply at the exact intended place, not the first matching text.
  - If the passage has changed or can't be found safely, don't change the writing; explain instead.
  - Every accepted change can be undone.
- **Note:** this is the existing Future Roadmap item 2 (suggestion cards), not new duplicate work. Kept separate from the voice milestone.
- **History:** 24 Oct — registered.

### PEN-029 — Response quality differs between browser and Lovable app
- **Source:** BR03. **Type:** Confirmed bug (quality). **P2**
- **Description:** the same request gave different corrections in the browser and the Lovable app; one rewrite dropped "in" ("He lived a house like a slob").
- **Testing focus:** grammatical accuracy, meaning preserved, consistency with Penie's voice guidelines. Different wording between replies is fine; introducing errors is not.
- **History:** 24 Oct — registered.

---

## Future Roadmap (not issues, no PEN IDs)
1. Brainstorm / Develop / Improve modes
2. Suggestion cards with Insert / Replace (see PEN-028)
3. .txt export and refined send labels
4. Accessibility review
5. Apply the brand
6. Sync writing across browsers and devices (needs accounts; see PEN-018)
