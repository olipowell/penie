import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Undo2, Redo2, Download, MessageCircle, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { loadDoc, requestPersistence, saveDoc } from "@/lib/autosave";
import { KeptSelection } from "@/lib/selection";
import { CompanionPanel } from "@/components/CompanionPanel";

type SaveState = { kind: "idle" | "saving" | "saved" | "error" | "restored" | "backup" | "empty" | "unavailable"; at?: number };

export function WritingSpace() {
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(false);
  const [temporary, setTemporary] = useState(false);
  const [, force] = useState(0);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  const firstDirty = useRef<number | null>(null);
  const restoring = useRef(true);
  const openRef = useRef(false);
  openRef.current = open;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, KeptSelection.configure({ active: () => openRef.current }), Placeholder.configure({ placeholder: "Start writing. Your story is saved here, in this browser." })],
    editorProps: { attributes: { class: "penie-prose", "aria-label": "Your writing", role: "textbox", "aria-multiline": "true" } },
    onCreate: ({ editor }) => {
      const r = loadDoc();
      if (r.kind === "main" || r.kind === "backup") {
        editor.commands.setContent(r.doc.content, { emitUpdate: false });
        setSave({ kind: r.kind === "main" ? "restored" : "backup", at: r.doc.savedAt });
      } else {
        setSave({ kind: r.kind === "none" ? "empty" : "unavailable" });
      }
      restoring.current = false;
      editor.commands.focus("end");
    },
    onUpdate: () => schedule(),
    onTransaction: () => force((n) => n + 1),
  });

  const flush = () => {
    if (!editor || firstDirty.current === null) return;
    clearTimeout(debounce.current);
    try {
      const at = saveDoc(editor.getJSON(), { restoring: restoring.current });
      if (at !== null) setSave({ kind: "saved", at });
      firstDirty.current = null;
    } catch {
      setSave({ kind: "error" });
      // Keep the change marked unsaved and retry shortly.
      debounce.current = setTimeout(() => flushRef.current(), 5000);
    }
  };
  const flushRef = useRef(flush);
  flushRef.current = flush;

  function schedule() {
    setSave((s) => ({ ...s, kind: "saving" }));
    const now = Date.now();
    firstDirty.current ??= now;
    clearTimeout(debounce.current);
    // Save 800ms after typing pauses, and at least every 4s while typing.
    if (now - firstDirty.current > 4000) return flushRef.current();
    debounce.current = setTimeout(() => flushRef.current(), 800);
  }

  useEffect(() => {
    void requestPersistence().then((s) => setTemporary(s === "temporary"));
    const onHide = () => flushRef.current();
    const onVis = () => document.visibilityState === "hidden" && onHide();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", onHide);
    };
  }, []);

  useEffect(() => {
    if (editor && !editor.isDestroyed) editor.view.dispatch(editor.state.tr.setMeta("penieRefresh", true));
  }, [open, editor]);

  const text = editor?.getText() ?? "";
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sel = editor?.state.selection;
  const selectedText = editor && sel && !sel.empty ? editor.state.doc.textBetween(sel.from, sel.to, "\n") : "";

  const exportTxt = () => {
    const url = URL.createObjectURL(new Blob([editor?.getText({ blockSeparator: "\n\n" }) ?? ""], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "penie-story.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const when = (at?: number) => (at ? new Date(at).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
  const status =
    save.kind === "saving" ? "Saving…"
    : save.kind === "error" ? "Couldn't save — your writing is only in this tab"
    : save.kind === "unavailable" ? "Browser storage isn't available — your writing won't be saved"
    : save.kind === "empty" ? "No saved writing found in this browser"
    : save.kind === "restored" ? `Restored your writing from ${when(save.at)}`
    : save.kind === "backup" ? `Restored your writing from a backup (${when(save.at)})`
    : save.at ? `Saved at ${new Date(save.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "Not saved yet";
  const fullStatus = temporary && save.kind !== "unavailable" ? `${status} · Storage may be temporary — export a .txt to keep a copy` : status;

  const Tool = ({ label, onClick, disabled, children, pressed }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode; pressed?: boolean }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={label} aria-pressed={pressed} onClick={onClick} disabled={disabled}>{children}</Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen bg-background text-foreground">
        <div className="flex min-w-0 flex-1 flex-col">
          <header className={`flex items-center gap-1 border-b px-4 py-2 transition-opacity ${focus ? "opacity-0 focus-within:opacity-100 hover:opacity-100" : ""}`}>
            <span className="mr-3 font-semibold tracking-tight">Penie</span>
            <Tool label="Undo (Ctrl/Cmd+Z)" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()}><Undo2 /></Tool>
            <Tool label="Redo (Ctrl/Cmd+Shift+Z)" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()}><Redo2 /></Tool>
            <Tool label={focus ? "Exit focus mode" : "Focus mode"} pressed={focus} onClick={() => setFocus((f) => !f)}>{focus ? <Minimize2 /> : <Maximize2 />}</Tool>
            <Tool label="Export as .txt" onClick={exportTxt}><Download /></Tool>
            <span className="ml-auto text-sm text-muted-foreground" role="status" aria-live="polite">
              {words} {words === 1 ? "word" : "words"} · {status}
            </span>
            <Button variant={open ? "secondary" : "outline"} className="ml-3" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
              <MessageCircle /> {open ? "Close Penie" : "Ask Penie"}
            </Button>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-2xl px-6 py-12">
              <EditorContent editor={editor} />
            </div>
          </main>
        </div>
        {open && <CompanionPanel selectedText={selectedText} onClose={() => setOpen(false)} />}
      </div>
    </TooltipProvider>
  );
}
