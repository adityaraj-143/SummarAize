import { getDbConnection } from "@/lib/db/db";
import { getContext } from "@/lib/findContext";
import { generateText } from "ai";
import { NextResponse } from "next/server";

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
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // --- 1. Save the user's message to the database ---
    await sql`
      INSERT INTO messages (chat_id, content, role) 
      VALUES (${chatId}, ${lastMessage}, 'user')
    `;

    // --- 2. Prepare Context and Prompt for the AI ---
    const fileKey = _chats[0].file_key;
    const context = await getContext(lastMessage, fileKey);

    const systemPrompt = `You are a highly knowledgeable and professional AI assistant for SummarAize, a specialized PDF analysis application. Your primary objective is to accurately and concisely answer user questions based EXCLUSIVELY on the provided document context.

### INSTRUCTIONS:
1. **Analyze the Context:** Carefully review the provided CONTEXT BLOCK. This text is extracted from the user's PDF via semantic search.
2. **Formulate the Answer:** Construct your response using ONLY the information found within the CONTEXT BLOCK.
3. **Acknowledge Missing Information:** If the answer cannot be confidently determined from the CONTEXT BLOCK, you must state: "I'm sorry, but I don't see the answer to that in the provided document." Do not attempt to guess or use outside knowledge.
4. **Tone & Style:** Maintain a professional, objective, and helpful tone. Be concise and format your response clearly using markdown (e.g., bullet points, bold text) where appropriate for readability.
5. **No Hallucinations:** You must not invent, assume, or extrapolate facts that are not explicitly stated in the context.

### START CONTEXT BLOCK
${context}
### END OF CONTEXT BLOCK

Remember: Your answers must be derived strictly from the text between the START and END CONTEXT BLOCK markers.`;

    const userMessages = allmessages.map((message: string) => ({
      role: "user" as const,
      content: message,
    }));

    const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
    const customGoogle = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "",
    });

    // --- 3. Generate the AI response ---
    const { text } = await generateText({
      model: customGoogle("gemini-flash-lite-latest"), // Using the quota-safe model
      messages: [{ role: "system", content: systemPrompt }, ...userMessages],
    });

    // --- 4. Save the AI's response to the database ---
    await sql`
      INSERT INTO messages (chat_id, content, role)
      VALUES (${chatId}, ${text}, 'system')
    `;

    // --- 5. Return the AI response to the client ---
    return Response.json({
      role: "system",
      content: text,
    });
  } catch (error) {
    console.error(error);
    return new Response(
      `Error processing request: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 },
    );
  }
}
