"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/* ── Typing Indicator ── */
const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="flex items-center gap-1.5 rounded-lg bg-muted px-4 py-3">
      <div
        className="size-1.5 rounded-full bg-muted-foreground animate-bounce-dot"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="size-1.5 rounded-full bg-muted-foreground animate-bounce-dot"
        style={{ animationDelay: "0.16s" }}
      />
      <div
        className="size-1.5 rounded-full bg-muted-foreground animate-bounce-dot"
        style={{ animationDelay: "0.32s" }}
      />
    </div>
  </div>
);

interface ChatSideBarProps {
  chatWidth: number;
  chatId: number;
}

const ChatSideBar: React.FC<ChatSideBarProps> = ({ chatWidth, chatId }) => {
  const { data: initialMessages } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data.map((msg) => ({ ...msg, id: String(msg.id) }));
    },
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    const newMessagesForUi = [...messages, userMessage];
    setMessages(newMessagesForUi);

    const messagesForApi = newMessagesForUi.map((msg) => msg.content);

    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesForApi, chatId: chatId }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from the server.");
      }

      const aiResponse = await response.json();
      const aiResponseMessage: Message = {
        id: Date.now().toString() + "-ai",
        role: "assistant",
        content: aiResponse.content,
      };

      setMessages((prevMessages) => [...prevMessages, aiResponseMessage]);
    } catch (error) {
      console.error("An error occurred:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: "error",
          role: "assistant",
          content: "Sorry, something went wrong.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden border-l border-border bg-card"
      style={{ width: `${chatWidth}px`, minWidth: "300px" }}
    >
      <div className="flex-shrink-0 border-b border-border p-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <MessageSquare className="size-5 flex-shrink-0 text-primary" />
          <h3 className="whitespace-nowrap text-lg font-semibold text-foreground">Chat</h3>
          <Badge
            variant="secondary"
            className="flex-shrink-0 border-primary/30 bg-primary/20 text-primary"
          >
            AI Powered
          </Badge>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-4 py-2" id="message-container">
        <div className="space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex animate-fade-in flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="size-5 text-primary" />
              </div>
              <p className="mb-1 text-sm font-medium text-foreground">Start a conversation</p>
              <p className="text-xs text-muted-foreground">
                Ask questions about your document
              </p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`animate-slide-up flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 break-words ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && <TypingIndicator />}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex-shrink-0 border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about your document..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="min-w-0 flex-1 border-border bg-input text-foreground"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatSideBar;
