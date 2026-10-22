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

        let body: { messages?: unknown };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }
        if (!Array.isArray(body.messages) || body.messages.length === 0) {
          return Response.json({ error: "Invalid request" }, { status: 400 });
        }
        const messages = body.messages.slice(-LIMITS.maxMessages);
        try {
          return await streamPenie(request, messages);
        } catch {
          return Response.json({ error: "Penie couldn't reply just now." }, { status: 500 });
        }
      },
    },
  },
});
