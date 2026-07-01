export interface PDFPage {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
}

export async function extractPdftext(fileUrl: string): Promise<PDFPage[]> {
  const response = await fetch(fileUrl);
  const arrayBuffer = await response.arrayBuffer();

  // Safely dynamically import pdfjs-dist
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(arrayBuffer);

  const doc = await pdfjs.getDocument({
    data,
    useSystemFonts: true, // helps prevent font-related infinite loops
  }).promise;

  const pages: PDFPage[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = textContent.items.map((item: any) => item.str).join(" ");

    pages.push({
      pageContent: text,
      metadata: { loc: { pageNumber: i } },
    });

    // Free page memory immediately to prevent OOM
    page.cleanup();
  }

  // Free document memory
  doc.cleanup();

  return pages;
}
