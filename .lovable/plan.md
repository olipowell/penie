# Penie — MVP Plan

**For your imagination.** A calm writing space with one optional AI companion that suggests and never takes over.

## Guiding principles
- **The author is in charge.** The AI only suggests. Nothing changes your text until you choose "Insert" or "Replace". Every change can be undone.
- **One companion, not a team of agents.** One AI, with a few clear "modes" set by the instructions we give it.
- **Proven building blocks.** Use well-tested, accessible components that already exist (buttons, panels, menus, dialogs). They handle keyboard use and screen readers properly.
- **No accounts, payments or database to start.** Writing is saved in the person's own browser, and they can export it.

## Recommended architecture

```text
 Browser (the app)                          Lovable's server (secure)
 ┌─────────────────────────────┐           ┌──────────────────────────┐
 │ Writing space (editor)      │  request  │ One small "ask companion"│
 │ Companion panel (chat)      │ ────────▶ │ function holding the AI  │──▶ AI model
 │ Saved in this browser       │ ◀──────── │ key + Penie's guidelines │
 └─────────────────────────────┘ streamed  └──────────────────────────┘
                                   reply
```

- **App:** the existing project setup (one page plus a settings panel).
- **Editor:** a proven open-source text editor (Tiptap). It's accessible and supports undo and showing suggested changes.
- **Chat panel:** built from ready-made accessible components, with replies appearing word by word using the standard Vercel AI SDK chat tools. We don't build a chat interface from scratch.
- **AI:** one secure server function. The AI key never reaches the browser. Penie's personality and rules (keep the author's voice, ask before rewriting, plain and kind language) live there in one place.
- **Storage:** saved in the browser for now. Accounts and cloud sync can come later if you need them.

## Lovable AI vs connecting OpenAI directly

| | Lovable built-in AI | Your own OpenAI key |
|---|---|---|
| Setup | Nothing to set up, works straight away | Create an OpenAI account, add a card, paste in a key |
| Models | Includes OpenAI, Google and Anthropic models | OpenAI only |
| Billing | Uses your Lovable workspace credits | Separate OpenAI bill |
| Monitoring | Usage logs, limits and alerts built in | You manage these in OpenAI |
| Switching later | Easy: change one key and address | Same |

**Recommendation:** start with Lovable's built-in AI. It's simpler and just as secure, and you can switch later without redesigning anything.

## Minimum features (MVP)

1. **Writing space.** Full-screen and calm, with a word count, autosave, and a focus mode that hides everything except your text.
2. **Companion panel.** Optional and closed by default. Opened with one button or a keyboard shortcut.
3. **Three ways to get help** (simple buttons, so nobody needs to know how to write a prompt):
   - **Brainstorm:** "Give me ideas for…", or "What could happen next?"
   - **Develop:** questions about characters, setting and plot that help you dig deeper, rather than writing it for you.
   - **Improve:** select some text, then get grammar, clarity or flow suggestions shown side by side, with a short reason for each.
4. **Suggestions you control.** Each suggestion has Insert, Replace selection, Copy and Dismiss buttons. Penie never edits your text automatically, and everything can be undone.
5. **Accessibility settings.** Choose a font (including dyslexia-friendly options), text size, line spacing, light/dark/soft theme, reduced motion, and "explain simply" replies. The whole app works with a keyboard alone.
6. **Projects.** A small list of pieces of writing, with export as a text file or Word-compatible document.

**Not included on purpose:** accounts, subscriptions, sharing, multiple AI agents, AI images, collaboration.

## Build order
1. **Visual base:** neutral colours and fonts set up as "tokens" (one central list of style values), so your brand can be swapped in later in one place.
2. **Writing space:** editor, autosave, word count, focus mode.
3. **Projects list and export.**
4. **Companion panel** connected to the AI, with free chat only.
5. **Brainstorm / Develop / Improve buttons**, using the selected text as context.
6. **Insert/Replace controls** with undo and side-by-side comparison.
7. **Accessibility settings.**
8. **Apply your brand:** logo, colours, fonts and your screen designs.
9. **Testing:** keyboard and screen-reader checks, and a short review of the AI's tone with real writers.

Each step can be tried in the preview before moving on.

## Decisions that need your input
1. **AI provider:** go with the recommended Lovable AI, or your own OpenAI key?
2. **Saving:** is "saved in this browser, and lost if the browser data is cleared, but exportable" OK for the MVP? Or do people need to reach their writing on different devices? That would mean adding sign-in.
3. **Penie's personality:** warm and encouraging, or more like a neutral editor? Should she be called "Penie" in the chat?
4. **Brand files:** when you have them ready, share your logo, colour codes and fonts (or a Figma link). We can apply them at step 8, or earlier if you prefer.

## Technical details
- TanStack Start route `/` for the workspace. Server function `askCompanion` uses the AI SDK and the Lovable AI Gateway (`openai/gpt-6-astra`), streamed replies, and one system prompt with a mode parameter. It shows clear messages for rate-limit (429) and out-of-credits (402) errors.
- Tiptap editor with its undo history. Suggestions are inserted as one transaction, so a single undo reverses them.
- Accessible components from shadcn/ui (Radix). Projects stored in localStorage/IndexedDB.
- The AI receives the selected text, or nearby paragraphs only. Nothing is stored on the server.
