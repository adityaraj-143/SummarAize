import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FileText, Plus, Upload, FileSearch, Menu, File } from "lucide-react";
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
  const [showSummary, setShowSummary] = useState(false);
  const currentTitle = showSummary ? "PDF Summary" : "PDF View";
  const currentIcon = showSummary ? FileSearch : File;
  const CurrentIcon = currentIcon;
  const router = useRouter();

  const handleRoute = (id: number) => {
    router.push(`${id}/`);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="min-h-0 flex-1 p-4">
        <Card className="flex h-full flex-col border-border bg-card">
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
                        <h2 className="text-lg font-semibold text-foreground">Chat Rooms</h2>
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
                      <div className="p-4">
                        {chats?.map((room) => (
                          <div
                            onClick={() => handleRoute(room.id)}
                            key={room.id}
                            className={`mb-3 cursor-pointer rounded-lg border p-3 transition-colors  ${
                              currentChat?.id === room.id
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
                <CurrentIcon className="size-5" />
                {currentTitle}
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="summary-toggle" className="text-sm text-foreground">
                  PDF View
                </Label>
                <Switch
                  id="summary-toggle"
                  checked={showSummary}
                  onCheckedChange={setShowSummary}
                />
                <Label htmlFor="summary-toggle" className="text-sm text-foreground">
                  Summary
                </Label>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 p-0">
            {showSummary ? (
              <ScrollArea className="h-full p-4">
                {isLoadingSummary && <p>Loading summary...</p>}
                {summaryError && <p className="text-red-500">{summaryError}</p>}
                {!isLoadingSummary && !summaryError && summary && (
                  <div className="prose prose-sm prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-8 prose-headings:mb-3 prose-strong:text-foreground prose-p:text-foreground prose-p:my-2 prose-hr:my-6 prose-hr:border-border prose-ul:my-2 prose-li:my-1.5 prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {summary.summary_text}
                    </ReactMarkdown>
                  </div>
                )}
              </ScrollArea>
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CenterSection;
