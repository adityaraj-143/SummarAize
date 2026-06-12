import { GoogleGenAI } from "@google/genai";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const OCR_MODEL = "gemini-2.0-flash";

export async function detectImagesInPdf(buffer: ArrayBuffer): Promise<Set<number>> {
  const data = new Uint8Array(buffer);
  const doc = await pdfjs.getDocument({ data }).promise;
  const pagesWithImages = new Set<number>();

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const ops = await page.getOperatorList();
    const hasImage = ops.fnArray.some(
      (fn) => fn === pdfjs.OPS.paintImageXObject || fn === pdfjs.OPS.paintInlineImageXObject,
    );
    if (hasImage) pagesWithImages.add(i);
  }

  return pagesWithImages;
}

export async function ocrImagePages(
  pdfBuffer: ArrayBuffer,
  pagesWithImages: Set<number>,
): Promise<Map<number, string>> {
  if (pagesWithImages.size === 0) return new Map();

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
  const base64 = Buffer.from(pdfBuffer).toString("base64");

  const pageList = Array.from(pagesWithImages).sort((a, b) => a - b);

  const result = await ai.models.generateContent({
    model: OCR_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64,
            },
          },
          {
            text: `This PDF has embedded images, charts, or diagrams on these pages: ${pageList.join(", ")}. Extract ONLY the text that appears inside images, charts, diagrams, and tables. Ignore already-readable text. Return results in this format exactly:

--- Page 1 ---
[extracted text]

--- Page 3 ---
[extracted text]`,
          },
        ],
      },
    ],
  });

  const text = result.text || "";
  const pageMap = new Map<number, string>();

  let currentPage = 0;
  const lines = text.split("\n");
  for (const line of lines) {
    const pageMatch = line.match(/^---\s*Page\s+(\d+)\s*---/i);
    if (pageMatch) {
      currentPage = parseInt(pageMatch[1], 10);
      continue;
    }
    if (currentPage > 0) {
      const existing = pageMap.get(currentPage) || "";
      pageMap.set(currentPage, existing + (existing ? "\n" : "") + line);
    }
  }

  return pageMap;
}

export async function ocrHandwrittenPdf(
  pdfBuffer: ArrayBuffer,
): Promise<{ pageContent: string; metadata: { loc: { pageNumber: number } } }[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
  const base64 = Buffer.from(pdfBuffer).toString("base64");

  const result = await ai.models.generateContent({
    model: OCR_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64,
            },
          },
          {
            text: "This is a scanned or handwritten document. Carefully transcribe all text from each page, including handwriting. Preserve the original layout and paragraph breaks as much as possible. Return results in this format exactly:\n\n--- Page 1 ---\n[transcribed text]\n\n--- Page 2 ---\n[transcribed text]",
          },
        ],
      },
    ],
  });

  const text = result.text || "";
  const pages: { pageContent: string; metadata: { loc: { pageNumber: number } } }[] = [];

  const blocks = text.split(/(?=^---\s*Page\s+\d+\s*---)/gim);
  for (const block of blocks) {
    const match = block.match(/^---\s*Page\s+(\d+)\s*---\s*\n?([\s\S]*)/i);
    if (match) {
      pages.push({
        pageContent: (match[2] || "").trim(),
        metadata: { loc: { pageNumber: parseInt(match[1], 10) } },
      });
    }
  }

  return pages;
}
