<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- AI calls live only in `src/lib/penie-ai.server.ts` (model constant + Penie instructions) behind the `/api/chat` server route; swap models/providers there. Why: one place to change AI, keys stay server-side.
- Writing is stored only in browser localStorage (`src/lib/autosave.ts`, rotating backups); no accounts or database. Why: privacy-first prototype.
- Never log writing or chat content server-side. Why: privacy is a core requirement.
- Structured correction tools display proposals only; acceptance uses a local document snapshot and exact mapped positions, rejecting changed/ambiguous passages and isolating one undo transaction. Why: AI must never directly edit or select a first text match.
- `ISSUES.md` is the single issue register: read it before work, update it after every investigation/build/verification, work one PEN issue at a time, never renumber or delete IDs, never implement an issue just because it was added. Why: traceable, focused fixes.
