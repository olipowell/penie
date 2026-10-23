# Penie Issue Register — setup plan (revised)

## What gets created
- **`ISSUES.md`** at the top of the project. It's a plain document that isn't part of the app, so users never see it.
- **One rule in `AGENTS.md`:** read and update `ISSUES.md` after every investigation, build and verification. Work on one issue at a time. Never renumber an ID.
- No changes to the app, how it looks, or its tests.

## Register layout
1. Key: types, categories, priorities and statuses.
2. Summary table: ID, title, type, category, priority, status, source, related IDs.
3. One section per issue: description, source, findings, fix, tests, outstanding checks, history.
4. **Future Roadmap**, kept separate from the issues and not given PEN IDs.

**Types:** Confirmed bug / Usability observation / Enhancement / Verification task.
**Priority:** P1 data loss, privacy or blocks use · P2 accessibility, comprehension or overload · P3 polish · P4 later.
**Status:** Reported → Investigating → Fix proposed → Fixed – awaiting verification → Verified → Closed. Also Deferred, Won't fix, Possible duplicate of PEN-x. Both entries in a duplicate pair are kept.
**Sources:** "Bug Report 01 (testing session)", "Build review – Milestone 1", and so on. The original reports stay unchanged and are only referenced.

## Initial register
| ID | Title | Type | Category | Pri | Status |
|---|---|---|---|---|---|
| PEN-001 | Writing disappeared after leaving Penie open overnight | Confirmed bug (cause unconfirmed) | Saving & recovery | P1 | Safeguards implemented; cause unconfirmed; overnight check pending |
| PEN-002 | Conversation clears on reload | Usability observation | Companion | P3 | Deferred (by design, for privacy) |
| PEN-003 | A blank start looked the same as a storage failure | Confirmed bug | Saving & recovery | P1 | Fixed – awaiting verification (backup message not seen on screen) |
| PEN-004 | Saves weren't checked by reading them back | Confirmed bug | Saving & recovery | P1 | Fixed – automated tests pass; manual check pending |
| PEN-005 | Selection highlight vanishes when you click into Penie | Confirmed bug | Selection & sharing | P2 | Fixed – awaiting your verification |
| PEN-006 | Unclear which text is being shared | Usability observation | Selection & sharing | P2 | Fixed – awaiting your verification |
| PEN-007 | Share switch available with nothing selected / 4,000-character limit not stated | Usability observation | Selection & sharing | P2 | Fixed – awaiting your verification (related: PEN-006) |
| PEN-008 | Kept-selection outline is subtle in neutral colours | Usability observation | Visual | P3 | Deferred until branding |
| PEN-009 | Sharing preview not tested with a screen reader | Verification task | Accessibility | P2 | Outstanding |
| PEN-010 | AI content logging | Verification task | Privacy | P1 | AI app context disabled by you: done. Still open: how long the AI provider keeps data |
| PEN-011 | Usage safeguards are best effort only | Enhancement | Reliability / cost | P2 | Outstanding: set a workspace spending cap |
| PEN-012 | Penie's replies are too long and cause cognitive overload | Usability observation | Companion voice | P2 | Reported |
| PEN-013 | Penie's language is too formal and refers to herself in the third person | Usability observation | Companion voice | P2 | Reported (possibly the same cause as PEN-012) |
| PEN-014 | Privacy messaging is repetitive | Usability observation | Privacy / comprehension | P2 | Reported (related: PEN-006) |
| PEN-015 | Typography and line spacing for comfortable reading | Usability observation | Editor / accessibility | P2 | Reported |
| PEN-016 | Saved writing preferences (font, spacing, size) | Enhancement | Accessibility | P3 | Reported (depends on PEN-015) |
| PEN-017 | Optional writing context and personalisation for Penie | Enhancement | Companion | P3 | Reported; needs privacy review (related: PEN-010) |

PEN-012 to PEN-017 are taken from your summary of Bug Report 01. Each section will note "wording to be confirmed against the original report". If any finding there is missing, it gets the next ID.

**Recommended order of what's left:** first verify PEN-001 and PEN-003 to PEN-007, then PEN-012/013 (one change to Penie's guidelines), PEN-014, PEN-015, then PEN-009. The enhancements come after the matching roadmap milestones.

## Future Roadmap (separate, no PEN IDs)
1. Brainstorm / Develop / Improve modes
2. Suggestion cards with Insert / Replace
3. .txt export and refined send labels
4. Accessibility review
5. Apply the brand

## Technical details
- Create `ISSUES.md` at the root. Add one rule to `AGENTS.md`. Add `roadmap.md` noting that this task is done. No changes to source, styles or tests.
