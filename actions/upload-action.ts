"use server";

import { getDbConnection } from "@/lib/db";
import { FetchSummary } from "@/lib/gemini";
import { extractPdftext } from "@/lib/langchain";
import { formatFileName } from "@/utils/format-file";
import { revalidatePath } from "next/cache";
import { ClientUploadedFileData } from "uploadthing/types";

export interface PdfSummaryType {
  userId?: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
}

export async function generatePdfSummary(
  uploadResponse:
    | ClientUploadedFileData<{
        uploadedBy: string;
        file: string;
      }>[]
    | undefined
) {
  if (!uploadResponse) {
    return {
      success: false,
      message: "file upload Failed",
      data: null,
    };
  }

  const pdfUrl = uploadResponse[0].ufsUrl;

  if (!pdfUrl) {
    return {
      success: false,
      message: "file upload Failed",
      data: null,
    };
  }

  try {
    const pdfText = await extractPdftext(pdfUrl);
    console.log(pdfText);
    const summary = await FetchSummary(pdfText);

    if (!summary) {
      return {
        success: false,
        message: "Failed to generate summary",
        data: null,
      };
    }

    const fileName = formatFileName(uploadResponse[0].name);

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
}: PdfSummaryType) {
  try {
    const sql = await getDbConnection();
    await sql`INSERT INTO pdf_summaries (
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
        )`;
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
