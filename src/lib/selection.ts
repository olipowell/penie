import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const MAX_EXCERPT = 4000;

/** What would be sent to Penie: nothing unless sharing is on and text is selected. */
export function excerptFor(selected: string, share: boolean): string | undefined {
  return share && selected ? selected.slice(0, MAX_EXCERPT) : undefined;
}

/** Short head…tail preview of a selection. */
export function previewOf(text: string, head = 120, tail = 40): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= head + tail + 1 ? t : `${t.slice(0, head).trimEnd()} … ${t.slice(-tail).trimStart()}`;
}

const key = new PluginKey("penieKeptSelection");

/** Keeps the selection visibly marked while the editor isn't focused (view-only; never saved). */
export const KeptSelection = Extension.create<{ active: () => boolean }>({
  name: "keptSelection",
  addOptions: () => ({ active: () => false }),
  addProseMirrorPlugins() {
    const opts = this.options;
    let pmView: { hasFocus(): boolean } | null = null;
    return [
      new Plugin({
        key,
        props: {
          decorations(state) {
            const { from, to, empty } = state.selection;
            if (empty || !opts.active() || !pmView || pmView.hasFocus()) return null;
            return DecorationSet.create(state.doc, [Decoration.inline(from, to, { class: "penie-kept-selection" })]);
          },
        },
        view(v) {
          pmView = v;
          const refresh = () => v.dispatch(v.state.tr.setMeta(key, true));
          v.dom.addEventListener("focus", refresh);
          v.dom.addEventListener("blur", refresh);
          return { destroy: () => { v.dom.removeEventListener("focus", refresh); v.dom.removeEventListener("blur", refresh); } };
        },
      }),
    ];
  },
});

export const MAX_PAGE = 12000;
export const PAGE_TOOL = "read_page";
export const OMITTED_NOTE = "Page text from this earlier read is not resent, for privacy. You cannot see the page now. For any new request about the writing, call read_page again — never ask the author to paste.";

/**
 * What context a message may carry. A selection always wins: if text is
 * selected, the page tool is never offered — even when sharing is switched off.
 */
export function contextFor(selected: string, share: boolean): { excerpt?: string | undefined; allowPageTool: boolean } {
  return { excerpt: excerptFor(selected, share), allowPageTool: !selected };
}

export type PageOutput = { page: string } | { denied: true } | { tooLong: true; words: number } | { omitted: true; note: string };

/** Answer for a page read the writer has authorised; nothing is sent over the limit. */
export function pageOutput(page: string): PageOutput {
  if (page.length > MAX_PAGE) return { tooLong: true, words: page.trim().split(/\s+/).filter(Boolean).length };
  return { page };
}

type AnyPart = { type: string; output?: unknown; [k: string]: unknown };
type AnyMsg = { role: string; parts: AnyPart[]; metadata?: { excerpt?: string | undefined } | undefined };

/**
 * Minimise retransmission: writing (page reads and selections) is only sent
 * with the turn it was shared for. Earlier turns keep the chat text but the
 * shared writing is replaced with a placeholder.
 */
export function minimiseHistory<M extends AnyMsg>(messages: M[]): M[] {
  let lastUser = -1;
  messages.forEach((m, i) => { if (m.role === "user") lastUser = i; });
  return messages.map((m, i) => {
    if (i >= lastUser) return m;
    const parts = m.parts.map((p) =>
      p.type === `tool-${PAGE_TOOL}` && p.output && typeof p.output === "object" && "page" in (p.output as object)
        ? { ...p, output: { omitted: true, note: OMITTED_NOTE } }
        : p,
    );
    return { ...m, parts, metadata: m.metadata ? { ...m.metadata, excerpt: undefined } : m.metadata };
  });
}
