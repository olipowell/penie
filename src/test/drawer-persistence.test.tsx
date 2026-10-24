import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WritingSpace } from "@/components/WritingSpace";

// PEN-002: closing and reopening Penie's drawer must keep the in-memory
// conversation. A reload (fresh mount) must still start with no conversation.

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function sse(parts: object[]): Response {
  const body = parts.map((p) => `data: ${JSON.stringify(p)}\n\n`).join("") + "data: [DONE]\n\n";
  return new Response(body, { status: 200, headers: { "content-type": "text/event-stream" } });
}

function textReply(text: string): Response {
  return sse([
    { type: "start" },
    { type: "start-step" },
    { type: "text-start", id: "t1" },
    { type: "text-delta", id: "t1", delta: text },
    { type: "text-end", id: "t1" },
    { type: "finish-step" },
    { type: "finish" },
  ]);
}

function pageRequest(): Response {
  return sse([
    { type: "start" },
    { type: "start-step" },
    { type: "tool-input-start", toolCallId: "c1", toolName: "read_page" },
    { type: "tool-input-available", toolCallId: "c1", toolName: "read_page", input: {} },
    { type: "finish-step" },
    { type: "finish" },
  ]);
}

function headerToggle(): HTMLElement {
  return screen.getAllByRole("button", { name: /Penie/ }).find((b) => b.hasAttribute("aria-expanded"))!;
}

function panel(): HTMLElement {
  const el = screen.getByLabelText("Penie, your writing companion");
  return el;
}

async function sendMessage(text: string) {
  fireEvent.change(screen.getByLabelText("Message Penie"), { target: { value: text } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  // First send asks for consent before anything leaves the browser.
  fireEvent.click(await screen.findByRole("button", { name: "I understand, send" }));
}

describe("PEN-002 drawer close/reopen", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    localStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("a fresh mount starts with no conversation", () => {
    render(<WritingSpace />);
    fireEvent.click(headerToggle());
    expect(screen.getByText(/Hi, I'm Penie/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the conversation across close/reopen via both close buttons, with no extra request or storage writes", async () => {
    fetchMock.mockResolvedValueOnce(textReply("Hello, writer!"));
    render(<WritingSpace />);
    fireEvent.click(headerToggle());

    await sendMessage("How is my opening?");
    expect(await screen.findByText("Hello, writer!")).toBeInTheDocument();
    expect(screen.getByText("How is my opening?")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const setItem = vi.spyOn(Storage.prototype, "setItem");

    // Close via the header button: panel hidden, conversation kept in memory.
    fireEvent.click(headerToggle());
    expect(panel()).not.toBeVisible();
    expect(panel()).toHaveAttribute("hidden");

    // Reopen: both messages still there, no new API request, no storage writes.
    fireEvent.click(headerToggle());
    expect(panel()).toBeVisible();
    expect(screen.getByText("How is my opening?")).toBeInTheDocument();
    expect(screen.getByText("Hello, writer!")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(setItem).not.toHaveBeenCalled();

    // Close via the panel's own X button, reopen again.
    fireEvent.click(within(panel()).getByRole("button", { name: "Close Penie" }));
    expect(panel()).not.toBeVisible();
    fireEvent.click(headerToggle());
    expect(screen.getByText("How is my opening?")).toBeInTheDocument();
    expect(screen.getByText("Hello, writer!")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });

  it("keeps a pending page-permission request across close/reopen, and revocation survives too", async () => {
    fetchMock.mockResolvedValueOnce(pageRequest()).mockResolvedValueOnce(textReply("Thanks for sharing your page."));
    render(<WritingSpace />);
    fireEvent.click(headerToggle());

    await sendMessage("Please check my writing");
    expect(await screen.findByText("Penie would like to read this page to help.")).toBeInTheDocument();

    // Pending permission card survives close/reopen without being answered.
    fireEvent.click(headerToggle());
    fireEvent.click(headerToggle());
    expect(screen.getByText("Penie would like to read this page to help.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Grant "Allow for this page": the reply streams and the access chip appears.
    fireEvent.click(screen.getByRole("button", { name: "Allow for this page" }));
    expect(await screen.findByText("Thanks for sharing your page.")).toBeInTheDocument();
    expect(screen.getByText("Penie can read this page")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // The granted state survives close/reopen…
    fireEvent.click(headerToggle());
    fireEvent.click(headerToggle());
    expect(screen.getByText("Penie can read this page")).toBeInTheDocument();

    // …and so does revocation via Stop.
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(screen.queryByText("Penie can read this page")).not.toBeInTheDocument();
    fireEvent.click(headerToggle());
    fireEvent.click(headerToggle());
    expect(screen.queryByText("Penie can read this page")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("a remount (like a reload) starts with no conversation", async () => {
    fetchMock.mockResolvedValueOnce(textReply("Hello, writer!"));
    const first = render(<WritingSpace />);
    fireEvent.click(headerToggle());
    await sendMessage("How is my opening?");
    expect(await screen.findByText("Hello, writer!")).toBeInTheDocument();

    first.unmount();
    render(<WritingSpace />);
    fireEvent.click(headerToggle());
    await waitFor(() => expect(screen.getByText(/Hi, I'm Penie/)).toBeInTheDocument());
    expect(screen.queryByText("How is my opening?")).not.toBeInTheDocument();
    expect(screen.queryByText("Hello, writer!")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
