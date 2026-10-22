import { createFileRoute } from "@tanstack/react-router";
import { WritingSpace } from "@/components/WritingSpace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Penie — For your imagination" },
      { name: "description", content: "A calm writing space with Penie, a warm AI companion who helps you brainstorm and grow your stories in your own voice." },
      { property: "og:title", content: "Penie — For your imagination" },
      { property: "og:description", content: "A calm writing space with a warm AI companion that never takes over your words." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WritingSpace,
});
