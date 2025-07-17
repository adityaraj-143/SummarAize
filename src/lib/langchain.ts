import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export interface PDFPage {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function extractPdftext(fileUrl: string) {
  const repsonse = await fetch(fileUrl);
  const blob = await repsonse.blob();

  const arrayBuffer = await blob.arrayBuffer();

  const loader = new PDFLoader(new Blob([arrayBuffer]));

  return (await loader.load()) as PDFPage[];

}
