import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, BarChart3, Clock } from "lucide-react";

export default function Features() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          <Card
            className="card-gradient text-center animate-slide-up"
            style={{ animationDelay: "0.6s" }}
          >
            <CardContent className="p-6">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Clock className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Get comprehensive summaries in under 30 seconds
              </p>
            </CardContent>
          </Card>

          <Card
            className="card-gradient text-center animate-slide-up"
            style={{ animationDelay: "0.8s" }}
          >
            <CardContent className="p-6">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">AI Powered</h3>
              <p className="text-sm text-muted-foreground">
                Advanced AI ensures accurate and contextual summaries
              </p>
            </CardContent>
          </Card>

          <Card
            className="card-gradient text-center animate-slide-up"
            style={{ animationDelay: "1s" }}
          >
            <CardContent className="p-6">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                <BarChart3 className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Smart Insights</h3>
              <p className="text-sm text-muted-foreground">
                Extract key insights and actionable information
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
