# Bug 02 — Selected text and Penie

## Current behaviour (from reading the code)
- **What gets shared** comes from the editor's own record of the selection, not from the highlight on screen. When you click into Penie's panel, the editor keeps that record, so "Share my selected text (X characters)" still counts the right passage. Clicking or typing in Penie's box does not change it.
- **Why the highlight disappears:** the blue highlight is drawn by the browser, and browsers only draw it in the area that has focus. Once focus moves to Penie's box, the highlight goes, even though the selection is still stored. Tiptap has no built-in way to keep it showing.
- **Why it's unclear:** the panel only shows a character count. You can't see *which* words will be sent until after you've sent them, when the message shows its "Shared … characters" label.
- **Other gaps:**
  - The switch stays "on" when nothing is selected, and its wording doesn't say that only the first 4,000 characters of a long selection are sent.
  - The selection is read at the moment you press Send. So if you select something new in between, the new passage is what goes. That's correct, but at the moment you can't see it.

Not checked yet: I haven't confirmed this in a live browser. That will be the first build step.

## Underlying issue
Penie's record of what will be shared is reliable. The problem is that nothing on screen shows it once focus leaves the editor.

## Recommended fix (smallest reliable)
1. **Keep the passage marked in the editor.** While Penie's panel is open and the editor isn't focused, the selected passage gets a soft highlight. This uses an existing colour style, so it's not a redesign. When you return to the editor, the normal browser highlight takes over again.
2. **Show a short preview in the panel.** Above the share switch, show a small quote of the selection: the first ~120 characters, "…", then the last ~40 characters, plus the character count. If more than 4,000 characters are selected, say "only the first 4,000 characters will be shared."
3. **Keep the share choice as it is.** The switch stays on by default and you can turn it off. When it's off, the preview fades and says "Not shared." Nothing is ever sent without a selection, and the whole document is never sent.
4. **Changing or clearing the selection.** The preview and highlight update straight away. If you clear the selection, the preview goes, the switch is disabled with the text "Select some writing to share it", and only your message is sent. Messages you've already sent keep their own "Shared…" label.
5. **Accessibility.** The preview is plain text that screen readers can read, and it is linked to the switch so the switch's description includes it. Changes are announced calmly, at most once after the selection settles. Everything still works with the keyboard alone: select with Shift+arrows, then Tab or click into Penie's box.

There are no changes to Penie's replies, her personality, the layout, or how saving works.

## Acceptance criteria
- Select text, then click or tab into Penie's box: the passage stays visibly marked in the editor.
- The panel shows a preview of that exact passage with the right character count.
- The message that gets sent includes exactly the previewed text, or nothing if the switch is off or nothing is selected.
- Select a different passage: the preview and highlight update before you send.
- Clear the selection: the preview disappears, the switch is disabled, and no excerpt is sent.
- A selection over 4,000 characters shows the limit notice, and only 4,000 characters are sent.
- Going back to the editor removes the extra highlight. Typing works normally, undo is unaffected, and the highlight is never saved into your writing.
- Closing Penie removes the highlight.
- Everything works by keyboard alone, and a screen reader announces the preview.

## Technical details
- Small Tiptap extension (ProseMirror plugin) adding an inline `Decoration` over `selection.from–to` when `!view.hasFocus()` and panel open; class styled with an existing token (e.g. `bg-accent`). Decorations are view-only, so not in JSON/history.
- Preview built in `CompanionPanel` from existing `selectedText` prop using `Label`/muted text; switch `disabled={!selectedText}`, `aria-describedby` → preview id.
- Tests: unit test for preview/truncation helper (4000 cap, head/tail) and excerpt-is-undefined when share off or empty; Playwright check of highlight persistence and send payload.
