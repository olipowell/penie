import { createFileRoute } from "@tanstack/react-router";

// Best-effort per-instance rate limit (basic safeguard against excessive use).
const hits = new Map<string, number[]>();

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { streamPenie, LIMITS } = await import("@/lib/penie-ai.server");

        const ip = request.headers.get("cf-connecting-ip") ?? "local";
        const now = Date.now();
        const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
        if (recent.length >= LIMITS.requestsPerMinute) {
          return Response.json(
            { error: "You're sending messages quickly. Take a breath and try again in a minute." },
            { status: 429 },
          );
        }
        recent.push(now);
        hits.set(ip, recent);

        let body: { messages?: unknown; allowPageTool?: unknown };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }
        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }
        const messages = body.messages.slice(-LIMITS.maxMessages);
        // Reject oversized page reads instead of silently truncating.
        const tooBig = messages.some((m: { parts?: { output?: { page?: unknown } }[] }) =>
          m.parts?.some((p) => typeof p?.output?.page === "string" && p.output.page.length > LIMITS.maxPageChars),
        );
        if (tooBig) return Response.json({ error: "That page is too long to share in full." }, { status: 413 });
        try {
          return await streamPenie(request, messages, body.allowPageTool === true);
        } catch {
          return Response.json({ error: "Penie couldn't reply just now." }, { status: 500 });
        }
      },
    },
  },
});
