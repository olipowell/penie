import { useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
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

const MAX_EXCERPT = 4000;
type Msg = UIMessage<{ excerpt?: string | undefined }>;

export function CompanionPanel({ selectedText, onClose }: { selectedText: string; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [share, setShare] = useState(true);
  const [askConsent, setAskConsent] = useState(false);
  const pending = useRef<{ text: string; excerpt?: string | undefined } | null>(null);
  const { messages, sendMessage, status, stop, error } = useChat<Msg>({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const busy = status === "submitted" || status === "streaming";
  const excerpt = share && selectedText ? selectedText.slice(0, MAX_EXCERPT) : undefined;

  const doSend = (p: { text: string; excerpt?: string | undefined }) => {
    sendMessage({ text: p.text, metadata: p.excerpt ? { excerpt: p.excerpt } : undefined });
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
              <div key={m.id} className="whitespace-pre-wrap text-sm leading-relaxed">{text || "…"}</div>
            );
          })}
          {status === "submitted" && <p className="text-sm text-muted-foreground">Penie is thinking…</p>}
          {error && <p role="alert" className="text-sm text-destructive">{friendly(error.message)}</p>}
        </div>
      </ScrollArea>

      <form onSubmit={submit} className="space-y-2 border-t p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch id="share" checked={share} onCheckedChange={setShare} />
          <Label htmlFor="share" className="text-xs font-normal">
            {selectedText
              ? `Share my selected text (${Math.min(selectedText.length, MAX_EXCERPT)} characters)`
              : "Share selected text (select some writing first)"}
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
          <span className="text-xs text-muted-foreground">Only this message{excerpt ? " and your selection" : ""} leave the browser.</span>
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
                <p>Your writing is saved only in this browser. When you message Penie, your message — and any text you choose to share — is sent to an AI service to create a reply.</p>
                <p>Penie doesn't store your writing or conversations. The rest of your document is never sent.</p>
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

function friendly(msg: string) {
  try {
    const j = JSON.parse(msg) as { error?: string };
    if (j.error) return j.error;
  } catch { /* plain text */ }
  return msg || "Penie couldn't reply just now. Please try again.";
}
