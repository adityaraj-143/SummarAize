"use server";

import { FetchSummary } from "@/lib/gemini";
import { extractPdftext } from "@/lib/langchain";
import { ClientUploadedFileData } from "uploadthing/types";

export async function generatePdfSummary(
  uploadResponse:ClientUploadedFileData<{
    uploadedBy: string;
    file: string;
}>[] | undefined
) {
  if (!uploadResponse) {
    return {
      success: false,
      message: "file upload Failed",
      data: null,
    };
  }

  const pdfUrl = uploadResponse[0].ufsUrl;

  if(!pdfUrl) {
    return {
        success: false,
        message: "file upload Failed",
        data: null,
      };
  }


  try {
    const pdfText = await extractPdftext(pdfUrl)
    console.log(pdfText)
    const summary = await FetchSummary(pdfText)

    return {
      success: false,
      message: "Summary created successfully",
      data: summary,
    };
  } catch (error) {
    return {
        success: false,
        message: "file upload Failed",
        data: null,
      };
  }
}
