import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { FileText, Plus, Upload, Menu } from "lucide-react";
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
        <Card className="flex h-full flex-col bg-card p-4 border-none rounded-none">
          <Tabs defaultValue="pdf" className="flex h-full flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center justify-between text-foreground">
                <div className="flex items-center gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button size="sm" variant="ghost" className="p-2">
                        <Menu className="size-5 text-foreground" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="flex w-80 flex-col overflow-hidden border-border bg-card p-0"
                    >
                      <div className="flex-shrink-0 border-b border-border p-4">
                        <div className="mb-4 flex items-center justify-between pr-8">
                          <SheetTitle className="text-lg font-semibold text-foreground">Chat Rooms</SheetTitle>
                          <Button size="sm" className="btn-primary whitespace-nowrap">
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
                            className="border-border hover:bg-muted"
                          >
                            <Upload className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <ScrollArea className="min-h-0 w-full flex-1">
                        <div className="p-4 pr-6">
                          {chats?.map((room) => (
                            <div
                              onClick={() => handleRoute(room.id)}
                              key={room.id}
                              className={`mb-3 cursor-pointer rounded-lg border p-3 transition-colors  ${currentChat?.id === room.id
                                ? "border-primary bg-primary/10"
                                : "border-border hover:bg-muted/50"
                                }`}
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
                  <TabsTrigger value="pdf" className="text-xs sm:text-sm">PDF View</TabsTrigger>
                  <TabsTrigger value="summary" className="text-xs sm:text-sm">Summary</TabsTrigger>
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
                    <p className="text-muted-foreground">
                      {currentChat ? "Loading PDF..." : "Select a chat to view PDF."}
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="summary" className="mt-0 h-full">
                <ScrollArea className="h-full p-4">
                  {isLoadingSummary && <p>Loading summary...</p>}
                  {summaryError && <p className="text-red-500">{summaryError}</p>}
                  {!isLoadingSummary && !summaryError && summary && (
                    <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-10 prose-headings:mb-4 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-strong:text-foreground prose-p:text-foreground prose-p:my-3 prose-p:leading-relaxed prose-hr:my-8 prose-hr:border-border/50 prose-ul:my-4 prose-li:my-2 prose-li:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-muted prose-pre:border prose-pre:border-border">
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
