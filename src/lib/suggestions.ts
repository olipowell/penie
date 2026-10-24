import type { Editor } from "@tiptap/core";
import { closeHistory } from "@tiptap/pm/history";

export const EDIT_TOOL = "propose_edit";
export type ProposedEdit = { start: number; original: string; replacement: string; reason: string };
export type WritingSnapshot = { text: string; positions: (number | null)[]; document: string };

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
      if (blocks++) { text += "\n\n"; positions.push(null, null); }
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

export function applySuggestion(editor: Editor, snapshot: WritingSnapshot | undefined, edit: ProposedEdit): boolean {
  if (!snapshot || editor.isDestroyed || JSON.stringify(editor.state.doc.toJSON()) !== snapshot.document) return false;
  const { start, original, replacement } = edit;
  if (!Number.isInteger(start) || start < 0 || !original || original === replacement || snapshot.text.slice(start, start + original.length) !== original) return false;
  const positions = snapshot.positions.slice(start, start + original.length);
  const from = positions[0];
  if (typeof from !== "number" || positions.length !== original.length || positions.some((p, i) => p !== from + i)) return false;
  const to = from + original.length;
  if (editor.state.doc.textBetween(from, to) !== original || replacement.includes("\n")) return false;
  let tr = closeHistory(editor.state.tr);
  tr = replacement ? tr.insertText(replacement, from, to) : tr.delete(from, to);
  editor.view.dispatch(tr);
  // Isolate this accepted edit from typing before and after it: one Undo.
  editor.view.dispatch(closeHistory(editor.state.tr));
  return true;
}