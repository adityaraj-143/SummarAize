'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare } from 'lucide-react';
import { useChat } from '@ai-sdk/react';

interface ChatSideBarProps {
  chatWidth: number;
}

const ChatSideBar: React.FC<ChatSideBarProps> = ({ chatWidth }) => {
  const { messages, sendMessage, status } = useChat({});
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    const text = newMessage.trim();
    if (!text || status !== 'ready') return;
    sendMessage({ text });
    setNewMessage('');
  };

  return (
    <div
      className='bg-card flex flex-col border-l border-border'
      style={{ width: `${chatWidth}px`, minWidth: '300px' }}
    >
      <div className='p-4 mt-1 border-b border-border flex-shrink-0'>
        <div className='flex items-center gap-2'>
          <MessageSquare className='h-5 w-5 text-primary' />
          <h3 className='text-lg font-semibold text-foreground'>Chat</h3>
          <Badge
            variant='secondary'
            className='bg-primary/20 text-primary border-primary/30'
          >
            AI Powered
          </Badge>
        </div>
      </div>

      <ScrollArea className='flex-1 min-h-0 p-4'>
        <div className='space-y-4'>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {message.parts.map((part, idx) => {
                  if (part.type === 'text') {
                    return (
                      <p key={idx} className='text-sm'>
                        {part.text}
                      </p>
                    );
                  }
                  // You can extend this to handle tool calls or custom parts later
                  return null;
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className='p-4 border-t border-border flex-shrink-0'>
        <div className='flex gap-2'>
          <Input
            placeholder='Whisper your query...'
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={status !== 'ready'}
            className='flex-1 bg-input border-border text-foreground'
          />
          <Button onClick={handleSend} disabled={status !== 'ready'}>
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSideBar;
