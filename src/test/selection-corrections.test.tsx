import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { Editor } from "@tiptap/core";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { WritingSpace } from "@/components/WritingSpace";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  // jsdom has no Range layout; only stub geometry used by editor scrolling.
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

it.each([false, true])(
  "preserves a selected soft line break through sharing, Accept and Undo (partial selection: %s)",
  async (partial) => {
    // Shift+Enter creates a hardBreak inside a paragraph, common in verse.
    localStorage.setItem(
      "penie.doc.v1",
      JSON.stringify({
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "hello" },
                { type: "hardBreak" },
                { type: "text", text: "bob" },
              ],
            },
          ],
        },
        savedAt: Date.now(),
      }),
    );
    localStorage.setItem("penie.privacyConsent.v1", "yes");
    const parts = [
      { type: "start" },
      { type: "start-step" },
      {
        type: "tool-input-available",
        toolCallId: "edit-1",
        toolName: "propose_edit",
        input: {
          original: "bob",
          replacement: "Bob",
          before: partial ? "lo\n" : "hello\n",
          after: "",
          reason: "Name capital",
        },
      },
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
    await waitFor(() => expect(writing).toHaveTextContent("hellobob"));
    const editor = (writing as HTMLElement & { editor: Editor }).editor;
    const original = editor.getJSON();
    act(() => editor.commands.setTextSelection({ from: partial ? 4 : 1, to: 10 }));
    fireEvent.click(screen.getByRole("button", { name: "Ask Penie" }));
    fireEvent.change(screen.getByLabelText("Message Penie"), {
      target: { value: "Check this passage" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    const accept = await screen.findByRole("button", { name: "Accept" });
    await waitFor(() => expect(accept).toBeEnabled());
    const request = JSON.parse(fetchMock.mock.calls[0]![1].body);
    expect(request.messages.at(-1).metadata.excerpt).toBe(partial ? "lo\nbob" : "hello\nbob");
    expect(request.allowPageTool).toBe(false);
    fireEvent.click(accept);
    expect(screen.getByText("Applied — you can Undo this change.")).toBeInTheDocument();
    expect(editor.getText()).toBe("hello\nBob");
    expect(writing.querySelectorAll("br")).toHaveLength(1);
    act(() => {
      expect(editor.commands.undo()).toBe(true);
    });
    expect(editor.getJSON()).toEqual(original);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  },
);
