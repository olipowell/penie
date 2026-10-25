import { afterEach, describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { applySuggestion, captureWriting, isActionable, resolveEditStart } from "@/lib/suggestions";

const original = "There once was a man called bob\n\nHe lived in a house like a slob";
const correction = { start: 28, original: "bob", replacement: "Bob", reason: "Names usually take a capital." };
let editor: Editor | undefined;
afterEach(() => editor?.destroy());
function setup(lines = original.split("\n\n")) {
  editor = new Editor({ extensions: [StarterKit], content: { type: "doc", content: lines.map((text) => ({ type: "paragraph", content: [{ type: "text", text }] })) } });
  return editor;
}
describe("PEN-028 safe accepted corrections", () => {
  it("changes only bob to Bob, preserving both lines, rhyme and wording", () => {
    const e = setup();
    expect(applySuggestion(e, captureWriting(e), correction)).toBe(true);
    expect(e.getText()).toBe("There once was a man called Bob\n\nHe lived in a house like a slob");
  });
  it("one Undo restores the exact original", () => {
    const e = setup();
    applySuggestion(e, captureWriting(e), correction);
    expect(e.commands.undo()).toBe(true);
    expect(e.getText()).toBe(original);
  });
  it("does not modify a document changed after sharing", () => {
    const e = setup(), snapshot = captureWriting(e);
    e.commands.insertContentAt(1, "New ");
    const before = e.getJSON();
    expect(applySuggestion(e, snapshot, correction)).toBe(false);
    expect(e.getJSON()).toEqual(before);
  });
  it("uses the intended occurrence, never the first matching bob", () => {
    const e = setup(["bob bob"]);
    expect(applySuggestion(e, captureWriting(e), { ...correction, start: 4 })).toBe(true);
    expect(e.getText()).toBe("bob Bob");
  });
  it("selection offsets target only the shared second occurrence", () => {
    const e = setup(["bob bob"]);
    e.commands.setTextSelection({ from: 5, to: 8 });
    const snapshot = captureWriting(e, true);
    expect(snapshot.text).toBe("bob");
    expect(applySuggestion(e, snapshot, { ...correction, start: 0 })).toBe(true);
    expect(e.getText()).toBe("bob Bob");
  });
  it("fails without an authorised snapshot", () => {
    const e = setup();
    expect(applySuggestion(e, undefined, correction)).toBe(false);
    expect(e.getText()).toBe(original);
  });
  it("fails on an invalid offset rather than searching", () => {
    const e = setup();
    expect(applySuggestion(e, captureWriting(e), { ...correction, start: 26 })).toBe(false);
    expect(e.getText()).toBe(original);
  });
  it("does not join line breaks or rewrite them", () => {
    const e = setup();
    expect(applySuggestion(e, captureWriting(e), { ...correction, start: 28, original: "bob\n\nHe", replacement: "Bob He" })).toBe(false);
    expect(e.getText()).toBe(original);
  });
  it("accepts verbatim context without requiring the AI to count offsets", () => {
    const e = setup(["Yesterday, bob watched the birds."]);
    expect(applySuggestion(e, captureWriting(e), { original: "bob", replacement: "Bob", reason: correction.reason, before: "Yesterday, ", after: " watched" })).toBe(true);
    expect(e.getText()).toBe("Yesterday, Bob watched the birds.");
    expect(e.commands.undo()).toBe(true);
    expect(e.getText()).toBe("Yesterday, bob watched the birds.");
  });
  it("uses context to correct only the intended repeated occurrence", () => {
    const e = setup(["bob met bob near the river."]);
    expect(applySuggestion(e, captureWriting(e), { original: "bob", replacement: "Bob", reason: correction.reason, before: " met ", after: " near" })).toBe(true);
    expect(e.getText()).toBe("bob met Bob near the river.");
  });
  it("rejects repeated text with missing distinguishing context even with a guessed offset", () => {
    const e = setup(["bob bob"]);
    expect(applySuggestion(e, captureWriting(e), { ...correction, start: 0, before: "", after: "" })).toBe(false);
    expect(e.getText()).toBe("bob bob");
  });
  it("rejects equally matching contexts rather than selecting the first", () => {
    expect(resolveEditStart("met bob today; met bob today", { ...correction, before: "met ", after: " today" })).toBeUndefined();
  });
  it("rejects incorrect context even when the original is unique", () => {
    const e = setup(["I met bob today"]);
    expect(applySuggestion(e, captureWriting(e), { ...correction, before: "saw ", after: " today" })).toBe(false);
    expect(e.getText()).toBe("I met bob today");
  });
  it("handles unique originals at text boundaries and empty context", () => {
    expect(resolveEditStart("bob", { ...correction, before: "", after: "" })).toBe(0);
    expect(resolveEditStart("bob left", { ...correction, before: "", after: " left" })).toBe(0);
    expect(resolveEditStart("hello bob", { ...correction, before: "hello ", after: "" })).toBe(6);
  });
  it("does not normalise punctuation, spaces or Unicode in anchors", () => {
    expect(resolveEditStart("“bob”", { ...correction, before: '"', after: '"' })).toBeUndefined();
    expect(resolveEditStart("Hello  bob", { ...correction, before: "Hello ", after: "" })).toBeUndefined();
    expect(resolveEditStart("✨ “bob”", { ...correction, before: "✨ “", after: "”" })).toBe(3);
  });
  it("refuses contextual corrections after the document changes", () => {
    const e = setup(), snapshot = captureWriting(e);
    e.commands.insertContentAt(1, "New ");
    const before = e.getJSON();
    expect(applySuggestion(e, snapshot, { ...correction, before: "called ", after: "\n\nHe" })).toBe(false);
    expect(e.getJSON()).toEqual(before);
  });
  it("resolves context only inside the shared selection", () => {
    const e = setup(["bob bob"]);
    e.commands.setTextSelection({ from: 5, to: 8 });
    expect(applySuggestion(e, captureWriting(e, true), { ...correction, before: "", after: "" })).toBe(true);
    expect(e.getText()).toBe("bob Bob");
  });
  it("rejects context-resolved changes spanning paragraph boundaries", () => {
    const e = setup();
    expect(applySuggestion(e, captureWriting(e), { ...correction, original: "bob\n\nHe", replacement: "Bob He", before: "called ", after: " lived" })).toBe(false);
    expect(e.getText()).toBe(original);
  });
});

describe("PEN-028 multiple suggestions from one reply", () => {
  const lines = ["there was was a man named bob", "who lived in an slob house"];
  const dup = { original: "was was", replacement: "was", reason: "r", before: "there ", after: " a man" };
  const art = { original: "an slob", replacement: "a slob", reason: "r", before: "lived in ", after: " house" };
  const fixed = "there was a man named bob\n\nwho lived in a slob house";

  it("accepts the second after the first shortens the text", () => {
    const e = setup(lines), s = captureWriting(e);
    expect(applySuggestion(e, s, dup)).toBe(true);
    expect(applySuggestion(e, s, art)).toBe(true);
    expect(e.getText()).toBe(fixed);
  });
  it("accepts them in reverse order", () => {
    const e = setup(lines), s = captureWriting(e);
    expect(applySuggestion(e, s, art)).toBe(true);
    expect(applySuggestion(e, s, dup)).toBe(true);
    expect(e.getText()).toBe(fixed);
  });
  it("each accepted suggestion is its own Undo step", () => {
    const e = setup(lines), s = captureWriting(e);
    applySuggestion(e, s, dup); applySuggestion(e, s, art);
    e.commands.undo();
    expect(e.getText()).toBe("there was a man named bob\n\nwho lived in an slob house");
    e.commands.undo();
    expect(e.getText()).toBe(lines.join("\n\n"));
  });
  it("targets the intended repeated occurrence after an earlier length change", () => {
    const e = setup(["the the bob met bob near bob."]), s = captureWriting(e);
    expect(applySuggestion(e, s, { original: "the the", replacement: "the", reason: "r", before: "", after: " bob met" })).toBe(true);
    expect(applySuggestion(e, s, { original: "bob", replacement: "Bob", reason: "r", before: " met ", after: " near" })).toBe(true);
    expect(e.getText()).toBe("the bob met Bob near bob.");
  });
  it("refuses overlapping suggestions", () => {
    const e = setup(lines), s = captureWriting(e);
    expect(applySuggestion(e, s, dup)).toBe(true);
    const before = e.getText();
    expect(applySuggestion(e, s, { original: "was a", replacement: "was one", reason: "r", before: "there was ", after: " man" })).toBe(false);
    expect(e.getText()).toBe(before);
  });
  it("refuses remaining suggestions after the writer edits", () => {
    const e = setup(lines), s = captureWriting(e);
    expect(applySuggestion(e, s, dup)).toBe(true);
    e.commands.insertContentAt(1, "Oh ");
    const before = e.getText();
    expect(applySuggestion(e, s, art)).toBe(false);
    expect(e.getText()).toBe(before);
  });
  it("refuses remaining suggestions after Undo rather than guessing", () => {
    const e = setup(lines), s = captureWriting(e);
    applySuggestion(e, s, dup);
    e.commands.undo();
    expect(applySuggestion(e, s, art)).toBe(false);
    expect(e.getText()).toBe(lines.join("\n\n"));
  });
  it("cannot accept the same suggestion twice", () => {
    const e = setup(lines), s = captureWriting(e);
    expect(applySuggestion(e, s, dup)).toBe(true);
    expect(applySuggestion(e, s, dup)).toBe(false);
  });

  // Oli's 24 Oct preview reports: context of one suggestion included a word another one changed.
  const bobLines = ["There once was a man called bob", "he lived in an house"];
  const bob = { original: "bob", replacement: "Bob", reason: "r", before: "a man called ", after: "\n\nhe lived" };
  const he = { original: "he", replacement: "He", reason: "r", before: "called bob\n\n", after: " lived in an" };
  const an = { original: "an", replacement: "a", reason: "r", before: "he lived in ", after: " house" };
  const bobFixed = "There once was a man called Bob\n\nHe lived in a house";
  for (const order of [[bob, he, an], [an, he, bob], [he, bob, an], [an, bob, he]]) {
    it(`applies independent edits whose context includes another accepted change (${order.map((o) => o.original).join(", ")})`, () => {
      const e = setup(bobLines), s = captureWriting(e);
      for (const o of order) expect(applySuggestion(e, s, o)).toBe(true);
      expect(e.getText()).toBe(bobFixed);
      for (let i = 0; i < 3; i++) expect(e.commands.undo()).toBe(true);
      expect(e.getText()).toBe(bobLines.join("\n\n"));
    });
  }
  it("still refuses a stale context changed by the writer", () => {
    const e = setup(bobLines), s = captureWriting(e);
    expect(applySuggestion(e, s, bob)).toBe(true);
    e.commands.insertContentAt(e.state.doc.content.size - 1, "!");
    expect(applySuggestion(e, s, an)).toBe(false);
    expect(e.getText()).toBe("There once was a man called Bob\n\nhe lived in an house!");
  });
  it("identical replacements are not actionable and never apply", () => {
    expect(isActionable({ original: "Bob", replacement: "Bob", reason: "r" })).toBe(false);
    expect(isActionable({ original: "bob", replacement: "Bob", reason: "r" })).toBe(true);
    const e = setup(["Bob"]);
    expect(applySuggestion(e, captureWriting(e), { original: "Bob", replacement: "Bob", reason: "r", before: "", after: "" })).toBe(false);
  });
});

describe("PEN-028 repeated-word context overlap (Oli, 24 Oct preview)", () => {
  const lines = ["there was was a man named bob", "who lived in an slob house"];
  // Exact proposal from the live model: before repeats the first "was" of original.
  const dup = { original: "was was", replacement: "was", reason: "r", before: "there was ", after: " a man named bob" };
  it("resolves the overlapping before-context to the only real occurrence", () => {
    expect(resolveEditStart(lines.join("\n\n"), dup)).toBe(6);
  });
  it("accepts the repeated-word fix first, then the article fix, with Undo", () => {
    const e = setup(lines), s = captureWriting(e);
    expect(applySuggestion(e, s, dup)).toBe(true);
    expect(applySuggestion(e, s, { original: "an slob", replacement: "a slob", reason: "r", before: "lived in ", after: " house" })).toBe(true);
    expect(e.getText()).toBe("there was a man named bob\n\nwho lived in a slob house");
    e.commands.undo(); e.commands.undo();
    expect(e.getText()).toBe(lines.join("\n\n"));
  });
  it("still refuses when trimming leaves an ambiguous match", () => {
    expect(resolveEditStart("there was was a man; there was was a man", { ...dup, after: " a man" })).toBeUndefined();
  });
  it("never trims partial words", () => {
    expect(resolveEditStart("I saw wash day", { original: "wash", replacement: "wish", reason: "r", before: "I saw wa", after: " day" })).toBeUndefined();
  });
});

describe("PEN-028 malformed live anchors stay refused (synthetic reproduction, 25 Oct)", () => {
  const text = "there was was a man named bob\n\nwho lived in an house";
  it("refuses before/after that omit the boundary space", () => {
    expect(resolveEditStart(text, { original: "was was", replacement: "was", reason: "r", before: "there", after: "a man named bob" })).toBeUndefined();
  });
  it("refuses a boundary space duplicated in original and after", () => {
    expect(resolveEditStart(text, { original: "an ", replacement: "a ", reason: "r", before: "lived in ", after: " house" })).toBeUndefined();
  });
  it("refuses capitalised context that is not verbatim", () => {
    expect(resolveEditStart(text, { original: "was was", replacement: "was", reason: "r", before: "There ", after: " a man" })).toBeUndefined();
  });
  it("resolves the well-formed contract where each boundary space appears once", () => {
    expect(resolveEditStart(text, { original: "was was", replacement: "was", reason: "r", before: "there ", after: " a man" })).toBe(6);
    expect(resolveEditStart(text, { original: "an", replacement: "a", reason: "r", before: "lived in ", after: " house" })).toBe(text.indexOf("an house"));
  });
  it("keeps legitimate whitespace edits in original", () => {
    const t = "a  big dog";
    expect(resolveEditStart(t, { original: "  ", replacement: " ", reason: "r", before: "a", after: "big" })).toBe(1);
  });
});
