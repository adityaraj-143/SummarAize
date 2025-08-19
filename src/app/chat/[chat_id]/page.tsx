'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { Chat } from '@/lib/db/schema';
import { SummaryType } from '@/types/types';
import CenterSection from '@/components/chat/centerSection';
import ChatSideBar from '@/components/chat/chatSideBar';

export default function ChatRoomClient() {
  const params = useParams<{ chat_id: string }>();
  const chatId = Number(params.chat_id);

  const [chats, setChats] = useState<Chat[] | null>(null);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [summary, setSummary] = useState<SummaryType | undefined>();
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [chatWidth, setChatWidth] = useState(384); // 24rem in pixels
  const [isResizing, setIsResizing] = useState(false);

  const [newRoomName, setNewRoomName] = useState('');

  // Fetch all chat rooms
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const result = await axios.get('/api/chats');
        setChats(result.data.data);
      } catch (err) {
        console.error('Error fetching chats:', err);
      }
    };
    fetchChats();
  }, []);

  // Set the current chat based on the URL parameter
  useEffect(() => {
    if (!chats) return;
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
    }
  }, [chats, chatId]);

  // Fetch the summary for the current chat
  useEffect(() => {
    if (!currentChat?.summary_id) return;

    const fetchSummary = async () => {
      setIsLoadingSummary(true);
      setSummaryError(null);
      try {
        const result = await axios.get('/api/pdf-summary', {
          params: { summary_id: currentChat.summary_id },
        });
        setSummary(result.data.data[0]);
      } catch (err) {
        console.error('Error fetching summary:', err);
        setSummaryError('Failed to load summary. Please try again.');
      } finally {
        setIsLoadingSummary(false);
      }
    };
    fetchSummary();
  }, [currentChat]);

  // --- Resizing Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const containerWidth = window.innerWidth;
    const newWidth = containerWidth - e.clientX;
    const minWidth = 300;
    const maxWidth = containerWidth * 0.6; // Max 60% of screen
    setChatWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className='h-[calc(100vh-4rem)] flex bg-background'>
      <CenterSection
        summary={summary}
        isLoadingSummary={isLoadingSummary}
        summaryError={summaryError}
        chats={chats}
        currentChat={currentChat}
        newRoomName={newRoomName}
        setNewRoomName={setNewRoomName}
      />

      {/* Resizable Divider */}
      <div
        className={`w-1 bg-border hover:bg-primary cursor-col-resize flex-shrink-0 ${
          isResizing ? 'bg-primary' : ''
        }`}
        onMouseDown={handleMouseDown}
      />

      <ChatSideBar chatWidth={chatWidth} />
    </div>
  );
}