import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  FileText,
  MessageCircle,
  BarChart3,
  Clock,
} from "lucide-react";

export default function Features() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card
            className="card-gradient text-center animate-slide-up"
            style={{ animationDelay: "0.6s" }}
          >
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground text-sm">
                Get comprehensive summaries in under 30 seconds
              </p>
            </CardContent>
          </Card>

          <Card
            className="card-gradient text-center animate-slide-up"
            style={{ animationDelay: "0.8s" }}
          >
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Powered</h3>
              <p className="text-muted-foreground text-sm">
                Advanced AI ensures accurate and contextual summaries
              </p>
            </CardContent>
          </Card>

          <Card
            className="card-gradient text-center animate-slide-up"
            style={{ animationDelay: "1s" }}
          >
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Smart Insights</h3>
              <p className="text-muted-foreground text-sm">
                Extract key insights and actionable information
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
