import { describe, expect, it } from "vitest";
import { excerptFor, previewOf, MAX_EXCERPT } from "@/lib/selection";

describe("shared excerpt", () => {
  it("sends nothing when sharing is off", () => expect(excerptFor("hello", false)).toBeUndefined());
  it("sends nothing when nothing is selected", () => expect(excerptFor("", true)).toBeUndefined());
  it("caps at 4000 characters", () => expect(excerptFor("a".repeat(5000), true)).toHaveLength(MAX_EXCERPT));
  it("sends exact selection when short", () => expect(excerptFor("The fox.", true)).toBe("The fox."));
});

describe("preview", () => {
  it("keeps short text whole", () => expect(previewOf("short passage")).toBe("short passage"));
  it("shows head and tail of long text", () => {
    const p = previewOf("A".repeat(200) + "END");
    expect(p.startsWith("A".repeat(120))).toBe(true);
    expect(p.endsWith("END")).toBe(true);
    expect(p).toContain("…");
  });
});

import { contextFor, pageOutput, minimiseHistory, MAX_PAGE } from "@/lib/selection";

describe("page access rules (PEN-024)", () => {
  it("selection beats page: no page tool when text is selected", () =>
    expect(contextFor("fox", true)).toEqual({ excerpt: "fox", allowPageTool: false }));
  it("sharing off with a selection: nothing shared and no page fallback", () =>
    expect(contextFor("fox", false)).toEqual({ excerpt: undefined, allowPageTool: false }));
  it("no selection: page tool offered, nothing sent yet", () =>
    expect(contextFor("", true)).toEqual({ excerpt: undefined, allowPageTool: true }));
  it("page up to 12,000 characters is sent", () => expect(pageOutput("a".repeat(MAX_PAGE))).toEqual({ page: "a".repeat(MAX_PAGE) }));
  it("page over 12,000 characters sends nothing", () => {
    const o = pageOutput("word ".repeat(3000));
    expect(o).toEqual({ tooLong: true, words: 3000 });
  });
  it("earlier page reads and selections are not resent", () => {
    const msgs = [
      { role: "user", parts: [{ type: "text", text: "check" }], metadata: { excerpt: "secret sel" } },
      { role: "assistant", parts: [{ type: "tool-read_page", output: { page: "secret page" } }] },
      { role: "user", parts: [{ type: "text", text: "thanks" }], metadata: { excerpt: "new sel" } },
    ];
    const out = JSON.stringify(minimiseHistory(msgs));
    expect(out).not.toContain("secret page");
    expect(out).not.toContain("secret sel");
    expect(out).toContain("new sel");
  });
  it("the current turn's page read is kept", () => {
    const msgs = [
      { role: "user", parts: [{ type: "text", text: "check" }] },
      { role: "assistant", parts: [{ type: "tool-read_page", output: { page: "now" } }] },
    ];
    expect(JSON.stringify(minimiseHistory(msgs))).toContain("now");
  });
});
