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
const MIN_PAGES_PER_CHUNK = 10;

function shouldChunk(docs: PDFPage[]): boolean {
  if (docs.length > CHUNK_PAGE_THRESHOLD) return true;
  const totalChars = docs.reduce((sum, d) => sum + d.pageContent.length, 0);
  return totalChars > CHUNK_CHAR_THRESHOLD;
}

function isHeadingLine(line: string): boolean {
  const trimmed = line.trim();
  const letters = trimmed.replace(/[^a-zA-Z]/g, "");
  return letters.length >= 3 && letters === letters.toUpperCase();
}

function endsWithCompleteSentence(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return true;
  return /[.?!:;]$/.test(trimmed);
}

function findBestSplitPoints(docs: PDFPage[], numChunks: number): number[] {
  if (numChunks <= 1) return [];

  const numSplits = numChunks - 1;
  const totalPages = docs.length;
  const minGap = MIN_PAGES_PER_CHUNK;

  interface Candidate { index: number; score: number; }
  const candidates: Candidate[] = [];

  for (let i = 1; i < totalPages; i++) {
    let score = 0;

    const nextLines = docs[i].pageContent.split("\n");
    const firstNonEmpty = nextLines.find((l) => l.trim())?.trim() || "";
    if (isHeadingLine(firstNonEmpty)) score += 100;

    const prevLines = docs[i - 1].pageContent.trim().split("\n");
    const lastLine = prevLines[prevLines.length - 1]?.trim() || "";
    if (endsWithCompleteSentence(lastLine)) score += 50;

    candidates.push({ index: i, score });
  }

  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  const selected: number[] = [];

  for (const c of sorted) {
    if (selected.length >= numSplits) break;
    if (c.score === 0) continue;
    if (selected.some((s) => Math.abs(s - c.index) < minGap)) continue;
    selected.push(c.index);
  }

  selected.sort((a, b) => a - b);

  while (selected.length < numSplits) {
    const target = selected.length + 1;
    const ideal = Math.round((target * totalPages) / numChunks);
    let pos = Math.max(1, Math.min(totalPages - 1, ideal));
    while (selected.includes(pos)) pos++;
    if (pos >= totalPages) pos = totalPages - 1;
    if (pos <= 0) pos = 1;
    selected.push(pos);
    selected.sort((a, b) => a - b);
  }

  return selected;
}

function splitIntoChunks(docs: PDFPage[]): PDFPage[][] {
  const numChunks = Math.min(MAX_CHUNKS, Math.ceil(docs.length / MIN_PAGES_PER_CHUNK));
  const splitPoints = findBestSplitPoints(docs, numChunks);

  const chunks: PDFPage[][] = [];
  let start = 0;
  for (const point of [...splitPoints, docs.length]) {
    chunks.push(docs.slice(start, point));
    start = point;
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
