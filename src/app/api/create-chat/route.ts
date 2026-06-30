import { generatePdfSummary, saveToNeon } from "../../../../actions/upload-action";
import { extractPdftext } from "@/lib/langchain";
import { loadPdfIntoPinecone } from "@/lib/pinecone";
import { detectImagesInPdf, ocrImagePages, ocrHandwrittenPdf } from "@/lib/ocr";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await req.json();
  const { fileKey, fileName, fileUrl, pdfType } = body;

  let docs = await extractPdftext(fileUrl);
  let extractionMethod = "digital";

  if (pdfType === "digital") {
    const response = await fetch(fileUrl);
    const pdfBuffer = await response.arrayBuffer();

    const pagesWithImages = await detectImagesInPdf(pdfBuffer);

    if (pagesWithImages.size > 0) {
      const ocrTexts = await ocrImagePages(pdfBuffer, pagesWithImages);
      for (const doc of docs) {
        const pageNum = doc.metadata.loc.pageNumber;
        const ocr = ocrTexts.get(pageNum);
        if (ocr) {
          doc.pageContent = doc.pageContent + "\n\n[Extracted from image]\n" + ocr;
        }
      }
      extractionMethod = "digital+ocr";
    }
  } else {
    const response = await fetch(fileUrl);
    const pdfBuffer = await response.arrayBuffer();

    docs = await ocrHandwrittenPdf(pdfBuffer);
    extractionMethod = "ocr_handwritten";
  }

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
      extractionMethod,
    });

    if (!result.success) {
      return new Response(JSON.stringify({ success: false, message: result.message }), {
        status: 500,
      });
    }

    return Response.json(
      { success: true, chat_id: result.chat_id, summary: data.summary },
      { status: 200 },
    );
  }

  return new Response(JSON.stringify({ success: false, message: "No summary returned" }), {
    status: 500,
  });
}
