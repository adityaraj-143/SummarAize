import { Pinecone } from "@pinecone-database/pinecone";
import { PDFPage } from "./langchain";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import md5 from "md5";

interface Vector {
  id: string;
  values: number[];
  metadata: {
    text: string;
    pageNumber: number
  }
}

let pc: Pinecone | null = null;

export const getPineconeClient = () => {
  if (!pc) {
    pc = new Pinecone({
      apiKey: process.env.PINECONE_API!,
    });
  }

  return pc;
};

export const loadPdfIntoPinecone = async (pages: PDFPage[], fileUrl: string, fileKey: string) => {
  const docs = await Promise.all(pages.map(prepareDoc));
  // console.log("DOCS: ",docs);

  const allvectors = (await Promise.all(docs.map(vectoriseDocument))).flat();
  // console.log("vectors: ",allvectors);
  
  const pc = getPineconeClient();
  const pcIndex = pc.index("summaraize", process.env.PINECONE_HOST);
  
  await pcIndex.namespace (fileUrl).upsert(allvectors);  
};

async function vectoriseDocument(docs: Document[]) {
  try {
    const texts = docs.map((doc) => doc.pageContent);
    const embeddings = await getEmbeddings(texts);
    // console.log("embeddings: ",embeddings)
    const hashes = docs.map((doc) => md5(doc.pageContent));

    const result: Vector[] = docs.map((doc, i) => ({
      id: hashes[i],
      values: embeddings[i],
      metadata: {
        text: doc.metadata.text as string,
        pageNumber: doc.metadata.pageNumber as number,
      },
    }));
    return result;
  } catch (error) {
    console.log("error embedding document: ", error);
    throw error;
  }
}

export const trimToByteLength = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDoc(page: PDFPage) {
  let { pageContent, metadata } = page;

  pageContent = pageContent.replace(/\n/g, "");

  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: trimToByteLength(pageContent, 36000),
      },
    }),
  ]);

  return docs;
}
