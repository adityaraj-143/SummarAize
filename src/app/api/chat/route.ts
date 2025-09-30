import { getDbConnection } from '@/lib/db/db';
import { getContext } from '@/lib/findContext';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

interface ChatFileKey {
  file_key: string;
}

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();

    const allmessages = messages as string[];
    const lastMessage = allmessages[allmessages.length - 1];

    const sql = await getDbConnection();

    // First, verify the chat exists
    const _chats = (await sql`
      SELECT file_key FROM chats WHERE id = ${chatId}
    `) as ChatFileKey[];

    if (_chats.length !== 1) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // --- 1. Save the user's message to the database ---
    await sql`
      INSERT INTO messages (chat_id, content, role) 
      VALUES (${chatId}, ${lastMessage}, 'user')
    `;

    // --- 2. Prepare Context and Prompt for the AI ---
    const fileKey = _chats[0].file_key;
    const context = await getContext(lastMessage, fileKey);

    const systemPrompt = `AI assistant is a brand new, powerful, human-like artificial intelligence.
The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
AI is a well-behaved and well-mannered individual.
AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in detail.
AI assistant is a big fan of Pinecone and Vercel.
START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK
AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer."
AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
AI assistant will not invent anything that is not drawn directly from the context.`;

    const userMessages = allmessages.map((message: string) => ({
      role: 'user' as const,
      content: message,
    }));

    // --- 3. Generate the AI response ---
    const { text } = await generateText({
      model: google('gemini-2.0-flash'), // Using an updated/valid model name
      messages: [
        { role: 'system', content: systemPrompt },
        ...userMessages,
      ],
    });

    // --- 4. Save the AI's response to the database ---
    await sql`
      INSERT INTO messages (chat_id, content, role)
      VALUES (${chatId}, ${text}, 'system')
    `;
    
    // --- 5. Return the AI response to the client ---
    return Response.json({
      role: 'system',
      content: text,
    });
    
  } catch (error) {
    console.error(error);
    return new Response(
      `Error processing request: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      { status: 500 }
    );
  }
}
