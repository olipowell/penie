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
- **Sources:** BR01 = Bug Report 01 (testing session) · M1 = Milestone 1 build review · BUG01-BUILD / BUG02-BUILD = fix builds

## Summary

| ID | Title | Type | Category | Pri | Status | Source | Related |
|---|---|---|---|---|---|---|---|
| PEN-001 | Writing disappeared after leaving Penie open overnight | Confirmed bug (cause unconfirmed) | Saving & recovery | P1 | Safeguards implemented; cause unconfirmed; overnight check pending | BR01 | PEN-003, PEN-004 |
| PEN-002 | Conversation clears on reload | Usability observation | Companion | P3 | Deferred (by design, privacy) | BR01 | PEN-001 |
| PEN-003 | Blank start looked the same as storage failure | Confirmed bug | Saving & recovery | P1 | Fixed – awaiting verification | BR01 investigation | PEN-001 |
| PEN-004 | Saves not checked by reading back | Confirmed bug | Saving & recovery | P1 | Fixed – awaiting verification | BR01 investigation | PEN-001 |
| PEN-005 | Selection highlight vanishes when clicking into Penie | Confirmed bug | Selection & sharing | P2 | Fixed – awaiting verification | BR01 | PEN-006 |
| PEN-006 | Unclear which text is being shared | Usability observation | Selection & sharing | P2 | Fixed – awaiting verification | BR01 | PEN-005, PEN-007, PEN-014 |
| PEN-007 | Share switch on with nothing selected; 4,000-char limit not stated | Usability observation | Selection & sharing | P2 | Fixed – awaiting verification | BR01 investigation | PEN-006 |
| PEN-008 | Kept-selection outline subtle in neutral colours | Usability observation | Visual | P3 | Deferred until branding | BUG02-BUILD | PEN-005 |
| PEN-009 | Sharing preview not tested with a screen reader | Verification task | Accessibility | P2 | Outstanding | BUG02-BUILD | PEN-006 |
| PEN-010 | AI content logging / retention | Verification task | Privacy | P1 | AI app context disabled (done); provider retention question open | M1 | PEN-017 |
| PEN-011 | AI usage safeguards are best effort only | Enhancement | Reliability / cost | P2 | Outstanding (set workspace spending cap) | M1 | — |
| PEN-012 | Penie's replies too long; cognitive overload | Usability observation | Companion voice | P2 | Reported | BR01 | PEN-013 |
| PEN-013 | Formal language; Penie refers to herself in third person | Usability observation | Companion voice | P2 | Reported | BR01 | PEN-012 |
| PEN-014 | Repetitive privacy messaging | Usability observation | Privacy / comprehension | P2 | Reported | BR01 | PEN-006 |
| PEN-015 | Typography and line spacing for comfortable reading | Usability observation | Editor / accessibility | P2 | Reported | BR01 | PEN-016 |
| PEN-016 | Saved writing preferences (font, spacing, size) | Enhancement | Accessibility | P3 | Reported | BR01 | PEN-015 |
| PEN-017 | Optional writing context and personalisation | Enhancement | Companion | P3 | Reported (needs privacy review) | BR01 | PEN-010 |

**Recommended next order:** verify PEN-001 and PEN-003 to PEN-007 → PEN-012 and PEN-013 (one change to Penie's guidelines) → PEN-014 → PEN-015 → PEN-009. Enhancements follow the matching roadmap milestones.

---

## Issue details

### PEN-001 — Writing disappeared after leaving Penie open overnight
- **Source:** BR01. **Type:** Confirmed bug (cause unconfirmed). **P1**
- **Description:** Writing was missing after Penie was left open overnight in the Lovable preview.
- **Findings:** No code path found that wipes saved writing. The most likely cause is that the preview's browser storage was temporary or separate (desktop app vs browser, sleep or reload). Not proven.
- **Fix (safeguards):** best-effort persistent-storage request, read-back check on every save, three distinct restore statuses, empty-page overwrite guard during restoration only.
- **Tests:** autosave unit tests pass.
- **Outstanding:** manual overnight check in its own browser tab and in the Lovable preview/desktop app; note whether "Storage may be temporary" appears.
- **History:** 23 Oct — investigated; safeguards built (BUG01-BUILD).

### PEN-002 — Conversation clears on reload
- **Source:** BR01. **Type:** Usability observation. **P3**
- **Description:** The chat with Penie is lost after a reload.
- **Findings:** By design. The conversation is held in memory only, for privacy.
- **Status:** Deferred. Saving the conversation is a separate future decision.
- **History:** 23 Oct — confirmed expected behaviour.

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
- **History:** 23 Oct — fixed (BUG02-BUILD).

### PEN-006 — Unclear which text is being shared
- **Source:** BR01. **Type:** Usability observation. **P2**
- **Fix:** preview card in the panel ("Sharing X characters" plus a quote of the start and end).
- **Tests:** preview/truncation unit tests pass.
- **Outstanding:** your manual verification; a real send has not been checked on screen.
- **History:** 23 Oct — fixed (BUG02-BUILD).

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
- **History:** 23 Oct — registered.

### PEN-013 — Formal language; third-person self-references
- **Source:** BR01. **Type:** Usability observation. **P2**
- **Description:** Penie should sound conversational and speak as "I", not refer to herself as "Penie".
- **Note:** likely shares a fix with PEN-012 (Penie's guidelines) but is kept separate. Wording to be confirmed against the original report.

### PEN-014 — Repetitive privacy messaging
- **Source:** BR01. **Type:** Usability observation. **P2**
- **Description:** privacy notices and labels repeat too often and add noise.
- **Note:** must keep showing clearly when writing leaves the browser. Related to the PEN-006 preview card. Wording to be confirmed.

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

---

## Future Roadmap (not issues, no PEN IDs)
1. Brainstorm / Develop / Improve modes
2. Suggestion cards with Insert / Replace
3. .txt export and refined send labels
4. Accessibility review
5. Apply the brand
