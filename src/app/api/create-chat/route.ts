import {
  generatePdfSummary,
  saveToNeon,
} from "../../../../actions/upload-action";
import { extractPdftext } from "@/lib/langchain";
import { loadPdfIntoPinecone } from "@/lib/pinecone";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      {
        status: 401,
      }
    );
  }

  const body = await req.json();
  const { fileKey, fileName, fileUrl } = body;

  const docs = await extractPdftext(fileUrl);

  const [summary] = await Promise.all([
    generatePdfSummary(fileName, fileUrl, docs),
    loadPdfIntoPinecone(docs, fileKey),
  ]);

  const { data } = summary;

  if (data) {
    const result = await saveToNeon({
      userId,
      fileUrl,
      summary: data.summary,
      title: data.title,
      fileName,
      fileKey,
    });

    if (!result) {
      return new Response(
        JSON.stringify({ success: false, message: "Failed to save summary" }),
        {
          status: 500,
        }
      );
    }

    return Response.json(
      { success: true, chat_id: result.chat_id, summary: data.summary },
      { status: 200 }
    );
  }

  return new Response(
    JSON.stringify({ success: false, message: "No summary returned" }),
    { status: 500 }
  );
}
