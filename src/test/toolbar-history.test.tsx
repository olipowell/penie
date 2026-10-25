import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { Editor } from "@tiptap/core";
import { closeHistory } from "@tiptap/pm/history";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WritingSpace } from "@/components/WritingSpace";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// A browser focuses a button between mousedown and mouseup. A click-only
// fireEvent skips the editor blur that caused PEN-030.
async function clickToolbar(name: string) {
  const button = screen.getByRole("button", { name });
  expect(button).toBeEnabled();
  fireEvent.mouseDown(button);
  act(() => button.focus());
  fireEvent.mouseUp(button);
  fireEvent.click(button);
  // Tiptap restores editor focus on the next animation frame.
  await waitFor(() => expect(screen.getByRole("textbox", { name: "Your writing" })).toHaveFocus());
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  // jsdom has no text-range layout; provide geometry only for ProseMirror's
  // scroll-to-selection. Keep the actual focus and history behaviour intact.
  Object.defineProperties(Range.prototype, {
    getClientRects: { configurable: true, value: () => [] },
    getBoundingClientRect: {
      configurable: true,
      value: () => document.createElement("span").getBoundingClientRect(),
    },
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(Range.prototype, "getClientRects");
  Reflect.deleteProperty(Range.prototype, "getBoundingClientRect");
});

describe("PEN-030 toolbar history", () => {
  it("undoes and redoes successive writing steps through the toolbar", async () => {
    render(<WritingSpace />);
    const writing = await screen.findByRole("textbox", { name: "Your writing" });
    await waitFor(() => expect(writing).toHaveFocus());
    const editor = (writing as HTMLElement & { editor: Editor }).editor;

    // Seed real editing transactions as separate typing bursts. jsdom does not
    // implement native contenteditable typing; history and toolbar stay real.
    for (const text of ["First. ", "Second. ", "Third."]) {
      act(() => {
        editor.view.dispatch(closeHistory(editor.state.tr));
        editor.commands.insertContent(text);
      });
    }
    expect(writing).toHaveTextContent("First. Second. Third.");
    for (const expected of ["First. Second.", "First.", ""]) {
      await clickToolbar("Undo (Ctrl/Cmd+Z)");
      expect(writing.textContent?.trim()).toBe(expected);
    }
    expect(screen.getByRole("button", { name: "Undo (Ctrl/Cmd+Z)" })).toBeDisabled();
    for (const expected of ["First.", "First. Second.", "First. Second. Third."]) {
      await clickToolbar("Redo (Ctrl/Cmd+Shift+Z)");
      expect(writing.textContent?.trim()).toBe(expected);
    }
    expect(screen.getByRole("button", { name: "Redo (Ctrl/Cmd+Shift+Z)" })).toBeDisabled();
  });
  it("undoes and redoes accepted corrections one at a time without another AI request", async () => {
    const original = "bob lived in an house.";
    localStorage.setItem(
      "penie.doc.v1",
      JSON.stringify({
        content: {
          type: "doc",
          content: [{ type: "paragraph", content: [{ type: "text", text: original }] }],
        },
        savedAt: Date.now(),
      }),
    );
    localStorage.setItem("penie.privacyConsent.v1", "yes");
    const parts = [
      { type: "start" },
      { type: "start-step" },
      ...[
        {
          original: "bob",
          replacement: "Bob",
          before: "",
          after: " lived",
          reason: "Name capital",
        },
        { original: "an", replacement: "a", before: "in ", after: " house", reason: "Article" },
      ].map((input, i) => ({
        type: "tool-input-available",
        toolCallId: `edit-${i}`,
        toolName: "propose_edit",
        input,
      })),
      { type: "finish-step" },
      { type: "finish" },
    ];
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          parts.map((part) => `data: ${JSON.stringify(part)}\n\n`).join("") + "data: [DONE]\n\n",
          { headers: { "content-type": "text/event-stream" } },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    render(<WritingSpace />);
    const writing = await screen.findByRole("textbox", { name: "Your writing" });
    await waitFor(() => expect(writing).toHaveTextContent(original));
    const editor = (writing as HTMLElement & { editor: Editor }).editor;
    act(() => editor.commands.selectAll());
    fireEvent.click(screen.getByRole("button", { name: "Ask Penie" }));
    fireEvent.change(screen.getByLabelText("Message Penie"), {
      target: { value: "Check this passage" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    const cards = await screen.findAllByRole("group", { name: "Proposed correction" });
    expect(cards).toHaveLength(2);
    for (const card of cards) {
      const accept = within(card).getByRole("button", { name: "Accept" });
      await waitFor(() => expect(accept).toBeEnabled());
      fireEvent.click(accept);
    }
    expect(writing.textContent).toBe("Bob lived in a house.");
    // As when returning to the document after accepting suggestions, put focus
    // in the editor so the first toolbar click includes an editor blur.
    act(() => writing.focus());
    for (const expected of ["Bob lived in an house.", original]) {
      await clickToolbar("Undo (Ctrl/Cmd+Z)");
      expect(writing.textContent).toBe(expected);
    }
    for (const expected of ["Bob lived in an house.", "Bob lived in a house."]) {
      await clickToolbar("Redo (Ctrl/Cmd+Shift+Z)");
      expect(writing.textContent).toBe(expected);
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
