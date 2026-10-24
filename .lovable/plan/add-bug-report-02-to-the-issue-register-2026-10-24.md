# Add Bug Report 02 to the Issue Register

Organisational only: no app changes. Bug Report 02 is referenced as source **BR02** and left unchanged.

## Updates to existing issues
- **PEN-001** — History line: BR02 says autosave survived refresh, tab close and overnight in its own browser tab. Status becomes "Verified in browser; Lovable preview/desktop app still differs" (new linked issue PEN-018).
- **PEN-005 / PEN-008** — Linked to PEN-019 and PEN-020. Status reopened to "Reopened (BR02)", because the highlight style changes and the highlight disappears when Penie closes.
- **PEN-006 / PEN-007 / PEN-014** — Linked to PEN-021. The preview card is now reported as clutter.
- **PEN-012 / PEN-013** — Linked to PEN-024 (Penie asks too many questions).

## New issues

| ID | Title | Type | Pri | Related |
|---|---|---|---|---|
| PEN-018 | Writing saved in the browser isn't shared with the Lovable app, other browsers or phones | Usability observation (expected: storage is per browser; syncing would need accounts) | P3 | PEN-001, Roadmap |
| PEN-019 | Highlight changes style (fill plus outline) when you click into Penie | Confirmed bug | P2 | PEN-005, PEN-008 |
| PEN-020 | Highlight disappears when Penie closes; it should belong to the writer and stay one pale red style | Confirmed bug / behaviour change | P2 | PEN-005, PEN-019 |
| PEN-021 | Sharing preview card above the message box is clutter; keep only a simple "Share selected text" switch | Usability observation | P2 | PEN-006, PEN-007 |
| PEN-022 | Show the selection count in the top bar ("19 characters, 5 words selected"), fading in where the word count is | Enhancement | P3 | PEN-021, PEN-027 |
| PEN-023 | Remove the "Penie" title inside the panel; show the welcome text only once | Usability observation | P3 | PEN-014 |
| PEN-024 | Penie asks you to paste text instead of looking at your writing; replies offer too many options | Confirmed bug (Penie can't see the page unless text is selected) | P1 | PEN-012, PEN-013, PEN-010 |
| PEN-025 | Not clear how to leave focus mode; caused worry about losing writing | Usability / accessibility | P2 | — |
| PEN-026 | Focus mode button: moon icon plus "Focus mode" label, lined up with the edge of the writing area, staying visible in focus mode | Enhancement | P3 | PEN-025 |
| PEN-027 | Move Export left of "Ask Penie"; when text is selected it becomes "Download selection", otherwise "Download page" | Enhancement | P3 | PEN-022 |

Notes recorded with the issues:
- **PEN-024** needs a privacy decision before any work. Penie only sees text you select, and never the whole page. If she reads the whole page when you ask, that changes the privacy promise, so it's marked "needs your decision".
- **PEN-018:** syncing across devices would need accounts, which are outside the prototype. It goes to the Future Roadmap and is marked Deferred.

## Updated recommended order
PEN-019 + PEN-020 (highlight) → PEN-021 + PEN-022 + PEN-023 (panel tidy-up) → PEN-025 + PEN-026 (focus mode) → PEN-024 privacy decision, then PEN-012/013/024 together → PEN-027 → remaining items.

## Technical details
- Edit `ISSUES.md` only: summary rows, detail sections and dated History lines (24 Oct). Add the sync item to the Future Roadmap section.
- No source, test or styling changes.
