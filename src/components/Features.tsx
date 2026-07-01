import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Search, Zap, PenLine, Library, MessageSquare } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Fast Summaries",
    description: "Get structured summaries with page references, typically in under a minute.",
    delay: "0.1s",
  },
  {
    icon: Sparkles,
    title: "Topic-Organized",
    description: "AI identifies key topics and organizes your summary by theme — not just a wall of text.",
    delay: "0.2s",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Your document is indexed for semantic search, so you can ask precise questions and get relevant answers.",
    delay: "0.3s",
  },
  {
    icon: PenLine,
    title: "Scanned & Handwritten",
    description: "Full OCR support for scanned pages and handwritten notes, powered by Google Gemini.",
    delay: "0.4s",
  },
  {
    icon: Library,
    title: "Document Library",
    description: "All your summaries are saved in your personal dashboard, searchable and filterable by category.",
    delay: "0.5s",
  },
  {
    icon: MessageSquare,
    title: "Chat with Docs",
    description: "Ask follow-up questions and get answers grounded in your actual document — no hallucinations.",
    delay: "0.6s",
  },
];

export default function Features() {
  return (
    <section className="border-t border-border bg-card/20 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          {/* Section heading */}
          <div className="mb-14 text-center">
            <h2
              className="mb-4 animate-slide-up text-3xl font-bold md:text-4xl"
              style={{ animationDelay: "0.05s" }}
            >
              Why <span className="gradient-text">SummarAIze</span>?
            </h2>
            <p
              className="mx-auto max-w-xl animate-slide-up text-muted-foreground"
              style={{ animationDelay: "0.15s" }}
            >
              Everything you need to understand your documents faster
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="card-gradient group animate-slide-up border-border text-center transition-all duration-300 hover:border-primary/30"
                style={{ animationDelay: feature.delay }}
              >
                <CardContent className="p-7">
                  <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:animate-pulse-glow">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold transition-colors group-hover:text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
