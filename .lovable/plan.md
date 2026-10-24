# PEN-024: Let Penie read the current page, with permission

## What happens today
- Penie only gets text from the editor if you've selected some and the share switch is on. Her instructions don't mention a page at all, so when you say "check my punctuation" she has nothing to look at and asks you to paste it.
- The privacy notice promises "The rest of your document is never sent." That wording needs to change along with this decision.
- Writing is sent only when you press Send, and it's never logged. This doesn't change.

## Proposed behaviour
1. **Penie asks only when she needs your page.** If your message is about your writing and nothing is selected, Penie asks to read the page before replying. A small card appears in the panel: "Penie would like to read this page to help." It has three buttons: **Allow once**, **Allow for this page** and **Not now**. A plain "hi" never triggers the card.
2. **Allow once** sends the page for this reply only. **Allow for this page** means Penie won't ask again until you reload or close the tab. This permission is never saved. **Not now** gets a short reply suggesting you select a passage.
3. **A selection always comes first.** If you've selected text, only that text is sent, exactly as it works today. Penie doesn't ask for the page.
4. **Sent only when you ask.** The page is read when you send a message, never in the background. Each reply uses the page as it is at that moment.
5. **Easy to see and undo.** While "Allow for this page" is on, a quiet line under the message box says "Penie can read this page", with a **Stop** button. Each sent message is labelled "Shared this page (N words)" or "Shared N characters", just as selections are labelled now.
6. **Long pages are handled openly.** Up to about 12,000 characters (around 2,000 words), the whole page is sent. A longer page is not cut off silently. The card says the page is too long for Penie to read in full and asks you to select the part you want help with. Nothing is sent.
7. **Your writing stays yours.** Penie only replies in the chat and never changes the editor.
8. **Wording updates.** The privacy notice becomes: "Your writing is only sent when you allow it. Penie doesn't store your writing or conversations." The line under the message box will name what is being sent.
9. **Penie's instructions get the smallest change.** Writing she's given is your current page or selection, so she uses it rather than asking you to paste. Simple checks get a short, direct answer. Wider changes to how talkative she is stay with PEN-012.

## Acceptance criteria
- Two lines written, nothing selected, "check my punctuation": the permission card appears. After you choose Allow once, Penie gives a brief punctuation check of those lines without asking you to paste.
- "Hi" with nothing selected: no card, and no writing is sent.
- With a selection: only the selection is sent, with no card.
- Allow for this page: the next request about your writing has no card. Stop shows the card again next time. A reload resets the permission.
- Not now: no writing is sent.
- A page over the limit: nothing is sent, and the card explains why and asks you to select a passage.
- The editor content is never changed by Penie. Undo history is unaffected.
- Every user message that included writing shows what was shared.
- The server still never logs writing. Requests over the limit are rejected.
- The card and the Stop button work by keyboard and are announced by screen readers.
- Unit tests cover the rules: selection beats page, nothing is sent without permission, the size limit, and permission that resets.

## Register updates
- PEN-024: add the decision (24 Oct), this approach and its status.
- Wording of PEN-014 is affected (privacy notice); add a History line only. No other issues change.

## Technical details
- Use an AI SDK **client-side tool** `read_page` (no `execute` on the server). The model calls it when it needs the page. The client renders the approval card for that tool part and returns either the page text or `{denied:true}` / `{tooLong:true, words}` via `addToolOutput`. It resubmits with `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls`. This only happens because of a user's request, so nothing runs in the background.
- If "allow for this page" is set, the client auto-answers the tool call with the page text. Permission is kept in React state in `WritingSpace`, never persisted.
- When there is a selection, the excerpt stays as it is now, and the tool isn't offered in that request (`body.allowPageTool=false`), so the selection wins.
- Server: in `penie-ai.server.ts`, add the tool definition, cap tool output at `LIMITS.maxPageChars = 12000` and add a short instruction line. In `/api/chat`, validate the size of tool output. There is still no content logging.
- Page text comes from `editor.getText({blockSeparator:"\n\n"})` and is passed to `CompanionPanel` as a getter.
- Pure helpers in `src/lib/selection.ts` (`contextFor`, the limit check) get Vitest tests. A Playwright check covers the two-line punctuation flow.
