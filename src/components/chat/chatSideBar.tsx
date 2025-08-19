import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare } from 'lucide-react';

// Define the type for the props
interface ChatSideBarProps {
  chatWidth: number;
}

// Define the type for a single message
interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

const ChatSideBar: React.FC<ChatSideBarProps> = ({ chatWidth }) => {
  // Chat-specific state is now located here
  const [newMessage, setNewMessage] = useState('');
  const [messages] = useState<Message[]>([
    {
      id: '1',
      content: 'which problem statement is related to skills',
      isUser: true,
      timestamp: '20:13',
    },
    {
      id: '2',
      content:
        "A problem statement related to skills could be: 'How can we improve the job readiness of recent graduates by developing a program that enhances their technical and soft skills?'",
      isUser: false,
      timestamp: '20:13',
    },
  ]);

  // Logic for sending a message is now self-contained
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Logic to add the new message to the `messages` array would go here
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
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
                message.isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className='text-sm'>{message.content}</p>
                <span className='text-xs opacity-70 mt-1 block text-right'>
                  {message.timestamp}
                </span>
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
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className='flex-1 bg-input border-border text-foreground'
          />
          <Button onClick={handleSendMessage} className='btn-primary'>
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSideBar;