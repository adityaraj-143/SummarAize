"use server";

import { getDbConnection } from "@/lib/db/db";
import { FetchSummary } from "@/lib/gemini";
import { PDFPage } from "@/lib/langchain";
import { revalidatePath } from "next/cache";

export interface SaveActionType {
  userId?: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
  fileKey: string;
}

export async function generatePdfSummary(
  fileName: string,
  fileUrl: string,
  docs: PDFPage[]
) {
  if (!fileUrl) {
    return {
      success: false,
      message: "File upload failed",
      data: null,
    };
  }

  try {
    const pdfText = docs.map((doc) => doc.pageContent).join("\n");
    const summary = await FetchSummary(pdfText);

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
        file_name
      ) VALUES (
        ${userId},
        ${fileUrl},
        ${summary},
        ${title},
        ${fileName}
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
