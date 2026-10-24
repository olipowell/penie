import { afterEach, describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { applySuggestion, captureWriting } from "@/lib/suggestions";

const original = "There once was a man called bob\n\nHe lived in a house like a slob";
const correction = { start: 27, original: "bob", replacement: "Bob", reason: "Names usually take a capital." };
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
    expect(applySuggestion(e, captureWriting(e), { ...correction, start: 27, original: "bob\n\nHe", replacement: "Bob He" })).toBe(false);
    expect(e.getText()).toBe(original);
  });
});