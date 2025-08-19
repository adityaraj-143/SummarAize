import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  FileText,
  Plus,
  Upload,
  FileSearch,
  Menu,
  File,
} from 'lucide-react';
import { Chat } from '@/lib/db/schema';
import { SummaryType } from '@/types/types';
import { useRouter } from 'next/navigation';

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
  const currentTitle = showSummary ? 'PDF Summary' : 'PDF View';
  const currentIcon = showSummary ? FileSearch : File;
  const CurrentIcon = currentIcon;
  const router = useRouter()

  const handleRoute = (id: number) => {
    router.push(`${id}/`)
  }


  return (
    <div className='flex-1 min-h-0 flex flex-col bg-background'>
      <div className='flex-1 min-h-0 p-4'>
        <Card className='h-full bg-card border-border flex flex-col'>
          <CardHeader className='flex-shrink-0'>
            <CardTitle className='flex items-center justify-between text-foreground'>
              <div className='flex items-center gap-2'>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size='sm' variant='ghost' className='p-2'>
                      <Menu className='h-5 w-5 text-foreground' />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side='left'
                    className='w-80 bg-card border-border p-0 flex flex-col overflow-hidden'
                  >
                    <div className='p-4 border-b border-border flex-shrink-0'>
                      <div className='flex items-center justify-between mb-4 pr-8'>
                        <h2 className='text-lg font-semibold text-foreground'>
                          Chat Rooms
                        </h2>
                        <Button size='sm' className='btn-primary whitespace-nowrap'>
                          <Plus className='h-4 w-4 mr-1' />
                          New
                        </Button>
                      </div>
                      <div className='flex gap-2'>
                        <Input
                          placeholder='Room name...'
                          value={newRoomName}
                          onChange={(e) => setNewRoomName(e.target.value)}
                          className='flex-1 bg-input border-border text-foreground'
                        />
                        <Button
                          size='sm'
                          variant='outline'
                          className='border-border hover:bg-muted'
                        >
                          <Upload className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className='flex-1 min-h-0 w-full'>
                      <div className='p-4'>
                        {chats?.map((room) => (
                          <div
                            onClick={() => handleRoute(room.id)}
                            key={room.id}
                            className={`mb-3 cursor-pointer transition-colors p-3 rounded-lg border  ${
                              currentChat?.id === room.id
                                ? 'border-primary bg-primary/10'
                                : 'hover:bg-muted/50 border-border'
                            }`}
                          >
                            <div className='flex items-center gap-2'>
                              <FileText className='h-4 w-4 text-muted-foreground flex-shrink-0' />
                              <div className='min-w-0 flex-1'>
                                <span className='font-medium text-sm text-foreground block truncate'>
                                  {room.pdf_name}
                                </span>
                                <span className='text-xs text-muted-foreground'>
                                  {new Date(room.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              {room.id === currentChat?.id && (
                                <Badge variant='secondary'>Active</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
                <CurrentIcon className='h-5 w-5' />
                {currentTitle}
              </div>
              <div className='flex items-center space-x-2'>
                <Label htmlFor='summary-toggle' className='text-sm text-foreground'>
                  PDF View
                </Label>
                <Switch
                  id='summary-toggle'
                  checked={showSummary}
                  onCheckedChange={setShowSummary}
                />
                <Label htmlFor='summary-toggle' className='text-sm text-foreground'>
                  Summary
                </Label>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className='flex-1 min-h-0 p-0'>
            {showSummary ? (
              <ScrollArea className='h-full p-4'>
                {isLoadingSummary && <p>Loading summary...</p>}
                {summaryError && <p className='text-red-500'>{summaryError}</p>}
                {!isLoadingSummary && !summaryError && summary && (
                  <div className='prose prose-sm max-w-none'>
                    <pre className='font-sans text-foreground whitespace-pre-wrap text-sm leading-relaxed'>
                      {summary.summary_text}
                    </pre>
                  </div>
                )}
              </ScrollArea>
            ) : (
              <>
                {summary?.original_file_url ? (
                  <iframe
                    src={`https://docs.google.com/gview?url=${summary.original_file_url}&embedded=true`}
                    className='h-full w-full border-0'
                    title='PDF Viewer'
                  />
                ) : (
                  <div className='flex items-center justify-center h-full'>
                    <p className='text-muted-foreground'>
                      {currentChat ? 'Loading PDF...' : 'Select a chat to view PDF.'}
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