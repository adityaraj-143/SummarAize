import ChatRoomClient from "./chatRoomClient";

export default function Page({ params }: { params: { chat_id: string } }) {
  const chatId = Number(params.chat_id); 
  return <ChatRoomClient chatId={chatId} />;
}