import { beforeEach, describe, expect, it, vi } from "vitest";
import { _resetBackupClock, loadDoc, saveDoc } from "@/lib/autosave";

const doc = (text?: string) => ({
  type: "doc",
  content: [{ type: "paragraph", ...(text ? { content: [{ type: "text", text }] } : {}) }],
});

beforeEach(() => {
  localStorage.clear();
  _resetBackupClock();
  vi.restoreAllMocks();
});

describe("autosave", () => {
  it("reports no saved writing when storage works but is empty", () => {
    expect(loadDoc().kind).toBe("none");
  });

  it("reports storage unavailable (distinct from empty) when the browser blocks it", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    expect(loadDoc().kind).toBe("unavailable");
  });

  it("restores what was saved", () => {
    saveDoc(doc("There once was a man called bob"));
    const r = loadDoc();
    expect(r.kind).toBe("main");
    expect(r.kind === "main" && r.doc.content.content?.[0]?.content?.[0]?.text).toBe("There once was a man called bob");
  });

  it("falls back to the newest backup when the main copy is damaged", () => {
    saveDoc(doc("first"));
    _resetBackupClock();
    saveDoc(doc("second")); // "first" rotates into backup0
    localStorage.setItem("penie.doc.v1", "{broken");
    const r = loadDoc();
    expect(r.kind).toBe("backup");
  });

  it("throws when the saved copy can't be read back", () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue("something else");
    expect(() => saveDoc(doc("hello"))).toThrow();
  });

  it("never overwrites saved writing with an empty page during restoration", () => {
    saveDoc(doc("keep me"));
    expect(saveDoc(doc(), { restoring: true })).toBeNull();
    expect(loadDoc().kind === "main" && JSON.stringify(loadDoc())).toContain("keep me");
  });

  it("allows intentionally clearing all writing", () => {
    saveDoc(doc("delete me"));
    expect(saveDoc(doc())).not.toBeNull();
    expect(JSON.stringify(loadDoc())).not.toContain("delete me");
  });
});
