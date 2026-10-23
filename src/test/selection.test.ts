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
