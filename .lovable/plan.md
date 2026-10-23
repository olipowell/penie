# Penie Issue Register — setup plan

## Approach (simplest possible)
- One plain document in the project: `ISSUES.md` at the top level. It is not part of the app, users never see it, and it changes nothing about how Penie works or looks.
- One short rule added to the project's working notes: read and update `ISSUES.md` after every investigation, build and verification, and work on one issue at a time.
- No new tools, interface or accounts. You can read it in the Lovable code view, or just ask me "show me the register".

## Register layout
1. **Summary table:** ID, title, type, category, priority, status, source, related IDs.
2. **One section per issue:** description, where it was found, findings, fix, tests, outstanding manual checks, history (dated entries).
3. **Key** explaining the fields.

**Fields**
- **ID:** PEN-001, PEN-002… These are permanent. They are never reused or renumbered.
- **Type:** Confirmed bug / Usability observation / Enhancement / Unconfirmed report.
- **Category:** Saving & recovery, Selection & sharing, Companion (AI), Privacy, Accessibility, Editor, Environment.
- **Priority:** P1 (data loss, privacy, blocks use), P2 (accessibility or confusing behaviour), P3 (polish), P4 (future). I set it from user impact, reliability, accessibility and what depends on what.
- **Status:** Reported → Investigating → Fix proposed → Fixed (awaiting verification) → Verified → Closed. Also: Duplicate of PEN-x, Won't fix, Deferred.
- **Duplicates:** both entries stay. The later one is marked "Possible duplicate of PEN-x" until confirmed.

## Initial entries (from Bug Report 01 and our history)
| ID | Title | Type | Priority | Status |
|---|---|---|---|---|
| PEN-001 | Writing disappeared overnight in preview | Confirmed bug (cause partly environmental) | P1 | Fixed — awaiting your overnight check and desktop-app check |
| PEN-002 | Conversation with Penie clears on reload | Usability observation (by design) | P3 | Deferred: save it later, keeping privacy in mind |
| PEN-003 | Blank start looked the same as storage failure | Confirmed bug | P1 | Fixed — backup message not yet checked on screen |
| PEN-004 | Saves weren't checked by reading them back | Confirmed bug | P1 | Fixed — tests pass |
| PEN-005 | Selection highlight vanishes when you click into Penie | Confirmed bug | P2 | Fixed — real send and 4,000+ character case not checked on screen |
| PEN-006 | Unclear which text is being shared | Usability observation | P2 | Fixed (preview card) — needs your review |
| PEN-007 | Share switch stays on with nothing selected | Usability observation | P2 | Fixed — related to PEN-006 |
| PEN-008 | Kept-selection outline is subtle in neutral colours | Usability observation | P3 | Deferred until branding |
| PEN-009 | Screen-reader check of the sharing preview | Accessibility (verification) | P2 | Outstanding |
| PEN-010 | Confirm whether AI content logging can be turned off | Privacy (verification) | P1 | Outstanding |
| PEN-011 | Usage safeguards are best effort; set a workspace spending cap | Enhancement / reliability | P2 | Outstanding (your action) |
| PEN-012… | Brainstorm/Develop/Improve, suggestion cards, .txt export, accessibility review, branding | Enhancement | P4 (roadmap) | Not started |

**New issues from your later testing:** I only have Bug Report 01 as you described it in chat. Please paste the new observations (and any parts of Bug Report 01 I haven't covered). They'll get the next IDs, marked as "Unconfirmed report" with their testing session, and any likely duplicates will be flagged.

## Working rules recorded in the register
- Adding an issue never triggers work. You choose what's next.
- One focused issue per investigation or build. Leave working features alone.
- Update the register after each step. Completed issues stay, marked Verified or Closed.

## Technical details
- Create `ISSUES.md` at the project root. Add one rule to `AGENTS.md` pointing to it. No source, style or test changes.
