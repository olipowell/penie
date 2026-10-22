# Penie — MVP Plan (revised)

**For your imagination.** A calm writing space with one optional AI companion who is warm and curious, and who suggests but never takes over.

## Decisions made
- **AI:** Lovable's built-in AI, using a lower-cost model. The model's name is set in one place so it's easy to change.
- **Saving:** in the browser, with reliable autosave, recovery after a crash or closed tab, and plain-text (.txt) export.
- **Personality:** warm, curious and encouraging. Never patronising, never writes the story for you.
- **Look:** neutral for now. All colours, fonts and spacing live in one central list of style values ("tokens"), ready for your brand.
- **Privacy is core:** send the AI as little as possible, store nothing on the server, and always show when writing is about to leave the browser.

## Architecture

```text
 Browser                                   Lovable server
 ┌───────────────────────────┐            ┌─────────────────────────┐
 │ Editor (Tiptap)            │  only the  │ One "ask Penie" function│
 │ Companion panel (AI chat   │  text you  │ - Penie's guidelines    │──▶ AI model
 │   components)              │  choose ─▶ │ - model name in 1 place │
 │ Autosave in this browser   │ ◀ streamed │ - nothing stored        │
 └───────────────────────────┘    reply    └─────────────────────────┘
```

Switching the AI model or provider later means changing one small server file. Nothing else needs to change.

## Ready-made parts (no custom interface components)
- **Editor:** Tiptap, an established open-source editor with built-in undo and keyboard support.
- **Chat panel:** AI Elements, ready-made chat components for the messages, typing box and streaming replies.
- **Buttons, panels, dialogs and menus:** shadcn/ui, which is built on accessible Radix components.
- **Pop-up notifications:** Sonner.

## MVP features
1. A writing space with autosave, recovery, undo/redo, word count, focus mode and .txt export.
2. An optional companion panel, closed by default.
3. Three modes: Brainstorm, Develop and Improve.
4. Suggestions appear as separate cards, apart from your writing. They only enter your text when you press "Insert" or "Replace", and a single undo reverses that.
5. A privacy notice before anything is first sent, plus a clear label on each message saying exactly what text is being sent.
6. Basic accessibility from day one: everything works with a keyboard, visible focus outlines, screen-reader labels, good contrast, respects the "reduce motion" setting, and readable default type.

**Postponed:** advanced accessibility settings, other export formats, managing multiple projects, accounts.

## Build order
1. **Milestone 1 (building now):** neutral style tokens, the editor, autosave and recovery, undo, and a simple companion panel connected to Penie (free chat about the text you choose to share).
2. Brainstorm / Develop / Improve buttons that use your selected text.
3. Suggestion cards with Insert/Replace.
4. The privacy notice and send labels refined, plus .txt export.
5. Accessibility review.
6. Apply your brand.

## Privacy approach
- By default only the text you select is sent, never the whole document. Sending the whole document needs a deliberate choice.
- The server doesn't save your writing or the conversation, and personal content is kept out of error logs.
- **One thing to check:** Lovable's AI service keeps basic request logs for usage and billing. I'll confirm in the project's AI settings whether the logging of message content can be turned off, and tell you what I find before we call privacy done.

## Milestone 1 scope (to test)
- Open the app and write. Your writing is saved automatically as you go.
- Reload or close the tab and come back: your writing is still there.
- Undo/redo work with buttons and keyboard shortcuts.
- A "Penie" button opens a side panel where you can chat with her about the text you've selected, with replies appearing as she writes them. Nothing she says changes your text.

## Technical details
- Workspace on route `/`. Server function / stream route `api/chat` uses the AI SDK with the Lovable AI Gateway. A `MODEL` constant picks a low-cost model from the live model list.
- Tiptap StarterKit (history). Autosave to localStorage (debounced at about 500ms), plus a backup copy saved when you leave the page.
- One system prompt for Penie, with a mode parameter added in step 2.
- Clear messages if the AI is busy (429) or credits run out (402). Lovable Cloud is not needed.
