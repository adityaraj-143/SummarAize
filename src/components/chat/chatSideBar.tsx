'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSideBarProps {
  chatWidth: number;
  chatId: number;
}

const ChatSideBar: React.FC<ChatSideBarProps> = ({ chatWidth, chatId }) => {
  const { data: initialMessages } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>('/api/get-messages', {
        chatId,
      });
      return response.data.map(msg => ({ ...msg, id: String(msg.id) }));
    },
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    
    const newMessagesForUi = [...messages, userMessage];
    setMessages(newMessagesForUi);

    const messagesForApi = newMessagesForUi.map((msg) => msg.content);

    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesForApi, chatId: chatId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from the server.');
      }

      const aiResponse = await response.json();
      const aiResponseMessage: Message = {
        id: Date.now().toString() + '-ai',
        role: 'assistant',
        content: aiResponse.content,
      };
      
      setMessages((prevMessages) => [...prevMessages, aiResponseMessage]);

    } catch (error) {
      console.error('An error occurred:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: 'error',
          role: 'assistant',
          content: 'Sorry, something went wrong.',
        },
      ]);
    } finally {
      setIsLoading(false);
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

      <ScrollArea className='flex-1 min-h-0 p-4' id='message-container'>
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
                <p className='text-sm whitespace-pre-wrap'>{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className='p-4 border-t border-border flex-shrink-0'
      >
        <div className='flex gap-2'>
          <Input
            placeholder='Enter query...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className='flex-1 bg-input border-border text-foreground'
          />
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Thinking...' : <Send className='h-4 w-4' />}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatSideBar;

