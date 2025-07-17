import { toast } from "sonner";
import {
  generatePdfSummary,
  saveSummaryAction,
} from "../../../../actions/upload-action";
import { extractPdftext } from "@/lib/langchain";
import { loadPdfIntoPinecone } from "@/lib/pinecone";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request, res: Response) {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await req.json();
  const { fileKey, fileName, fileUrl } = body;

  const docs = await extractPdftext(fileUrl);

  const [chat_id, summary] = await Promise.all([
    loadPdfIntoPinecone(docs, fileUrl, fileKey),
    generatePdfSummary(fileName, fileUrl, docs),
  ]);

  console.log({ summary });
  console.log("done this part");

  const { data } = summary;
  let result;
  if (data && userId) {
    // toast.success("We are saving your PDF!");
    result = await saveSummaryAction({
      userId,
      fileUrl,
      summary: data.summary,
      title: data.title,
      fileName,
    });
    // toast.success("Summary Generated", {
    //   description: "Your PDF has been successfully summarized and saved",
    // });
  }

  return Response.json({ success: true, chat_id, summary: data?.summary, result }, {
    status: 200,
  });

}
