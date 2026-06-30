import { getDbConnection } from "@/lib/db/db";
import { FetchSummary, combineSummaries } from "@/lib/gemini";
import { PDFPage } from "@/lib/langchain";
import { revalidatePath } from "next/cache";

export interface SaveActionType {
  userId?: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
  fileKey: string;
  extractionMethod: string;
}

const CHUNK_PAGE_THRESHOLD = 20;
const CHUNK_CHAR_THRESHOLD = 50_000;
const MAX_CHUNKS = 3;

function shouldChunk(docs: PDFPage[]): boolean {
  if (docs.length > CHUNK_PAGE_THRESHOLD) return true;
  const totalChars = docs.reduce((sum, d) => sum + d.pageContent.length, 0);
  return totalChars > CHUNK_CHAR_THRESHOLD;
}

function splitIntoChunks(docs: PDFPage[]): PDFPage[][] {
  const numChunks = Math.min(MAX_CHUNKS, Math.ceil(docs.length / 10));
  const baseSize = Math.ceil(docs.length / numChunks);
  const chunks: PDFPage[][] = [];
  for (let i = 0; i < docs.length; i += baseSize) {
    if (chunks.length < numChunks - 1) {
      chunks.push(docs.slice(i, i + baseSize));
    } else {
      chunks.push(docs.slice(i));
      break;
    }
  }
  return chunks;
}

function formatWithPageMarkers(docs: PDFPage[]): string {
  return docs
    .map((doc) => `[Page ${doc.metadata.loc.pageNumber}]\n${doc.pageContent}`)
    .join("\n\n");
}

export async function generatePdfSummary(
  fileName: string,
  fileUrl: string,
  docs: PDFPage[],
  pdfType: "digital" | "scanned" = "digital",
) {
  if (!fileUrl) {
    return {
      success: false,
      message: "File upload failed",
      data: null,
    };
  }

  try {
    let summary: string | null | undefined;

    if (shouldChunk(docs)) {
      const chunks = splitIntoChunks(docs);
      const partialSummaries: string[] = [];

      for (const chunk of chunks) {
        const chunkText = formatWithPageMarkers(chunk);
        const partial = await FetchSummary(chunkText, pdfType);
        if (partial) partialSummaries.push(partial);
      }

      if (partialSummaries.length === 0) {
        return {
          success: false,
          message: "Failed to generate partial summaries",
          data: null,
        };
      }

      if (partialSummaries.length === 1) {
        summary = partialSummaries[0];
      } else {
        summary = await combineSummaries(partialSummaries, pdfType);
      }
    } else {
      const pdfText = formatWithPageMarkers(docs);
      summary = await FetchSummary(pdfText, pdfType);
    }

    if (!summary) {
      return {
        success: false,
        message: "Failed to generate summary",
        data: null,
      };
    }

    return {
      success: true,
      message: "Summary created successfully",
      data: {
        summary,
        title: fileName,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "File upload failed",
      data: null,
    };
  }
}

export async function saveToNeon({
  userId,
  fileUrl,
  summary,
  title,
  fileName,
  fileKey,
  extractionMethod,
}: SaveActionType) {
  if (!userId) {
    return {
      success: false,
      message: "User not found",
    };
  }

  try {
    const sql = await getDbConnection();
    
    // Save PDF summary and assert return type
    const summaryResult = await sql`
      INSERT INTO pdf_summaries (
        user_id,
        original_file_url,
        summary_text,
        title,
        file_name,
        extraction_method
      ) VALUES (
        ${userId},
        ${fileUrl},
        ${summary},
        ${title},
        ${fileName},
        ${extractionMethod}
      )
      RETURNING id;
    ` as { id: number }[];

    const summaryId = summaryResult[0]?.id;
    console.log("summaryId: ", summaryId);

    if (!summaryId) {
      return {
        success: false,
        message: "Failed to save PDF summary",
      };
    }

    // Save chat info and link to summary, assert return type
    const chatResult = await sql`
      INSERT INTO chats (
        user_id,
        pdf_url,
        pdf_name,
        file_key,
        summary_id
      ) VALUES (
        ${userId},
        ${fileUrl},
        ${fileName},
        ${fileKey},
        ${summaryId}
      )
      RETURNING id;
    ` as { id: number }[];

    console.log("chatResult: ", chatResult);
    if (!chatResult[0]?.id) {
      return {
        success: false,
        message: "Failed to save chat info",
      };
    }

    return {
      success: true,
      message: "PDF summary and chat info saved successfully",
      chat_id: chatResult[0].id,
    };
  } catch (error) {
    console.error("Error saving summary and chat info", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
