"use server";

import { getDbConnection } from "@/lib/db/db";
import { FetchSummary } from "@/lib/gemini";
import { PDFPage } from "@/lib/langchain";
import { revalidatePath } from "next/cache";

export interface PdfSummaryType {
  userId?: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
}

export async function generatePdfSummary(
  fileUrl: string,
  fileName: string,
  docs: PDFPage[]
) {
  if (!fileUrl) {
    return {
      success: false,
      message: "file upload Failed",
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
      success: false,
      message: "Summary created successfully",
      data: {
        summary,
        title: fileName,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "file upload Failed",
      data: null,
    };
  }
}

async function savePdfSummary({
  userId,
  fileUrl,
  summary,
  title,
  fileName,
}: PdfSummaryType){
  try {
    const sql = await getDbConnection();
    const result = await sql`INSERT INTO pdf_summaries (
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
        `;
    return result;
  } catch (error) {
    console.error("Error saving the summary", error);
    throw error;
  }
}

export async function saveSummaryAction({
  userId,
  fileUrl,
  summary,
  title,
  fileName,
}: PdfSummaryType) {
  if (!userId) {
    return {
      success: false,
      message: "User not found",
    };
  }

  let saveSummary: any;

  try {
    saveSummary = await savePdfSummary({
      userId,
      fileUrl,
      summary,
      title,
      fileName,
    });
    if (!saveSummary) {
      return {
        success: false,
        message: "Failed to save the PDF, please try again",
      };
    }
    console.log("saveSummary: ", saveSummary);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error saving PDF summary",
    };
  }

  revalidatePath(`/summaries/${saveSummary.id}`);

  return {
    success: true,
    message: "PDF summary saved successfully",
  };
}
