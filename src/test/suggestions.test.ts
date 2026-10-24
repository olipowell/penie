import { afterEach, describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { applySuggestion, captureWriting, resolveEditStart } from "@/lib/suggestions";

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