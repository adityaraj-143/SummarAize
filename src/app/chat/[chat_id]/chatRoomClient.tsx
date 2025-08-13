  "use client";
  import { useUser } from "@clerk/nextjs";
  import axios from "axios";
  import { useEffect, useState } from "react";
  import { Chat } from "@/lib/db/schema";

  type Props = {
    chatId: number;
  };

  export default function ChatRoomClient({ chatId }: Props) {
    const { user } = useUser();
    console.log(chatId)
    const [chats, setChats] = useState<Chat[] | null>(null);
    const [currentChat, setCurrentChat] = useState<Chat | null>(null);

    useEffect(() => {
      const fetchChats = async () => {
        try {
          const result = await axios.get("/api/chats");
          setChats(result.data.data);
        } catch (err) {
          console.error("Error fetching chats:", err);
        }
      };
      fetchChats();
    }, []);

    useEffect(() => {
      if (!chats) return;
      const chat = chats.find((c) => c.id === chatId);
      if (chat) setCurrentChat(chat);
    }, [chats, chatId]);

    useEffect(() => {
      console.log("currentChat: ",currentChat)
      if (!currentChat?.summary_id) return;
      const fetchSummary = async () => {
        try {
          const result = await axios.get("/api/pdf-summary", {
            params: { summary_id: currentChat.summary_id },
          });
          console.log("Summary:", result.data.data);
        } catch (err) {
          console.error("Error fetching summary:", err);
        }
      };
      fetchSummary();
    }, [currentChat]);

    return (
      <div className="flex max-h-screen overflow-hidden">
        <div className="flex w-full max-h-screen overflow-hidden">
          {/*chat sidebar*/}
          <div className="flex-[1] max-w-xs"></div>

          {/*pdf/summary viewer*/}
          <div></div>

          {/*chat component*/}
          <div></div>
        </div>
      </div>
    );
  }
