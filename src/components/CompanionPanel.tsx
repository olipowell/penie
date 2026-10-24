import { useEffect, useId, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls, type UIMessage } from "ai";
import { Send, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { giveConsent, hasConsent } from "@/lib/autosave";
import { Suggestion } from "@/components/Suggestion";
import { EDIT_TOOL, type ProposedEdit, type WritingSnapshot } from "@/lib/suggestions";
import { MAX_EXCERPT, PAGE_TOOL, contextFor, minimiseHistory, pageOutput, previewOf, type PageOutput } from "@/lib/selection";

type Msg = UIMessage<{ excerpt?: string | undefined }>;

export function CompanionPanel({ selectedText, getPage, captureWriting, applyEdit, pageAllowed, setPageAllowed, onClose }: {
  selectedText: string;
  getPage: () => string;
  captureWriting: (selection: boolean) => WritingSnapshot | undefined;
  applyEdit: (snapshot: WritingSnapshot | undefined, edit: ProposedEdit) => boolean;
  /** "Allow for this page" — kept in memory only; a reload resets it. */
  pageAllowed: boolean;
  setPageAllowed: (v: boolean) => void;
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [share, setShare] = useState(true);
  const [askConsent, setAskConsent] = useState(false);
  const pending = useRef<{ text: string; excerpt?: string | undefined } | null>(null);
  const snapshotRef = useRef<WritingSnapshot | undefined>(undefined);
  const editSnapshots = useRef(new Map<string, WritingSnapshot | undefined>());
  const captureRef = useRef(captureWriting);
  captureRef.current = captureWriting;
  const ctx = contextFor(selectedText, share);
  const excerpt = ctx.excerpt;
  // Refs so the transport/tool handler always see the latest choices.
  const allowToolRef = useRef(ctx.allowPageTool);
  const pageAllowedRef = useRef(pageAllowed);
  const getPageRef = useRef(getPage);
  allowToolRef.current = ctx.allowPageTool;
  pageAllowedRef.current = pageAllowed;
  getPageRef.current = getPage;
  const [transport] = useState(() => new DefaultChatTransport<Msg>({
    api: "/api/chat",
    prepareSendMessagesRequest: ({ messages, body }) => ({
      // Earlier shared writing isn't resent; the page tool is offered only with no selection.
      body: { ...body, messages: minimiseHistory(messages), allowPageTool: allowToolRef.current },
    }),
  }));
  const { messages, sendMessage, status, stop, error, addToolOutput } = useChat<Msg>({
    transport,
    sendAutomaticallyWhen: ({ messages }) => {
      const last = messages.at(-1);
      return !!last?.parts.some((p) => p.type === `tool-${PAGE_TOOL}`) && !last.parts.some((p) => p.type === `tool-${EDIT_TOOL}`) && lastAssistantMessageIsCompleteWithToolCalls({ messages });
    },
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === EDIT_TOOL) {
        editSnapshots.current.set(toolCall.toolCallId, snapshotRef.current);
        // Resolved locally, never auto-send on Accept/Still thinking.
        void addToolOutput({ tool: EDIT_TOOL as never, toolCallId: toolCall.toolCallId, output: { displayed: true } as never });
        return;
      }
      if (toolCall.toolName !== PAGE_TOOL) return;
      // Only auto-answer when the writer chose "Allow for this page"; otherwise the card asks.
      if (pageAllowedRef.current) {
        snapshotRef.current = captureRef.current(false);
        void addToolOutput({ tool: PAGE_TOOL as never, toolCallId: toolCall.toolCallId, output: pageOutput(getPageRef.current()) as never });
      }
    },
  });
  const answer = (toolCallId: string, output: PageOutput) => {
    snapshotRef.current = "page" in output ? captureWriting(false) : undefined;
    void addToolOutput({ tool: PAGE_TOOL as never, toolCallId, output: output as never });
  };
  const busy = status === "submitted" || status === "streaming";
  const previewId = useId();
  // Announce selection changes once they settle.
  const [announce, setAnnounce] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setAnnounce(selectedText ? `Selected ${selectedText.length} characters` : "No text selected"), 700);
    return () => clearTimeout(t);
  }, [selectedText]);

  const doSend = (p: { text: string; excerpt?: string | undefined }) => {
    snapshotRef.current = p.excerpt ? captureWriting(true) : undefined;
    sendMessage({ text: p.text, metadata: { excerpt: p.excerpt } });
    setInput("");
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const p = { text: text.slice(0, 2000), excerpt };
    if (!hasConsent()) {
      pending.current = p;
      setAskConsent(true);
      return;
    }
    doSend(p);
  };

  return (
    <aside aria-label="Penie, your writing companion" className="flex w-full max-w-md flex-col border-l bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h2 className="font-semibold">Penie</h2>
        <Button variant="ghost" size="icon" aria-label="Close Penie" onClick={onClose}><X /></Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4" aria-live="polite">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Hi, I'm Penie. Tell me what you're writing, or select a passage and ask me about it. I'll only ever suggest — your words stay yours.
            </p>
          )}
          {messages.map((m) => {
            const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
            const pageParts = m.parts.filter((p) => p.type === `tool-${PAGE_TOOL}`) as unknown as { toolCallId: string; state: string; output?: PageOutput }[];
            const edits = m.parts.filter((p) => p.type === `tool-${EDIT_TOOL}`) as unknown as { toolCallId: string; state: string; input?: ProposedEdit }[];
            return m.role === "user" ? (
              <div key={m.id} className="ml-8 space-y-1">
                {m.metadata?.excerpt && (
                  <p className="text-xs text-muted-foreground">
                    Shared {m.metadata.excerpt.length} characters: “{m.metadata.excerpt.slice(0, 80)}{m.metadata.excerpt.length > 80 ? "…" : ""}”
                  </p>
                )}
                <div className="whitespace-pre-wrap rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">{text}</div>
              </div>
            ) : (
              <div key={m.id} className="space-y-2">
                {edits.filter((p) => p.input && (p.state === "input-available" || p.state === "output-available")).map((p) => p.input && <Suggestion key={p.toolCallId} edit={p.input} ready={!busy} onAccept={() => applyEdit(editSnapshots.current.get(p.toolCallId), p.input as ProposedEdit)} />)}
                {pageParts.map((p) => <PageRequest key={p.toolCallId} part={p}
                  onOnce={() => answer(p.toolCallId, pageOutput(getPage()))}
                  onAlways={() => { setPageAllowed(true); answer(p.toolCallId, pageOutput(getPage())); }}
                  onDeny={() => answer(p.toolCallId, { denied: true })} />)}
                {(text || (pageParts.length === 0 && edits.length === 0)) && <div className="whitespace-pre-wrap text-sm leading-relaxed">{text || "…"}</div>}
              </div>
            );
          })}
          {status === "submitted" && <p className="text-sm text-muted-foreground">Penie is thinking…</p>}
          {error && <p role="alert" className="text-sm text-destructive">{friendly(error.message)}</p>}
        </div>
      </ScrollArea>

      <form onSubmit={submit} className="space-y-2 border-t p-3">
        {selectedText && (
          <div id={previewId} className={`rounded-md border px-3 py-2 text-xs ${share ? "" : "opacity-60"}`}>
            <p className="font-medium">{share ? `Sharing ${Math.min(selectedText.length, MAX_EXCERPT)} characters` : "Not shared"}</p>
            <blockquote className="mt-1 border-l-2 pl-2 italic text-muted-foreground">“{previewOf(selectedText)}”</blockquote>
            {share && selectedText.length > MAX_EXCERPT && (
              <p className="mt-1 text-muted-foreground">Only the first {MAX_EXCERPT.toLocaleString()} characters will be shared.</p>
            )}
          </div>
        )}
        <span className="sr-only" aria-live="polite">{announce}</span>
        {pageAllowed && (
          <div className="flex items-center justify-between rounded-md border px-3 py-1 text-xs text-muted-foreground">
            <span>Penie can read this page</span>
            <Button type="button" size="sm" variant="ghost" onClick={() => setPageAllowed(false)}>Stop</Button>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch id="share" checked={share && !!selectedText} disabled={!selectedText} onCheckedChange={setShare} aria-describedby={selectedText ? previewId : undefined} />
          <Label htmlFor="share" className="text-xs font-normal">
            {selectedText ? "Share my selected text" : "Select some writing to share it"}
          </Label>
        </div>
        <Label htmlFor="penie-input" className="sr-only">Message Penie</Label>
        <Textarea
          id="penie-input"
          value={input}
          maxLength={2000}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) submit(e); }}
          placeholder="Ask Penie anything about your story…"
          rows={3}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {excerpt ? "This message and your selection will be sent."
              : selectedText ? "Only this message will be sent."
              : pageAllowed ? "This message will be sent. Penie can read this page."
              : "Only this message will be sent. Penie will ask before reading your page."}
          </span>
          {busy ? (
            <Button type="button" size="sm" variant="outline" onClick={stop}><Square /> Stop</Button>
          ) : (
            <Button type="submit" size="sm" disabled={!input.trim()}><Send /> Send</Button>
          )}
        </div>
      </form>

      <AlertDialog open={askConsent} onOpenChange={setAskConsent}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Before Penie replies</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Your writing is saved locally in this browser. When you message Penie, your message is sent to an AI provider to create a reply.</p>
                <p>Your writing is sent only when you allow it: a passage you select and choose to share, or your page when Penie asks and you say yes.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => (pending.current = null)}>Not now</AlertDialogCancel>
            <AlertDialogAction onClick={() => { giveConsent(); if (pending.current) doSend(pending.current); pending.current = null; }}>
              I understand, send
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}

