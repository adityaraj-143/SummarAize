import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { FileText, Plus, Upload, Menu, Loader2 } from "lucide-react";
import { Chat } from "@/lib/db/schema";
import { SummaryType } from "@/types/types";
import { useRouter } from "next/navigation";

// Define the types for the props this component receives
interface CenterSectionProps {
  summary: SummaryType | undefined;
  isLoadingSummary: boolean;
  summaryError: string | null;
  chats: Chat[] | null;
  currentChat: Chat | null;
  newRoomName: string;
  setNewRoomName: (name: string) => void;
}

/* ── Summary Skeleton ── */
const SummarySkeleton = () => (
  <div className="animate-fade-in space-y-4 p-4">
    <div className="skeleton h-7 w-3/4 rounded" />
    <div className="skeleton h-4 w-full rounded" />
    <div className="skeleton h-4 w-full rounded" />
    <div className="skeleton h-4 w-5/6 rounded" />
    <div className="mt-6 skeleton h-6 w-1/2 rounded" />
    <div className="skeleton h-4 w-full rounded" />
    <div className="skeleton h-4 w-full rounded" />
    <div className="skeleton h-4 w-4/5 rounded" />
    <div className="mt-6 skeleton h-6 w-2/3 rounded" />
    <div className="skeleton h-4 w-full rounded" />
    <div className="skeleton h-4 w-3/4 rounded" />
  </div>
);

/* ── PDF Loading Skeleton ── */
const PdfSkeleton = () => (
  <div className="flex h-full animate-fade-in flex-col items-center justify-center gap-4">
    <div className="relative">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
        <FileText className="size-7 text-primary" />
      </div>
      <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-card">
        <Loader2 className="size-3.5 text-primary animate-spin" />
      </div>
    </div>
    <p className="text-sm text-muted-foreground">Loading PDF...</p>
  </div>
);

const CenterSection: React.FC<CenterSectionProps> = ({
  summary,
  isLoadingSummary,
  summaryError,
  chats,
  currentChat,
  newRoomName,
  setNewRoomName,
}) => {
  const router = useRouter();

  const handleRoute = (id: number) => {
    router.push(`${id}/`);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1">
        <Card className="flex h-full flex-col rounded-none border-none bg-card p-4">
          <Tabs defaultValue="pdf" className="flex h-full flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center justify-between text-foreground">
                <div className="flex items-center gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-2 transition-transform hover:scale-105 active:scale-95"
                      >
                        <Menu className="size-5 text-foreground" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="flex w-80 flex-col overflow-hidden border-border bg-card p-0"
                    >
                      <div className="flex-shrink-0 border-b border-border p-4">
                        <div className="mb-4 flex items-center justify-between pr-8">
                          <SheetTitle className="text-lg font-semibold text-foreground">
                            Chat Rooms
                          </SheetTitle>
                          <Button
                            size="sm"
                            className="btn-primary whitespace-nowrap transition-transform hover:scale-105 active:scale-95"
                          >
                            <Plus className="mr-1 size-4" />
                            New
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Room name..."
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            className="flex-1 border-border bg-input text-foreground"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border transition-transform hover:scale-105 hover:bg-muted active:scale-95"
                          >
                            <Upload className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <ScrollArea className="min-h-0 w-full flex-1">
                        <div className="p-4 pr-6">
                          {chats?.map((room, index) => (
                            <div
                              onClick={() => handleRoute(room.id)}
                              key={room.id}
                              className={`animate-fade-in mb-3 cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:scale-[1.01] ${
                                currentChat?.id === room.id
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:bg-muted/50"
                              }`}
                              style={{ animationDelay: `${index * 0.05}s` }}
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="size-4 flex-shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-medium text-foreground">
                                    {room.pdf_name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(room.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                {room.id === currentChat?.id && (
                                  <Badge variant="secondary">Active</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>
                  <FileText className="size-5 text-foreground" />
                  <span className="text-base font-semibold">
                    {currentChat?.pdf_name || "Document"}
                  </span>
                </div>
                <TabsList>
                  <TabsTrigger value="pdf" className="text-xs sm:text-sm">
                    PDF View
                  </TabsTrigger>
                  <TabsTrigger value="summary" className="text-xs sm:text-sm">
                    Summary
                  </TabsTrigger>
                </TabsList>
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 p-0">
              <TabsContent value="pdf" className="mt-0 h-full">
                {summary?.original_file_url ? (
                  <iframe
                    src={summary.original_file_url}
                    className="size-full border-0"
                    title="PDF Viewer"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    {currentChat ? (
                      <PdfSkeleton />
                    ) : (
                      <div className="animate-fade-in text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                          <FileText className="size-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">Select a chat to view PDF.</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="summary" className="mt-0 h-full">
                <ScrollArea className="h-full p-4">
                  {isLoadingSummary && <SummarySkeleton />}
                  {summaryError && (
                    <div className="animate-fade-in flex flex-col items-center justify-center py-12 text-center">
                      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
                        <FileText className="size-6 text-destructive" />
                      </div>
                      <p className="text-sm text-red-500">{summaryError}</p>
                    </div>
                  )}
                  {!isLoadingSummary && !summaryError && summary && (
                    <article className="animate-fade-in prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-10 prose-headings:mb-4 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-strong:text-foreground prose-p:text-foreground prose-p:my-3 prose-p:leading-relaxed prose-hr:my-8 prose-hr:border-border/50 prose-ul:my-4 prose-li:my-2 prose-li:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {summary.summary_text}
                      </ReactMarkdown>
                    </article>
                  )}
                </ScrollArea>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default CenterSection;
