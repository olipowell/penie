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
