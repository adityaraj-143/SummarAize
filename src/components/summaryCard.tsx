import { Calendar, FileText, ArrowRight, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { SummaryType } from "@/types/types";
import { useRouter } from "next/navigation";

type Props = {
  filteredSummaries: (SummaryType & { chat_id: number })[];
};

const SummaryCard = ({ filteredSummaries }: Props) => {
  const router = useRouter();

  const handleRoute = (id: number) => {
    router.push(`chat/${id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredSummaries.map((summary, index) => (
        <Card
          key={summary.id}
          className="card-gradient group animate-fade-in cursor-pointer border-border transition-all duration-300 hover:scale-[1.02] hover:border-primary/30"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <FileText className="size-5 text-primary" />
                </div>
                <Badge variant="outline" className="border-primary/20 text-xs text-primary">
                  {summary.category}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                {formatDate(summary.created_at)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <h3 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
              {summary.title}
            </h3>
            <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
              {summary.summary_text}
            </p>
            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-primary transition-transform hover:scale-105 active:scale-95"
              >
                <ArrowRight className="mr-1 size-3" />
                View Summary
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-primary transition-transform hover:scale-105 active:scale-95"
                onClick={() => handleRoute(summary?.chat_id)}
              >
                <MessageSquare className="mr-1 size-3" />
                Open Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SummaryCard;
