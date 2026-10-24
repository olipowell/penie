import type { Editor } from "@tiptap/core";
import { closeHistory } from "@tiptap/pm/history";
import { Mapping } from "@tiptap/pm/transform";

export const EDIT_TOOL = "propose_edit";
export type ProposedEdit = { start?: number; before?: string; after?: string; original: string; replacement: string; reason: string };
export type WritingSnapshot = { text: string; positions: (number | null)[]; document: string };

/** Only real changes can be shown as Accept cards; identical replacements (Bob → Bob) are dropped. */
export function isActionable(edit: ProposedEdit | undefined): edit is ProposedEdit {
  return !!edit && typeof edit.original === "string" && typeof edit.replacement === "string" && edit.original.length > 0 && edit.original !== edit.replacement;
}

/** Resolve verbatim anchors only within the authorised snapshot; never pick the first match. */
export function resolveEditStart(text: string, edit: ProposedEdit): number | undefined {
  if (!edit.original) return undefined;
  // Previously displayed offset-based proposals still require their exact offset.
  if (edit.before === undefined && edit.after === undefined) {
    const start = edit.start;
    return typeof start === "number" && Number.isInteger(start) && start >= 0 && text.slice(start, start + edit.original.length) === edit.original ? start : undefined;
  }
  if (typeof edit.before !== "string" || typeof edit.after !== "string") return undefined;
  const exact = uniqueMatch(text, edit.original, edit.before, edit.after);
  if (exact !== null) return exact;
  // Repeated-word fixes ("was was" → "was") often arrive with context that repeats part
  // of original ("there was " + "was was"). Remove only that verbatim overlap and retry;
  // the result must still be an exact, unique match.
  const before = trimOverlap(edit.before, edit.original, "end");
  const after = trimOverlap(edit.after, edit.original, "start");
  if (before === edit.before && after === edit.after) return undefined;
  return uniqueMatch(text, edit.original, before, after) ?? undefined;
}

/** number = unique match, undefined = ambiguous, null = no match. */
function uniqueMatch(text: string, original: string, before: string, after: string): number | undefined | null {
  let found: number | null = null;
  for (let start = text.indexOf(original); start >= 0; start = text.indexOf(original, start + 1)) {
    const end = start + original.length;
    if (start < before.length || text.slice(start - before.length, start) !== before || text.slice(end, end + after.length) !== after) continue;
    if (found !== null) return undefined;
    found = start;
  }
  return found;
}

const isGap = (c: string) => c === "" || /\s/.test(c);

/** Remove a whole-word piece of original that the context repeats at its edge (e.g. "there was " before "was was"). */
function trimOverlap(context: string, original: string, edge: "start" | "end"): string {
  for (let len = original.length - 1; len > 0; len--) {
    if (edge === "end") {
      // piece = leading words of original, followed in original by whitespace
      const gap = original.charAt(len);
      if (!/\s/.test(gap)) continue;
      const tail = original.slice(0, len) + gap;
      const rest = context.slice(0, context.length - tail.length);
      if (context.endsWith(tail) && isGap(rest.charAt(rest.length - 1))) return rest;
    } else {
      const gap = original.charAt(original.length - len - 1);
      if (!/\s/.test(gap)) continue;
      const head = gap + original.slice(original.length - len);
      const rest = context.slice(head.length);
      if (context.startsWith(head) && isGap(rest.charAt(0))) return rest;
    }
  }
  return context;
}

/** Local-only position map: AI offsets refer to the exact authorised text, not a search. */
export function captureWriting(editor: Editor, selection = false, limit = Infinity): WritingSnapshot {
  const { doc, selection: sel } = editor.state;
  const from = selection ? sel.from : 0;
  const to = selection ? sel.to : doc.content.size;
  let text = "";
  const positions: (number | null)[] = [];
  let blocks = 0;
  doc.descendants((node, pos) => {
    if (pos >= to || pos + node.nodeSize <= from) return false;
    if (node.isTextblock) {
      if (blocks++) { const separator = selection ? "\n" : "\n\n"; text += separator; for (const _ of separator) positions.push(null); }
    }
    if (node.isText && node.text) {
      const a = Math.max(0, from - pos), b = Math.min(node.text.length, to - pos);
      text += node.text.slice(a, b);
      for (let i = a; i < b; i++) positions.push(pos + i);
    } else if (node.type.name === "hardBreak") { text += "\n"; positions.push(null); }
    return true;
  });
  return { text: text.slice(0, limit), positions: positions.slice(0, limit), document: JSON.stringify(doc.toJSON()) };
}

/**
 * Per-snapshot record of changes made by accepted suggestions from the same reply.
 * `expected` is the document as it should look if only those accepted edits happened;
 * any other change (typing, Undo) makes it differ and remaining suggestions are refused.
 */
type Batch = { expected: string; mapping: Mapping; applied: [number, number][] };
const batches = new WeakMap<WritingSnapshot, Batch>();

export function applySuggestion(editor: Editor, snapshot: WritingSnapshot | undefined, edit: ProposedEdit): boolean {
  if (!snapshot || editor.isDestroyed) return false;
  const batch = batches.get(snapshot) ?? { expected: snapshot.document, mapping: new Mapping(), applied: [] };
  if (JSON.stringify(editor.state.doc.toJSON()) !== batch.expected) return false;
  const { original, replacement } = edit;
  // Anchors are always resolved in the original authorised text, never the edited document.
  const start = resolveEditStart(snapshot.text, edit);
  if (start === undefined || original === replacement || replacement.includes("\n")) return false;
  const end = start + original.length;
  // Refuse only if the passage itself overlaps a change already accepted from this reply.
  // Its context may include an accepted change: anchors were verified in the authorised
  // snapshot, and the expected-document check proves only this reply's edits happened since.
  if (batch.applied.some(([a, b]) => start < b && a < end)) return false;
  const positions = snapshot.positions.slice(start, end);
  const first = positions[0];
  if (typeof first !== "number" || positions.length !== original.length || positions.some((p, i) => p !== first + i)) return false;
  const from = batch.mapping.map(first, 1), to = batch.mapping.map(first + original.length, -1);
  if (to - from !== original.length || editor.state.doc.textBetween(from, to) !== original) return false;
  let tr = closeHistory(editor.state.tr);
  tr = replacement ? tr.insertText(replacement, from, to) : tr.delete(from, to);
  editor.view.dispatch(tr);
  // Isolate this accepted edit from typing before and after it: one Undo.
  editor.view.dispatch(closeHistory(editor.state.tr));
  batch.mapping.appendMapping(tr.mapping);
  batch.applied.push([start, end]);
  batch.expected = JSON.stringify(editor.state.doc.toJSON());
  batches.set(snapshot, batch);
  return true;
}