function PageRequest({ part, onOnce, onAlways, onDeny }: {
  part: { state: string; output?: PageOutput };
  onOnce: () => void; onAlways: () => void; onDeny: () => void;
}) {
  const o = part.output;
  if (part.state === "output-available" && o) {
    const note = "page" in o ? `Shared this page (${o.page.trim().split(/\s+/).filter(Boolean).length} words)`
      : "denied" in o ? "Page not shared"
      : "tooLong" in o ? `Page not shared — too long to read in full (${o.words} words). Select the part you want help with.`
      : "Shared earlier";
    return <p className="text-xs text-muted-foreground">{note}</p>;
  }
  if (part.state !== "input-available") return null;
  return (
    <div role="group" aria-label="Penie asks to read your page" className="space-y-2 rounded-md border p-3 text-sm">
      <p>Penie would like to read this page to help.</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onOnce}>Allow once</Button>
        <Button size="sm" variant="outline" onClick={onAlways}>Allow for this page</Button>
        <Button size="sm" variant="ghost" onClick={onDeny}>Not now</Button>
      </div>
    </div>
  );
}

function friendly(msg: string) {
  try {
    const j = JSON.parse(msg) as { error?: string };
    if (j.error) return j.error;
  } catch { /* plain text */ }
  return msg || "Penie couldn't reply just now. Please try again.";
}
