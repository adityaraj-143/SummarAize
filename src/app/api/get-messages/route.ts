import { getDbConnection } from "@/lib/db/db";
import { NextResponse } from 'next/server';

interface Message {
  id: number;
  content: string;
  role: 'user' | 'system'; 
  created_at: Date;
}

export const POST = async (req: Request) => {
  try {
    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json({ error: 'chatId is required' }, { status: 400 });
    }

    const sql = await getDbConnection();

    const _messages = await sql`
      SELECT id, content, role, created_at 
      FROM messages 
      WHERE chat_id = ${chatId} 
      ORDER BY created_at ASC
    ` as Message[];

    return NextResponse.json(_messages, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while fetching messages.' }, 
      { status: 500 }
    );
  }
};
