import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ProposedEdit } from "@/lib/suggestions";

export function Suggestion({ edit, ready, onAccept }: { edit: ProposedEdit; ready: boolean; onAccept: () => boolean }) {
  const [result, setResult] = useState<"pending" | "accepted" | "thinking" | "stale">("pending");
  return <div role="group" aria-label="Proposed correction" className="space-y-2 rounded-md border p-3 text-sm">
    <p>{edit.reason}</p>
    <p className="whitespace-pre-wrap"><del>{edit.original}</del> → <ins>{edit.replacement}</ins></p>
    {result === "pending" ? <div className="flex gap-2">
      <Button size="sm" disabled={!ready} onClick={() => setResult(onAccept() ? "accepted" : "stale")}>Accept</Button>
      <Button size="sm" variant="outline" onClick={() => setResult("thinking")}>Still thinking</Button>
    </div> : <p role="status" className="text-muted-foreground">{result === "accepted" ? "Applied — you can Undo this change." : result === "thinking" ? "When you're ready. Your writing is unchanged." : "Your writing has changed, or this passage couldn't be identified safely. Nothing was changed. Ask me to check it again."}</p>}
  </div>;
}